from __future__ import print_function
from geoserver.catalog import Catalog
from find_orphaned_layers import get_geoserver_layers
import sys

def eprint(*args, **kwargs):
	"""
	print to stderr instead of stdout
	In this file, only results inteaded to be piped to additional
	command	are sent to stdout
	"""
	print(*args, file=sys.stderr, **kwargs)

def strip_workspace_from_layer_name(layer_name):
	if ':' in layer_name:
		#layer name is in the format "workspace:name"
		name = layer_name.split(':')[1]
		return name
	else:
		return layer_name

def get_names_of_layers_to_delete(layers_to_delete_filename):
	"""
	Opens the parameterized filename, returns a set() of trimmed, non-blank lines from the file
	"""
	layer_names = []
	with open(layers_to_delete_filename) as layers_to_delete_file:
		for line in layers_to_delete_file.readlines():
			stripped_line = line.strip()
			if '' != stripped_line:
				layer_names.append(stripped_line)

	return layer_names

def delete_layers(layers):
	"""
	layers - an iterable of geoserver.layer.Layer
	returns a tuple (successes, failures) -
		successes - a list of string layer names that were successfully deleted
		failures - a dict that maps string layer names to strings detailing the failures
	"""
	successes = []
	failures = {}
	for layer in layers:
		layer_name = layer.name
		try:
			layer.catalog.delete(layer, True, True)
			successes.append(layer_name)
		except Exception as e:
			failures[layer_name] = e

	return (successes, failures)

def make_command_line_report(successes, failures):
	"""
	successes - a list of string layer names that were successfully deleted
	failures - a dict that maps string layer names to strings detailing the failures

	return a string command line-friendly report
	"""
	report = 'Successfully Deleted {} Layers:'.format(len(successes))
	report += '\n'
	report += '\n'.join(successes)
	report += '\n'
	if failures:
		report += '\nERROR - Could NOT Delete The Following {} Layers:\n'.format(len(failures))
		for k,v in failures.iteritems():
			report += k + ':' + str(v) + '\n'

	return report

def delete_all_gs_layers_specified_in_file(geoserver_url, geoserver_username, geoserver_password, layers_to_delete_filename):
	"""
	geoserver_url
	geoserver_username
	geoserver_password
	layers_to_delete_filename - a string filename. The associated file should list one
		layer name per line.

	returns a tuple (successes, failures) -
		successes - a list of string layer names that were successfully deleted
		failures - a dict that maps string layer names to strings detailing the failures
	"""
	names_of_layers_to_delete = get_names_of_layers_to_delete(layers_to_delete_filename)
	all_gs_layers = get_geoserver_layers(geoserver_url, geoserver_username, geoserver_password)
	layers_that_will_be_deleted = [ layer for layer in all_gs_layers if layer.name in names_of_layers_to_delete ]
	successes, failures = delete_layers(layers_that_will_be_deleted)

	return (successes, failures)


def parse_cmd_args(argv):
	"""
	Takes sys.argv, validates, and extracts params, returning them in a dict
	"""
	if len(argv) != 5:
		raise Exception(
			'Usage: delete_layers.py $INTERNAL_GEOSERVER_URL $GEOSERVER_USERNAME $GEOSERVER_PASSWORD $FILE_WITH_LAYERS_TO_DELETE'
			+ '\nExample:\n' +
			'delete_layers.py http://my-internal-geoserver-host.usgs.gov:8081/geoserver/ ralph t0pS3crEt orphaned_layers.txt'
			+ '\nThe file should contain a newline-delimited list of layer names to delete.'
		)
	else:
		args = {
			'geoserver_url': argv[1],
			'geoserver_username': argv[2],
			'geoserver_password': argv[3],
			'layers_to_delete_filename': argv[4]
		}
		return args

def main(argv):
	"""
	Command line-specific logic
	Exits with status code 1 if there were problems, 0 otherwise
	"""
	parsed_args = parse_cmd_args(argv)
	successes, failures = delete_all_gs_layers_specified_in_file(**parsed_args)
	report = make_command_line_report(successes, failures)
	print(report)

	if failures:
		exit(1)
	else:
		exit(0)

if '__main__' == __name__ :
	main(sys.argv)
