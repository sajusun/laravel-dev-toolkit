import * as assert from 'assert';
import { isValidPhpIdentifier, validateClassInput } from '../../src/services/phpValidator';

suite('PHP Validator Tests', () => {
  test('Validates valid single identifiers', () => {
    assert.strictEqual(isValidPhpIdentifier('User'), true);
    assert.strictEqual(isValidPhpIdentifier('UserController'), true);
    assert.strictEqual(isValidPhpIdentifier('User_Controller'), true);
    assert.strictEqual(isValidPhpIdentifier('_PrivateClass'), true);
    assert.strictEqual(isValidPhpIdentifier('Api2Controller'), true);
  });

  test('Rejects PHP reserved keywords as identifiers', () => {
    assert.strictEqual(isValidPhpIdentifier('class'), false);
    assert.strictEqual(isValidPhpIdentifier('function'), false);
    assert.strictEqual(isValidPhpIdentifier('return'), false);
    assert.strictEqual(isValidPhpIdentifier('switch'), false);
    assert.strictEqual(isValidPhpIdentifier('parent'), false);
    assert.strictEqual(isValidPhpIdentifier('static'), false);
    assert.strictEqual(isValidPhpIdentifier('CLASS'), false);
  });

  test('Rejects invalid characters in identifiers', () => {
    assert.strictEqual(isValidPhpIdentifier('123Controller'), false);
    assert.strictEqual(isValidPhpIdentifier('User-Controller'), false);
    assert.strictEqual(isValidPhpIdentifier('User.Controller'), false);
    assert.strictEqual(isValidPhpIdentifier('User@Controller'), false);
    assert.strictEqual(isValidPhpIdentifier(''), false);
  });

  test('Validates simple class input with suffix auto-append', () => {
    const res1 = validateClassInput('User', 'Controller');
    assert.strictEqual(res1.isValid, true);
    assert.strictEqual(res1.className, 'UserController');
    assert.strictEqual(res1.subNamespace, '');
    assert.strictEqual(res1.subPath, '');

    const res2 = validateClassInput('UserController', 'Controller');
    assert.strictEqual(res2.isValid, true);
    assert.strictEqual(res2.className, 'UserController');
  });

  test('Validates nested class input with subpaths', () => {
    const res = validateClassInput('Api/V1/Order', 'Controller');
    assert.strictEqual(res.isValid, true);
    assert.strictEqual(res.className, 'OrderController');
    assert.strictEqual(res.subNamespace, 'Api\\V1');
    assert.strictEqual(res.subPath, 'Api/V1');
  });

  test('Rejects directory traversal attempts', () => {
    const res1 = validateClassInput('../Malicious', 'Controller');
    assert.strictEqual(res1.isValid, false);
    assert.match(res1.error || '', /traversal/i);

    const res2 = validateClassInput('Api/../../Malicious', 'Controller');
    assert.strictEqual(res2.isValid, false);
  });

  test('Rejects inputs containing reserved keywords in subpaths', () => {
    const res = validateClassInput('Api/class/UserController', 'Controller');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /reserved keyword/i);
  });

  test('Rejects empty or whitespace-only inputs', () => {
    const res = validateClassInput('   ', 'Controller');
    assert.strictEqual(res.isValid, false);
    assert.match(res.error || '', /empty/i);
  });
});
