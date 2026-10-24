/* eslint-disable @typescript-eslint/no-explicit-any */
import Module from 'module';
import * as mockVscode from './mocks/vscode';

const originalLoad = (Module as any)._load;
(Module as any)._load = function (request: string, parent: any, isMain: boolean) {
  if (request === 'vscode') {
    return mockVscode;
  }
  return originalLoad.apply(this, [request, parent, isMain]);
};
