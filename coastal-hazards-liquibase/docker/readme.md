Required Environment Variables
- CCH_POSTGRES_PASSWORD - The password to use for the cchportal PostgreSQL user
- CCH_LIQUIBASE_VERSION - The version of the CCH Liquibase project to checkout

Optional Environment Variables
- CCH_LOAD_BOOTSTRAP - [default: false] Set to true to load the portal bootstrap data from liquibase

Example Build Command
- docker build -t cch_postgres .

Example Run Command
- docker run --name cch_postgres -e CCH_POSTGRES_PASSWORD=password -d cch_postgres

Building from local sources
- This Docker file can also be built from the local project sources rather than a version of CCH pulled from Git. In order to do this frist copy the `Dockerfile` and `dbInit` directory from the `coastal-hazards/Docker/postgres` directory into the `coastal-hazards/coastal-hazards-liquibase` directory. Next open the `Dockerfile` in an editor and comment out the block of lines marked as `Git Build` and then uncomment the block of lines marked as `Local Build`. At this point the docker build command can then be run from the `coastal-hazards/coastal-hazards-liquibase` directory.