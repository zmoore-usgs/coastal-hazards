FROM tomcat:8.0-jre8-alpine

VOLUME ["/heapdumps", "/data"]

ARG doi_network=false
ARG GEOSERVER_VERSION=1.1.58

RUN apk add --update openssl

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi


RUN mkdir -p /data/coastal-hazards/uploaded-data

RUN mkdir -p /usr/local/tomcat/ssl
COPY ./docker/trust-store.jks /usr/local/tomcat/ssl/key-store.jks
COPY ./docker/trust-store.jks /usr/local/tomcat/ssl/trust-store.jks

RUN wget -O /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/3.0.0.M3/probe.war"

####################
#  Artifact Build
####################

#RUN wget -O /usr/local/tomcat/webapps/geoserver.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-geoserver/${GEOSERVER_VERSION}/coastal-hazards-geoserver-${GEOSERVER_VERSION}.war"

####################
# End Artifact Build
####################

#################
#  Local Build
#################

COPY target/geoserver.war /usr/local/tomcat/webapps/geoserver.war

#################
# End Local Build
#################

COPY docker/setenv.sh /usr/local/tomcat/bin/setenv.sh
COPY docker/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY docker/context.xml /usr/local/tomcat/conf/context.xml
COPY docker/server.xml /usr/local/tomcat/conf/server.xml

EXPOSE 8080 8443

ENTRYPOINT ["catalina.sh", "run"]