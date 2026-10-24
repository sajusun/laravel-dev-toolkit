import * as vscode from 'vscode';
import * as path from 'path';

export interface GenerateFileOptions {
  targetUri: vscode.Uri;
  content: string;
  projectRootUri?: vscode.Uri;
}

export interface GenerateFileResult {
  success: boolean;
  cancelled?: boolean;
  fileUri?: vscode.Uri;
  error?: string;
}

/**
 * Safely creates a file with overwrite protection and directory creation.
 * Opens the file in the editor upon success.
 */
export async function safelyGenerateFile(
  options: GenerateFileOptions,
): Promise<GenerateFileResult> {
  const { targetUri, content, projectRootUri } = options;

  try {
    // 1. Check if file already exists
    let exists = false;
    try {
      await vscode.workspace.fs.stat(targetUri);
      exists = true;
    } catch {
      exists = false;
    }

    if (exists) {
      const displayPath = projectRootUri
        ? path.relative(projectRootUri.fsPath, targetUri.fsPath)
        : targetUri.fsPath;

      const choice = await vscode.window.showWarningMessage(
        `File "${displayPath}" already exists. Do you want to overwrite it?`,
        { modal: true },
        'Overwrite',
      );

      if (choice !== 'Overwrite') {
        return { success: false, cancelled: true };
      }
    }

    // 2. Ensure parent directory exists
    const parentDirUri = vscode.Uri.file(path.dirname(targetUri.fsPath));
    try {
      await vscode.workspace.fs.createDirectory(parentDirUri);
    } catch (dirError) {
      const message = dirError instanceof Error ? dirError.message : String(dirError);
      return {
        success: false,
        error: `Could not create directory "${parentDirUri.fsPath}": ${message}`,
      };
    }

    // 3. Write file
    const buffer = Buffer.from(content, 'utf-8');
    await vscode.workspace.fs.writeFile(targetUri, buffer);

    // 4. Open document in editor
    try {
      const doc = await vscode.workspace.openTextDocument(targetUri);
      await vscode.window.showTextDocument(doc);
    } catch {
      // Non-fatal if editor fails to open
    }

    const relativeDisplay = projectRootUri
      ? path.relative(projectRootUri.fsPath, targetUri.fsPath)
      : targetUri.fsPath;

    vscode.window.showInformationMessage(`Created: ${relativeDisplay}`);

    return {
      success: true,
      fileUri: targetUri,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Failed to write file "${targetUri.fsPath}": ${message}`,
    };
  }
}
