FROM maven:3.6.0-jdk-8-alpine AS geoserver_build

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /etc/ssl/certs && \
		curl -o /usr/local/share/ca-certificates/DOIRootCA.crt "http://sslhelp.doi.net/docs/DOIRootCA2.cer" && \
		update-ca-certificates; \
	fi

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

RUN mvn -B -pl coastal-hazards-geoserver -am dependency:go-offline

COPY coastal-hazards-commons coastal-hazards-commons
COPY coastal-hazards-wps coastal-hazards-wps
COPY coastal-hazards-geoserver coastal-hazards-geoserver

RUN mvn -B -pl coastal-hazards-geoserver -am package

FROM tomcat:8.5-jre8-alpine

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

RUN mkdir -p /data/coastal-hazards/uploaded-data

COPY --from=geoserver_build /source/coastal-hazards-geoserver/target/geoserver.war /usr/local/tomcat/webapps/geoserver.war
COPY Docker/tomcat/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY Docker/tomcat/entrypoint.sh /usr/local/tomcat/entrypoint.sh
COPY coastal-hazards-geoserver/docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/entrypoint.sh
RUN chmod +x /usr/local/tomcat/bin/setenv.sh

CMD /usr/local/tomcat/entrypoint.sh

HEALTHCHECK --interval=2s --timeout=3s \
 CMD curl -s 'https://localhost:8444/geoserver/web/wicket/bookmarkable/org.geoserver.web.AboutGeoServerPage' -k | \
 grep -q '<span id="version">2.11.1</span>' || exit 1
