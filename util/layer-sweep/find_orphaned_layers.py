import requests
from geoserver.catalog import Catalog

def get_cch_items(cch_url, cch_geoserver_url):
	"""
	returns an iterable of dicts representing items that CCH is aware of
	"""
	#'subtree=false' produces a flat list of all items
	all_items_url = cch_url + 'data/item?subtree=false&showDisabled=true'
	all_items_response = requests.get(all_items_url)
	items = handle_cch_items_response(all_items_response)
	print "total cch items retrieved: {}".format(len(items))
	item_filter = lambda(i): _item_filter(i, cch_geoserver_url)
	filtered_items = filter(item_filter, items)
	print "cch data items that have cch geoserver services: {}".format(len(filtered_items))
	#return filtered_items
	return items

def _item_filter(item, cch_geoserver_url):
	"""
	returns true if `item` has 'itemType' == 'data' and has some service endpoints that point to the CCH geoserver
	"""
	cch_geoserver_services = get_only_cch_geoserver_services(item['services'], cch_geoserver_url)
	has_cch_geoserver_services = 0 != len(cch_geoserver_services)
	is_data = 'data' == item['itemType']
	return is_data and has_cch_geoserver_services;

def get_only_cch_geoserver_services(services, cch_geoserver_url):
	"""
	Filters the parameterized list of services (dicts). The returned list should only contain services (dicts) that have the cch_geoserver_url in their 'endpoint' attributes.
	"""
	return [ service for service in services if cch_geoserver_url in service['endpoint'] ]

def handle_cch_items_response(response):
	"""
	given a response from a 'request' library request, return a list of dicts. Each dict is a cch item.
	"""
	if 200 != response.status_code:
		raise Exception('Could not retrieve CCH Items. Got status code ' + response.status_code)
	else:
		the_json = response.json()
		cch_items = the_json['items']
		return cch_items

def get_geoserver_layers(geoserver_url, geoserver_username, geoserver_password):
	"""
	returns an iterable of GeoServer layers
	"""
	cat = Catalog(geoserver_url + 'rest', username=geoserver_username, password=geoserver_password)
	all_layers = cat.get_layers()
	return all_layers

def map_names_to_gs_layers(layers):
	"""
	return a dict whose keys are layer names and whose values are the associated GeoServer layer objects
	"""
	names_to_layers = {}
	for layer in layers:
		names_to_layers[layer.name] = layer

	return names_to_layers

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
	gs_names_to_layers = map_names_to_gs_layers(gs_layers)
	
	cch_items = get_cch_items(cch_url, geoserver_url)
	
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
