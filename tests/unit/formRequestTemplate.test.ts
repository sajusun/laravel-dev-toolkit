import * as assert from 'assert';
import { renderFormRequestTemplate } from '../../src/templates/formRequestTemplate';

suite('Form Request Template Tests', () => {
  test('Renders valid Form Request with authorize and rules methods', () => {
    const code = renderFormRequestTemplate({
      className: 'StorePostRequest',
      namespace: 'App\\Http\\Requests',
    });

    assert.match(code, /^<\?php/);
    assert.match(code, /namespace App\\Http\\Requests;/);
    assert.match(code, /use Illuminate\\Foundation\\Http\\FormRequest;/);
    assert.match(code, /class StorePostRequest extends FormRequest/);
    assert.match(code, /public function authorize\(\): bool/);
    assert.match(code, /return true;/);
    assert.match(code, /public function rules\(\): array/);
    assert.match(code, /return \[/);
  });
});
