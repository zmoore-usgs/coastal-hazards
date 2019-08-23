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

### Using Docker For Local Deployment

The `compose.env` file located in the project root directory contains example
values for all of the necessary configuration variables when running the docker
containers. If you launch CCH using `docker-compose` then this file will be
automatically picked up and applied to the containers. The following
instructions make the assumption they are executed from the coastal hazards
project root directory.

#### Setup
1. Change `EXTERNAL_HOST` to have the value of your host machine's IP 
(or localhost if running Docker directly).
    * using docker-machine: `docker-machine ip <machine name>`
    * Ubuntu 18.04: `hostname -I`

2. Add an entry to your host OS `hosts` file to map the hostname `keycloak` to
   the IP of your Docker host. This is necessary for the Dockerized version of Keycloak to be
   able to properly complete the OAuth2 flow with the portal application
   (regardless of whether the portal is run within Docker or on a local Tomcat
   instance).

   To determine your Docker host address:

    1. If using Docker installed directly on your machine as in Linux, use
        `localhost` or `127.0.0.1`
    2. If using a remote Docker engine, use the IP of the host
        running your Docker engine.
    3. If using Docker Machine, use the name of the VM to find out the ip. For
        example, if the VM's name is "workbench", issue the following command:

        `docker-machine ip workbench`

3. If building from local sources, run `mvn clean package`. There should be a
   total of 3 WAR files created, 1 in each of `coastal-hazards-n52`,
   `coastal-hazards-geoserver`, and `coastal-hazards-portal`.

#### Building and running the docker containers

1. To build the images, execute `docker-compose -f docker-compose.yml -f
   docker-compose-local.yml build`
    * This should begin the process of building. This process will take some
      time, possibly in upwards of 15 minutes.
    * Note: If you want to build from remote sources, simply run `docker-compose
      build`

2. To launch the built images into containers, execute `docker-compose up`
    * Note: To limit output, only include the containers you want to see. For
      example, `docker-compose up cch_portal` will only show the output for
      `cch_portal`.

3. Once the portal has finished building and starting it should be accessible
   from `http://<EXTERNAL_HOST>:8080/coastal-hazards-portal/`

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

### Stopping the docker containers

In order to bring down the running cch stack run the following command:

`docker-compose down`

This will bring down _all_ of the running CCH services defined in the
`docker-compose.yml` file. Note that running this command will also __REMOVE__
the associated docker containers meaning all data stored in them will be lost.

An alternative method for only brining down select services is to run `docker
ps` to find the `container ID` of the service that you'd like to bring down.
Once you've found the `container ID` run `docker stop <container ID>` to stop
that service and then, if you'd like to also remove the container, run `docker
rm <container ID>`.

### Modifying the docker images

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
`Dockerfile` of the service that you would like to rebuild. In this directory
open a terminal and run `docker build -t <image name> .` where `<image name>`
matches the name of the image for that service as defined in the
`docker-compose.yml` file. Build arguments can be passed into the `docker build`
command in the same manner as the `docker-compose up` command (described above).
Example: `docker build -t cch-portal .`

Any re-built services can then be brought up via the service-specific version of
`docker-compose` described in point `1` under `Additional Important Notes`
below.

### Setting up a non-Docker Tomcat 8 for Coastal Hazards Portal (not GeoServer)
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
be used to properly configure a Tomcat 8 instance for running the portal. Note
that the `context.xml` "Environment" values are set via the `setenv.sh` script,
which pulls its values out of the system environment. When running locally
outside of Docker it is easier to skip the `setenv.sh` script and simply replace
the substituion parameters in `context.xml` with the actual values you want to
use. To see the values used by Docker, check out `./compose.env` in the project
root dir, but note that some of the values in that file are specific to the way
that Docker is configured and won't work directly outside of it (specifically
the various URL and port parameters).



### Additional Important Notes

1. It is recommended that you primarily use the docker containers for running
   the Rserve and PostgreSQL portions of the application. Due to the large size
   of most files that are uploaded into the portal it requires a very large
   Docker VM to store a decent number of items. In order to launch only a subset
   of the applications services run a command similar to the following (you can
   find the service names in the `docker-compose.yml` file in the project root
   directory).

    `docker-compose up cch_postgres cch_rserve`

2. The ports that are described in the `compose.env` for the different services
   are the ports that they will be _exposed_ on from Docker, not necessarily the
   ports that the services themselves are running on  _within the containers_.
   The ports in your `compose.env` file should match up with the ports on the
   _left_ of side of the `ports` argument for that service in the
   `docker-compose.yml` file. The ports argument is defined as

  `<port to be exposed on from the Docker IP>:<port service is running on within
  the container>`.

For example, the `cch_n52_wps` service runs on port `8080` in the container,
however it is being exposed by docker on port `8082` (as shown by `8082:8080`
being its `port` argument in the `docker-compose.yml` file) and is thus
accessible from `<your docker IP>:8082` and _not_ accessible from `<your docker
IP>:8080`. `<your docker IP>:8080` is serving the `cch_portal` service, which is
also exposed on port `8080` within its container as shown by its `port` argument
being `8080:8080`.
