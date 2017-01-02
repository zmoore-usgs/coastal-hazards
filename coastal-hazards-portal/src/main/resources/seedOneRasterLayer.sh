#!/bin/bash
set -e
CCH_BASE_URL="${1}" #no trailing slash. Ex: https://cida-test.er.usgs.gov/dev/coastalchangehazardsportal
LAYER_NAME="${2}" #Ex: _0b57c74f-d8d6-4686-a4fb-0de9b5c7f6d0
ITEM_ID="${3}" #Ex: EWyGbdyH

#http://stackoverflow.com/a/10660730
rawurlencode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""
  local pos c o

  for (( pos=0 ; pos<strlen ; pos++ )); do
     c=${string:$pos:1}
     case "$c" in
        [-_.~a-zA-Z0-9] ) o="${c}" ;;
        * )               printf -v o '%%%02x' "'$c"
     esac
     encoded+="${o}"
  done
  echo "${encoded}"    # You can either set a return variable (FASTER) 
  REPLY="${encoded}"   #+or echo the result (EASIER)... or both... :p
}

ENCODED_CCH_BASE_URL=$( rawurlencode "${CCH_BASE_URL}")


time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=cch&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4210828.910601,1354689.205608,14229583.080601&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4210828.910601,-6159376.421892,6715517.453101&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed -H 'Connection: keep-alive' -H 'Cache-Control: max-age=0'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4210828.910601,-7411720.693142,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,5463173.181851,-7411720.693142,6715517.453101&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,5463173.181851,-8037892.828767,6089345.317476&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4210828.910601,-8037892.828767,4837001.046226&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,4210828.910601,-7411720.693142,4837001.046226&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4837001.046226,-8037892.828767,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,4837001.046226,-7411720.693142,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,5463173.181851,-7411720.693142,6089345.317476&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8350978.8965795,5463173.181851,-8037892.828767,5776259.2496635&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,5150087.1140385,-7724806.7609545,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,5463173.181851,-7724806.7609545,5776259.2496635&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8350978.8965795,5150087.1140385,-8037892.828767,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-7724806.7609545,5150087.1140385,-7411720.693142,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,4837001.046226,-7724806.7609545,5150087.1140385&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-7724806.7609545,5463173.181851,-7411720.693142,5776259.2496635&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8350978.8965795,4837001.046226,-8037892.828767,5150087.1140385&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,5776259.2496635,-7724806.7609545,6089345.317476&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-7724806.7609545,4837001.046226,-7411720.693142,5150087.1140385&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,5150087.1140385,-8350978.8965795,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8350978.8965795,5776259.2496635,-8037892.828767,6089345.317476&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,5463173.181851,-8350978.8965795,5776259.2496635&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-7724806.7609545,5776259.2496635,-7411720.693142,6089345.317476&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4837001.046226,-8350978.8965795,5150087.1140385&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,4523914.9784135,-7724806.7609545,4837001.046226&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8350978.8965795,4523914.9784135,-8037892.828767,4837001.046226&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,5776259.2496635,-8350978.8965795,6089345.317476&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-7724806.7609545,4523914.9784135,-7411720.693142,4837001.046226&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4523914.9784135,-8350978.8965795,4837001.046226&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4523914.9784135,-8350978.8965795,4837001.046226&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4210828.910601,-8350978.8965795,4523914.9784135&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8350978.8965795,4210828.910601,-8037892.828767,4523914.9784135&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8037892.828767,4210828.910601,-7724806.7609545,4523914.9784135&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-7724806.7609545,4210828.910601,-7411720.693142,4523914.9784135&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

time curl -v -s -o /dev/null "${CCH_BASE_URL}/geoserver/proxied/wms?LAYERS=proxied%3A${LAYER_NAME}&FORMAT=image%2Fpng&TRANSPARENT=TRUE&STYLES=&VERSION=1.3.0&SLD=${ENCODED_CCH_BASE_URL}%2Fdata%2Fsld%2F${ITEM_ID}&EXCEPTIONS=application%2Fvnd.ogc.se_blank&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG%3A3857&BBOX=-8664064.964392,4210828.910601,-7411720.693142,5463173.181851&WIDTH=256&HEIGHT=256" -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed  -H 'Connection: keep-alive'

