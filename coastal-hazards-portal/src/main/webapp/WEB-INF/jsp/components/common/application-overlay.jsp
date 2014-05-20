<%@page import="java.io.File"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%!
	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			File propsFile = new File(getClass().getClassLoader().getResource("application.properties").toURI());
			props = new DynamicReadOnlyProperties(propsFile);
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}

	private String getProp(String key) {
		String result = props.getProperty(key, "");
		return result;
	}
	
    
%>

<%
	Boolean development = Boolean.parseBoolean(request.getParameter("debug-qualifier"));
	String referer = request.getHeader("referer");
	props.getProperty("coastal-hazards.base.url");
%>
<link type="text/css" rel="stylesheet" href="<%=request.getParameter("base-url")%>/css/application-overlay/application-overlay<%= development ? "" : "-min"%>.css" />
<div id="application-overlay">
	<div id="application-initial-load-splash" class="hidden">
		<div id="application-overlay-content-wrap">
			<div id="application-overlay-image-container">
				<img src="<%=request.getParameter("base-url")%>/images/splash/usgs.svg" alt="USGS Logo"/>
			</div>
			<div id="application-overlay-description-container">
				<div id="application-overlay-description-container-title">Coastal Change Hazards Portal</div>
				<div id="application-overlay-description-container-version">Version <%=request.getParameter("version")%></div>
				<div class="application-overlay-description-container-spinner-container">
					<img class="splash-spinner" src="images/spinner/spinner3.gif" class="img-responsive" alt="Spinner Image"/><span id="splash-status-update"></span>
				</div>
			</div>
		</div>
	</div>
	<div id="application-subsequent-load-splash" class="hidden">
		<h2>Retrieving Data...</h2>
		<div class="application-overlay-description-container-spinner-container">
			<img class="splash-spinner" src="images/spinner/spinner3.gif" class="img-responsive" alt="Spinner Image"/><span class="splash-status-update"></span>
		</div>
	</div>
</div>
<script type="text/javascript">
    var splashUpdate = function(message) {
        $('.splash-status-update').html(message);
    };
	var splashAppend = function(elements) {
		$('.splash-status-update').append(elements);
	};
	
	var onSiteReferral = document.referrer.indexOf(CCH.CONFIG.publicUrl) !== -1;
	(function(){
		var selector;
		if(onSiteReferral){
			selector = '#application-subsequent-load-splash';
			
		}
		else{
			selector = '#application-initial-load-splash';
		}
		$(selector).removeClass('hidden');
		
	}());
    splashUpdate("Loading Application...");
</script>