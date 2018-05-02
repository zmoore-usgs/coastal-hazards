# Description

This script retrieves all the items from the CCH Portal, retrieves all layers from a CCH GeoServer, and then prints out the names of GeoServer layers that do not have an item in the CCH Portal.

# Usage

```
python find_orphaned_layers.py $GEOSERVER_URL $GEOSERVER_USERNAME $GEOSERVER_PASSWORD $CCH_URL
```

The script has difficulty passing credentials to GeoServer via publicly-mapped urls. Use an internal url for the GeoServer instead.

# Example

```bash
python find_orphaned_layers.py http://my-internal-server.usgs.gov:8081/geoserver/ ralph t0pS3crEt https://marine.usgs.gov/coastalchangehazardsportal/
```

