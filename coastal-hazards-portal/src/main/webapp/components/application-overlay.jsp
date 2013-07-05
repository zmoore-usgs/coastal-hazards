<style type="text/css">
	#application-overlay {
		height : 100%;
		width : 100%;
		position : fixed;
		top : 0;left : 0;
		background-color: #FFFFFF;
		z-index: 9999;
		
	}
	
	#application-overlay-content {
		height: 50%;
		padding-left: 25%;
		position: relative;
		top: 15%;
		width: 50%;
		color: #999999;
		font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
		font-size: 14px;
		line-height: 20px;
		text-align: center;
	}
	
	#application-overlay-title {
		text-align: center;
		font-size: 3.25em; 
		line-height: 1em;
		color: inherit; 
		font-family: inherit; 
		font-weight: bold;
		text-rendering: optimizelegibility;
		font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
	}
	
	#application-overlay-banner {
		margin-top: 5px;
		border: 0 none;
		vertical-align: middle;
	}
	
	#application-overlay-banner img {
		width: 30%;
	}
	
	#application-overlay-description-container {
		width: 100%;
	}
	
	#application-overlay-description {
		width: 50%;
		padding-left: 25%;
		text-align: left;
	}
</style>

<div id="application-overlay">
    <div id="application-overlay-content">
        <div id="application-overlay-title">
			USGS Coastal Change Hazards Portal
		</div>
        <div id="application-overlay-banner">
            <img src="images/splash/splash.svg" />
        </div>
        <!-- start slipsum code -->
		<div id="application-overlay-description-container">
			<p id="application-overlay-description">Maecenas eu placerat ante. Fusce ut neque justo, et aliquet enim. In hac habitasse platea dictumst. <br />
			Nullam commodo neque erat, vitae facilisis erat. Cras at mauris ut tortor vestibulum fringilla vel sed metus. Donec interdum purus a justo feugiat rutrum. <br />
			Sed ac neque ut neque dictum accumsan. Cras lacinia rutrum risus, id viverra metus dictum sit amet. </p>
		</div>
		
        <div style="text-align:center;">
            <div id="splash-status-update"></div>
            <img id="splash-spinner" src="images/spinner/spinner3.gif" />
        </div>
    </div>
</div>
<script type="text/javascript">
	var splashUpdate = function(message) {
		$('#splash-status-update').html(message);
	};
	splashUpdate("Loading application...");
</script>