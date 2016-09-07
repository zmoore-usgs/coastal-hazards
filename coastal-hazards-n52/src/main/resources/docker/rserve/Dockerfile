FROM rserve:latest

MAINTAINER Jordan Walker <jiwalker@usgs.gov>

USER root
RUN apt-get update && \
    apt-get install -y --force-yes git libcurl3=7.38.0-4+deb8u4 libcurl4-openssl-dev libssl-dev libxml2-dev

RUN R -e 'install.packages("hazardItems", repos=c("https://owi.usgs.gov/R", "http://cran.us.r-project.org/"))'

USER rserve
