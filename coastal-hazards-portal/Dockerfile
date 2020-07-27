FROM maven:3.6.0-jdk-8-alpine AS portal_build

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /etc/ssl/certs && \
		curl -o /usr/local/share/ca-certificates/DOIRootCA.crt "http://sslhelp.doi.net/docs/DOIRootCA2.cer" && \
		update-ca-certificates; \
	fi

WORKDIR /source

# Copy in POM files for dependency resolution
COPY pom.xml pom.xml
COPY ehcache-shaded/pom.xml ehcache-shaded/pom.xml
COPY coastal-hazards-commons/pom.xml coastal-hazards-commons/pom.xml
COPY coastal-hazards-export/pom.xml coastal-hazards-export/pom.xml
COPY coastal-hazards-n52/pom.xml coastal-hazards-n52/pom.xml
COPY coastal-hazards-wps/pom.xml coastal-hazards-wps/pom.xml
COPY coastal-hazards-liquibase/pom.xml coastal-hazards-liquibase/pom.xml
COPY coastal-hazards-geoserver/pom.xml coastal-hazards-geoserver/pom.xml
COPY coastal-hazards-portal/pom.xml coastal-hazards-portal/pom.xml

# Download dependencies for portal dependency projects
RUN mvn -B -pl ehcache-shaded,coastal-hazards-commons,coastal-hazards-export -am dependency:go-offline

# Copy in sources for portal dependency projects
COPY ehcache-shaded ehcache-shaded
COPY coastal-hazards-commons/src coastal-hazards-commons/src
COPY coastal-hazards-export/src coastal-hazards-export/src

# Build and install portal dependency projects
RUN mvn -B -nsu -pl ehcache-shaded,coastal-hazards-commons,coastal-hazards-export -am package install

# Download dependencies for portal project, excluding snapshot dependencies which should only be the above 3 packages
RUN mvn -B -nsu -pl coastal-hazards-portal dependency:go-offline

# Copy in sources for portal project
COPY coastal-hazards-portal/src coastal-hazards-portal/src

# Build portal project
RUN mvn -B -nsu -pl coastal-hazards-portal -am package

FROM tomcat:8.5-jre8-alpine

ARG POSTGRES_JDBC_VERSION=42.2.4
ARG KEYCLOAK_ADAPTER_VERSION=8.0.2

RUN apk add --update --no-cache \
	openssl \
	fontconfig \
	ttf-dejavu \
	curl && \
	rm -rf /var/lib/apt/lists/* && \
  rm /var/cache/apk/*

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /etc/ssl/certs && \
		curl -o /usr/local/share/ca-certificates/DOIRootCA.crt "http://sslhelp.doi.net/docs/DOIRootCA2.cer" && \
		update-ca-certificates; \
	fi

RUN mkdir -p /usr/local/tomcat/ssl

RUN curl -o /usr/local/tomcat/webapps/probe.war "https://repo1.maven.org/maven2/com/github/psi-probe/psi-probe-web/3.3.1/psi-probe-web-3.3.1.war"

RUN rm -rf /usr/local/tomcat/webapps/ROOT /usr/local/tomcat/webapps/docs /usr/local/tomcat/webapps/examples
RUN rm -f /usr/local/tomcat/conf/tomcat-users.xml /usr/local/tomcat/conf/server.xml /usr/local/tomcat/conf/context.xml

RUN curl -o /usr/local/tomcat/lib/postgresql.jar https://jdbc.postgresql.org/download/postgresql-$POSTGRES_JDBC_VERSION.jar && \
	curl -o /usr/local/tomcat/keycloak.tar.gz https://downloads.jboss.org/keycloak/$KEYCLOAK_ADAPTER_VERSION/adapters/keycloak-oidc/keycloak-tomcat-adapter-dist-$KEYCLOAK_ADAPTER_VERSION.tar.gz && \
	tar xvzf /usr/local/tomcat/keycloak.tar.gz -C /usr/local/tomcat/lib/ && \
	rm /usr/local/tomcat/keycloak.tar.gz;

# Server ENVs
ENV JAVA_SSL_DIR="/usr/local/tomcat/ssl"
ENV SSL_CERT_DIR="/usr/local/tomcat/ssl/server_cert"
ENV CERT_IMPORT_DIRECTORY="/usr/local/tomcat/ssl/trust_certs"
ENV TOMCAT_CERT_FILE="ssl.crt"
ENV TOMCAT_CHAIN_FILE="ssl.chain"
ENV TOMCAT_KEY_FILE="ssl.key"
ENV JAVA_KEYSTORE="/usr/local/tomcat/ssl/key-store.jks"
ENV JAVA_KEYSTORE_PASS="changeit"
ENV JAVA_TRUSTSTORE="/usr/local/tomcat/ssl/trust-store.jks"
ENV JAVA_TRUSTSTORE_PASS="changeit"

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
ENV CCH_WPS_FETCH_UNZIP_TOKEN="I_pf^-qRE~^8Sf#"
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
ENV CCH_ADMIN_ROLE_NAME="CCH_ADMIN"
ENV CCH_DB_DRIVER_CLASS="org.postgresql.Driver"
ENV CCH_DB_MAX_ACTIVE="200"
ENV CCH_DB_MAX_IDLE="60"
ENV CCH_DB_MAX_WAIT="60"
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

COPY --from=portal_build /source/coastal-hazards-portal/target/coastal-hazards-portal.war /usr/local/tomcat/webapps/coastal-hazards-portal.war
COPY Docker/tomcat/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY Docker/tomcat/entrypoint.sh /usr/local/tomcat/entrypoint.sh
COPY coastal-hazards-portal/docker/context.xml /usr/local/tomcat/conf/context.xml
COPY coastal-hazards-portal/docker/server.xml /usr/local/tomcat/conf/server.xml
COPY coastal-hazards-portal/docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/entrypoint.sh
RUN chmod +x /usr/local/tomcat/bin/setenv.sh

CMD /usr/local/tomcat/entrypoint.sh

HEALTHCHECK --interval=10s --timeout=2s \
	CMD curl -s -k "https://localhost:8443/coastal-hazards-portal/diagnostics" | grep -q '<div name="getServletPath">/diagnostics</div>' || exit 1
