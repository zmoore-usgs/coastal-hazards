<%@page contentType="text/html" pageEncoding="UTF-8"%>
<%-- We do not support Internet Explorer at versions below 9 --%>
<script type="text/javascript">
	(function () {
		if (navigator.appName === 'Microsoft Internet Explorer') {
			var ua = navigator.userAgent;
			if (ua.toLowerCase().indexOf('msie 6') !== -1 || ua.toLowerCase().indexOf('msie 7') !== -1 || ua.toLowerCase().indexOf('msie 8') !== -1) {
				alert("We apologize, but this application does not support Internet Explorer versions lower than 9.0.\n\nOther supported browsers are Firefox, Chrome and Safari.");
				window.open('http://windows.microsoft.com/en-us/internet-explorer/download-ie');
			}
		}
	})();
</script>