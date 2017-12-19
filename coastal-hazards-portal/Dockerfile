FROM tomcat:8.0-jre8-alpine

ARG doi_network=false
ARG PORTAL_VERSION=1.1.58

RUN apk add --update openssl

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi


RUN wget -O /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/3.0.0.M3/probe.war"

####################
#  Artifact Build
####################

#RUN wget -O /usr/local/tomcat/webapps/coastal-hazards-portal.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-portal/${PORTAL_VERSION}/coastal-hazards-portal-${PORTAL_VERSION}.war"

####################
# End Artifact Build
####################

#################
#  Local Build
#################

COPY target/coastal-hazards-portal.war /usr/local/tomcat/webapps/coastal-hazards-portal.war

#################
# End Local Build
#################

RUN mkdir -p /usr/local/tomcat/ssl

COPY ./docker/key-store.jks /usr/local/tomcat/ssl/key-store.jks

ADD https://jdbc.postgresql.org/download/postgresql-9.3-1102.jdbc41.jar /usr/local/tomcat/lib

COPY docker/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY docker/server.xml /usr/local/tomcat/conf/server.xml
COPY docker/setenv.sh /usr/local/tomcat/bin/setenv.sh
COPY docker/tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY docker/context.xml /usr/local/tomcat/conf/context.xml

RUN chmod +x /usr/local/tomcat/bin/setenv.sh

RUN rm -rf /usr/local/tomcat/bin/ROOT

RUN rm -rf /usr/local/tomcat/bin/docs

RUN rm -rf /usr/local/tomcat/bin/examples

EXPOSE 8080 8443

HEALTHCHECK --interval=60s --timeout=3s \
	CMD curl -f http://localhost:8080/manager/ || exit 1
