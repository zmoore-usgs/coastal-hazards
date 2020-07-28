# Coastal Change Hazards Portal

With more than half of the American people living along our Nation's coasts,
extreme beach and cliff erosion can dramatically alter coastal ecosystems, cause
billions of dollars' worth of coastal development, and even threaten human life.

Through projects like the National Assessment of Coastal Change Hazards and
regional studies of nearshore processes, the US Geological Survey is uncovering
the science behind coastal change hazards and providing data, tools, and
scientific knowledge to help coastal planners, resource managers, and emergency
operations as they work to reduce risk along our coastlines.

------------

## Sub Components

This repo contains the many sub-components that make up the whole portal application. The portal is developed in Java and uses Maven for dependency management and as such the sub-projects are generally representing different modules of the root Maven project for the portal (see pom.xml at the root).

### 1. coastal-hazards-commons

**Description:** A Java Library holding common models and utilities for various other sub-projects in this repo. Allows for re-use of several classes across all sub-projects.

**Language:** Java

**Executable:** No

**Code Used By:** coastal-hazards-portal, coastal-hazards-wps

### 2. coastal-hazards-export

**Description:** A Java Library holding data export utilities for the portal. Includes utilities for generating GML and WMS files.

**Language:** Java

**Executable:** No

**Code Used By:** coastal-hazards-portal

### 3. coastal-hazards-geoserver

**Description:** A fork of GeoServer with several customizations for CCH. Built using a WAR Overlay to add CCH-specific configuration and functionality into the base GeoServer WAR file.

**Language:** Java

**Executable:** Yes

**Code Used By:** N/A

### 4. coastal-hazards-liquibase

**Description:** A set of Liquibase scripts for constructing the CCH schema in a new PostgreSQL Database. Additionally includes a Dockerfile for creating a PostgreSQL database and executing the liquibase scripts on it to quickly get a database available for local development and integration testing.

**Language:** Liquibase, SQL

**Executable:** Yes

**Code Used By:** N/A

### 5. coastal-hazards-n52

**Description:** A 52N-based WPS Server that handles communication between the portal and Rserve for generating item thumbnails and extracting metadata.

**Language:** Java

**Executable:** Yes

**Code Used By:** N/A

### 6. coastal-hazards-portal

**Description:** The main CCH Portal project. This holds all of the code for running the portal itself including the UI and backend services that feed the UI (serving items, generating SLDs, managing items, etc.)

**Language:** Java, JavaScript

**Executable:** Yes

**Code Used By:** N/A

### 7. coastal-hazards-wps

**Description:** A Java Library holding some custom WPS processes that the portal utilizes. These processes are injected into the Coastal Hazards GeoServer as part of its WAR Overlay. This includes custom processes for fetching and unzipping compressed layer data uploaded through the portal UI and generating ribbons for ribbonable data.

**Language:** Java

**Executable:** No

**Used By:** coastal-hazards-geoserver

### 8. ehcache-shaded

**Description:** A wrapper around the ehcache Java project which pulls in some additional dependencies needed by the portal and overrides some build settings. The version of ehcache built by this project is used by the main Coastal Hazards Portal project for caching frequently accessed items from the database to allow for faster display on the UI.

**Language:** Java

**Executable:** No

**Used By:** coastal-hazards-portal

### 9. coastal-hazards-integration-testing

**Description:** A package of integration tests written with JMeter that can be used to test the behavior of a running portal stack. **Note** that these tests will result in every item being deleted on the stack they are run against so they should only ever be run against a local stack or integration testing stack. More information on these can be found in the readme in the project sub-directory.

**Language:** Multiple

**Executable:** Yes

**Used By:** N/A

------------

## Using Docker For Local Deployment

### TL;DR - Just get it running

1. Add a line to your operating system `hosts` (Ubuntu `/etc/hosts`) file with: `127.0.0.1 keycloak`
2. From project root directory `docker-compose up` or `docker-compose up -d` (for daemonized/detached mode)
3. Visit `http://localhost:8080/coastal-hazards-portal/`
4. Visit `http://localhost:8080/coastal-hazards-portal/publish/item/`
    - Login - **Username**: `cch_admin` | **Password**: `password`

If you're going to be doing active development on the project locally it is **_highly_** suggested to read through the entirety of this readme. While it is very long, the process for building and running this project locally can be very confusing, especially if you are newer to Docker.

### TL;DR 2 - Make changes to the portal itself and see them locally

