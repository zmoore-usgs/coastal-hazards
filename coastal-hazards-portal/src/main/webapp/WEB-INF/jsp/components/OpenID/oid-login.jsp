<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%!	protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();

	{
		try {
			props = props.addJNDIContexts(new String[0]);
		} catch (Exception e) {
			System.out.println("Could not find JNDI - Application will probably not function correctly");
		}
	}
%>
<%
	String baseUrl = StringUtils.isNotBlank(request.getContextPath()) ? request.getContextPath() : props.getProperty("coastal-hazards.base.url");
%>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Google OpenID Login</title>
	</head>
	<body>
		<div id="form-div" style="display:none">
			<form id="form" action="<%=baseUrl%>/login" method="post">
				<input type="text" name="openid_identifier" value="https://www.google.com/accounts/o8/id" />
				<input type="text" name="alias" value="email" />
				<input type="text" name="typeUri" value="http://axschema.org/contact/email" />
				<input type="checkbox" name="required0" id="required0" checked="checked" />
				<input type="text" name="count" value="1" />
				<input type="text" name="alias" value="country" />
				<input type="text" name="typeUri" value="http://axschema.org/contact/country/home" />
				<input type="checkbox" name="required1" id="required1" checked="checked" />
				<input type="text" name="count" value="1" />
				<input type="text" name="alias" value="firstname" />
				<input type="text" name="typeUri" value="http://axschema.org/namePerson/first" />
				<input type="checkbox" name="required2" id="required2" checked="checked" />
				<input type="text" name="count" value="1" />
				<input type="text" name="alias" value="lastname" />
				<input type="text" name="typeUri" value="http://axschema.org/namePerson/last" />
				<input type="checkbox" name="required3" id="required3" checked="checked" />
				<input type="text" name="count" value="1" />
				<input type="text" name="alias" value="language" />
				<input type="text" name="typeUri" value="http://axschema.org/pref/language" />
				<input type="checkbox" name="required4" id="required4" checked="checked" />
				<input type="text" name="count" value="1" />
				<button type="submit" name="login"></button>
			</form>
		</div>
		<script>
			function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}
			r(function() {
				document.forms['form'].submit();
			})
		</script>
	</body>
</html>