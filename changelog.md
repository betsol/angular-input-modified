# angular-input-modified changelog

## Version 1.2.0
(12 November 2014)

- [\#4][issue-4]: Doesn't work with Ui-Bootstrap's Timepicker
  (thanks to [@prudd][user-prudd]).
- [\#2][issue-2]: Fixed *ngModel* existence check.
  Issue revisited.
  Implemented general solution for both `1.2.x` and `1.3.x` branches of AngularJS
- Added configuration provider
- Introduced ability to disable directive globally
- Introduced ability to enable directive only for specific elements or forms
- CSS classes are now configurable
- Added demos to the repository
- Added *Gulp* task to deploy demos to *GitHub Pages*
- Updated README

## Version 1.1.6
(10 November 2014)

- [\#2][issue-2]: Fixed *ngModel* existence check
  (thanks to [@atte-backman][user-atte-backman]).
- [\#3][issue-3]: Fixed a problem when *ngModel* pointing to a missing variable will cause exception when input is reset
  (thanks to [@kornalius][user-kornalius]).
- Done some minor refactoring.
- Updated Demo plunk.

## Version 1.1.5
(29 October 2014)

- AngularJS 1.3 is now tested and supported.
- Updated Demo plunk.

## Version 1.1.4
(25 October 2014)

- Removed unused `gulp-clean` dependency.
- Fixed an issue where form modification state will not be properly updated after a call to form's `$setPristine()` method.

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


  <!-- *** LINKS *** -->

  <!-- Issues -->

  [issue-2]: https://github.com/betsol/angular-input-modified/pull/2
  [issue-3]: https://github.com/betsol/angular-input-modified/issues/3
  [issue-4]: https://github.com/betsol/angular-input-modified/issues/4
  
  <!-- Users -->
  
  [user-atte-backman]: https://github.com/atte-backman
  [user-kornalius]: https://github.com/kornalius
  [user-prudd]: https://github.com/prudd
