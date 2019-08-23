FROM tomcat:8.0-jre8-alpine

LABEL maintainer="gs-w_eto_eb_federal_employees@usgs.gov"

ARG N52_WPS_VERSION=1.1.63

ENV KEY_STORE_PASSWORD=changeit

RUN apk add --update openssl curl

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

RUN mkdir -p /usr/local/tomcat/ssl

COPY docker/key-store.jks /usr/local/tomcat/ssl/trust-store.jks

RUN wget -O /usr/local/tomcat/webapps/probe.war "http://central.maven.org/maven2/com/github/psi-probe/psi-probe-web/3.1.0/psi-probe-web-3.1.0.war"

RUN wget -O /usr/local/tomcat/webapps/wps.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-n52/${N52_WPS_VERSION}/coastal-hazards-n52-${N52_WPS_VERSION}.war"

RUN mkdir -p /data/coastal-hazards/uploaded-data

COPY docker/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY docker/context.xml /usr/local/tomcat/conf/context.xml
COPY docker/run.sh /run.sh
COPY docker/wps_config.xml /wps_config.xml
COPY docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/bin/setenv.sh /run.sh

CMD /run.sh

HEALTHCHECK --interval=2s --timeout=3s \
 CMD curl -s "http://localhost:8080/wps/WebProcessingService?Service=WPS&Request=GetCapabilities" \
 | grep -q "Coastal Hazards WPS Processing" \
 || exit 1
