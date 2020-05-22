FROM code.chs.usgs.gov:5001/cmgp/coastal-hazards:dependencies AS portal_build

WORKDIR /source

COPY ehcache-shaded ehcache-shaded
COPY coastal-hazards-commons/src coastal-hazards-commons/src
COPY coastal-hazards-export/src coastal-hazards-export/src
COPY coastal-hazards-portal/src coastal-hazards-portal/src

RUN mvn -B -pl coastal-hazards-portal -am package

FROM tomcat:8.5-jre8-alpine

ENV KEY_STORE_PASSWORD=changeit

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

ARG POSTGRES_JDBC_VERSION=42.2.4
ARG KEYCLOAK_ADAPTER_VERSION=8.0.2

RUN curl -o /usr/local/tomcat/lib/postgresql.jar https://jdbc.postgresql.org/download/postgresql-$POSTGRES_JDBC_VERSION.jar && \
	curl -o /usr/local/tomcat/keycloak.tar.gz https://downloads.jboss.org/keycloak/$KEYCLOAK_ADAPTER_VERSION/adapters/keycloak-oidc/keycloak-tomcat-adapter-dist-$KEYCLOAK_ADAPTER_VERSION.tar.gz && \
	tar xvzf /usr/local/tomcat/keycloak.tar.gz -C /usr/local/tomcat/lib/ && \
	rm /usr/local/tomcat/keycloak.tar.gz;

COPY --from=portal_build /source/coastal-hazards-portal/target/coastal-hazards-portal.war /usr/local/tomcat/webapps/coastal-hazards-portal.war
COPY coastal-hazards-portal/docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/bin/setenv.sh

HEALTHCHECK --interval=10s --timeout=2s \
	CMD curl -s -k "https://localhost:8443/coastal-hazards-portal/diagnostics" | grep -q '<div name="getServletPath">/diagnostics</div>' || exit 1
