FROM tomcat:8.0-jre8-alpine

ARG N52_WPS_VERSION=1.1.58

ENV PROBE_VERSION 3.0.0.M3

RUN apk add --update openssl

ARG doi_network=false

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi


RUN wget -O /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/${PROBE_VERSION}/probe.war"

RUN mkdir -p /usr/local/tomcat/ssl

COPY ./docker/trust-store.jks /usr/local/tomcat/ssl/trust-store.jks

####################
#  Artifact Build
####################

#RUN wget -O /usr/local/tomcat/webapps/wps.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-n52/${N52_WPS_VERSION}/coastal-hazards-n52-${N52_WPS_VERSION}.war"

####################
# End Artifact Build
####################

#################
#  Local Build
#################

COPY target/wps.war /usr/local/tomcat/webapps/wps.war

#################
# End Local Build
#################

RUN mkdir -p /data/coastal-hazards/uploaded-data

COPY docker/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY docker/context.xml /usr/local/tomcat/conf/context.xml
COPY docker/run.sh run.sh
COPY docker/wps_config.xml /wps_config.xml
COPY docker/wps_config.xml /wps_config-original.xml
COPY docker/setenv.sh /usr/local/tomcat/bin/setenv.sh

RUN chmod +x /usr/local/tomcat/bin/setenv.sh

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "sh run.sh"]

HEALTHCHECK --interval=60s --timeout=3s \
	CMD curl -f http://localhost:8080/wps || exit 1