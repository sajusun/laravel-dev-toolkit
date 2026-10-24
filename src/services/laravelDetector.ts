import * as vscode from 'vscode';
import * as path from 'path';

export interface LaravelProjectInfo {
  rootUri: vscode.Uri;
  composerJsonUri: vscode.Uri;
  artisanUri: vscode.Uri;
  appName?: string;
  hasLaravelDependency: boolean;
}

/**
 * Checks if a specific folder URI is a Laravel application.
 * Verifies the presence of artisan, composer.json, and app/ directory.
 */
export async function inspectFolderForLaravel(
  folderUri: vscode.Uri,
): Promise<LaravelProjectInfo | undefined> {
  try {
    const artisanUri = vscode.Uri.joinPath(folderUri, 'artisan');
    const composerJsonUri = vscode.Uri.joinPath(folderUri, 'composer.json');
    const appDirUri = vscode.Uri.joinPath(folderUri, 'app');

    // Check artisan
    try {
      const artisanStat = await vscode.workspace.fs.stat(artisanUri);
      if (artisanStat.type !== vscode.FileType.File) {
        return undefined;
      }
    } catch {
      return undefined;
    }

    // Check composer.json
    let hasLaravelDependency = false;
    try {
      const composerBytes = await vscode.workspace.fs.readFile(composerJsonUri);
      const composerContent = Buffer.from(composerBytes).toString('utf-8');
      const composerObj = JSON.parse(composerContent);

      const requireDeps = composerObj.require || {};
      const requireDevDeps = composerObj['require-dev'] || {};

      if (requireDeps['laravel/framework'] || requireDevDeps['laravel/framework']) {
        hasLaravelDependency = true;
      }
    } catch {
      // If composer.json is unreadable or malformed, continue checking fallback
    }

    // Check app directory
    try {
      const appStat = await vscode.workspace.fs.stat(appDirUri);
      if (appStat.type !== vscode.FileType.Directory) {
        return undefined;
      }
    } catch {
      return undefined;
    }

    return {
      rootUri: folderUri,
      artisanUri,
      composerJsonUri,
      hasLaravelDependency,
    };
  } catch {
    return undefined;
  }
}

/**
 * Finds the active Laravel root from the currently open workspace,
 * or based on an optional context URI (e.g. from an Explorer right-click).
 */
export async function findLaravelProject(
  contextUri?: vscode.Uri,
): Promise<LaravelProjectInfo | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return undefined;
  }

  // If a context URI was provided (e.g. from context menu or active file)
  if (contextUri) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(contextUri);
    if (workspaceFolder) {
      // First check if workspaceFolder is itself a Laravel root
      const info = await inspectFolderForLaravel(workspaceFolder.uri);
      if (info) {
        return info;
      }

      // If contextUri is within a nested Laravel folder, walk upwards to the workspace folder
      let currentPath = contextUri.fsPath;
      const rootPath = workspaceFolder.uri.fsPath;

      while (currentPath.length >= rootPath.length) {
        const candidateUri = vscode.Uri.file(currentPath);
        const candidateInfo = await inspectFolderForLaravel(candidateUri);
        if (candidateInfo) {
          return candidateInfo;
        }

        const parentPath = path.dirname(currentPath);
        if (parentPath === currentPath) {
          break;
        }
        currentPath = parentPath;
      }
    }
  }

  // Check each workspace folder
  for (const folder of workspaceFolders) {
    const info = await inspectFolderForLaravel(folder.uri);
    if (info) {
      return info;
    }
  }

  // Check 1-level deep subdirectories (avoid deep recursive scans into node_modules/vendor)
  for (const folder of workspaceFolders) {
    try {
      const entries = await vscode.workspace.fs.readDirectory(folder.uri);
      for (const [name, type] of entries) {
        if (
          type === vscode.FileType.Directory &&
          !name.startsWith('.') &&
          name !== 'node_modules' &&
          name !== 'vendor'
        ) {
          const subfolderUri = vscode.Uri.joinPath(folder.uri, name);
          const subInfo = await inspectFolderForLaravel(subfolderUri);
          if (subInfo) {
            return subInfo;
          }
        }
      }
    } catch {
      // Ignore directory read errors
    }
  }

  return undefined;
}
