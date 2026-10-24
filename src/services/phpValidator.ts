/**
 * List of PHP reserved words and keywords that cannot be used as class names or namespace segments.
 */
export const PHP_RESERVED_KEYWORDS = new Set([
  'abstract',
  'and',
  'array',
  'as',
  'break',
  'callable',
  'case',
  'catch',
  'class',
  'clone',
  'const',
  'continue',
  'declare',
  'default',
  'die',
  'do',
  'echo',
  'else',
  'elseif',
  'empty',
  'enddeclare',
  'endfor',
  'endforeach',
  'endif',
  'endswitch',
  'endwhile',
  'eval',
  'exit',
  'extends',
  'false',
  'final',
  'finally',
  'fn',
  'for',
  'foreach',
  'function',
  'global',
  'goto',
  'if',
  'implements',
  'include',
  'include_once',
  'instanceof',
  'insteadof',
  'interface',
  'isset',
  'list',
  'match',
  'namespace',
  'new',
  'null',
  'or',
  'parent',
  'print',
  'private',
  'protected',
  'public',
  'readonly',
  'require',
  'require_once',
  'return',
  'self',
  'static',
  'switch',
  'throw',
  'trait',
  'true',
  'try',
  'unset',
  'use',
  'var',
  'while',
  'xor',
  'yield',
]);

// PHP identifier regex: [a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*
const PHP_IDENTIFIER_REGEX = /^[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  className?: string;
  subNamespace?: string;
  subPath?: string;
}

/**
 * Validates a single PHP class name or namespace segment.
 */
export function isValidPhpIdentifier(identifier: string): boolean {
  if (!identifier || typeof identifier !== 'string') {
    return false;
  }
  if (PHP_RESERVED_KEYWORDS.has(identifier.toLowerCase())) {
    return false;
  }
  return PHP_IDENTIFIER_REGEX.test(identifier);
}

/**
 * Validates a user-supplied input such as "UserController" or "Api/V1/UserController".
 * Ensures safe paths, valid identifiers, and no path traversal.
 */
export function validateClassInput(input: string, suffix?: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Name cannot be empty.' };
  }

  // Prevent path traversal
  if (trimmed.includes('..') || trimmed.startsWith('/') || trimmed.startsWith('\\')) {
    return {
      isValid: false,
      error: 'Invalid name. Path traversal or leading slashes are not allowed.',
    };
  }

  // Normalize slashes
  const normalized = trimmed.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { isValid: false, error: 'Name cannot be empty.' };
  }

  for (const segment of segments) {
    if (!isValidPhpIdentifier(segment)) {
      if (PHP_RESERVED_KEYWORDS.has(segment.toLowerCase())) {
        return {
          isValid: false,
          error: `"${segment}" is a PHP reserved keyword and cannot be used in a class or namespace.`,
        };
      }
      return {
        isValid: false,
        error: `"${segment}" is not a valid PHP identifier. Use letters, numbers, and underscores only.`,
      };
    }
  }

  let className = segments[segments.length - 1];

  // Optional suffix auto-completion if not already present
  if (suffix && !className.toLowerCase().endsWith(suffix.toLowerCase())) {
    className = `${className}${suffix}`;
    segments[segments.length - 1] = className;
  }

  const subNamespaceSegments = segments.slice(0, segments.length - 1);
  const subNamespace = subNamespaceSegments.length > 0 ? subNamespaceSegments.join('\\') : '';
  const subPath = segments.slice(0, segments.length - 1).join('/');

  return {
    isValid: true,
    className,
    subNamespace,
    subPath,
  };
}
