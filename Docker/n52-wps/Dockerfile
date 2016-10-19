FROM tomcat:8-jre8

MAINTAINER Ivan Suftin <isuftin@usgs.gov>

ENV CCH_N52WPS_VERSION ${cch_wps_version:-"LATEST"}

ARG doi_network=false

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://blockpage.doi.gov/images/DOIRootCA.crt && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

RUN wget -O /usr/local/tomcat/webapps/wps.war "https://cida.usgs.gov/maven/service/local/artifact/maven/redirect?r=cida-public-releases&g=gov.usgs.cida.coastalhazards&a=coastal-hazards-n52&v=${CCH_N52WPS_VERSION}&e=war"

RUN wget -O /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/3.0.0.M3/probe.war"

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml

COPY context.xml /usr/local/tomcat/conf/context.xml

COPY setenv.sh /usr/local/tomcat/bin/setenv.sh

COPY wps_config.xml /wps_config.xml

HEALTHCHECK --interval=15s --timeout=3s \
	CMD curl -f http://localhost:8080/wps || exit 1

# Because this container needs to wait for the database to be up, install Dockerize
# and control this container running its command based on the database server starting up.
#
# https://github.com/jwilder/dockerize
# https://github.com/mefellows/dockerize-compose-demo

ENV DOCKERIZE_VERSION "0.2.0"

RUN wget https://github.com/jwilder/dockerize/releases/download/v${DOCKERIZE_VERSION}/dockerize-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz && \
	tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v${DOCKERIZE_VERSION}.tar.gz
