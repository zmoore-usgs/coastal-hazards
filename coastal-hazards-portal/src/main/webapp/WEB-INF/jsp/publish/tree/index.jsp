<%@page import="java.io.File"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<!DOCTYPE html>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

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
	boolean development = Boolean.parseBoolean(getProp("development"));
	String version = getProp("application.version");
	String vJqueryUI = getProp("version.jqueryui");
	String vBootstrap = getProp("version.bootstrap");
	String vFontAwesome = getProp("version.fontawesome");
	String vSugarJs = getProp("version.sugarjs");
	String vJsTree = getProp("version.jstree");
	String vJquery = getProp("version.jquery");
%>
<%
	String fullRefererUrl = request.getHeader("referer");
	String referer = "";
	String baseUrlJndiString = props.getProperty("coastal-hazards.base.secure.url");
	String baseUrl = StringUtils.isNotBlank(baseUrlJndiString) ? baseUrlJndiString : request.getContextPath();
	String relPath = baseUrl+"/";
	if (null != fullRefererUrl && fullRefererUrl.toLowerCase().contains("/publish/item/")) {
		referer = fullRefererUrl.substring(fullRefererUrl.lastIndexOf("/") + 1);
	}
%>
<html lang="en">
    <head>
        <title>Data Tree Manipulation</title>
		<%-- https://developer.apple.com/library/ios/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html --%>
		<link rel="apple-touch-icon" sizes="57x57" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_57x57.jpg" />
		<link rel="apple-touch-icon" sizes="72x72" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_72x72.jpg" />
		<link rel="apple-touch-icon" sizes="114x114" href="<%=baseUrl%>/images/mobileIcons/iphone_usgs_114x114.jpg" />
		<link rel="apple-touch-icon" sizes="144x144" href="<%=baseUrl%>/images/mobileIcons/ipad_usgs_144x144.jpg" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/themes/base/<%= development ? "" : "minified/"%>jquery<%= development ? "." : "-"%>ui<%= development ? ".all" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/<%=vBootstrap%>/css/bootstrap<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/jstree/<%=vJsTree%>/themes/default/style<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/font-awesome/<%=vFontAwesome%>/css/font-awesome<%= development ? "" : ".min"%>.css" />
		<link type="text/css" rel="stylesheet" href="<%=baseUrl%>/css/publish/tree.css" />
    </head>
    <body>
        <div class="container-fluid">
			<div class="page-header">
				<div class="row" id="row-title">
					<h3 class="col-md-12">Coastal Hazards Portal Tree Manipulation Service</h3>
				</div>
			</div>
			<div class="row" id="row-instructions">
				<div class="col-md-12">
					<p class="lead">Instructions</p>
					<p class="text-muted">
						"Click and drag items to re-order them within the tree. Only items nested 
						underneath 'Uber' will be displayed on the portal UI. Items nested under 
						'Orphans' will still exist in the portal database but will not be shown
						through the UI. Right click an item for additional available actions. Changes
						made to the tree will not be applied unless you click the 'Save' button. If
						the page is refreshed without 'Save' being clicked changes made will be lost."
					</p>
				</div>
			</div>
			<div class="row">
				<div class="col-md-6">
					<i class="fa fa-search"></i><input type="text" id="search-input" /><button id="clear-search" class="btn">Clear Search</button>		
				</div>

				<div id="save-button-container" class="col-md-6">
					<button type="button" id="save-button" class="btn btn-default btn-success pull-right"><i class="fa fa-floppy-o"></i> Save</button>
				</div>
			</div>

			<div id="tree-container" class="col-md-12 well"></div>

		</div>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/<%=vJquery%>/jquery<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jstree/<%=vJsTree%>/jstree<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/jquery-ui/<%=vJqueryUI%>/ui<%= development ? "" : "/minified"%>/jquery-ui<%= development ? "" : ".min"%>.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/webjars/sugar/<%=vSugarJs%>/sugar-full<%= development ? ".development" : ".min"%>.js"></script>

		<script type="text/javascript">
			window.CCH = Object.extended();
			CCH.config = {
				'id': '${it.id}' || 'uber',
				'baseUrl': '<%=baseUrl%>',
				'relPath' : '<%=relPath%>',
				'referer' : '<%=referer%>'
			};
		</script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/util/Util.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/publish/tree/UI.js"></script>
		<script type="text/javascript" src="<%=baseUrl%>/js/cch/objects/publish/tree/OnReady.js"></script>
    </body>
</html>
