FROM tomcat:8.0-jre8-alpine

ENV CCH_N52WPS_VERSION ${cch_wps_version:-"LATEST"}

RUN apk add --update openssl

ARG doi_network=false

RUN if [ "${doi_network}" = true ]; then \
		mkdir -p /usr/lib/ssl/certs/ && \
		/usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
		ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
		echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; \
	fi

RUN wget -O /usr/local/tomcat/webapps/wps.war "https://cida.usgs.gov/maven/service/local/repositories/cida-public-releases/content/gov/usgs/cida/coastalhazards/coastal-hazards-n52/1.1.58/coastal-hazards-n52-1.1.58.war"

RUN wget -O /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/3.0.0.M3/probe.war"

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml

COPY context.xml /usr/local/tomcat/conf/context.xml

COPY setenv.sh /usr/local/tomcat/bin/setenv.sh

COPY wps_config.xml /wps_config.xml

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "catalina.sh run"]

HEALTHCHECK --interval=15s --timeout=3s \
	CMD curl -f http://localhost:8080/wps || exit 1