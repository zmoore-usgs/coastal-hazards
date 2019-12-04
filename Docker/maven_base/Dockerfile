FROM maven:3.6.0-jdk-8-alpine AS maven_base

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /etc/ssl/certs && \
		wget -O /usr/local/share/ca-certificates/DOIRootCA.crt "http://sslhelp.doi.net/docs/DOIRootCA2.cer" && \
		update-ca-certificates; \
	fi

WORKDIR /source

COPY pom.xml pom.xml

COPY coastal-hazards-commons coastal-hazards-commons
COPY coastal-hazards-export coastal-hazards-export
COPY coastal-hazards-geoserver coastal-hazards-geoserver
COPY coastal-hazards-liquibase coastal-hazards-liquibase
COPY coastal-hazards-n52 coastal-hazards-n52
COPY coastal-hazards-portal coastal-hazards-portal
COPY coastal-hazards-wps coastal-hazards-wps
COPY ehcache-shaded ehcache-shaded

RUN mvn -B clean package
