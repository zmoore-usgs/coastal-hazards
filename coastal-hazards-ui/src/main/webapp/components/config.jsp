<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%!    
    protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

    {
        try {
            props = props.addJNDIContexts(new String[0]);
        } catch (Exception e) {
            LoggerFactory.getLogger("index.jsp").error("Could not find JNDI - Application will probably not function correctly");
        }
    }
    boolean development = Boolean.parseBoolean(props.getProperty("development"));
    String geoserverEndpoint = props.getProperty("coastal-hazards.geoserver.endpoint");
    String n52Endpoint = props.getProperty("coastal-hazards.n52.endpoint");
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
	CONFIG.namespace.published = 'gov.usgs.cida.ch.published';
	CONFIG.namespace.input = 'gov.usgs.cida.ch.input';
	CONFIG.namespace.output = 'gov.usgs.cida.ch.output';
	CONFIG.name = {};
	CONFIG.name.published = 'published';
	CONFIG.dateFormat = {
		padded: '{MM}/{dd}/{yyyy}',
		nonPadded: '{M}/{d}/{yyyy}'
	};
	CONFIG.alertQueue = {
		application: [],
		shorelines: [],
		baseline: [],
		transects: [],
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