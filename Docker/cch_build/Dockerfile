FROM maven:3.6.0-jdk-8-alpine AS cch_build

RUN if getent ahosts "sslhelp.doi.net" > /dev/null 2>&1; then \
		mkdir -p /etc/ssl/certs && \
		wget -O /usr/local/share/ca-certificates/DOIRootCA.crt "http://sslhelp.doi.net/docs/DOIRootCA2.cer" && \
		update-ca-certificates; \
	fi

WORKDIR /source

COPY pom.xml pom.xml

COPY ehcache-shaded/pom.xml ehcache-shaded/pom.xml
COPY coastal-hazards-commons/pom.xml coastal-hazards-commons/pom.xml
COPY coastal-hazards-export/pom.xml coastal-hazards-export/pom.xml
COPY coastal-hazards-n52/pom.xml coastal-hazards-n52/pom.xml
COPY coastal-hazards-wps/pom.xml coastal-hazards-wps/pom.xml
COPY coastal-hazards-liquibase/pom.xml coastal-hazards-liquibase/pom.xml
COPY coastal-hazards-geoserver/pom.xml coastal-hazards-geoserver/pom.xml
COPY coastal-hazards-portal/pom.xml coastal-hazards-portal/pom.xml

RUN mvn -B dependency:go-offline

COPY ehcache-shaded ehcache-shaded
COPY coastal-hazards-commons coastal-hazards-commons
COPY coastal-hazards-export coastal-hazards-export
COPY coastal-hazards-n52 coastal-hazards-n52
COPY coastal-hazards-wps coastal-hazards-wps
COPY coastal-hazards-liquibase coastal-hazards-liquibase
COPY coastal-hazards-geoserver coastal-hazards-geoserver
COPY coastal-hazards-portal coastal-hazards-portal

RUN mvn -B package