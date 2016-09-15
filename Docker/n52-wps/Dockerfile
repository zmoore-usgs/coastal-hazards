FROM tomcat:8-jre8

MAINTAINER Ivan Suftin <isuftin@usgs.gov>

ARG wps_version=LATEST

ARG doi_network=false

RUN echo $doi_network

RUN if [ "${doi_network}" = true ]; then \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://blockpage.doi.gov/images/DOIRootCA.crt && \
		ln -s /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0; \
	fi

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml

COPY context.xml /usr/local/tomcat/conf/context.xml

COPY download-cch-wps.sh /download-cch-wps.sh

COPY setenv.sh /usr/local/tomcat/bin/setenv.sh

COPY wps_config.xml /wps_config.xml

RUN apt-get update && \
   apt-get install -y libxml2-utils && \
   /download-cch-wps.sh