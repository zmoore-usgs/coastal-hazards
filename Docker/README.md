# Coastal Hazards Docker Containers

## Docker Containers

Contents:

- Docker
- Docker Compose
- Docker Machine
- Building on the DOI network
- Parameterized Environment Variables
- Building Everything
- Running The Portal and GeoServer Locally
- Geoserver
- RServe
- 52N WPS
- Postgres/PostGIS
- Troubleshooting

---------------------------------

### Docker

======

The minimum version required for creating and running these containers is 1.12
or higher.

### Docker Compose

==============

While Docker Compose is not strictly necessary to run this series of containers,
it does make life much easier. Ideally you will only need a single command to
build all of the containers and then one command to run all of the containers
without having to know much more about their inner workings.

### Docker Machine

==============

This set of containers was built against Docker Machine but I don't think that
there's anything specific to using Docker Machine at this time. The only
difference you should experience if using just Docker is that instead of
connecting to containers via the IP of the Docker Machine, you'll connect to
localhost (unless you have some funky networking setup happening).

### Building on the DOI network

===========================

The DOI network has implemented an SSL intercept certificate that performs MITM
inspection to any HTTPS traffic. This causes many errors when dependencies are
attempting to be downloaded from GitHub, Python repositories and more. These
containers should automatically be able to detect when being built on the DOI
Network and will make the necessary modifications to be able to pull
dependencies when this is the case.

### Configuring SSL

================

To run the containers locally you must first create local development self-signed
SSL certificates. These can be easily created by running the `create_keys.sh`
script included in the `Docker/tomcat/ssl` directory.

### Running The Portal and GeoServer locally with all other services in containers

================

Run a command like the following to stand up the relevant containers:

```bash
docker-compose up cch_keycloak cch_postgres cch_rserve cch_n52_wps
```

Manually set up you tomcat instances locally for the Portal and GeoServer. Use
the dev tier's context.xml file or the Dockerized context.xml as a starting
point.

Modify the context.xml for those tomcat instances. Most references to services
should use either `localhost` or your docker machine vm IP. Ports for
containerized services are defined in
`coastal-hazards/Docker/docker-compose.yml`.

### Keycloak

=========

CCH Uses Keycloak for authentication into the mediation page, and as such when
running in Docker we must have a Keycloak instance available for the portal to
authenticate with. The cch_keycloak container is started and automatically
configured using the `cch_local_development_realm.json` file in
`./Docker/keycloak/`. In order for Keycloak to work properly it must be
available on **the same URL** both _within_ and _outside_ of the Docker network.
Within the network created by the Docker Compose file the Keycloak container
runs on the `keycloak` hostname, however this hostname is not directly available
to us outside of the Docker network. To get around this, you should add an entry
to your host OS `hosts` file to map the hostname `keycloak` to your Docker host
address so that when you open a browser to `keycloak:8083/auth/` you end up at
the keycloak site running on `<docker host>:8083`. This will allow the OAuth2
login flow to work properly between the Keycloak server and Portal server. This
step **must** be done regardless of whether the portal is running in Docker or
on a Tomcat instance outside of Docker.

To determine your Docker host address:

1. If using Docker installed directly on your machine as in Linux, use
   `localhost` or `127.0.0.1`
2. If using a remote Docker engine, use the IP of the host
   running your Docker engine.
3. If using Docker Machine, use the name of the VM to find out the ip. For
   example, if the VM's name is "workbench", issue the following command:

    `docker-machine ip workbench`

The `CCH` Realm that is automatically configured in the cch_keycloak container
includes three default users:

1. User: admin, Password: admin

    This local user is what should be used for modifying the Realm in Keycloak.
    This user does not have the role to access the mediation page in the portal
    itself, but is the only user with admin privileges within Keycloak.

2. User: cch_admin, Password: password

    This local user has the proper role to be granted access to the mediation
    page in the local Dockerized version of the coastal-hazards-portal
    application.

3. User: cch_user, Password: password

    This local user has no roles assigned and is meant to serve as a test user
    who might try to login to the mediation page without the proper role.

### Geoserver

=========

The Geoserver container runs standalone and does not require other containers to
be running in order to run. This container does not need DOI SSL certificates
for building. You can build the container by issuing:

`$ docker-compose build cch_geoserver`

You will end up with an image named cch_geoserver in your Docker repository. The
port exposed to the host will be 8081 and it will route to port 8080 on the
actual server. You can run the container by issuing:

`docker-compose up cch_geoserver`

Once the server is up, you will be able to connect to it by pointing a browser
to `http://<docker ip>:8081/geoserver`

### RServe

======

This container is standalone and does not depend on any other containers to run.
You can run the container by issuing:

`docker-compose up cch_rserve`

The container exposes port 6311 if you need to work with this RServe standalone

### 52N WPS

=======

The 52 North WPS container takes advantage of the RServe container to create the
WPS4R service. The RServe container should already be running in order for this
container to run properly. There is configuration in Docker Compose that causes
this container to wait until the CCH RServe container is operational before
launching this one. `docker-compose build cch_52n_wps`

When running this container from Docker Compose, RServe will automatically be
started if it is not currently running.

Once the server is up and running, you can access the server by pointing your
web browser at `http://<docker ip>:8082/wps`

### Postgres/PostGIS

================

This container is standalone and does not depend on any other containers to run.
You can run the container by issuing:

`docker-compose up cch_postgres`

The DOI SSL issue also applies to this container, so if you are on the DOI
network, issue:

`docker-compose build cch_postgres`

You will then be able to connect to the database via the ports and credentials
described in `docker-compose.yml` and `postgres/Dockerfile`

### Troubleshooting

=====================

#### Stale Container Contents

Not seeing the changes you expect? Try building without a cache by using
`--build` and/or `--force-recreate`.

Example:

```bash
docker-compose up --build --force-recreate cch_postgres cch_rserve cch_n52_wps
```

#### DB-related Startup Errors

The postgres container may fail to start the first time you try to
`docker-compose up` them, logging messages like:

`docker_cch_postgres_1 exited with code 255`

In that case, try running the same command again. You may get an error like
this:

```bash
ERROR: for cch_postgres  oci runtime error: container with id exists:

5ca07708b997ab70562ae32f79d4925b0bf7e35c7997a00ded90cf416685e038

Traceback (most recent call last): File "/usr/bin/docker-compose", line 9, in <module>
load_entry_point('docker-compose==1.7.1', 'console_scripts', 'docker-compose')()
File "/usr/lib/python2.7/site-packages/compose/cli/main.py", line 63, in main
log.error(e.msg) AttributeError: 'ProjectError' object has no attribute 'msg'
```

In that case, try the same command again.

#### 52N WPS Difficulties

If the 52N WPS is giving you a hard time, you can safely use the dev tier
instead.
