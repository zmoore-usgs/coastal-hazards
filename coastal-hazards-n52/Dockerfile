FROM tomcat:8.5-jre8-alpine

LABEL maintainer="gs-w_eto_eb_federal_employees@usgs.gov"

ARG N52_WPS_VERSION=1.1.63

ENV KEY_STORE_PASSWORD=changeit

RUN apk add --update openssl curl

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /etc/ssl/certs && \
		/usr/bin/wget -O /usr/local/share/ca-certificates/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		update-ca-certificates; \
	fi

RUN mkdir -p /usr/local/tomcat/ssl /data/coastal-hazards/uploaded-data

RUN curl -o /usr/local/tomcat/webapps/probe.war "https://repo1.maven.org/maven2/com/github/psi-probe/psi-probe-web/3.3.1/psi-probe-web-3.3.1.war"
RUN curl -o /usr/local/tomcat/webapps/wps.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-n52/${N52_WPS_VERSION}/coastal-hazards-n52-${N52_WPS_VERSION}.war"

COPY docker/run.sh /run.sh

RUN chmod +x /run.sh

RUN rm -rf /usr/local/tomcat/webapps/ROOT /usr/local/tomcat/webapps/docs /usr/local/tomcat/webapps/examples
RUN rm -f /usr/local/tomcat/conf/tomcat-users.xml /usr/local/tomcat/conf/context.xml /usr/local/tomcat/conf/server.xml

CMD /run.sh

HEALTHCHECK --interval=10s --timeout=5s \
 CMD curl -s "http://localhost:8082/wps/WebProcessingService?Service=WPS&Request=GetCapabilities" \
 	| grep -q "Coastal Hazards WPS Processing"
