<%-- Add google analytics --%>
<%@page import="gov.usgs.cida.config.DynamicReadOnlyProperties"%>
<%@page import="java.io.File"%>
<%! protected DynamicReadOnlyProperties props = new DynamicReadOnlyProperties();
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

boolean production = Boolean.parseBoolean(getProp("production"));
%>
<% if (production) { %>
	(function (i, s, o, g, r, a, m) {
		i['GoogleAnalyticsObject'] = r;
		i[r] = i[r] || function () {
			(i[r].q = i[r].q || []).push(arguments)
		}, i[r].l = 1 * new Date();
		a = s.createElement(o),
			m = s.getElementsByTagName(o)[0];
		a.async = 1;
		a.src = g;
		m.parentNode.insertBefore(a, m);
	})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
	ga('create', 'UA-46378632-1', 'usgs.gov');
	ga('set', 'anonymizeIp', true);
	ga('send', 'pageview');
<% }  else { %>
	ga = function() { /* no-op */ };
<% }%>