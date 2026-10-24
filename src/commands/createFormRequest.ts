import * as vscode from 'vscode';
import * as path from 'path';
import { findLaravelProject } from '../services/laravelDetector';
import { validateClassInput } from '../services/phpValidator';
import { resolveNamespaceForFolder } from '../services/namespaceResolver';
import { renderFormRequestTemplate } from '../templates/formRequestTemplate';
import { safelyGenerateFile } from '../services/fileGenerator';

export async function createFormRequestCommand(contextUri?: vscode.Uri): Promise<void> {
  // 1. Detect Laravel project
  const project = await findLaravelProject(contextUri);
  if (!project) {
    vscode.window.showWarningMessage(
      'Laravel Developer Toolkit: No Laravel project detected in the current workspace (artisan and composer.json not found).',
    );
    return;
  }

  // 2. Ask for Form Request Name with real-time validation
  const inputName = await vscode.window.showInputBox({
    prompt: 'Enter form request name (e.g. StorePostRequest or Admin/UpdateUserRequest)',
    placeHolder: 'StorePostRequest',
    validateInput: (value) => {
      const res = validateClassInput(value, 'Request');
      return res.isValid ? undefined : res.error;
    },
  });

  if (!inputName) {
    return; // Cancelled
  }

  const validation = validateClassInput(inputName, 'Request');
  if (!validation.isValid || !validation.className) {
    vscode.window.showErrorMessage(validation.error || 'Invalid form request name.');
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
      baseFolderUri = vscode.Uri.joinPath(project.rootUri, 'app', 'Http', 'Requests');
    }
  } else {
    baseFolderUri = vscode.Uri.joinPath(project.rootUri, 'app', 'Http', 'Requests');
  }

  const targetFolderUri = validation.subPath
    ? vscode.Uri.joinPath(baseFolderUri, ...validation.subPath.split('/'))
    : baseFolderUri;

  const targetFileUri = vscode.Uri.joinPath(targetFolderUri, `${validation.className}.php`);

  // 4. Resolve namespace
  const namespace = await resolveNamespaceForFolder(project.rootUri, targetFolderUri);

  // 5. Render template
  const content = renderFormRequestTemplate({
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
