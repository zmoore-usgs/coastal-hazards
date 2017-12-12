FROM tomcat:8.0-jre8-alpine

VOLUME ["/heapdumps", "/data"]

ARG doi_network=false

ENV CCH_GEOSERVER_VERSION ${cch_geoserver_version:-"LATEST"}

RUN apk add --update openssl

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

RUN mkdir -p /usr/local/tomcat/ssl

RUN keytool -genkey -noprompt -keystore /usr/local/tomcat/ssl/.keystore -validity 999 -keysize 2048 -alias cch-geoserver -keyalg RSA -keypass changeit -storepass changeit -dname "CN=cch-geoserver, OU=owi, O=owi, L=middleton, S=WI, C=US" 

RUN keytool -selfcert -alias cch-geoserver -keypass changeit -dname "CN=cch-geoserver , OU=owi, O=owi, L=middleton, S=WI, C=US" -keystore /usr/local/tomcat/ssl/.keystore -storepass changeit -validity 999

RUN wget -O /usr/local/tomcat/webapps/geoserver.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-geoserver/1.1.58/coastal-hazards-geoserver-1.1.58.war"

RUN wget -O /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/3.0.0.M3/probe.war"

COPY setenv.sh /usr/local/tomcat/bin/setenv.sh

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml

COPY context.xml /usr/local/tomcat/conf/context.xml

COPY server.xml /usr/local/tomcat/conf/server.xml

EXPOSE 8080 8443

ENTRYPOINT ["catalina.sh", "run"]