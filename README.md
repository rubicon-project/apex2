# Apex 2.0

## Requirements
- `nodejs@12.x`

## Build
To build non-minified development version, run:
```
npm run build
```
Resulting file will be in `build` folder.

To build minified version, run:
```
npm run dist
```
Resulting file will be in `dist` folder.

## Code Linting
```
npm run lint
```
Code style configuration file: `.eslintrc.js`.

## Unit Tests and Code Coverage Report
```
npm run test
```
The report can be found in the `coverage` folder:
- `lcov-report`: HTML code coverate report
- `lcov.info`: LCOV code coverage report
- `junit-test-report.xml`: Report in JUnit test data format
- `sonar-test-report.xml`: Report in Sonar generic test data format

## Documentation
```
npm run doc
```
The documentation in JSDoc format can be found in the `doc` folder.

## References for Developing with JWPlayer
- [JWPlayer Developer Documentation][1]


[1]: https://developer.jwplayer.com/jwplayer/docs
