FROM cch_dependencies:latest AS portal_build

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
COPY ehcache-shaded ehcache-shaded
COPY coastal-hazards-commons/src coastal-hazards-commons/src
COPY coastal-hazards-export/src coastal-hazards-export/src
COPY coastal-hazards-portal/src coastal-hazards-portal/src

RUN mvn --settings /root/artifactory-settings.xml -B -nsu -pl coastal-hazards-portal -am package install

FROM code.chs.usgs.gov:5001/cmgp/tomcat/tomcat:1.0.0

ARG POSTGRES_JDBC_VERSION=42.2.4
ARG KEYCLOAK_ADAPTER_VERSION=8.0.2

RUN curl -k -o /usr/local/tomcat/lib/postgresql.jar https://jdbc.postgresql.org/download/postgresql-$POSTGRES_JDBC_VERSION.jar && \
	curl -k -o /usr/local/tomcat/keycloak.tar.gz https://downloads.jboss.org/keycloak/$KEYCLOAK_ADAPTER_VERSION/adapters/keycloak-oidc/keycloak-tomcat-adapter-dist-$KEYCLOAK_ADAPTER_VERSION.tar.gz && \
	tar xvzf /usr/local/tomcat/keycloak.tar.gz -C /usr/local/tomcat/lib/ && \
	rm /usr/local/tomcat/keycloak.tar.gz;

