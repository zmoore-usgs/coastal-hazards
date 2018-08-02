# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html). (Patch version X.Y.0 is implied if not specified.)

## [Unreleased]
### Added
- isuftin@usgs.gov - travis configuration to build and scan docker container for rserve
- isuftin@usgs.gov - maintainer label for rserve dockerfile
- isuftin@usgs.gov - healthceck to rserve dockerfile
- isuftin@usgs.gov - this changelog

### Changed
 - isuftin@usgs.gov - rserve package dependencies
 - isuftin@usgs.gov - Switched rserve container to use rocker/r-ver:3.4.3 to lock down
  changes in base container

### Removed
 - isuftin@usgs.gov - processing to change the rserve password file inline
