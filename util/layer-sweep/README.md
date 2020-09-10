# Layer Sweeping

CCH does not always clean up after itself. Sometimes CCH Items that are deleted in the Portal UI are not removed from GeoServer. This directory contains two scripts for Python 3 to help clean up.

 1. find_dangling_layers.py
 1. delete_layers.py 

# Setup

Optionally, create and activate a virtualenv to ensure isolation from other pojects.

```bash
$> virtualenv --python python3.8 env
```

Required: install the dependencies described in requirements.txt.

To use pip to install the dependencies...

```bash
$> ./env/bin/pip install -r requirements.txt
```

# Finding Layers to Delete

## Description

`find_dangling_layers.py` retrieves all the items from the CCH Portal, retrieves all layers from a CCH GeoServer, and then writes to stdout out the names of GeoServer layers that do not have an item in the CCH Portal. Summary information is written to stderr.

## Usage

```bash
$> python find_dangling_layers.py $GEOSERVER_URL $GEOSERVER_USERNAME $GEOSERVER_PASSWORD $CCH_URL
```

The script has difficulty passing credentials to GeoServer via publicly-mapped urls. Use an internal url for the GeoServer instead.

## Example

```bash
$> python find_dangling_layers.py http://my-internal-server.usgs.gov:8081/geoserver/rest/ ralph t0pS3crEt https://marine.usgs.gov/coastalchangehazardsportal/ > dangling_layers.txt
```

# Deleting Layers

## Description

`delete_layers.py` reads newline-separated layer names from a file and then deletes them from GeoServer. A report is printed to stdout. The script returns exit code 1 if there were any errors deleting the layers. Otherwise the script returns exit code 0.

## Usage

```bash
$> python delete_layers.py $GEOSERVER_URL $GEOSERVER_USERNAME $GEOSERVER_PASSWORD $FILE_WITH_LAYERS_TO_DELETE
```

The script has difficulty passing credentials to GeoServer via publicly-mapped urls. Use an internal url for the GeoServer instead.

## Example

### Success

```bash
$> python delete_layers.py http://my-internal-server.usgs.gov:8081/geoserver/rest/ admin $GEOSERVER_PASSWORD dangling_layers.txt
retrieving GeoServer layer info via http://my-internal-server.usgs.gov:8081/geoserver/rest
Successfully Deleted 1 Layers:
G57Sz1h5

$> echo $?
0

```

### Failure

```bash
$> python delete_layers.py http://my-internal-server.usgs.gov:8081/geoserver/rest/ admin $GEOSERVER_PASSWORD dangling_layers.txt
retrieving GeoServer layer info via http://my-internal-server.usgs.gov:8081/geoserver/rest
Successfully Deleted 0 Layers:

ERROR - Could NOT Delete The Following 1 Layers:
my_layer:Tried to make a DELETE request to http://my-internal-server.usgs.gov:8081/geoserver/rest/layers/my_layer but got a 500 status code

$> echo $?
1

```

# Putting It All Together

```bash
$> python find_dangling_layers.py http://my-internal-server.usgs.gov:8081/geoserver/rest/ ralph t0pS3crEt https://marine.usgs.gov/coastalchangehazardsportal/ > dangling_layers.txt
retrieving GeoServer layer info via http://192.168.99.100:8081/geoserver/rest
retrieving CCH items from http://192.168.99.100:8080/coastal-hazards-portal/data/item?subtree=false&showDisabled=true

Total Layers Retrieved From GeoServer: 43
Total Items Retrieved From CCH Portal: 4
Total Relevant Layres Extracted From CCH Items: 0
Total Dangling Layers: 43

$> #now manually inspect and modify the list of layers to delete
$> vim dangling_layers.txt
$> python delete_layers.py http://my-internal-server.usgs.gov:8081/geoserver/rest/ admin $GEOSERVER_PASSWORD dangling_layers.txt
retrieving GeoServer layer info via http://192.168.99.100:8081/geoserver/rest
Successfully Deleted 1 Layers:G57Sz1h5

```

# Tear-Down
If you created and activated the optional virtualenv, you can get out of it by closing your terminal or by running `deactivate` once you are finished using the scripts.

