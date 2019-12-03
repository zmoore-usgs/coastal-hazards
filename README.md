coastal-hazards
===============

With more than half of the American people living along our Nation's coasts,
extreme beach and cliff erosion can dramatically alter coastal ecosystems, cause
billions of dollars' worth of coastal development, and even threaten human life.

Through projects like the National Assessment of Coastal Change Hazards and
regional studies of nearshore processes, the US Geological Survey is uncovering
the science behind coastal change hazards and providing data, tools, and
scientific knowledge to help coastal planners, resource managers, and emergency
operations as they work to reduce risk along our coastlines.

### **Using Docker For Local Deployment**

#### TL;DR - Just get it running

1. From project root directory `mvn clean package`
2. From project root directory `docker-compose -f docker-compose.yml -f docker-compose-local.yml build`
3. Add a line to your operating system `hosts` (Ubuntu `/etc/hosts`) file with: `127.0.0.1 keycloak`
4. From project root directory `docker-compose up`
5. Visit `http://localhost:8080/coastal-hazards-portal/`
6. Visit `http://localhost:8080/coastal-hazards-portal/publish/item/`
    - Login - **Username**: `cch_admin` | **Password**: `password`

#### Full Explanation

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

5. CCH N52 WPS - The N52 WPS Server which is used to calculate and serve some metadata
about uplaoded data.

6. CCH Portal - The portal services and UI

#### Setup
1. If building from local sources, run `mvn clean package`. There should be a
   total of 3 WAR files created, 1 in each of `coastal-hazards-n52`,
   `coastal-hazards-geoserver`, and `coastal-hazards-portal`.

2. In order for the full authorization flow to work with keycloak you will need to add
    an entry to your operating system's `hosts` file. On Ubuntu this is found at
    `/etc/hosts`. The entry needs to map the alias `keycloak` to the local IP on your
    your machine. An example entry would look like:

    ```
    127.0.0.1 keycloak
    ```

#### Building and running the docker containers

1. To build the images from artifacts built locally execute:
    `docker-compose -f docker-compose.yml -f docker-compose-local.yml build`
    * This should begin the process of building. This process will take some
      time, possibly in upwards of 15 minutes.
    * Note: If you want to build the containers from pre-built artifacts
      simply run `docker-compose build`

2. To launch the built images into containers, execute: `docker-compose up`
    * Note: To limit output, only include the containers you want to see. For
      example, `docker-compose up cch_portal` will only show the output for
      `cch_portal`.

3. Once the portal has finished building and starting it should be accessible
   from `http://localhost:8080/coastal-hazards-portal/`

4. If accessing a secure part of the portal application you will be directed to
   login via the local Keycloak container that should be running on
   `https://keycloak:8446` (this is why step 2 of the setup section is
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

### **Modifying the docker images**

When you launch a service using `docker-compose` it does _NOT_ always re-build
the docker image for the service it is trying to launch. If there is already an
existing image for the service you'd like to launch then it will use that rather
than building a new one.

In order to build a new docker image for a specific service you can either
remove the existing image (which will force `docker-compose` to rebuild it), or
you can overwrite it with a newer image using `docker build`.

If you remove the existing image note that the _entire_ image building process
will need to run again, but if you simply run `docker build` and overwrite the
existing image Docker will re-use the parts of the existing image that have not
been modified.

In order to use `docker build` first navigate into the directory containing the
Dockerfile of the service that you would like to rebuild. In this directory
open a terminal and run `docker build -t <image name> .` where `<image name>`
matches the name of the image for that service as defined in the
`docker-compose.yml` file. Build arguments can be passed into the `docker build`
command in the same manner as the `docker-compose up` command (described above).
Example: `docker build -t cch-portal .`

Any re-built services can then be brought up via the service-specific version of
`docker-compose` such as: `docker-compose up cch_portal`. For example, if you
wanted to launch all of the services that the portal needs as docker containers
but not the portal itself since you might be actively working on it you would run:
`docker-compose up cch_postgres cch_keycloak cch_n52_wps cch_geoserver cch_rserve`
Then once you're ready to run the portal in another command window you'd run:
`docker-compose up --build cch_portal` which will rebuild and launch the portal
container. If you need to make changes to the portal and want to bring it back down
you'd use one of the methods described above to stop the portal container but not
the rest of the containers, and then bring it back up with the build and launch
command `docker-compose up --build cch_portal`.

### **Setting up a non-Docker Tomcat 8 for Coastal Hazards Portal (not GeoServer)**
#### Libraries
The Tomcat instance will need several libraries installed into its `lib`
directory in order for it to work properly with the CCH Portal application.
These are installed during the build of the Dockerized portal, but must be
installed manually in the non- Dockerized version.

1. PostgreSQL JDBC - Where ${version} is the version defined in the
   coastal-hazards-portal Dockerfile as `POSTGRES_JDBC_VERSION`: 

    https://jdbc.postgresql.org/download/postgresql-${version}.jar

2. Keycloak Tomcat 8 Adapter - Where ${version} is the version defined in the
   coastal-hazards-portal Dockerfile as `KEYCLOAK_ADAPTER_VERSION`: 

    https://downloads.jboss.org/keycloak/${version}/adapters/keycloak-oidc/keycloak-tomcat8-adapter-dist-${version}.tar.gz
    

    (Can also change `.tar.gz` to `.zip`)

Once you've downloaded the files above place all of the JARs into the tomcat
instance `lib` directory (the JAR files must be extracted from the Keycloak
Tomcat 8 Adapter archive).

#### Configuration Files

To setup a non-Docker Tomcat 8 instance for CCH Portal, take a look at the
config files in the ./coastal-hazards-portal/docker directory. These files can
be used to properly configure a Tomcat 8 instance for running the portal.