FROM tomcat:8.5.57-jdk8-openjdk-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV JAVA_SSL_DIR="/usr/local/tomcat/ssl"
ENV SSL_CERT_DIR="/usr/local/tomcat/ssl/server_cert"
ENV CERT_IMPORT_DIRECTORY="/usr/local/tomcat/ssl/trust_certs"
ENV TOMCAT_CERT_FILE="ssl.crt"
ENV TOMCAT_CHAIN_FILE="ssl.chain"
ENV TOMCAT_KEY_FILE="ssl.key"
ENV JAVA_KEYSTORE="/usr/local/tomcat/ssl/key-store.jks"
ENV JAVA_KEYSTORE_PASS="changeit"
ENV JAVA_TRUSTSTORE="/usr/local/tomcat/ssl/trust-store.jks"
ENV JAVA_TRUSTSTORE_PASS="changeit"
ENV PROBE_VERSION="3.5.0"
ENV TOMCAT_MODE="run"
ENV APP_STARTUP_SCRIPT="/usr/local/tomcat/startup.sh"

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl=1.1.1* \
    fontconfig=2.13.1* \
    ttf-dejavu=2.37* \
    curl=7.64.0* \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/tomcat/ssl

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /etc/ssl/certs && \
        curl -k -o /usr/local/share/ca-certificates/DOIRootCA.crt "http://sslhelp.doi.net/docs/DOIRootCA2.cer" && \
		update-ca-certificates; \
	fi

RUN curl -k -L -o /usr/local/tomcat/webapps/probe.war "https://github.com/psi-probe/psi-probe/releases/download/psi-probe-${PROBE_VERSION}/probe.war"
# RUN curl -k -o /usr/local/tomcat/webapps/probe.war "https://artifactory.wma.chs.usgs.gov/artifactory/maven-central/com/github/psi-probe/psi-probe-web/${PROBE_VERSION}/psi-probe-web-${PROBE_VERSION}.war"

RUN rm -rf /usr/local/tomcat/webapps/ROOT /usr/local/tomcat/webapps/docs /usr/local/tomcat/webapps/examples

COPY tomcat-users.xml /usr/local/tomcat/conf/tomcat-users.xml
COPY entrypoint.sh /usr/local/tomcat/entrypoint.sh
RUN chmod +x /usr/local/tomcat/entrypoint.sh
CMD /usr/local/tomcat/entrypoint.sh ${TOMCAT_MODE}