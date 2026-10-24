import * as vscode from 'vscode';
import * as path from 'path';
import { findLaravelProject } from '../services/laravelDetector';
import { validateClassInput } from '../services/phpValidator';
import { resolveNamespaceForFolder } from '../services/namespaceResolver';
import { renderApiResourceTemplate } from '../templates/apiResourceTemplate';
import { safelyGenerateFile } from '../services/fileGenerator';

export async function createApiResourceCommand(contextUri?: vscode.Uri): Promise<void> {
  // 1. Detect Laravel project
  const project = await findLaravelProject(contextUri);
  if (!project) {
    vscode.window.showWarningMessage(
      'Laravel Developer Toolkit: No Laravel project detected in the current workspace (artisan and composer.json not found).',
    );
    return;
  }

  // 2. Ask for API Resource Name with real-time validation
  const inputName = await vscode.window.showInputBox({
    prompt: 'Enter API resource name (e.g. UserResource or V1/PostResource)',
    placeHolder: 'UserResource',
    validateInput: (value) => {
      const res = validateClassInput(value, 'Resource');
      return res.isValid ? undefined : res.error;
    },
  });

  if (!inputName) {
    return; // Cancelled
  }

  const validation = validateClassInput(inputName, 'Resource');
  if (!validation.isValid || !validation.className) {
    vscode.window.showErrorMessage(validation.error || 'Invalid API resource name.');
    return;
  }

  // 3. Determine destination directory
  let baseFolderUri: vscode.Uri;
  if (contextUri && contextUri.fsPath.startsWith(project.rootUri.fsPath)) {
    try {
      const stat = await vscode.workspace.fs.stat(contextUri);
      if (stat.type === vscode.FileType.Directory) {
        baseFolderUri = contextUri;
      } else {
        baseFolderUri = vscode.Uri.file(path.dirname(contextUri.fsPath));
      }
    } catch {
      baseFolderUri = vscode.Uri.joinPath(project.rootUri, 'app', 'Http', 'Resources');
    }
  } else {
    baseFolderUri = vscode.Uri.joinPath(project.rootUri, 'app', 'Http', 'Resources');
  }

  const targetFolderUri = validation.subPath
    ? vscode.Uri.joinPath(baseFolderUri, ...validation.subPath.split('/'))
    : baseFolderUri;

  const targetFileUri = vscode.Uri.joinPath(targetFolderUri, `${validation.className}.php`);

  // 4. Resolve namespace
  const namespace = await resolveNamespaceForFolder(project.rootUri, targetFolderUri);

  // 5. Render template
  const content = renderApiResourceTemplate({
    className: validation.className,
    namespace,
  });

  // 6. Write file safely
  await safelyGenerateFile({
    targetUri: targetFileUri,
    content,
    projectRootUri: project.rootUri,
  });
}
