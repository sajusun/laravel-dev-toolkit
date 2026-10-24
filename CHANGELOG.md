# Changelog

All notable changes to the **Laravel Developer Toolkit** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-24

### Added
- **Laravel Project Detection**: Automatically verifies Laravel workspace roots using `artisan`, `app/`, and `composer.json` without scanning `node_modules` or `vendor`.
- **Controller Generator (`laravel-toolkit.createController`)**:
  - Supports Plain, Resource (full CRUD), API Resource, and Invokable (`__invoke`) controllers.
  - Subfolder resolution (e.g. `Api/V1/UserController`).
- **Form Request Generator (`laravel-toolkit.createFormRequest`)**:
  - Generates strongly-typed `authorize(): bool` and `rules(): array` methods with PSR-12 formatting.
- **API Resource Generator (`laravel-toolkit.createApiResource`)**:
  - Generates standard `JsonResource` class with `toArray()` implementation.
- **PSR-4 Namespace Resolver**:
  - Dynamically parses `composer.json` autoload mappings to resolve correct namespaces across nested folders.
- **Non-Destructive File Safety**:
  - Prompts with confirmation before overwriting any existing file.
  - Prevents path traversal and rejects PHP reserved keywords.
- **Explorer Context Menu Integration**:
  - Right-click any folder in the Explorer to generate files directly into that location.
