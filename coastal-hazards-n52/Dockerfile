FROM cch_dependencies:latest AS n52_build

WORKDIR /source

COPY pom.xml pom.xml
COPY ehcache-shaded/pom.xml ehcache-shaded/pom.xml
COPY coastal-hazards-commons/pom.xml coastal-hazards-commons/pom.xml
COPY coastal-hazards-export/pom.xml coastal-hazards-export/pom.xml
COPY coastal-hazards-n52/pom.xml coastal-hazards-n52/pom.xml
COPY coastal-hazards-wps/pom.xml coastal-hazards-wps/pom.xml
COPY coastal-hazards-liquibase/pom.xml coastal-hazards-liquibase/pom.xml
COPY coastal-hazards-geoserver/pom.xml coastal-hazards-geoserver/pom.xml
COPY coastal-hazards-portal/pom.xml coastal-hazards-portal/pom.xml
COPY coastal-hazards-n52/src coastal-hazards-n52/src

RUN mvn --settings /root/artifactory-settings.xml -B -nsu -pl coastal-hazards-n52 -am package install

FROM code.chs.usgs.gov:5001/cmgp/tomcat/tomcat:1.0.0

RUN mkdir -p /data/coastal-hazards/uploaded-data

# Context Config ENVs
ENV CCH_WPS_CONFIG_LOCATION="/wps_config.xml"
ENV CCH_WPS_FETCH_UNZIP_BASE_DIR="/data/coastal-hazards/uploaded-data"
ENV CCH_WPS_FETCH_UNZIP_TOKEN="changeme"
ENV CATALINA_OPTS_XMX="1024m"
ENV CATALINA_OPTS_XMS="1024m"
ENV CATALINA_OPTS_MAXPERMSIZE="256m"

COPY --from=n52_build /source/coastal-hazards-n52/target/wps.war /usr/local/tomcat/webapps/wps.war
COPY coastal-hazards-n52/docker/context.xml /usr/local/tomcat/conf/context.xml
COPY coastal-hazards-n52/docker/server.xml /usr/local/tomcat/conf/server.xml
COPY coastal-hazards-n52/docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/bin/setenv.sh

HEALTHCHECK --interval=10s --timeout=5s \
 CMD curl -s "http://localhost:8082/wps/WebProcessingService?Service=WPS&Request=GetCapabilities" \
 	| grep -q "Coastal Hazards WPS Processing"
