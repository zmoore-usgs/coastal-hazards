<%@page import="gov.usgs.cida.coastalhazards.service.util.Property"%>
<%@page import="gov.usgs.cida.coastalhazards.service.util.PropertyUtil"%>
<%!    
    boolean development = Boolean.parseBoolean(PropertyUtil.getProperty(Property.DEVELOPMENT));
    String geoserverEndpoint = PropertyUtil.getProperty(Property.GEOSERVER_ENDPOINT);
    String n52Endpoint = PropertyUtil.getProperty(Property.N52_ENDPOINT);
%>
<script type="text/javascript">
	splashUpdate("Setting configuration...");
	var CONFIG = Object.extended();
	CONFIG.window = {};
	CONFIG.window.login = null;
	// Tells the application whether its in development mode or not.
	// Development mode tends to have more verbose logging
	CONFIG.development = <%= development%>;
	CONFIG.geoServerEndpoint = '<%=geoserverEndpoint%>';
	CONFIG.n52Endpoint = '<%=n52Endpoint%>';
	CONFIG.popupHoverDelay = 1500;
	CONFIG.namespace = Object.extended();
	CONFIG.namespace.proxydatumbias = 'gov.usgs.cida.ch.bias';
	CONFIG.namespace.published = 'gov.usgs.cida.ch.published';
	CONFIG.namespace.input = 'gov.usgs.cida.ch.input';
	CONFIG.namespace.output = 'gov.usgs.cida.ch.output';
	CONFIG.name = {};
	CONFIG.name.published = 'published';
	CONFIG.name.proxydatumbias = 'proxydatumbias';
	CONFIG.dateFormat = {
		padded: '{yyyy}-{MM}-{dd}',
		nonPadded: '{yyyy}-{M}-{d}'
	};
	CONFIG.alertQueue = {
		application: [],
		shorelines: [],
		baseline: [],
		transects: [],
		bias: [],
		calculation: [],
		results: []
	};
	// Sets the AJAX Timeout in milliseconds
	CONFIG.ajaxTimeout = 300000;
	CONFIG.graph = Object.extended();
	CONFIG.graph.enabled = 'LRR';
	CONFIG.graph.displayMap = {
		'LRR': {
			longName: 'Linear regression rate +/- LCI',
			units: 'm yr^-1',
			uncertainty: 'LCI',
			invert: true
		},
		'WLR': {
			longName: 'Weighted linear regression rate +/i WCI',
			units: 'm yr^-1',
			uncertainty: 'WCI',
			invert: true
		},
		'SCE': {
			longName: 'Shoreline change envelope',
			units: 'm',
			invert: false
		},
		'NSM': {
			longName: 'Net shoreline movement',
			units: 'm',
			invert: false
		},
		'EPR': {
			longName: 'End point rate',
			units: 'm yr^-1',
			uncertainty: 'ECI',
			invert: false
		}
	};

	JSON.stringify = JSON.stringify || function(obj) {
		var t = typeof (obj);
		if (t !== "object" || obj === null) {
			// simple data type
			if (t === "string")
				obj = '"' + obj + '"';
			return String(obj);
		}
		else {
			// recurse array or object
			var n, v, json = [], arr = (obj && obj.constructor === Array);
			for (n in obj) {
				v = obj[n];
				t = typeof(v);
				if (t === "string")
					v = '"' + v + '"';
				else if (t === "object" && v !== null)
					v = JSON.stringify(v);
				json.push((arr ? "" : '"' + n + '":') + String(v));
			}
			return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
		}
	};


</script>