FROM tomcat:8.0-jre8-alpine

LABEL maintainer="gs-w_eto_eb_federal_employees@usgs.gov"

ARG GEOSERVER_VERSION=1.1.63
ENV KEY_STORE_PASSWORD=changeit

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

RUN apk add --update --no-cache \
	openssl \
	fontconfig \
	ttf-dejavu \
	curl && \
	rm -rf /var/lib/apt/lists/* && \
  rm /var/cache/apk/*

RUN mkdir -p /data/coastal-hazards/uploaded-data /usr/local/tomcat/ssl

RUN wget -O /usr/local/tomcat/webapps/probe.war "http://central.maven.org/maven2/com/github/psi-probe/psi-probe-web/3.1.0/psi-probe-web-3.1.0.war"
RUN wget -O /usr/local/tomcat/webapps/geoserver.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-geoserver/${GEOSERVER_VERSION}/coastal-hazards-geoserver-${GEOSERVER_VERSION}.war"

COPY docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/bin/setenv.sh

RUN rm -rf /usr/local/tomcat/webapps/ROOT /usr/local/tomcat/webapps/docs /usr/local/tomcat/webapps/examples
RUN rm -f /usr/local/tomcat/conf/tomcat-users.xml /usr/local/tomcat/conf/server.xml /usr/local/tomcat/conf/context.xml

CMD catalina.sh run

HEALTHCHECK --interval=2s --timeout=3s \
 CMD curl -s 'https://localhost:8444/geoserver/web/wicket/bookmarkable/org.geoserver.web.AboutGeoServerPage' -k | \
 grep -q '<span id="version">2.11.1</span>' || exit 1
