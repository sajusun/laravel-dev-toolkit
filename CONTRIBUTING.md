# Contributing to Laravel Developer Toolkit

Thank you for your interest in contributing to Laravel Developer Toolkit! We welcome bug reports, feature suggestions, and pull requests.

## Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or v20.x recommended)
- [npm](https://www.npmjs.com/) (v10.x+)
- [Visual Studio Code](https://code.visualstudio.com/)

### Getting Started

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/sajusun/laravel-dev-toolkit.git
   cd laravel-dev-toolkit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile TypeScript:
   ```bash
   npm run compile
   ```

4. Launch Extension Development Host:
   - Open this repository in VS Code.
   - Press `F5` (or go to Run & Debug and start "Run Extension").
   - A new VS Code window will open with the extension loaded.
   - Open any Laravel project in that window to test commands.

## Available Scripts

- `npm run compile` - Compiles TypeScript files to `./out`.
- `npm run watch` - Watches for changes and compiles incrementally.
- `npm run build` - Bundles source into `./dist/extension.js` using esbuild.
- `npm run package` - Bundles and minifies for production release.
- `npm test` - Runs unit tests via Mocha with test fixtures.
- `npm run lint` - Runs ESLint.
- `npm run format` - Formats code using Prettier.
- `npm run format-check` - Verifies Prettier formatting compliance.

## Pull Request Guidelines

1. Create a feature branch: `git checkout -b feat/my-new-feature`
2. Follow TypeScript strict mode conventions.
3. Write automated unit tests for any new service, validator, or template.
4. Ensure all checks pass:
   ```bash
   npm run lint
   npm run format-check
   npm test
   npm run build
   ```
5. Submit a clear and descriptive Pull Request explaining the problem and solution.
