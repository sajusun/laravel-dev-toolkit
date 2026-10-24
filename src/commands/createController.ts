import * as vscode from 'vscode';
import * as path from 'path';
import { findLaravelProject } from '../services/laravelDetector';
import { validateClassInput } from '../services/phpValidator';
import { resolveNamespaceForFolder } from '../services/namespaceResolver';
import { ControllerType, renderControllerTemplate } from '../templates/controllerTemplate';
import { safelyGenerateFile } from '../services/fileGenerator';

export async function createControllerCommand(contextUri?: vscode.Uri): Promise<void> {
  // 1. Detect Laravel project
  const project = await findLaravelProject(contextUri);
  if (!project) {
    vscode.window.showWarningMessage(
      'Laravel Developer Toolkit: No Laravel project detected in the current workspace (artisan and composer.json not found).',
    );
    return;
  }

  // 2. Ask for Controller Name with real-time validation
  const inputName = await vscode.window.showInputBox({
    prompt: 'Enter controller name (e.g. UserController or Api/V1/UserController)',
    placeHolder: 'UserController',
    validateInput: (value) => {
      const res = validateClassInput(value, 'Controller');
      return res.isValid ? undefined : res.error;
    },
  });

  if (!inputName) {
    return; // Cancelled
  }

  const validation = validateClassInput(inputName, 'Controller');
  if (!validation.isValid || !validation.className) {
    vscode.window.showErrorMessage(validation.error || 'Invalid controller name.');
    return;
  }

  // 3. Ask for Controller Type
  interface ControllerPickItem extends vscode.QuickPickItem {
    type: ControllerType;
  }

  const items: ControllerPickItem[] = [
    {
      label: '$(file-code) Plain Controller',
      description: 'Empty controller class',
      type: 'plain',
    },
    {
      label: '$(list-ordered) Resource Controller',
      description: 'Includes full CRUD actions (index, create, store, show, edit, update, destroy)',
      type: 'resource',
    },
    {
      label: '$(server) API Resource Controller',
      description: 'API actions without create and edit (index, store, show, update, destroy)',
      type: 'api',
    },
    {
      label: '$(zap) Invokable Controller',
      description: 'Single-action controller with __invoke method',
      type: 'invokable',
    },
  ];

  const selectedPick = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select the controller type',
  });

  if (!selectedPick) {
    return; // Cancelled
  }

  // 4. Determine destination directory
  let baseFolderUri: vscode.Uri;
  if (contextUri && contextUri.fsPath.startsWith(project.rootUri.fsPath)) {
    // If contextUri is a folder inside the project, use it
    try {
      const stat = await vscode.workspace.fs.stat(contextUri);
      if (stat.type === vscode.FileType.Directory) {
        baseFolderUri = contextUri;
      } else {
        baseFolderUri = vscode.Uri.file(path.dirname(contextUri.fsPath));
      }
    } catch {
      baseFolderUri = vscode.Uri.joinPath(project.rootUri, 'app', 'Http', 'Controllers');
    }
  } else {
    baseFolderUri = vscode.Uri.joinPath(project.rootUri, 'app', 'Http', 'Controllers');
  }

  // If input had subpaths (e.g. Api/V1/UserController), append subpath
  const targetFolderUri = validation.subPath
    ? vscode.Uri.joinPath(baseFolderUri, ...validation.subPath.split('/'))
    : baseFolderUri;

  const targetFileUri = vscode.Uri.joinPath(targetFolderUri, `${validation.className}.php`);

  // 5. Resolve namespace
  const namespace = await resolveNamespaceForFolder(project.rootUri, targetFolderUri);

  // 6. Render template
  const content = renderControllerTemplate({
    className: validation.className,
    namespace,
    type: selectedPick.type,
  });

  // 7. Write file safely
  await safelyGenerateFile({
    targetUri: targetFileUri,
    content,
    projectRootUri: project.rootUri,
  });
}
