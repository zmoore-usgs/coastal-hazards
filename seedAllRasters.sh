#!/bin/bash
CCH_BASE_URL="${1}" #CCH base url without the trailing slash. Ex: https://cida-test.er.usgs.gov/dev/coastalchangehazardsportal
LAYERS_AND_ITEMS_FILE_NAME="${2}" #Name of a csv file whose first column is the layer name and second column is the item id. The file should not have any header rows. Only one comma should separate the layers and the items -- no spaces should be present. Ex: layers_and_items.csv
BEARER_ID=${3} #The bearer token from a logged-in session. Ex: e20a4c07-84ac-4a57-90f2-15bda6e8c318

curl -v -s -o /dev/null -X DELETE "${CCH_BASE_URL}/data/cache" -H "Authorization: Bearer ${BEARER_ID}"

while IFS='' read -r line || [[ -n "$line" ]]; do
    LAYER_NAME=$(echo $line | cut -f1 -d,)
    ITEM_ID=$(echo $line | cut -f2 -d,)
    bash seedOneRasterLayer.sh ${CCH_BASE_URL} ${LAYER_NAME} ${ITEM_ID}
done < "${LAYERS_AND_ITEMS_FILE_NAME}"
