coastal-hazards
===============

With more than half of the American people living along our Nation's coasts, 
extreme beach and cliff erosion can dramatically alter coastal ecosystems, cause 
billions of dollars' worth of coastal development, and even threaten human life. 

Through projects like the National Assessment of Coastal Change Hazards and 
regional studies of nearshore processes, the US Geological Survey is uncovering 
the science behind coastal change hazards and providing data, tools, and scientific 
knowledge to help coastal planners, resource managers, and emergency operations 
as they work to reduce risk along our coastlines.


## Using Docker 

This project has support for running locally via Docker. The first step in getting the projcet to run in docker is to create the SSL certificate keystore and trust store that the project needs.

### Setting up the Docker Containers
#### 1). Creating the keystore

1. In the project `Docker` directory run the following command where `<your docker IP>` is replaced with the IP address of the docker container that your CCH Portal service will be deployed on.

    `keytool -genkey -noprompt -keystore key-store.jks -validity 999 -keysize 2048 -alias cch-portal -keyalg RSA -storepass changeit -dname "CN=<your docker IP>, OU=owi, O=owi, L=middleton, S=WI, C=US"`

    Note that the keystore password `storepass` can be changed from `changeit` to another value, however doing so will require that you pass in additional arguments when building the containers. This will be described later.

2. Copy `key-store.jks` into `coastal-hazards/coastal-hazards-portal/docker` directory. 

3. Copy `key-store.jks` into `coastal-hazards/coastal-hazards-geoserver/docker` directory.

4. Copy `key-store.jks` into `coastal-hazards/coastal-hazards-n52/docker` directory. 

#### 2). Modifying configuration

The `compose.env` file located in the project root directory contains example values for all of the necessary configuration variables when running the docker containers. If you launch CCH using `docker-compose` then this file will be automatically picked up and applied to the containers.

Several of the configuration values in `compose.env` may need to be changed if your docker vm does not have an ip address of `192.168.99.100`.

#### 3). Building and running the docker containers

1. If building from local sources, prior to building the docker containers the CCH Maven project must first be built so that the WAR files are placed into the targe directories. There should be a total of 3 WAR files created, 1 in each of `coastal-hazards-n52`, `coastal-hazards-geoserver`, and `coastal-hazards-portal`.

2. There are 2 build arguments that can be supplied which will modify the built containers.
    - `doi_network` - Set this to true if you are having trouble pulling the necessary files for the docker containres during build and you are behind the DOI network. It's possible that the SSL inspection certificate is casuing problems.

    - `KEYSTORE_PASSWORD` If you changed the default keystore password from `changeit` this is where you should provide the updated keystore password value.

    When running the `docker-compose` or `Docker build` commands these arguments can be passed in as follows: `KEYSTORE_PASSWORD=newpass docker-compose up`

2. Navigate to the coastal hazards project root directory and exectue the following command (note if you are on Windows this must be exectued from the Docker Machine context).

    `docker-compose up`

    This should being the process of building and then launching all of the docker containers needed for this project. This process will take some time, possibly in upwards of 15 minutes.

3. Once the portal has finished building and starting it should be accessible from `<your docker IP>:8080/coastal-hazards-portal/`
 
### Building from local sources vs building from artifacts

Several of the sub-project docker files support buildling from local sources instead of pulling a specific artifact version from the CIDA Nexus. The sub-projects that support this are `coastal-hazards-n52`, `coastal-hazards-liquibase`, `coastal-hazards-geoserver`, and `coastal-hazards-portal`. 

These projects have local-source building enabled by default. In order to switch to building from a pre-built artifact open the `Dockerfile` in each project, comment out the `Local Build` section, and uncomment the `Artifact Build` section. Additionally, check that the desired artifact version is correctly specified in the `ARG` at the top of the `Dockerfile`.


### Additional Important Notes

1. It is recommended that you primarily use the docker containers for running the Rserve, PyCSW, and PostgreSQL portions of the application. Due to the large size of most files that are uploaded into the portal it requires a very large Docker VM to store a decent number of items. In order to launch only a subset of the applications services run a command similar to the following (you can find the service names in the `docker-compose.yml` file in the project root directory).

    `docker-compose up cch_postgres cch_pycsw cch_rserve`

2. The ports that are described in the `compose.env` for the different services are the ports that they will be _exposed_ on from Docker, not necessarily the ports that the services themselves are running on  _within the containers_. The ports in your `compose.env` file should match up with the ports on the _left_ of side of the `ports` argument for that service in the `docker-compose.yml` file. The ports argument is defined as `<port to be exposed on from the Docker IP>:<port service is running on within the container>`. For example, the `cch_n52_wps` service runs on port `8080` in the container, however it is being exposed by docker on port `8082` (as shown by `8082:8080` being its `port` argument in the `docker-compose.yml` file) and is thus accessible from `<your docker IP>:8082` and _not_ accessible from `<your docker IP>:8080`. `<your docker IP>:8080` is serving the `cch_portal` service, which is also exposed on port `8080` within its container as shown by its `port` argument being `8080:8080`.