1. Add a line to your operating system `hosts` (Ubuntu `/etc/hosts`) file with: `127.0.0.1 keycloak`
2. **Terminal 1:** From project root directory `docker-compose build cch_tomcat cch_dependencies`
    - This will build the two base images that the rest of the portal Tomcat images (cch_portal, cch_geoserver, and cch_n52_wps) depend on. If these images have not been built locally you will see an error about not being able to pull `cch_tomcat` or `<project>_build` when building one of the portal Tomcat images.
    - If you make changes to the pom.xml file of one of the CCH projects you should rebuild the cch_dependencies image via `docker-compose build cch_dependencies` so that the updated dependencies are cached and future builds are faster.
    - To ensure that you always have an up-to-date cch_dependencies image you can preface any builds of cch_portal with cch_dependencies like this: `docker-compose build cch_dependencies cch_portal`
3. **Terminal 1:** From project root directory `docker-compose up cch_keycloak cch_postgres cch_rserve cch_n52_wps cch_geoserver`
    - Add `-d` to `docker-compose up` before the service names if you want to launch them in daemonized/detached mode which will allow you to re-use the same terminal for the steps below.
    - Add `--build` to `docker-compose up` if you want to rebuild any of these images that you might already have locally
    - Once these containers are up you shouldn't have to touch them or this terminal
4. **Terminal 2:** From project root directory `docker-compose up --build cch_portal`
    - Add `-d` to `docker-compose up --build` before the service name if you want to launch build/launch the portal in daemonized/detached mode which will allow you to re-use the same terminal for the steps below.
    - If you make changes to the pom.xml file of one of the CCH projects you should rebuild the cch_dependencies image via `docker-compose build cch_dependencies` so that the updated dependencies are cached and future builds are faster.
5. Visit `http://localhost:8080/coastal-hazards-portal/`
6. Visit `http://localhost:8080/coastal-hazards-portal/publish/item/`
    - Login - **Username**: `cch_admin` | **Password**: `password`
7. Make changes to portal code...
8. **Terminal 3:** From project root directory `docker-compose stop cch_portal`
    - After running this **Terminal 2** should become interactive again
9. Repeat steps 4-7...

### High-Level Explanation

While this project does not currently run using Docker Containers when deployed
into a server environment, this project contains Dockerfiles to aid in setting
up a local development environment quickly.

Within the `docker` sub-folders of each project, as well as the top-level
`Docker` folder, there are configuration files used for each service that must
run locally for a fully functioning environment. These configuration files are
mounted into the containers at runtime so that changes to the configuration
files can be made without needing to rebuild the images.

The containers are orchestrated using the included `docker-compose.yml` file
which will launch a total of 6 docker containers:

1. CCH KeyCloak - A pre-configured KeyCloak instance which the portal will use for
user authentication/authorization.

2. CCH Rserve - The Rserve instance which is used for generating the thumbnail
images when uploading new items.

3. CCH Postgres - The Postgres DB which stores uploaded item data.

4. CCH Geoserver - The GeoServer instance which stores and serves uploaded shapefiles

5. CCH N52 WPS - The N52 WPS Server which is used to parse some metadata from uploaded items and facilitate interaction between the portal and Rserve in order to calculate additional metadata about uploaded data and generate thumbnails.

6. CCH Portal - The portal services and UI

If accessing a secure part of the portal application you will be directed to
   login via the local Keycloak container that should be running on
   `https://keycloak:8446` (this is why the setup section below is
   important). There are 3 default local users configured in the Keycloak
   container:

    1. User: admin, Password: admin

        This local user is what should be used for modifying the Realm in
        Keycloak. This user does not have the role to access the mediation page
        in the portal itself, but is the only user with admin privileges within
        Keycloak.

    2. User: cch_admin, Password: password

        This local user has the proper role to be granted access to the
        mediation page in the local Dockerized version of the
        coastal-hazards-portal application.

    3. User: cch_user, Password: password

        This local user has no roles assigned and is meant to serve as a test
        user who might try to login to the mediation page without the proper
        role.

### System Setup

1. In order for the full authorization flow to work with keycloak you will need to add
    an entry to your operating system's `hosts` file. On Ubuntu this is found at
    `/etc/hosts`. The entry needs to map the alias `keycloak` to the local IP on your
    your machine. An example entry would look like:

    `127.0.0.1 keycloak`

### Building and running the docker containers

There are two ways to build the docker containers for this project:

