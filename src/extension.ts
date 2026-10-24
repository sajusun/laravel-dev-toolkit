import * as vscode from 'vscode';
import { createControllerCommand } from './commands/createController';
import { createFormRequestCommand } from './commands/createFormRequest';
import { createApiResourceCommand } from './commands/createApiResource';

export function activate(context: vscode.ExtensionContext): void {
  // Register commands with Explorer context URI support
  const createControllerDisposable = vscode.commands.registerCommand(
    'laravel-toolkit.createController',
    (uri?: vscode.Uri) => createControllerCommand(uri),
  );

  const createFormRequestDisposable = vscode.commands.registerCommand(
    'laravel-toolkit.createFormRequest',
    (uri?: vscode.Uri) => createFormRequestCommand(uri),
  );

  const createApiResourceDisposable = vscode.commands.registerCommand(
    'laravel-toolkit.createApiResource',
    (uri?: vscode.Uri) => createApiResourceCommand(uri),
  );

  context.subscriptions.push(
    createControllerDisposable,
    createFormRequestDisposable,
    createApiResourceDisposable,
  );
}

export function deactivate(): void {
  // Cleanup if needed
}
