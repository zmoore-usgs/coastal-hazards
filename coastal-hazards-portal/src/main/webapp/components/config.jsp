
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
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
	String geoserverEndpoint = props.getProperty("coastal-hazards.geoserver.endpoint");
%>
<script type="text/javascript">
	splashUpdate("Setting configuration...");
	var CONFIG = {};

	CONFIG.popupHandling = {
		isVisible : false,
		clickedAway : false
	};
	CONFIG.development = <%= development%>;
	CONFIG.geoServerEndpoint = '<%=geoserverEndpoint%>';
	CONFIG.popupHoverDelay = 1500;
	CONFIG.ajaxTimeout = 300000;
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