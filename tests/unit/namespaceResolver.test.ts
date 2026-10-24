import * as assert from 'assert';
import { parsePsr4Mappings, resolveNamespaceFromPath } from '../../src/services/namespaceResolver';

suite('Namespace Resolver Tests', () => {
  test('Parses standard Laravel composer.json PSR-4 mapping', () => {
    const json = JSON.stringify({
      autoload: {
        'psr-4': {
          'App\\': 'app/',
          'Database\\Factories\\': 'database/factories/',
        },
      },
    });

    const mappings = parsePsr4Mappings(json);
    assert.strictEqual(mappings.length >= 2, true);
    assert.strictEqual(
      mappings.some((m) => m.prefix === 'App\\' && m.dir === 'app/'),
      true,
    );
  });

  test('Provides fallback App\\ mapping if composer.json is empty or missing autoload', () => {
    const mappings = parsePsr4Mappings('{}');
    assert.strictEqual(mappings.length, 1);
    assert.strictEqual(mappings[0].prefix, 'App\\');
    assert.strictEqual(mappings[0].dir, 'app/');
  });

  test('Resolves standard controller path to App\\Http\\Controllers', () => {
    const mappings = [{ prefix: 'App\\', dir: 'app/' }];
    const ns = resolveNamespaceFromPath('app/Http/Controllers', mappings);
    assert.strictEqual(ns, 'App\\Http\\Controllers');
  });

  test('Resolves nested subfolder path to App\\Http\\Controllers\\Api\\V1', () => {
    const mappings = [{ prefix: 'App\\', dir: 'app/' }];
    const ns = resolveNamespaceFromPath('app/Http/Controllers/Api/V1', mappings);
    assert.strictEqual(ns, 'App\\Http\\Controllers\\Api\\V1');
  });

  test('Handles custom PSR-4 root namespace (e.g. Domain\\ -> src/)', () => {
    const mappings = [
      { prefix: 'Domain\\', dir: 'src/' },
      { prefix: 'App\\', dir: 'app/' },
    ];
    const ns = resolveNamespaceFromPath('src/Http/Controllers', mappings);
    assert.strictEqual(ns, 'Domain\\Http\\Controllers');
  });

  test('Handles Windows-style backslashes in directory paths', () => {
    const mappings = [{ prefix: 'App\\', dir: 'app/' }];
    const ns = resolveNamespaceFromPath('app\\Http\\Requests\\Auth', mappings);
    assert.strictEqual(ns, 'App\\Http\\Requests\\Auth');
  });

  test('Returns App as fallback for root or empty path', () => {
    const mappings = [{ prefix: 'App\\', dir: 'app/' }];
    const ns = resolveNamespaceFromPath('', mappings);
    assert.strictEqual(ns, 'App');
  });
});
