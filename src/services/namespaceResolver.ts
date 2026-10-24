import * as vscode from 'vscode';
import * as path from 'path';

export interface Psr4Mapping {
  prefix: string; // e.g. "App\\"
  dir: string; // e.g. "app/"
}

/**
 * Parses PSR-4 mappings from a composer.json string.
 */
export function parsePsr4Mappings(composerContent: string): Psr4Mapping[] {
  const mappings: Psr4Mapping[] = [];

  try {
    const parsed = JSON.parse(composerContent);
    const autoload = parsed.autoload || {};
    const psr4 = autoload['psr-4'] || {};

    for (const [prefix, target] of Object.entries(psr4)) {
      if (typeof target === 'string') {
        mappings.push({
          prefix: prefix.endsWith('\\') ? prefix : `${prefix}\\`,
          dir: target.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') + '/',
        });
      } else if (Array.isArray(target)) {
        for (const dirItem of target) {
          if (typeof dirItem === 'string') {
            mappings.push({
              prefix: prefix.endsWith('\\') ? prefix : `${prefix}\\`,
              dir: dirItem.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '') + '/',
            });
          }
        }
      }
    }
  } catch {
    // If parsing fails, return empty list
  }

  // Ensure default Laravel App\ mapping is present as fallback
  if (!mappings.some((m) => m.prefix === 'App\\')) {
    mappings.push({ prefix: 'App\\', dir: 'app/' });
  }

  // Sort mappings by directory length descending (longest/most specific match first)
  mappings.sort((a, b) => b.dir.length - a.dir.length);

  return mappings;
}

/**
 * Resolves the PHP namespace given a relative path from the project root and PSR-4 mappings.
 * Example:
 * relativePath = "app/Http/Controllers/Api"
 * mapping = { prefix: "App\\", dir: "app/" }
 * result = "App\Http\Controllers\Api"
 */
export function resolveNamespaceFromPath(relativeDirPath: string, mappings: Psr4Mapping[]): string {
  // Normalize forward slashes and trim slashes
  const normalized = relativeDirPath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!normalized) {
    return 'App';
  }

  const normalizedWithTrailing = `${normalized}/`;

  for (const mapping of mappings) {
    if (normalizedWithTrailing.startsWith(mapping.dir)) {
      const remainder = normalizedWithTrailing.slice(mapping.dir.length).replace(/\/+$/, '');
      const prefixClean = mapping.prefix.replace(/\\+$/, '');

      if (!remainder) {
        return prefixClean;
      }

      const remainderNamespace = remainder.split('/').filter(Boolean).join('\\');

      return `${prefixClean}\\${remainderNamespace}`;
    }
  }

  // Fallback: if relativePath starts with 'app'
  if (normalized.startsWith('app/') || normalized === 'app') {
    const sub = normalized.slice(3).replace(/^\/+/, '');
    if (!sub) {
      return 'App';
    }
    return `App\\${sub.split('/').filter(Boolean).join('\\')}`;
  }

  // Ultimate fallback to App
  return 'App';
}

/**
 * Resolves the namespace for a target directory within a Laravel project root.
 */
export async function resolveNamespaceForFolder(
  projectRootUri: vscode.Uri,
  targetFolderUri: vscode.Uri,
): Promise<string> {
  const relative = path.relative(projectRootUri.fsPath, targetFolderUri.fsPath);
  const composerUri = vscode.Uri.joinPath(projectRootUri, 'composer.json');

  let mappings: Psr4Mapping[] = [{ prefix: 'App\\', dir: 'app/' }];

  try {
    const composerBytes = await vscode.workspace.fs.readFile(composerUri);
    const content = Buffer.from(composerBytes).toString('utf-8');
    mappings = parsePsr4Mappings(content);
  } catch {
    // Keep fallback mapping
  }

  return resolveNamespaceFromPath(relative, mappings);
}