# Context Config ENVs
ENV CCH_PUBLIC_URL="https://localhost:8443/coastal-hazards-portal"
ENV CCH_BASE_URL="https://localhost:8443/coastal-hazards-portal"
ENV CCH_BASE_URL_SECURE="https://localhost:8443/coastal-hazards-portal"
ENV CCH_GO_USA_LOGIN="AddYourOwnLogin"
ENV CCH_GO_USA_API_KEY="AddYourOwnApiKey"
ENV CCH_GO_USA_ENDPOINT="https://go.usa.gov/api/"
ENV CCH_ST_PETE_ARC_SERVER="http://olga.er.usgs.gov/stpgis"
ENV CCH_MARINE_ENDPOINT="https://coastalmap.marine.usgs.gov/cmgp"
ENV CCH_N52_SERVICE_ENDPOINT="https://localhost:8445/wps"
ENV CCH_FILE_UPLOAD_MAX_SIZE="15728640"
ENV CCH_WPS_FETCH_UNZIP_BASE_DIR="/data/coastal-hazards/uploaded-data"
ENV CCH_WPS_FETCH_UNZIP_TOKEN="changeme"
ENV CCH_GEOSERVER_INTERNAL_ENDPOINT="https://localhost:8444/geoserver"
ENV CCH_GEOSERVER_PUBLIC_ENDPOINT="https://localhost:8444/geoserver"
ENV CCH_GEOSERVER_USERNAME="admin"
ENV CCH_GEOSERVER_PASSWORD="geoserver"
ENV CCH_GEOSERVER_LAYER_AGE_MAX="604800000"
ENV CCH_GEOSERVER_WORKSPACES_PERMANENT="published"
ENV CCH_GEOSERVER_WORKSPACES_PUBLISHED="published"
ENV CCH_GEOSERVER_PORTAL_CACHE_NAME="cchGeoserverCache"
ENV CCH_IS_PRODUCTION="false"
ENV CCH_IS_DEVELOPMENT="true"
ENV CCH_KEYCLOAK_CONFIG_FILE="/usr/local/tomcat/conf/keycloak.json"
ENV CCH_KEYCLOAK_REALM="CCH"
ENV CCH_KEYCLOAK_AUTH_URL="http://keycloak:8083/auth"
ENV CCH_KEYCLOAK_RESOURCE="cch_local"
ENV CCH_KEYCLOAK_PUBLIC_CLIENT=true
ENV CCH_KEYCLOAK_SECRET=""
ENV CCH_KEYCLOAK_CONFIDENTIAL_PORT=0
ENV CCH_KEYCLOAK_REDIRECT_RULES=""
ENV CCH_ADMIN_ROLE_NAME="CCH_ADMIN"
ENV CCH_DB_DRIVER_CLASS="org.postgresql.Driver"
ENV CCH_DB_MAX_ACTIVE="200"
ENV CCH_DB_MAX_IDLE="60"
ENV CCH_DB_MAX_WAIT="10000"
ENV CCH_DB_JDBC_URL="jdbc:postgresql://localhost:5432/cchportal"
ENV CCH_DB_USERNAME="cchportal"
ENV CCH_DB_PASSWORD="cchportal_password"
ENV CCH_NHC_BBOX_NORTH="45.95"
ENV CCH_NHC_BBOX_EAST="-62.4"
ENV CCH_NHC_BBOX_SOUTH="17.64"
ENV CCH_NHC_BBOX_WEST="-101.84"
ENV CCH_NHC_WMS_URL="https://nowcoast.noaa.gov/arcgis/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer/WmsServer?"
ENV CCH_NHC_ATTRS="NHC_TRACK_POLY|NHC_TRACK_LIN|NHC_TRACK_PT"
ENV CCH_NHC_ATTR_PARAMS="6|3|8,7,4,9"
ENV CCH_NHC_TINY_TEXT="NWS NHC Forecasted Tropical Cyclone"
ENV CCH_NHC_MED_TEXT="The latest Tropical Cyclone Forecast from the NWS National Hurricane Center (NHC), updated hourly."
ENV CCH_NHC_FULL_TEXT="The nowCOAST wwa Web Map Service (WMS) provides layers containing near real-time watches, warnings and advisories from the National Weather Service (NWS).  This layer shows the latest Tropical Cyclone Track and Cone Forecast from the NWS National Hurricane Center (NHC), updated hourly. The 'wwa' WMS is one of several map services provided by the NOAA nowCOAST project (http://nowcoast.noaa.gov), a product of the NOAA/NOS/OCS Coast Survey Development Laboratory."
ENV CCH_NHC_MED_TITLE="NWS NHC Forecast"
ENV CCH_NHC_FULL_TITLE="NWS NHC Forecasted Tropical Cyclone"
ENV CCH_NHC_KEYWORDS="Hurricane|Track|NOAA|nowCOAST"
ENV CCH_NHC_RES_TITLES="NOAA nowCOAST"
ENV CCH_NHC_RES_LINKS="https://nowcoast.noaa.gov/"
ENV CCH_LOG_LEVEL_ROOT="DEBUG"
ENV CCH_LOG_LEVEL_HTTP="INFO"
ENV CCH_LOG_LEVEL_HIBERNATE="INFO"
ENV CCH_LOG_LEVEL_GEOSERVER="INFO"
ENV CATALINA_OPTS_XMX="1024m"
ENV CATALINA_OPTS_XMS="1024m"
ENV CATALINA_OPTS_MAXPERMSIZE="256m"

COPY --from=portal_build /source/coastal-hazards-portal/target/coastal-hazards-portal.war /usr/local/tomcat/webapps/coastal-hazards-portal.war
COPY coastal-hazards-portal/docker/context.xml /usr/local/tomcat/conf/context.xml
COPY coastal-hazards-portal/docker/server.xml /usr/local/tomcat/conf/server.xml
COPY coastal-hazards-portal/docker/keycloak.json /usr/local/tomcat/conf/keycloak.json
COPY coastal-hazards-portal/docker/setenv.sh /usr/local/tomcat/bin/setenv.sh
COPY coastal-hazards-portal/docker/startup.sh /usr/local/tomcat/startup.sh

RUN chmod +x /usr/local/tomcat/bin/setenv.sh
RUN chmod +x /usr/local/tomcat/startup.sh

HEALTHCHECK --interval=10s --timeout=2s \
	CMD curl -s -k "https://localhost:8443/coastal-hazards-portal/diagnostics" | grep -q '<div name="getServletPath">/diagnostics</div>' || exit 1
