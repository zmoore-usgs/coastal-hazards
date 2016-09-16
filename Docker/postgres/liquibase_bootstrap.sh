#!/bin/bash

cd /liquibase/coastal-hazards-liquibase/src/main/liquibase

$LIQUIBASE_HOME/liquibase --defaultsFile="${LIQUIBASE_HOME}/liquibase.bootstrap.properties" update