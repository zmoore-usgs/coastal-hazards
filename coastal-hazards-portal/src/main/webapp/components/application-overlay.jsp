<style type="text/css">
	#application-overlay {
		height : 100%;
		width : 100%;
		position : fixed;
		top : 0;left : 0;
		background-color: #FFFFFF;
		background-image: url("images/splash/splash.svg");
		background-attachment: fixed;
		background-position: center center;
		background-repeat: no-repeat;
		z-index: 9999;
	}

	#application-overlay-content {
		height: auto;
		position: relative;
		top: 15%;
		width: 90%;
		color: #000000;
		margin-left: 5%;
		font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
		font-size: 14px;
		line-height: 20px;
		text-align: center;
		background-color: rgba(255, 255, 255, 0.5);
		border-style: solid;
		border-color: #EBEBEB;
		border-width: 2px;
		border-radius: 5px;
		-moz-border-radius: 5px;
		-webkit-border-radius: 5px;

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

	#application-overlay-description-container {
		width: 100%;
		margin-top: 10px;
		font-size: 1.3em;
		line: 1.3em;
	}

	#application-overlay-description {
		width: 90%;
		padding-left: 5%;
		text-align: left;
	}
	
	#splash-status-update {
		font-size: 1.4em;
		font-weight: bold;
	}
</style>

<div id="application-overlay">
    <div id="application-overlay-content">
        <div id="application-overlay-title">
			USGS Coastal Change Hazards Portal
		</div>
		<div id="application-overlay-description-container">
			<p id="application-overlay-description">Maecenas eu placerat ante. Fusce ut neque justo, et aliquet enim. In hac habitasse platea dictumst. <br />
				Nullam commodo neque erat, vitae facilisis erat. Cras at mauris ut tortor vestibulum fringilla vel sed metus. Donec interdum purus a justo feugiat rutrum. <br />
				Sed ac neque ut neque dictum accumsan. Cras lacinia rutrum risus, id viverra metus dictum sit amet. </p>
		</div>

        <div>
            <div id="splash-status-update"></div>
            <img id="splash-spinner" src="images/spinner/spinner3.gif" />
        </div>
    </div>
</div>
<script type="text/javascript">
	var splashUpdate = function(message) {
		document.getElementById('splash-status-update').innerHTML = message;
	};
	splashUpdate("Loading application...");
</script>