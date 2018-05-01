import requests
import re
from geoserver.catalog import Catalog

def get_cch_items(cch_url):
	"""
	returns an iterable of dicts representing items that CCH is aware of
	"""
	#'subtree=false' produces a flat list of all items
	all_items_url = cch_url + 'data/item?subtree=false&showDisabled=true'
	print("retrieving CCH items from {}".format(all_items_url))
	all_items_response = requests.get(all_items_url)
	items = handle_cch_items_response(all_items_response)
	print "total cch items retrieved: {}".format(len(items))
	filtered_items = filter(item_filter, items)
	print "cch data items that have cch geoserver services: {}".format(len(filtered_items))
	#return filtered_items
	return items

def item_filter(item):
	"""
	returns true if `item` has 'itemType' == 'data' and has some service endpoints that point to the CCH geoserver
	
	"""
	cch_geoserver_services = get_only_cch_geoserver_services(item['services'])
	has_cch_geoserver_services = 0 != len(cch_geoserver_services)
	is_data = 'data' == item['itemType']
	return is_data and has_cch_geoserver_services;

def _exclude_known_non_cch_endpoints_from_items(items):
	"""
	This function is not called during the normal execution of this script. It was used to analyze the cch item objects' "endpoint" properties on all three tiers so that reasonable filter critiera could be created for the `get_only_cch_geoserver_services` function.
	Example usage:
	```
	items = get_cch_items(cch_url)
	print(_exclude_known_non_cch_endpoints_from_items(items))
	```
	"""
	return set([ service['endpoint'].replace('https', 'http') for item in items for service in item['services'] if 'noaa.gov' not in service['endpoint'] and 'service=CSW' not in service['endpoint'] and 'olga.er.usgs.gov' not in service['endpoint'] and 'coastalmap.marine.usgs.gov' not in service['endpoint']])

def get_only_cch_geoserver_services(services):
	"""
	Filters the parameterized list of services (dicts). The returned list should only contain services (dicts) that have `endpoint`s that look like they are from a cch geoserver.
	"""
	#match hostnames of format:
	# cida-eros-...
	# cidasd...
	# cida-test.er.usgs.gov...
	# cida.usgs.gov
	#
	#This pattern matches either http or https
	cida_pattern = re.compile('//cida.*usgs\.gov')
	
	#Also match CCH-specific urls on marine.usgs.gov.
	#This string matches either http or https.
	marine_string = '://marine.usgs.gov/coastalchangehazardsportal/geoserver'

	return [ 
		service for service in services 
			if 'csw' != service['type']
			and (
				marine_string in service['endpoint']
				or cida_pattern.search(service['endpoint'])
			)
 	]

def handle_cch_items_response(response):
	"""
	given a response from a 'request' library request, return a list of dicts. Each dict is a cch item. Raises an Exception if the HTTP response is bad.
	"""
	if 200 != response.status_code:
		raise Exception('Could not retrieve CCH Items. Got status code {}'.format(response.status_code))
	else:
		the_json = response.json()
		cch_items = the_json['items']
		return cch_items

def get_geoserver_layers(geoserver_url, geoserver_username, geoserver_password):
	"""
	returns an iterable of GeoServer layers
	"""
	geoserver_rest_url = geoserver_url + 'rest'
	print("retrieving GeoServer layer info via {}".format(geoserver_rest_url))
	cat = Catalog(geoserver_rest_url, username=geoserver_username, password=geoserver_password)
	all_layers = cat.get_layers()
	print("total GeoServer layers retrieved: {}".format(len(all_layers)))
	return all_layers

#def map_names_to_gs_layers(layers):
#	"""
#	return a dict whose keys are layer names and whose values are the associated GeoServer layer objects
#	"""
#	names_to_layers = {}
#	for layer in layers:
#		names_to_layers[layer.name] = layer
#
#	return names_to_layers

def find_gs_layers_missing_from_cch_items(gs_layers, cch_items):
	"""
	returns an iterable of dicts representing GeoServer Layers in `gs_layers` that have no corresponding entry in `cch_items`.
	"""
	pass

def find_orphaned_layers(geoserver_url, geoserver_username, geoserver_password, cch_url):
	"""
	returns an iterable of dicts representing layers that are present in GeoServer, but absent from CCH.
	"""
	gs_layers = get_geoserver_layers(geoserver_url, geoserver_username, geoserver_password)
	#gs_names_to_layers = map_names_to_gs_layers(gs_layers)
	
	cch_items = get_cch_items(cch_url)
	cch_item_ids = map(lambda i: i['id'], cch_items)
	return cch_items
	
def parse_cmd_args(argv):
	"""
	Takes sys.argv, validates, and extracts params, returning them in a dict
	"""
	if len(argv) != 5:
		raise Exception(
			'Usage: find_orphaned_layers.py $GEOSERVER_URL $GEOSERVER_USERNAME $GEOSERVER_PASSWORD $CCH_URL'
			+ '\nExample:\n' +
			'find_orphaned_layers.py https://marine.usgs.gov/coastalchangehazardsportal/geoserver/ ralph t0pS3crEt https://marine.usgs.gov/coastalchangehazardsportal/'
		)
	else:
		args = {
			'geoserver_url': argv[1],
			'geoserver_username': argv[2],
			'geoserver_password': argv[3],
			'cch_url': argv[4]
		}
		return args

def main(argv):
	parsed_args = parse_cmd_args(argv)
	return find_orphaned_layers(**parsed_args)

if '__main__' == __name__ :
	import sys
	print(main(sys.argv))
