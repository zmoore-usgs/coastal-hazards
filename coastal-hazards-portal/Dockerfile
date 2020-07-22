FROM maven:3.6.0-jdk-8-alpine AS portal_build

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

RUN mvn -B -pl coastal-hazards-portal -am dependency:go-offline

COPY ehcache-shaded ehcache-shaded
COPY coastal-hazards-commons/src coastal-hazards-commons/src
COPY coastal-hazards-export/src coastal-hazards-export/src
COPY coastal-hazards-portal/src coastal-hazards-portal/src

RUN mvn -B -pl coastal-hazards-portal -am package

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

ARG POSTGRES_JDBC_VERSION=42.2.4
ARG KEYCLOAK_ADAPTER_VERSION=8.0.2

RUN curl -o /usr/local/tomcat/lib/postgresql.jar https://jdbc.postgresql.org/download/postgresql-$POSTGRES_JDBC_VERSION.jar && \
	curl -o /usr/local/tomcat/keycloak.tar.gz https://downloads.jboss.org/keycloak/$KEYCLOAK_ADAPTER_VERSION/adapters/keycloak-oidc/keycloak-tomcat-adapter-dist-$KEYCLOAK_ADAPTER_VERSION.tar.gz && \
	tar xvzf /usr/local/tomcat/keycloak.tar.gz -C /usr/local/tomcat/lib/ && \
	rm /usr/local/tomcat/keycloak.tar.gz;

COPY --from=portal_build /source/coastal-hazards-portal/target/coastal-hazards-portal.war /usr/local/tomcat/webapps/coastal-hazards-portal.war
COPY Docker/tomcat/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY Docker/tomcat/entrypoint.sh /usr/local/tomcat/entrypoint.sh
COPY coastal-hazards-portal/docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/entrypoint.sh
RUN chmod +x /usr/local/tomcat/bin/setenv.sh

CMD /usr/local/tomcat/entrypoint.sh

HEALTHCHECK --interval=10s --timeout=2s \
	CMD curl -s -k "https://localhost:8443/coastal-hazards-portal/diagnostics" | grep -q '<div name="getServletPath">/diagnostics</div>' || exit 1