1. From Local Sources - This means building the containers by building the portal from the source code in this repo and then copying the built artifacts into their respective containers. This is the version of the build process that should normally be used when working on the portal locally.

2. From Remote Sources - This means building the containers by pulling down pre-built binaries of the various portal components and using those in the containers instead of building the portal from the source code in this repo. This is generally used for integration testing or building images for deployment and shouldn't be used when developing the portal locally unless you need to run a specific, pre-built version of the portal for debugging or testing purposes.

#### Building from local sources

The following projects in this repo have the ability to build their containers from local sources:

- coastal-hazards-portal
- coastal-hazards-geoserver
- coastal-hazards-n52
- coastal-hazards-liquibase

Each of the listed projects includes two different Dockerfiles: `Dockerfile` and `Dockerfile.remote`

For Java projects `Dockerfile` is the same as `Dockerfile.remote` except that instead of pulling a specified pre-built version of the project from a remote repository it instead utilizes a Docker Multistage Build to build the project from the source code in the repo and then copy the built artifact into the container. The liquibase project doesn't use Maven for building and doesn't require a Multistage build, it just copies the sources into the container instead of pulling a specific version of the sources from the remote Git repo. The `docker-compose-local.yml` file at the root of the project enables building of the `.local` versions of each supported project by overriding the target Dockerfile for `docker-compose build` and `docker-compose up`.

The Docker Multistage Build for Java projects works by first creating a maven-based build container (such as `portal_build`), copying all of the project POM.xml files into the container, and then running a command to pull down all of the required dependencies for the specified projects via Maven. After that step is completed the source code for the specific project (and the source for any of the other projects that are required) is copied into the container and then built via Maven.

This order is important because it allows us to significantly speed up builds after the first build (unless the POM files change). By copying in the POM files first and then downloading all of the necessary dependencies we take advantage of Docker Layer Caching to allow subsequent Docker builds to skip that entire (very long) step and unless the POM files change.

The docker images built from both the `Dockerfile` and `Dockerfile.remote` use the same image name which means that regardless of which version you build the name used to bring them up via docker-compose remains the same.

To build the images from local sources:

1. Execute `docker-compose build` to build all images
    - This should begin the process of building. This process will take some
      time, possibly in upwards of 15-20 minutes depending on network speed.

2. To launch the built images into containers, execute: `docker-compose up`
    - Note: To limit output, only include the containers you want to see. For
      example, `docker-compose up cch_portal` will only show the output for
      `cch_portal`

### **Stopping the docker containers**

In order to bring down the running cch stack run the following command:

`docker-compose down`

This will bring down _all_ of the running CCH services defined in the
`docker-compose.yml` file. Note that running this command will also __REMOVE__
the associated docker containers meaning all data stored in them will be lost.

To bring down a select service you can use the command `docker-compose stop <service name>`.
Example: `docker-compose stop cch_portal`

An alternative method for only brining down select services is to run
`docker ps` to find the container ID of the service that you'd like to bring down.
Once you've found the container ID run `docker stop <container ID>` to stop
that service and then, if you'd like to also remove the container, run
`docker rm <container ID>`.

### **Modifying the and rebuilding the services** (Highly suggested reading)

When you launch a service using `docker-compose` it does _NOT_ always re-build
the docker image for the service it is trying to launch. If there is already an
existing image for the service you'd like to launch then it will use that rather
than building a new one.

In order to build a new docker image for a specific service you can either
remove the existing image (which will force `docker-compose` to rebuild it), or
you can overwrite it with a newer image using `docker-compose up --build <service>`.

If you remove the existing image note that the _entire_ image building process
will need to run again, but if you simply run `docker-compose up --build <service>` and overwrite the
existing image Docker will re-use the parts of the existing image that have not
been modified.

Any re-built services can then be brought up via the service-specific version of
`docker-compose` such as: `docker-compose up cch_portal`.

#### Example: Modifying, rebuilding, and relaunching the portal

By far the most common workflow used when working on this project locally is to make changes to the main Coastal Hazards Portal project without making changes to any of the others. By correctly using the docker-compose build process it is easy to launch all of the services that the portal requires and then launch the portal itself with the ability to easily bring down, rebuild, and re-launch the portal without affecting the other running services.

Since we're only working on the portal project in this example we could build and run the containers for all of the other services using their remote sources instead of local sources because we don't need to have any changes propagate up to those services, however for this example I'm going to build everything (that can be) from local sources.

