
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="org.slf4j.Logger"%>
<%@page import="org.slf4j.LoggerFactory"%>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			LoggerFactory.getLogger("index.jsp").error("Could not find JNDI - Application will probably not function correctly");
		}
	}
	boolean development = Boolean.parseBoolean(props.getProperty("development"));
	String publicContext = props.getProperty("coastal-hazards.public.context");
	String geoserverEndpoint = props.getProperty("coastal-hazards.geoserver.endpoint");
	String stPeteArcServerEndpoint = props.getProperty("coastal-hazards.stpetearcserver.endpoint");
	String geocodeEndpoint = props.getProperty("coastal-hazards.geocoding.endpoint", "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/find");
	String publicUrl = props.getProperty("coastal-hazards.public.url", "http://127.0.0.1:8080/coastal-hazards-portal");
%>
<%
	String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");
%>
<script type="text/javascript">
	splashUpdate("Setting configuration...");
    
    OpenLayers.ProxyHost = 'geoserver/';
    
    var CCH = {'Objects': {}};
	CCH.CONFIG = {
		development: <%= development%>,
		ajaxTimeout: 300000,
		contextPath: '<%=baseUrl%>',
		emailLink: 'CCH_Help@usgs.gov',
		publicUrl: '<%=publicUrl%>',
        params: {
            id : '${param.id}',
            type : '${param.idType}' 
        },
		popupHandling: {
			isVisible: false,
			clickedAway: false,
			hoverDelay: 1500
		},
		name: {
			'published': 'published'
		},
		map: {
			layers: {
				markerLayer: new OpenLayers.Layer.Markers('geocoding-marker-layer', {
					displayInLayerSwitcher: false
				}),
				baselayers: [
					new OpenLayers.Layer.XYZ("World Imagery",
							"http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/\${z}/\${y}/\${x}",
							{
								sphericalMercator: true,
								isBaseLayer: true,
								numZoomLevels: 20,
								wrapDateLine: true
							}
					),
					new OpenLayers.Layer.XYZ("Street",
							"http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/\${z}/\${y}/\${x}",
							{
								sphericalMercator: true,
								isBaseLayer: true,
								numZoomLevels: 20,
								wrapDateLine: true
							}
					),
					new OpenLayers.Layer.XYZ("Topo",
							"http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/\${z}/\${y}/\${x}",
							{
								sphericalMercator: true,
								isBaseLayer: true,
								numZoomLevels: 20,
								wrapDateLine: true
							}
					),
					new OpenLayers.Layer.XYZ("Ocean",
							"http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/\${z}/\${y}/\${x}",
							{
								sphericalMercator: true,
								isBaseLayer: true,
								numZoomLevels: 17,
								wrapDateLine: true
							})
				]
			}
		},
		data: {
			sources: {
				'cida-geoserver': {
					'endpoint': '<%=geoserverEndpoint%>',
					'proxy': 'geoserver/'
				},
				'stpete-arcserver': {
					'endpoint': '<%=stPeteArcServerEndpoint%>',
					'proxy': 'stpgis/'
				},
				'item': {
					'endpoint': '/data/item'
				},
				'geocoding': {
					'endpoint': '<%=geocodeEndpoint%>'
				},
				'session': {
					'endpoint': '/data/view/'
				}
			}
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
    
    // Internet Explorer Fix
    // http://tosbourn.com/2013/08/javascript/a-fix-for-window-location-origin-in-internet-explorer/
    if (!window.location.origin) {
      window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
    }

</script>