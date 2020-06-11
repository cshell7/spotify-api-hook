# npm-package-templata

A template to give you a quick start on making npm packages

## Quickstart

1. `npm i`
1. Update name/info in `package.json`
1. Develop your npm package in `/src`
1. Test your changes:
   1. `npm run test:all`
   1. Manually Test your changes:
      1. `npm link`
      1. `cd /your-project-you-want-to-use-this-package-in`
      1. `npm link your-npm-package`
      1. Manually Test that the package works in your project
1. `npm login`
1. `npm version major|minor|patch`
1. `npm publish`
1. In your project `npm i your-npm-package`
