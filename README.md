coastal-hazards
===============

With more than half of the American people living along our Nation's coasts, extreme beach and cliff erosion can dramatically alter coastal ecosystems, cause billions of dollars' worth of coastal development, and even threaten human life.

Through projects like the National Assessment of Coastal Change Hazards and regional studies of nearshore processes, the US Geological Survey is uncovering the science behind coastal change hazards and providing data, tools, and scientific knowledge to help coastal planners, resource managers, and emergency operations as they work to reduce risk along our coastlines.

### Using Docker For Local Deployment

The `compose.env` file located in the project root directory contains example values for all of the necessary configuration variables when running the docker containers. If you launch CCH using `docker-compose` then this file will be automatically picked up and applied to the containers. The following instructions make the assumption they are executed from the coastal hazards project root directory.

#### Setup
1. Change `EXTERNAL_HOST` to have the value of your host machine's IP.
    * using docker-machine: `docker-machine ip <machine name>`
    * Ubuntu 18.04: `hostname -I`

2. If building from local sources, run `mvn clean package`. There should be a total of 3 WAR files created, 1 in each of `coastal-hazards-n52`, `coastal-hazards-geoserver`, and `coastal-hazards-portal`.

#### Building and running the docker containers

1. To build the images, execute `docker-compose -f docker-compose.yml -f docker-compose-local.yml build`
    * This should begin the process of building. This process will take some time, possibly in upwards of 15 minutes.
    * Note: If you want to build from remote sources, simply run `docker-compose build`
    * Note: If you are having trouble pulling the necessary files for the docker containers during build and you are behind the DOI network, try adding `doi_network=true` to your command. It's possible that the SSL inspection certificate is causing problems.

2. To launch the built images into containers, execute `docker-compose up`
    * Note: To limit output, only include the containers you want to see. For example, `docker-compose up cch_portal` will   only show the output for `cch_portal`.

3. Once the portal has finished building and starting it should be accessible from `http://<EXTERNAL_HOST>:8080/coastal-hazards-portal/`

### Stopping the docker containers

In order to bring down the running cch stack run the following command:

`docker-compose down`

This will bring down _all_ of the running CCH services defined in the `docker-compose.yml`
file. Note that running this command will also __REMOVE__ the associated docker
containers meaning all data stored in them will be lost.

An alternative method for only brining down select services is to run `docker ps`
to find the `container ID` of the service that you'd like to bring down. Once
you've found the `container ID` run `docker stop <container ID>` to stop that
service and then, if you'd like to also remove the container, run `docker rm <container ID>`.

### Modifying the docker images

When you launch a service using `docker-compose` it does _NOT_ always re-build
the docker image for the service it is trying to launch. If there is already an
existing image for the service you'd like to launch then it will use that rather
than building a new one.

In order to build a new docker image for a specific service you can either remove
the existing image (which will force `docker-compose` to rebuild it), or you can
overwrite it with a newer image using `docker build`.

If you remove the existing image note that the _entire_ image building process
will need to run again, but if you simply run `docker build` and overwrite the
existing image Docker will re-use the parts of the existing image that have not
been modified.

In order to use `docker build` first navigate into the directory containing the
`Dockerfile` of the service that you would like to rebuild. In this directory open
a terminal and run `docker build -t <image name> .` where `<image name>` matches
the name of the image for that service as defined in the `docker-compose.yml` file.
Build arguments can be passed into the `docker build` command in the same manner
as the `docker-compose up` command (described above). Example:
`docker build -t cch-portal .`

Any re-built services can then be brought up via the service-specific version of
`docker-compose` described in point `1` under `Additional Important Notes` below.

### Additional Important Notes

1. It is recommended that you primarily use the docker containers for running the
Rserve, PyCSW, and PostgreSQL portions of the application. Due to the large size
of most files that are uploaded into the portal it requires a very large Docker VM
to store a decent number of items. In order to launch only a subset of the
applications services run a command similar to the following (you can find the
  service names in the `docker-compose.yml` file in the project root directory).

    `docker-compose up cch_postgres cch_pycsw cch_rserve`

2. The ports that are described in the `compose.env` for the different services
are the ports that they will be _exposed_ on from Docker, not necessarily the
ports that the services themselves are running on  _within the containers_. The
 ports in your `compose.env` file should match up with the ports on the _left_ of
side of the `ports` argument for that service in the `docker-compose.yml` file.
The ports argument is defined as

  `<port to be exposed on from the Docker IP>:<port service is running on within the container>`.

For example, the `cch_n52_wps` service runs on port `8080` in the container, however
it is being exposed by docker on port `8082` (as shown by `8082:8080` being its `port`
  argument in the `docker-compose.yml` file) and is thus accessible from
  `<your docker IP>:8082` and _not_ accessible from `<your docker IP>:8080`.
  `<your docker IP>:8080` is serving the `cch_portal` service, which is also
  exposed on port `8080` within its container as shown by its `port` argument
  being `8080:8080`.
