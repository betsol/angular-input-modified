# angular-input-modified changelog

## Version 1.1.3
(13 October 2014)

- Done some serious refactoring.
  Low-level details moved to a separate functions, so the main logic became more abstract and readable.
  Performance and memory footprint should also improve
- Fixed bug when empty element would not recover it's master value when reset is invoked on the parent form
- Introduced distribution files (normal and minified versions) and a proper build process using **Gulp**
- Improved README

## Version 1.1.2
(13 October 2014)

- Updated README (no code changes)
- Added new Demo via **Plunker**

## Version 1.1.1
(08 October 2014)

- Updated versioning (no code changes)

## Version 1.1.0
(30 May 2014)

- Improved initialization code
- Updated comparison function to allow more weak comparison like `"1"` (string) and `1` (integer)
- Fixed bug with `$setPristine` method, now it should work correctly in all cases
- Improved modification tracking
- Added property `ngForm.modifiedModels` (list of names for modified models)
- Demo updated

## Version 1.0.0
(18 May 2014)

- Public API stabilized
