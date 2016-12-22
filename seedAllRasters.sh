#!/bin/bash
set -e
# Example usage:
#./seedAllRasters.sh https://cida-test.er.usgs.gov/dev/coastalchangehazardsportal layer_and_item.csv

#Note that in most cases you will want to run "invalidateRasterCache.sh" before running this script.

CCH_BASE_URL="${1}" #CCH base url without the trailing slash. Ex: https://cida-test.er.usgs.gov/dev/coastalchangehazardsportal
LAYERS_AND_ITEMS_FILE_NAME="${2}" #Name of a csv file whose first column is the layer name and second column is the item id. The file should not have any header rows. Only one comma should separate the layers and the items -- no spaces should be present. Ex: layers_and_items.csv

#Now repopulate the cache
while IFS='' read -r line || [[ -n "$line" ]]; do
    LAYER_NAME=$(echo $line | cut -f1 -d,)
    ITEM_ID=$(echo $line | cut -f2 -d,)
    bash seedOneRasterLayer.sh ${CCH_BASE_URL} ${LAYER_NAME} ${ITEM_ID}
done < "${LAYERS_AND_ITEMS_FILE_NAME}"
