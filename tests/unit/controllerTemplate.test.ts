import * as assert from 'assert';
import { renderControllerTemplate } from '../../src/templates/controllerTemplate';

suite('Controller Template Tests', () => {
  test('Renders plain controller', () => {
    const code = renderControllerTemplate({
      className: 'UserController',
      namespace: 'App\\Http\\Controllers',
      type: 'plain',
    });

    assert.match(code, /^<\?php/);
    assert.match(code, /namespace App\\Http\\Controllers;/);
    assert.match(code, /use Illuminate\\Http\\Request;/);
    assert.match(code, /class UserController extends Controller/);
    assert.strictEqual(code.includes('public function index()'), false);
  });

  test('Renders resource controller with full CRUD methods', () => {
    const code = renderControllerTemplate({
      className: 'PostController',
      namespace: 'App\\Http\\Controllers',
      type: 'resource',
    });

    assert.match(code, /public function index\(\)/);
    assert.match(code, /public function create\(\)/);
    assert.match(code, /public function store\(Request \$request\)/);
    assert.match(code, /public function show\(string \$id\)/);
    assert.match(code, /public function edit\(string \$id\)/);
    assert.match(code, /public function update\(Request \$request, string \$id\)/);
    assert.match(code, /public function destroy\(string \$id\)/);
  });

  test('Renders API controller without create and edit methods', () => {
    const code = renderControllerTemplate({
      className: 'ProductController',
      namespace: 'App\\Http\\Controllers\\Api',
      type: 'api',
    });

    assert.match(code, /namespace App\\Http\\Controllers\\Api;/);
    assert.match(code, /public function index\(\)/);
    assert.match(code, /public function store\(Request \$request\)/);
    assert.match(code, /public function show\(string \$id\)/);
    assert.match(code, /public function update\(Request \$request, string \$id\)/);
    assert.match(code, /public function destroy\(string \$id\)/);
    // API controllers should not have create or edit
    assert.strictEqual(code.includes('public function create()'), false);
    assert.strictEqual(code.includes('public function edit('), false);
  });

  test('Renders invokable controller with __invoke method', () => {
    const code = renderControllerTemplate({
      className: 'ProvisionServerController',
      namespace: 'App\\Http\\Controllers',
      type: 'invokable',
    });

    assert.match(code, /public function __invoke\(Request \$request\)/);
  });
});
