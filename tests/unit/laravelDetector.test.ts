/* eslint-disable @typescript-eslint/no-explicit-any */
import * as assert from 'assert';
import * as vscode from 'vscode';
import { inspectFolderForLaravel, findLaravelProject } from '../../src/services/laravelDetector';

suite('Laravel Detector Tests', () => {
  const originalStat = (vscode.workspace.fs as any).stat;
  const originalReadFile = (vscode.workspace.fs as any).readFile;
  const originalFolders = vscode.workspace.workspaceFolders;

  teardown(() => {
    (vscode.workspace.fs as any).stat = originalStat;
    (vscode.workspace.fs as any).readFile = originalReadFile;
    (vscode.workspace as any).workspaceFolders = originalFolders;
  });

  test('Detects valid Laravel folder with artisan, app/, and composer.json', async () => {
    (vscode.workspace.fs as any).stat = async (uri: vscode.Uri) => {
      if (uri.fsPath.endsWith('artisan')) {
        return { type: vscode.FileType.File };
      }
      if (uri.fsPath.endsWith('app')) {
        return { type: vscode.FileType.Directory };
      }
      throw new Error('Not found');
    };

    (vscode.workspace.fs as any).readFile = async (uri: vscode.Uri) => {
      if (uri.fsPath.endsWith('composer.json')) {
        return Buffer.from(
          JSON.stringify({
            require: {
              'laravel/framework': '^11.0',
            },
          }),
        );
      }
      throw new Error('Not found');
    };

    const dummyUri = vscode.Uri.file('/dummy/laravel-app');
    const result = await inspectFolderForLaravel(dummyUri);

    assert.ok(result);
    assert.strictEqual(result.hasLaravelDependency, true);
    assert.strictEqual(result.rootUri.fsPath, dummyUri.fsPath);
  });

  test('Rejects non-Laravel folder when artisan is missing', async () => {
    (vscode.workspace.fs as any).stat = async (uri: vscode.Uri) => {
      if (uri.fsPath.endsWith('artisan')) {
        throw new Error('File not found');
      }
      return { type: vscode.FileType.Directory };
    };

    const dummyUri = vscode.Uri.file('/dummy/node-app');
    const result = await inspectFolderForLaravel(dummyUri);

    assert.strictEqual(result, undefined);
  });

  test('Rejects folder when app/ directory is missing', async () => {
    (vscode.workspace.fs as any).stat = async (uri: vscode.Uri) => {
      if (uri.fsPath.endsWith('artisan')) {
        return { type: vscode.FileType.File };
      }
      if (uri.fsPath.endsWith('app')) {
        throw new Error('Directory not found');
      }
      throw new Error('Not found');
    };

    const dummyUri = vscode.Uri.file('/dummy/incomplete-laravel');
    const result = await inspectFolderForLaravel(dummyUri);

    assert.strictEqual(result, undefined);
  });

  test('findLaravelProject returns undefined when no workspace folders are open', async () => {
    (vscode.workspace as any).workspaceFolders = undefined;
    const result = await findLaravelProject();
    assert.strictEqual(result, undefined);
  });
});
