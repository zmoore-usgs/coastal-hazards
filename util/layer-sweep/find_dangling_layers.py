from __future__ import print_function
import requests
import re
from geoserver.catalog import Catalog
import sys

def eprint(*args, **kwargs):
	"""
	print to stderr instead of stdout
	In this file, only results inteaded to be piped to additional
	command	are sent to stdout
	"""
	print(*args, file=sys.stderr, **kwargs)

def get_cch_items(cch_url):
	"""
	returns an iterable of dicts representing items that CCH is aware of
	"""
	#'subtree=false' produces a flat list of all items
	all_items_url = cch_url + 'data/item?subtree=false&showDisabled=true'
	eprint("retrieving CCH items from {}".format(all_items_url))
	all_items_response = requests.get(all_items_url)
	items = handle_cch_items_response(all_items_response)
	return items

def item_filter(item):
	"""
	returns true if `item` has 'itemType' == 'data' and has some service
	endpoints that use CCH-geoserver-like parameters
	"""
	cch_geoserver_services = get_only_cch_geoserver_services(item['services'])
	has_cch_geoserver_services = 0 != len(cch_geoserver_services)
	is_data = 'data' == item['itemType']
	return is_data and has_cch_geoserver_services;

def get_only_cch_geoserver_services(services):
	"""
	Filters the parameterized list of services (dicts). The returned list
	should only contain services (dicts) that have parameters that look
	like they are from a cch geoserver.
	"""

	service_parameter_prefix_proxied = 'proxied'
	service_parameter_prefix_published = 'published'

	return [
		service for service in services
			if 'csw' != service['type']
			and (
				service_parameter_prefix_proxied in service['serviceParameter']
				or service_parameter_prefix_published in service['serviceParameter']
			)
 	]

def strip_workspace_from_layer_name(layer_name):
	if ':' in layer_name:
		#layer name is in the format "workspace:name"
		name = layer_name.split(':')[1]
		return name
	else:
		return layer_name

def convert_cch_items_to_cch_geoserver_layer_names(cch_items):
	layer_names = set()
	for item in cch_items:
		cch_geoserver_services = get_only_cch_geoserver_services(item['services'])
		for service in cch_geoserver_services:
			layer_name = strip_workspace_from_layer_name(service['serviceParameter'])
			layer_names.add(layer_name)

	return layer_names

def handle_cch_items_response(response):
	"""
	given a response from a 'request' library request, return a list of
	dicts. Each dict is a cch item. Raises an Exception if the
	HTTP response is bad.
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
	eprint("retrieving GeoServer layer info via {}".format(geoserver_rest_url))
	cat = Catalog(geoserver_rest_url, username=geoserver_username, password=geoserver_password)
	all_layers = cat.get_layers()
	return all_layers

def filter_out_geoserver_layers_that_are_registered(all_gs_layers, registered_geoserver_layer_names):
	"""
	all_gs_layers - an iterable of geoserver.layer.Layer
	registered_geoserver_layer_names - a set of the string layer names
		that are referenced in items in the CCH portal. The names
		should not contain workspaces. In other words they should be
		'ABCD' rather than 'proxied:ABCD'

	returns a list of geoserver.layer.Layer objects that are not registered
	"""
	dangling_gs_layers = []
	for layer in all_gs_layers:
		if layer.name not in registered_geoserver_layer_names:
			dangling_gs_layers.append(layer)

	return dangling_gs_layers

def find_dangling_layers(geoserver_url, geoserver_username, geoserver_password, cch_url):
	"""
	returns an iterable of geoserver.layer.Layer objects that are present
	in CCH's GeoServer, but absent from CCH's Portal.
	"""
	all_gs_layers = get_geoserver_layers(geoserver_url, geoserver_username, geoserver_password)

	cch_items = get_cch_items(cch_url)
	registered_geoserver_layer_names = convert_cch_items_to_cch_geoserver_layer_names(cch_items)
	dangling_gs_layers = filter_out_geoserver_layers_that_are_registered(all_gs_layers, registered_geoserver_layer_names)
	eprint(
		("\nTotal Layers Retrieved From GeoServer: {}\n" +
		"Total Items Retrieved From CCH Portal: {}\n" +
		"Total Relevant Layers Extracted from CCH Items: {}\n" +
		"Total Dangling Layers: {}\n").format(
			len(all_gs_layers),
			len(cch_items),
			len(registered_geoserver_layer_names ),
			len(dangling_gs_layers)
		)
	)
	return dangling_gs_layers

def parse_cmd_args(argv):
	"""
	Takes sys.argv, validates, and extracts params, returning them in a dict
	"""
	if len(argv) != 5:
		raise Exception(
			'\n\nUsage: find_dangling_layers.py $INTERNAL_GEOSERVER_REST_URL $GEOSERVER_USERNAME $GEOSERVER_PASSWORD $CCH_URL'
			+ '\n\tNote: URLs MUST include a trailing slash.'
			+ '\n\nExample:\n' +
			'\tfind_dangling_layers.py http://my-internal-geoserver-host.usgs.gov:8081/geoserver/rest/ admin t0pS3crEt https://marine.usgs.gov/coastalchangehazardsportal/'
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
	dangling_layers = find_dangling_layers(**parsed_args)
	dangling_layer_names = '\n'.join([ l.name for l in dangling_layers ])
	return dangling_layer_names

if '__main__' == __name__ :
	print(main(sys.argv))
