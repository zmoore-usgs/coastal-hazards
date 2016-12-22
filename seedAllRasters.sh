#!/bin/bash
CCH_BASE_URL="${1}" #Ex: https://cida-test.er.usgs.gov/dev/coastalchangehazardsportal

#somehow still need to invalidate the cache. Might be via:
#curl -v -X DELETE "${CCH_BASE_URL}/data/cache"

LAYERS_AND_ITEMS_FILE_NAME="${2}" #Name of a csv file whose first column is the layer name and second column is the item id. The file should not have any header rows. Ex: layers_and_items.csv
while IFS='' read -r line || [[ -n "$line" ]]; do
    LAYER_NAME=$(echo $line | cut -f1 -d,)
    ITEM_ID=$(echo $line | cut -f2 -d,)
    bash seedOneRasterLayer.sh ${CCH_BASE_URL} ${LAYER_NAME} ${ITEM_ID}
done < "${LAYERS_AND_ITEMS_FILE_NAME}"
