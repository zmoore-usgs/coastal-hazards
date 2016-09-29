FROM tomcat:8-jre8

MAINTAINER Ivan Suftin <isuftin@usgs.gov>

ENV CCH_PORTAL_VERSION ${cch_portal_version:-"LATEST"}

RUN wget -O /usr/local/tomcat/webapps/auth-manager-console.war "http://cida-eros-maven-public.er.usgs.gov:8080/maven/service/local/artifact/maven/?r=cida-public-releases&g=gov.usgs.cida.coastalhazards&a=coasl-hazards-portal&v=${CCH_PORTAL_VERSION}&e=war"

RUN wget -O /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/3.0.0.M3/probe.war"

RUN mkdir -p /usr/local/tomcat/ssl

RUN keytool -genkey -noprompt -keystore /usr/local/tomcat/ssl/.keystore -validity 999 -keysize 2048 -alias auth-manager-console -keyalg RSA -keypass changeit -storepass changeit -dname "CN=Coastal Change Hazards Portal, OU=owi, O=owi, L=middleton, S=WI, C=US" 

RUN keytool -selfcert -alias auth-manager-console  -keypass changeit -dname "CN=Coastal Change Hazards Portal, OU=owi, O=owi, L=middleton, S=WI, C=US" -keystore /usr/local/tomcat/ssl/.keystore -storepass changeit -validity 999

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml

COPY server.xml /usr/local/tomcat/conf/server.xml

COPY setenv.sh /usr/local/tomcat/bin/setenv.sh

COPY download-geoserver.sh /download-geoserver.sh

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml

COPY context.xml /usr/local/tomcat/conf/context.xml

RUN chmod +x /usr/local/tomcat/bin/setenv.sh

RUN rm -rf /usr/local/tomcat/bin/ROOT

RUN rm -rf /usr/local/tomcat/bin/docs

RUN rm -rf /usr/local/tomcat/bin/examples

HEALTHCHECK --interval=15s --timeout=3s \
	CMD curl -f http://localhost:8080/manager/ || exit 1