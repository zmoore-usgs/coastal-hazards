## Coastal Hazards Docker Containers
---------------------------------

Contents:
- Docker
- Docker Compose
- Docker Machine
- Building on the DOI network
- Geoserver
- RServe
- 52N WPS
- Postgres/PostGIS
- PyCSW


#### Docker
======

The minimum version required for creating and running these containers is 1.12 or higher.

#### Docker Compose
==============

While Docker Compose is not strictly necessary to run this series of containers, it does make life much easier. Ideally you will only need a single command to build all of the containers and then one command to run all of the containers without having to know much more about their inner workings.

#### Docker Machine
==============

This set of containers was built against Docker Machine but I don't think that there's anything specific to using Docker Machine at this time. The only difference you should experience if using just Docker is that instead of connecting to containers via the IP of the Docker Machine, you'll connect to localhost (unless you have some funky networking setup happening).

#### Building on the DOI network
===========================

If you are building these containers on a machine on the DOI network, there is a modification needed in order to properly finish the build. The reason is that the DOI network has implemented an SSL intercept certificate that performs MITM inspection to any HTTPS traffic. This causes many errors when dependencies are attempting to be downloaded from GitHub, Python repositories and more. By default, these containers are assuming they are not being built on the DOI network. To build on the DOI network, you should preface `doi_network="true"` prior to building:

`$ doi_network="true" docker-compose build [container name]`

With this modification, the containers that need it will include pulling the SSL root certificate from DOI and install it into openssl as a valid certificate.

#### Parameterized Environment Variables
===============================
Several of the containers accept parameterized environment files. By default, `docker-compose` will use `compose.env`. To customize the parameters, first create a copy of `compose.env`. Make sure the copy's file name starts with`compose` and ends with `.env`. An example valid custom env file name is `compose_johns_laptop.env`. Subsequently prepend each of your `docker-compose` commands with the middle portion of your custom env file. For example:

```
$ CCH_ENV_LOCAL="_johns_laptop" doi_network="true" docker-compose up cch_db cch_rserve cch_n52_wps cch_pycsw
```

Known Bugs:
Not all parameterizations work. In particular, most version numbers in custom env files are ignored in favor of the default values. This is detailed further [on Slack](https://usgs-cida.slack.com/archives/cch/p1476487434000753).

#### Geoserver
=========

The Geoserver container runs standalone and does not require other containers to be running in order to run.
This container does not need DOI SSL certificates for building. You can build the container by issuing:

`$ docker-compose build cch_geoserver`

You will end up with an image named cch_geoserver in your Docker repository. The port exposed to the host will be 8081 and it will route to port 8080 on the actual server. You can run the container by issuing:

`docker-compose up cch_geoserver`

Once the server is up, you will be able to connect to it by pointing a browser to `http://<docker ip>:8081/geoserver`

#### RServe
======

In order to build the CCH RServe container, you will first need to build the base rserve container which is also produced by us. To build the base rserve container, clone the GitHub repository at [https://github.com/USGS-CIDA/docker-rserve](https://github.com/USGS-CIDA/docker-rserve). When in the directory you've cloned to, just issue `docker-compose build`. The DOI SSL issue also applies to this container, so if you are on the DOI network, issue `doi_network="true" docker-compose build` instead.

Once the base container is built, you may then build the CCH RServe container by issuing:

`doi_network="true" docker-compose build cch_rserve`

This container is standalone and does not depend on any other containers to run. You can run the container by issuing:

`docker-compose up cch_rserve`

The container exposes port 6311 if you need to work with this RServe standalone

#### 52N WPS
=======

The 52 North WPS container takes advantage of the RServe container to create the WPS4R service. The RServe container should already be running in order for this container to run properly. There is configuration in Docker Compose that causes this container to wait until the CCH RServe container is operational before launching this one. The DOI SSL issue also applies to this container, so if you are on the DOI network, issue `doi_network="true" docker-compose build cch_52n_wps`. Otherwise, `docker-compose build cch_52n_wps` is sufficient.

When running this container from Docker Compose, RServe will automatically be started if it is not currently running.

Once the server is up and running, you can access the server by pointing your web browser at `http://<docker ip>:8082/wps`

#### Postgres/PostGIS
================


This container is standalone and does not depend on any other containers to run. You can run the container by issuing:

`docker-compose up cch_db`

The DOI SSL issue also applies to this container, so if you are on the DOI network, issue:

`doi_network="true" docker-compose build cch_db`

You will then be able to connect to the database via the ports and credentials described in `docker-compose.yml` and `postgres/Dockerfile`

#### PyCSW
=====

PyCSW requires a database. Accordingly, this container requires the postgres (`cch_db`) container.

You can run the container and its dependent db container by issuing:

`docker-compose up cch_pycsw`

The DOI SSL issue also applies to this container, so if you are on the DOI network, issue:

`doi_network="true" docker-compose build cch_pycsw`

