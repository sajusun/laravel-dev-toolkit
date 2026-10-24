import * as assert from 'assert';
import { renderApiResourceTemplate } from '../../src/templates/apiResourceTemplate';

suite('API Resource Template Tests', () => {
  test('Renders valid JsonResource with toArray method', () => {
    const code = renderApiResourceTemplate({
      className: 'UserResource',
      namespace: 'App\\Http\\Resources',
    });

    assert.match(code, /^<\?php/);
    assert.match(code, /namespace App\\Http\\Resources;/);
    assert.match(code, /use Illuminate\\Http\\Resources\\Json\\JsonResource;/);
    assert.match(code, /class UserResource extends JsonResource/);
    assert.match(code, /public function toArray\(Request \$request\): array/);
    assert.match(code, /return parent::toArray\(\$request\);/);
  });
});
