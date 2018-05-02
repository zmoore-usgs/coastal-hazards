# Description

This script retrieves all the items from the CCH Portal, retrieves all layers from a CCH GeoServer, and then prints out the names of GeoServer layers that do not have an item in the CCH Portal.

# Setup

Optionally, create and activate a virtualenv to ensure isolation from other pojects.

```
virtualenv --python python2.7 env
. env/bin/activate
```

Required: use pip to install the dependencies

```
pip install -r requirements.txt
```

# Usage

```
python find_orphaned_layers.py $GEOSERVER_URL $GEOSERVER_USERNAME $GEOSERVER_PASSWORD $CCH_URL
```

The script has difficulty passing credentials to GeoServer via publicly-mapped urls. Use an internal url for the GeoServer instead.

# Example

```bash
python find_orphaned_layers.py http://my-internal-server.usgs.gov:8081/geoserver/ ralph t0pS3crEt https://marine.usgs.gov/coastalchangehazardsportal/
```


# Tear-Down
If you created and activated the optional virtualenv, you can get out of it by running `deactivate` once you are finished using the script.


