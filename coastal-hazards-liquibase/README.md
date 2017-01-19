# Coastal Hazards Liquibase Module

## Running locally
To experiment with schema changes locally, install postgres locally.
Add a new profile to your maven settings file (usually ~/.m2/settings.xml). In the profile, specify the properties necessary to run liquibase. An example follows.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                http://maven.apache.org/xsd/settings-1.0.0.xsd">
<profiles>
	<profile>
		<id>liquibase-properties</id>
		<activation>
			<activeByDefault>true</activeByDefault>
		</activation>
		<properties>
			<liquibase.driver>org.postgresql.Driver</liquibase.driver>
			<liquibase.url>jdbc:postgresql://localhost:5432/cchportal</liquibase.url>
			<liquibase.username>username_goes_here</liquibase.username>
			<liquibase.password>password_goes_here</liquibase.password>
		</properties>
	</profile>
</profiles>
</settings>
```
