/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from 'path';

export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64,
}

export class MockUri {
  public scheme = 'file';
  public authority = '';
  public path: string;
  public query = '';
  public fragment = '';

  constructor(public fsPath: string) {
    this.path = fsPath.replace(/\\/g, '/');
  }

  static file(fsPath: string): MockUri {
    return new MockUri(fsPath);
  }

  static joinPath(base: MockUri, ...pathSegments: string[]): MockUri {
    const joined = path.join(base.fsPath, ...pathSegments);
    return new MockUri(joined);
  }

  toString(): string {
    return `file://${this.path}`;
  }
}

export const Uri = MockUri;

export const workspace: any = {
  workspaceFolders: [],
  fs: {
    stat: async () => ({ type: FileType.File }),
    readFile: async () => Buffer.from(''),
    writeFile: async () => {},
    createDirectory: async () => {},
    readDirectory: async () => [],
  },
  getWorkspaceFolder: () => undefined,
};

export const window: any = {
  showWarningMessage: async () => undefined,
  showInformationMessage: async () => undefined,
  showErrorMessage: async () => undefined,
  showInputBox: async () => undefined,
  showQuickPick: async () => undefined,
};

export const commands: any = {
  registerCommand: () => ({ dispose: () => {} }),
};
