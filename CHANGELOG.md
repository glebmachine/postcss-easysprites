# Changelog

## 1.1.0 (2020-07-18)

- Add `outputStylesheetPath` option. Big thank to [@kenfoo](https://github.com/kenfoo).
- Update minor dependencies.

## 1.0.0 (2019-11-02)

- Switch from exports to module.exports syntax.
- Add @async jsdoc param documentation.
- Use object destructuring for postcss decl function.
- Switch to jsdoc eslint plugin with recommended settings.
- Update all non-major dependencies.

## 1.0.0-beta.1 (2019-08-09)

- Removed dependency on lodash by replace it with native functions.
- Added jsdoc library and npm script.
- Converted promises to async/await syntax.
- Updated sprite layout visual tests.
- Updated minor dependencies.

## 1.0.0-alpha.3 (2019-07-20)

- Adds more test coverage.
- Replaces more lodash functions with native ones.
- Updates dependencies.
- General refactoring.

## 1.0.0-alpha.2 (2019-06-30)

- Replaces Q promise libraries with native promises.
- Removes .npmignore in favor of package.json files config.
- Replaces async library with map and async/await.
- Replaces some lodash functions with native ones.

## 1.0.0-alpha.1 (2019-06-24)

This is the first 1.0.0 alpha release of postcss-easysprites.

## Breaking Changes

- The 1.0.0 release only supports Nodejs version >= 8.0. If you need support for earlier versions of Nodejs, you can continue to use the `0.1.10` release.

### New User Features

- Added option to output the pixel `height` and `width` of the image.
- Added option to choose the [layout algorithm](https://github.com/twolfson/layout) spritesmith should use.
- Expanded background-color support when using `background` property. Color keyword names, `transparent`, `currentColor`, RGB, RGBa, HSL, HSLa, are supported.
- Updated all dependencies to their latest versions, include PostCSS, Gulpjs, and lodash.

### DX Features

- Updated to use more ES6 syntax features.
- Added additional test coverage, including visual regression tests.
- Modularized plugin components.
- Moved from jscs to eslint + prettier.
- Add commitizen git configuration support.

## 0.1.10 (2019-06-08)

- Update lodash dependency to 4.17.11.
- Replace custom console.log override 'fixture-stdout' library.
- Updated other non-major dependencies.
- Update Travis config to test with more recent versions of Node.
- Add package-lock.json file so consistent install of dependencies can be assured.

## 0.1.9 (2017-12-18)

- Save .parent prior to replaceWith #181. Thanks for [@AMar4enko](https://github.com/AMar4enko) Cheers!)

## 0.1.8 (2017-01-18)

- Fixed minified css support. Big thank to [@jonas8](https://github.com/jonas8) Cheers!

## 0.1.7 (2016-07-04)

- Package deps fixed, huge thanks and lots of beer for [Daniel Lindenkreuz @dlindenkreuz](http://github.com/dlindenkreuz))

## 0.1.6 (2016-06-26)

- Package deps updated (broken!)

## 0.1.5 (2016-04-21)

- Fixes improper rule property in background-color extraction function.
- Fixed linter warnings in plugin tests.

Thanks for [Eugene Romanovsky @setage](http://github.com/setage) again 🍺

## 0.1.4 (2016-04-20)

- Deprecation warnings fixed (Thanks for [Eugene Romanovsky @setage](http://github.com/setage))

## 0.1.3 (2016-04-20)

- Added tests
