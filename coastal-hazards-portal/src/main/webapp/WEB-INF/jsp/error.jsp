<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
	boolean development = Boolean.parseBoolean(props.getProperty("development"));

%>
<%
	String baseUrl = StringUtils.isNotBlank(props.getProperty("coastal-hazards.base.url")) ? props.getProperty("coastal-hazards.base.url") : request.getContextPath();
%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <META HTTP-EQUIV="CACHE-CONTROL" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="PRAGMA" CONTENT="NO-CACHE" />
        <META HTTP-EQUIV="EXPIRES" CONTENT="0" />
        <META HTTP-EQUIV="CONTENT-LANGUAGE" CONTENT="en-US" />
        <META HTTP-EQUIV="CONTENT-TYPE" CONTENT="text/html; charset=UTF-8" />
        <META NAME="viewport" CONTENT="width=device-width, minimum-scale=1, maximum-scale=1" />
		<meta NAME="apple-mobile-web-app-capable" CONTENT="yes" /> 
        <link rel="shortcut icon" href="<%=baseUrl%>/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="<%=baseUrl%>/favicon.ico" type="image/x-icon" />
        <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
        <!--[if lt IE 9]>
        <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <script type="text/javascript" src="<%=baseUrl%>/webjars/jquery/2.0.0/jquery.min.js"></script>
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/2.3.1/css/bootstrap.min.css" />
        <link type="text/css" rel="stylesheet" href="<%=baseUrl%>/webjars/bootstrap/2.3.1/css/bootstrap-responsive.min.css" />
        <script type="text/javascript" src="<%=baseUrl%>/webjars/bootstrap/2.3.1/js/bootstrap.min.js"></script>
		<script type="text/javascript">
			var errorCode = <%=request.getAttribute("javax.servlet.error.status_code")%>;
			var errorPath = '<%=request.getAttribute("javax.servlet.error.request_uri")%>';
		</script>
		<style type="text/css">
			body {
				min-width: 320px;
			}
			.container-fluid {
				margin-top: 10px;
			}

			#error-title-error-row {
				margin-bottom: 10px;
			}

			#error-code-container {
				font-size : 120px;
				line-height: 120px;
				font-family:"Times New Roman", Times, serif;
				font-style: italic;
				font-weight: bold;
				border-style: dashed;
				text-align: center;
				border-radius: 10px;
				-moz-border-radius: 10px;
				-webkit-border-radius: 10px;
				border-color: #999999;
			}
			#error-title-container {
				font-size : 60px;
				line-height: 60px;
				text-align: right;
			}

			#error-title-error-description-container {
				font-size: 40px;
				line-height: 40px;
			}

			#error-title-error-description {
				margin-top: 50px;
			}

			#error-title-error-path {
				text-decoration: underline;
			}
		</style>
    </head>

    <body>
		<div class="container-fluid">
			<div id="error-title-error-row" class="row-fluid">
				<div id="error-code-container" class="span2"></div>
				<div id="error-title-container" class="span10">USGS Coastal Change Hazards Portal</div>
			</div>

			<div class="row-fluid">
				<div id="error-title-error-description-container" class="well well-large">
					<div id="error-title-error-path" class="row-fluid"></div>
					<div id="error-title-error-description" class="row-fluid"></div>
				</div>
			</div>

			<div class="row-fluid">
				<div class="well well-large">
					<a id="error-button-email" class="btn btn-large" role="button"><i class="icon-envelope"></i> Contact Us</a>
					<a class="btn btn-large" role="button" href="<%=baseUrl%>"><i class="icon-refresh"></i> Go To Portal</a>
				</div>
			</div>
		</div>
		<script type="text/javascript">
			$(document).ready(function() {
				$('#error-code-container').html(errorCode);
				$('#error-title-error-path').html(errorPath);
				var description;
				var contact = {
					subject: '',
					content: ''
				};
				switch (errorCode) {
					case 404 :
						{
							description = 'Unfortunately the page that you\'re searching for could not be found.';
							contact.subject = 'Error 404: ' + errorPath;
							contact.content = 'The application could not fine the path at ' + errorPath;
						}
				}

				var emailAttributes = '';
				emailAttributes += contact.subject ? 'Subject=' + contact.subject : '';
				emailAttributes += contact.content ? '&Body=' + contact.content : '';
				$('#error-button-email').attr('href', 'mailto:CCH_Help@usgs.gov?' + emailAttributes);
				
				$('#error-title-error-description').html(description);
			});
		</script>

    </body>
</html>
