FROM cch_dependencies:latest AS geoserver_build

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
COPY coastal-hazards-commons/src coastal-hazards-commons/src
COPY coastal-hazards-wps/src coastal-hazards-wps/src
COPY coastal-hazards-geoserver/src coastal-hazards-geoserver/src

RUN mvn --settings /root/artifactory-settings.xml -B -nsu -pl coastal-hazards-geoserver -am package install

FROM code.chs.usgs.gov:5001/cmgp/tomcat/tomcat:1.1.0

RUN mkdir -p /data/coastal-hazards/uploaded-data
RUN mkdir -p /data/geoserver

# Context Config ENVs
ENV CCH_GEOSERVER_DATA_DIR="/data/geoserver"
ENV CCH_WPS_FETCH_UNZIP_BASE_DIR="/data/coastal-hazards/uploaded-data"
ENV CCH_WPS_FETCH_UNZIP_TOKEN="changeme"

COPY --from=geoserver_build /source/coastal-hazards-geoserver/target/geoserver.war /usr/local/tomcat/webapps/geoserver.war
COPY coastal-hazards-geoserver/docker/context.xml /usr/local/tomcat/conf/context.xml
COPY coastal-hazards-geoserver/docker/server.xml /usr/local/tomcat/conf/server.xml
COPY coastal-hazards-geoserver/docker/setenv.sh /usr/local/tomcat/bin/setenv.sh
COPY coastal-hazards-geoserver/docker/startup.sh /usr/local/tomcat/startup.sh

RUN chmod +x /usr/local/tomcat/bin/setenv.sh
RUN chmod +x /usr/local/tomcat/startup.sh

HEALTHCHECK --interval=2s --timeout=3s \
 CMD curl -s 'https://localhost:8444/geoserver/web/wicket/bookmarkable/org.geoserver.web.AboutGeoServerPage' -k | \
 grep -q '<span id="version">2.11.1</span>' || exit 1
