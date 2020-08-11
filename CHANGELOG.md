## [1.0.0-development.13](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.12...1.0.0-development.13) (2020-08-11)


### :sparkles: Feature

* Update to new version of base Tomcat image ([7bf0237](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/7bf0237a6a73ef68eb6acc6adb2cb48d8ae614d5))

## [1.0.0-development.12](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.11...1.0.0-development.12) (2020-07-30)


### :sparkles: Feature

* Fix setenv for all the things ([4810795](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/481079505ec38114f0cf36b9217060cdcf41912a))

## [1.0.0-development.11](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.10...1.0.0-development.11) (2020-07-30)


### :sparkles: Feature

* Remove unused JVM options ([1edf316](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/1edf31678a4ee343e263cda50c6b4fdef280863b))

## [1.0.0-development.10](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.9...1.0.0-development.10) (2020-07-30)


### :sparkles: Feature

* Add more java options ([6afa935](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/6afa93518f29326201b550484e36636c2f26f59d))

## [1.0.0-development.9](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.8...1.0.0-development.9) (2020-07-30)


### :sparkles: Feature

* Add some java opts ([4b278c6](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/4b278c6d937e9128dcb9eaa2188f7d68b8f7b65f))

## [1.0.0-development.8](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.7...1.0.0-development.8) (2020-07-30)


### :bug: Bugfix

* Cleanup catalina opts ([e6163ae](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/e6163ae188e30409da05cf40d540d4377e526152))

## [1.0.0-development.7](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.6...1.0.0-development.7) (2020-07-29)


### :repeat: CI

* bump version ([394a5b3](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/394a5b3df9f4fc83871a23f258d2ec79829646fb))

## [1.0.0-development.6](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.5...1.0.0-development.6) (2020-07-29)


### :sparkles: Feature

* Removing tomcat building and config from this repo ([060647c](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/060647cd329c7630cfa6d005cc045481196d2c83))

## [1.0.0-development.5](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.4...1.0.0-development.5) (2020-07-24)


### :repeat: CI

* test trigger ([bbb0030](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/bbb0030ada721d656d211f9f9701b799fea56055))

## [1.0.0-development.4](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.3...1.0.0-development.4) (2020-07-24)


### :repeat: CI

* Attempt triggering remote project ([8d1e9dc](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/8d1e9dc124e426fd1ae0321d5fd0d9091111e978))

## [1.0.0-development.3](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.2...1.0.0-development.3) (2020-07-15)


### :repeat: CI

* test build of all images ([f7773d1](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/f7773d19ab98f0307858a839e55d244c90891aea))

## [1.0.0-development.2](https://code.chs.usgs.gov/cmgp/coastal-hazards/compare/1.0.0-development.1...1.0.0-development.2) (2020-07-15)


### :repeat: CI

* test rserve build ([7722c4c](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/7722c4c1022fa5b179e501e58fedbb0a6495cf17))

## 1.0.0-development.1 (2020-07-15)


### :bug: Bugfix

* Double login ([258557a](https://code.chs.usgs.gov/cmgp/coastal-hazards/commit/258557a475335ebfb6355b16f6fbeed463e8e87b))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html). (Patch version X.Y.0 is implied if not specified.)

## [Unreleased]

### Added

- zmoore@usgs.gov  - Updated readmes
- zmoore@usgs.gov  - Moved multi-stage builds back within individual service dockerfiles
- isuftin@usgs.gov - Updates for Docker Compose to use Dockerfile specific for local artifacts
- isuftin@usgs.gov - portal - healthcheck in dockerfile
- isuftin@usgs.gov - portal - trust store password in setenv
- isuftin@usgs.gov - portal - setenv heapdump options set to java opts
- isuftin@usgs.gov - portal - internal port in compose.env
- isuftin@usgs.gov - portal - switched to using external addressing for containers
- isuftin@usgs.gov - geoserver - healthcheck
- isuftin@usgs.gov - geoserver - maintainer label in dockerfile
- isuftin@usgs.gov - n52 - healthcheck
- isuftin@usgs.gov - n52 - maintainer label in dockerfile
- isuftin@usgs.gov - wildcard jks certs
- isuftin@usgs.gov - pycsw - ability to configure port
- isuftin@usgs.gov - pycsw - ability to configure gzip encoding ability
- isuftin@usgs.gov - pycsw - direct config file mounting
- isuftin@usgs.gov - pycsw - health check
- isuftin@usgs.gov - pycsw - maintainer label in dockerfile
- isuftin@usgs.gov - initialization fix for postgres to use liquibase
- isuftin@usgs.gov - travis configuration to build and scan docker container for rserve
- isuftin@usgs.gov - maintainer label for rserve dockerfile
- isuftin@usgs.gov - maintainer label for postgres dockerfile
- isuftin@usgs.gov - healthcheck to rserve dockerfile
- isuftin@usgs.gov - healthcheck to postgres dockerfile
- isuftin@usgs.gov - this changelog

### Changed

- isuftin@usgs.gov - removed unused kvp in environments
- isuftin@usgs.gov - removed unused kvp in environments
- isuftin@usgs.gov - portal - hard coding keystore password in server.xml
- isuftin@usgs.gov - geoserver - hard-coding trust/keystore password into server.xml
- isuftin@usgs.gov - geoserver - creating secrets config for server.xml in compose
- isuftin@usgs.gov - geoserver - setting heapdump path properly in setenv.xml
- isuftin@usgs.gov - geoserver - getting latest psi-probe
- isuftin@usgs.gov - geoserver - cleaning up apk downloads
- isuftin@usgs.gov - geoserver - getting latest release of cch geoserver
- isuftin@usgs.gov - n52 - Dockerfile pulls latest release of n52
- isuftin@usgs.gov - n52 - hard-coded rserve user/pass into wps_config
- isuftin@usgs.gov - pycsw - took out commented options in config file
- isuftin@usgs.gov - pycsw - changed Dockerfile to use debian stretch specifically
- isuftin@usgs.gov - postgres init script now using ash instead of bash
- isuftin@usgs.gov - clean up postgres dependency install
- isuftin@usgs.gov - rserve - package dependencies
- isuftin@usgs.gov - Switched rserve container to use rocker/r-ver:3.3.3 to lock down
    changes in base container
- zmoore@usgs.gov - Refactored local development docker setup to mount config files at
    container startup rather than copy at build to simplify configuration.
- zmoore@usgs.gov - Adjust containers to run in "host" network mode to simplify
    configuration and make things work.
- zmoore@usgs.gov - Adjusted actual tomcat ports of GeoServer and N52 WPS so that they
    work properly in host network mode.

### Removed

- isuftin@usgs.gov - portal - deprecated -XX:MaxPermSize from setenv
- isuftin@usgs.gov - portal - setenv uses internal addressing for cch_csw_internal_endpoint
- isuftin@usgs.gov - portal - coastal-hazards.geoserver.endpoint param from context.xml
- isuftin@usgs.gov - geoserver - keystore password arg in dockerfile
- isuftin@usgs.gov - geoserver - run.sh
- isuftin@usgs.gov - n52 - run file no longer manipulates wps_config
- isuftin@usgs.gov - pycsw - runtime sed replacement for config file
- isuftin@usgs.gov - processing to change the rserve password file inline
- isuftin@usgs.gov - bash installation for postgres init script
- isuftin@usgs.gov - jks removed from .gitignore
