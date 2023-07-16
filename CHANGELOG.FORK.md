# Hard Fork Changelog

Document notable changes to this hard fork from [release-please-action](https://github.com/google-github-actions/release-please-action)

## Changes

- Updated to build and test under NPM 18/20
- Updated to use Jest,MSW, removed mocha,chai,sinon,nock. This allows the tests to pass on node 16, 18, and 20.
  I also find this makes it easier to work on since it was very picky about which versions of node it wanted.
  Hoping this will make others more interested in submitting PRs.

## Changes Incorporated Upstream

- None yet

## Notes

- Going to leave the code style following [Google](https://github.com/google/gts) even though its not my preferred style, it will make porting changes easier.
