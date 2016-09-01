FROM rserve:latest

MAINTAINER Jordan Walker <jiwalker@usgs.gov>

USER root
RUN apt-get update && \
    apt-get install -y --force-yes git libcurl3 libcurl3-gnutls libcurl4-openssl-dev libxml2-dev

RUN R -e 'install.packages("hazardItems", repos=c("http://owi.usgs.gov/R", "http://cran.us.r-project.org/"));'

USER rserve