/* eslint-disable @typescript-eslint/no-explicit-any */
import * as assert from 'assert';
import * as vscode from 'vscode';
import { safelyGenerateFile } from '../../src/services/fileGenerator';

suite('File Generator Tests', () => {
  const originalStat = (vscode.workspace.fs as any).stat;
  const originalWriteFile = (vscode.workspace.fs as any).writeFile;
  const originalCreateDirectory = (vscode.workspace.fs as any).createDirectory;
  const originalShowWarning = (vscode.window as any).showWarningMessage;

  teardown(() => {
    (vscode.workspace.fs as any).stat = originalStat;
    (vscode.workspace.fs as any).writeFile = originalWriteFile;
    (vscode.workspace.fs as any).createDirectory = originalCreateDirectory;
    (vscode.window as any).showWarningMessage = originalShowWarning;
  });

  test('Creates file successfully when it does not exist', async () => {
    let written = false;
    let dirCreated = false;

    (vscode.workspace.fs as any).stat = async () => {
      throw new Error('File does not exist');
    };
    (vscode.workspace.fs as any).createDirectory = async () => {
      dirCreated = true;
    };
    (vscode.workspace.fs as any).writeFile = async () => {
      written = true;
    };

    const targetUri = vscode.Uri.file('/path/to/project/app/Http/Controllers/UserController.php');
    const result = await safelyGenerateFile({
      targetUri,
      content: '<?php // test',
      projectRootUri: vscode.Uri.file('/path/to/project'),
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(dirCreated, true);
    assert.strictEqual(written, true);
  });

  test('Aborts file creation when file exists and user cancels overwrite', async () => {
    let written = false;

    (vscode.workspace.fs as any).stat = async () => ({ type: vscode.FileType.File });
    (vscode.window as any).showWarningMessage = async () => undefined; // User clicked Cancel or closed dialog
    (vscode.workspace.fs as any).writeFile = async () => {
      written = true;
    };

    const targetUri = vscode.Uri.file(
      '/path/to/project/app/Http/Controllers/ExistingController.php',
    );
    const result = await safelyGenerateFile({
      targetUri,
      content: '<?php // overwrite attempt',
      projectRootUri: vscode.Uri.file('/path/to/project'),
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(result.cancelled, true);
    assert.strictEqual(written, false);
  });

  test('Overwrites existing file when user explicitly confirms', async () => {
    let written = false;

    (vscode.workspace.fs as any).stat = async () => ({ type: vscode.FileType.File });
    (vscode.window as any).showWarningMessage = async () => 'Overwrite'; // User confirms Overwrite
    (vscode.workspace.fs as any).writeFile = async () => {
      written = true;
    };

    const targetUri = vscode.Uri.file(
      '/path/to/project/app/Http/Controllers/ExistingController.php',
    );
    const result = await safelyGenerateFile({
      targetUri,
      content: '<?php // overwritten',
      projectRootUri: vscode.Uri.file('/path/to/project'),
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(written, true);
  });
});