The coastal hazards portal project itself requires PostgreSQL DB, Rserve, GeoServer, KeyCloak, and N52 WPS to all be running in order for it to be fully functional. As such, we need to first bring up all of these services via Docker Compose.

In a terminal window executing the following command will build all of the portal's required services from their local sources (for supported projects):

`docker-compose build cch_postgres cch_rserve cch_geoserver cch_n52_wps`

If you wanted to build and run all of the portal's required services from their remote sources instead of using local sources you would run the following:

`docker-compose -f docker-compose.yml -f docker-compose-remote.yml build cch_postgres cch_rserve cch_geoserver cch_n52_wps`

Once you've built the images for the required services you can bring all of the required service up via:

`docker-compose up cch_keycloak cch_postgres cch_rserve cch_geoserver cch_n52_wps`

You'll notice that the `docker-compose up` command added an extra service: cch_keycloak. The reason this is not built with the others is that for the cch_keycloak service we simply use and configure a pre-built docker image for KeyCloak rather than building our own. Thus it does not need to be built.

Note that running `docker-compose up` will also inherently trigger `docker-compose build` for any services that don't already have images available locally. You can also force `docker-compose up` to execute docker-compose build even if the images already exist locally with the `docker-compose up --build` flag. Combining these two steps into a single call is definitely an acceptable approach, but splitting them out into their separate calls makes it easier to understand what exactly is happening in an example so that's why it was done here. Using the `docker-compose up --build` command the steps above can be condensed down to:

At this point all of the services required to run the portal should be up and running, so we can build and bring up the portal itself. To build the portal from our local sources open a new terminal and execute the following:

`docker-compose build cch_portal`

Note that if you changed the pom.xml you should also rebuild the cch_dependencies image to speed up future builds. You can do this by modifying the above command to be: `docker-compose build cch_dependencies cch_portal`

This will build the portal via Maven within a build container and then copy the built artifacts from the build container into the final portal image.

Once the build completes we can execute `docker-compose up cch_portal` to bring up the build container and once it's up it should be accessible from: `http://localhost:8080/coastal-hazards-portal`

If we then make some changes to the portal code and want to rebuild and relaunch the portal container with our changes we do the following in a new terminal:

1. Stop and remove the existing container via `docker-compose stop cch_portal`
2. The terminal that was running the portal container should be available again so switch back to that terminal and execute `docker-compose build cch_portal && docker-compose up cch_portal` which will rebuild the portal image from local sources and then re-launch the newly built image into a new container.

Note that, as described above, we can combine the docker-compose build and up commands into a single command via: `docker-compose up --build cch_portal` which is a perfectly acceptable replacement command for the one listed in step 2.

### Using the Java Remote Debugger on the Portal Docker Container

The Coastal Hazards Portal docker container is configured to allow a Java remote debugger to attach to the portal process running within it. Depending on your Java IDE the process for attaching the remote debugger to a running application will vary, but those instructions can be found online.

The import information to know regarding the portal is that the remote debug port for the portal container is: `8900`

### [OPTIONAL] **Setting up a non-Docker Tomcat 8 for Coastal Hazards Portal (not GeoServer)**

#### Libraries

The Tomcat instance will need several libraries installed into its `lib`
directory in order for it to work properly with the CCH Portal application.
These are installed during the build of the Dockerized portal, but must be
installed manually in the non- Dockerized version.

1. PostgreSQL JDBC - Where ${version} is the version defined in the
   coastal-hazards-portal Dockerfile as `POSTGRES_JDBC_VERSION`:

    <https://jdbc.postgresql.org/download/postgresql-${version}.jar>

2. Keycloak Tomcat 8 Adapter - Where ${version} is the version defined in the
   coastal-hazards-portal Dockerfile as `KEYCLOAK_ADAPTER_VERSION`:

    <https://downloads.jboss.org/keycloak/${version}/adapters/keycloak-oidc/keycloak-tomcat8-adapter-dist-${version}.tar.gz>

    (Can also change `.tar.gz` to `.zip`)

Once you've downloaded the files above place all of the JARs into the tomcat
instance `lib` directory (the JAR files must be extracted from the Keycloak
Tomcat 8 Adapter archive).

#### Configuration Files

To setup a non-Docker Tomcat 8 instance for CCH Portal, take a look at the
config files in the ./coastal-hazards-portal/docker directory. These files can
be used to properly configure a Tomcat 8 instance for running the portal.
