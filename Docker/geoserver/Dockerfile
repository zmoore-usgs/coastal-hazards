FROM tomcat:8-jre8

MAINTAINER Ivan Suftin <isuftin@usgs.gov>

VOLUME ["/heapdumps", "/data"]

COPY setenv.sh /usr/local/tomcat/bin/setenv.sh

COPY download-geoserver.sh /download-geoserver.sh

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml

COPY context.xml /usr/local/tomcat/conf/context.xml

RUN apt-get update && \
    apt-get install -y libxml2-utils

RUN chmod a+x /download-geoserver.sh && sleep 1 && /download-geoserver.sh

HEALTHCHECK --interval=15s --timeout=3s \
	CMD curl -f http://localhost:8080/geoserver || exit 1