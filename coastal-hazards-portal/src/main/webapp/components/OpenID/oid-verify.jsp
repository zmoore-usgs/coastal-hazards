
<?xml version="1.0" encoding="UTF-8"?>
<%@page contentType="text/html; charset=UTF-8" import="java.util.Map" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>Verified</title>
		<meta http-equiv="Content-Type" content="application/xhtml+xml; charset=UTF-8" />
	</head>
	<body>
		<script type="text/javascript" src="<%= request.getContextPath()%>/webjars/jquery/2.0.0/jquery.min.js"></script>
		<script>
			$(document).ready(function() {
				var returnAttributes = {};
			<c:forEach items="${attributes}" var="attribute">
				returnAttributes['${attribute.key}'] = '${attribute.value}';
			</c:forEach>
					$.get('<%= request.getContextPath()%>/app/session/oid', function(data) {
						data = data || {};
						if (data.email) {
							
						} else {
							
						}
						var loginListItem = $('#login-list-item');
						var country = '',
								email = '',
								firstname = '',
								lastname = '',
								language = '';

						var createLoginLink = function() {
							loginListItem.empty();
							loginListItem.append($('<div />').attr({
								'id': 'session-login-link'
							}).html('<img id="sign-in-img" src="images/OpenID/White-signin_Medium_base_44dp.png"></img>'));

							$('#session-login-link').on('click', function() {
								if (CONFIG.window.login) {
									CONFIG.window.login.close();
								}
								CONFIG.window.login = window.open('components/OpenID/oid-login.jsp', 'login', 'width=1000,height=550,fullscreen=no', true);
							});

							$('#sign-in-img').on({
								'mouseenter': function() {
									$(this).attr('src', 'images/OpenID/White-signin_Medium_hover_44dp.png');
								},
								'mouseleave': function() {
									$(this).attr('src', 'images/OpenID/White-signin_Medium_base_44dp.png');
								},
								'mousedown': function() {
									$(this).attr('src', 'images/OpenID/White-signin_Medium_press_44dp.png');
								},
								'mouseup': function() {
									$(this).attr('src', 'images/OpenID/White-signin_Medium_base_44dp.png');
								}
							});
						};

						var createLoggedInMenu = function() {
							loginListItem.empty();
							var dropdownItem = $('<a />').addClass('dropdown-toggle').attr({
								'data-toggle': 'dropdown',
								'role': 'button',
								'href': '#',
								'id': 'login-menu-dropdown'
							}).html(firstname + ' ' + lastname + ' (' + email + ')')
									.append($('<b />').addClass('caret'));
							loginListItem.addClass('dropdown').append(dropdownItem);

							// CREATE the log out link 
							var logoutMenuItem = $('<ul />').addClass('dropdown-menu').attr('aria-labelledby', 'login-menu-dropdown');
							var listItem = $('<li />').attr('role', 'presentation');
							var logoutLink = $('<a />').attr({
								'id': 'login-menu-item-logout',
								'tabindex': '-1',
								'role': 'menuitem'
							}).html('Log Out');
							loginListItem.append(logoutMenuItem.append(listItem.append(logoutLink)));

							// IF it is a USGS address
							if (email.toLowerCase().endsWith('usgs.gov')) {
								// APPEND the publish menu item to the menu
								var publishListItem = $('<li />').attr('role', 'presentation');
								var publishLink = $('<a />').attr({
									'id': 'session-menu-item-publish',
									'tabindex': '-1',
									'role': 'menuitem'
								}).html('Publish');
								$('#session-drop-down-list').append(publishListItem.append(publishLink));
								publishLink.on('click', function() {
									CONFIG.ui.createMetadataUploadForm();
								});
							}

							// BIND the log out menu item
							logoutLink.on('click', function() {
								$.get('service/session?action=logout', function() {
									createLoginLink();
									$('#session-menu-item-publish').detach();
								});
							});
						};

						if (loggedIn === 'true') {
							country = data.country;
							email = data.email;
							firstname = data.firstname;
							lastname = data.lastname;
							language = data.language;
							createLoggedInMenu();
						} else {
							createLoginLink();
						}
					});
				})
		</script>
	</body>
</html>