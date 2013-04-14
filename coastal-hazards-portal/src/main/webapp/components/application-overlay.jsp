<div id="application-overlay" style="height : 100%;width : 100%;position : fixed;top : 0;left : 0;background-color: #FFFFFF;z-index: 9999;">
    <div id="application-overlay-content" style='height: 50%;padding-left: 25%;position: relative;top: 15%;width: 50%;color: #333333;font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;font-size: 14px;line-height: 20px;'>
        <div style="text-align: center">
			<h1 style="letter-spacing: 0.5em;font-size: 38.5px; line-height: 40px;color: inherit; font-family: inherit; font-weight: bold;text-rendering: optimizelegibility;">
				USGS Coastal Hazards Portal
			</h1>
		</div>
        <div style="width: 100%;max-width: none;border: 0 none;height: auto;vertical-align: middle;">
            <img id="application-overlay-banner" src="images/splash/splash.png" style="width:75%" />
        </div>
        <!-- start slipsum code -->

<p>Maecenas eu placerat ante. Fusce ut neque justo, et aliquet enim. In hac habitasse platea dictumst. <br />
	Nullam commodo neque erat, vitae facilisis erat. Cras at mauris ut tortor vestibulum fringilla vel sed metus. Donec interdum purus a justo feugiat rutrum. <br />
	Sed ac neque ut neque dictum accumsan. Cras lacinia rutrum risus, id viverra metus dictum sit amet. </p>

<p>Integer elementum massa at nulla placerat varius. Suspendisse in libero risus, in interdum massa. <br />
	Vestibulum ac leo vitae metus faucibus gravida ac in neque. Nullam est eros, suscipit sed dictum quis, accumsan a ligula. In sit amet justo lectus. <br />
	Etiam feugiat dolor ac elit suscipit in elementum orci fringilla. Aliquam in felis eros. Praesent hendrerit lectus sit amet turpis tempus hendrerit.</p>

<p>Maecenas eu placerat ante. Fusce ut neque justo, et aliquet enim. In hac habitasse platea dictumst. <br />
	Nullam commodo neque erat, vitae facilisis erat. Cras at mauris ut tortor vestibulum fringilla vel sed metus. Donec interdum purus a justo feugiat rutrum. <br />
	Sed ac neque ut neque dictum accumsan. Cras lacinia rutrum risus, id viverra metus dictum sit amet. Fusce venenatis, urna eget cursus placerat, dui nisl fringilla purus.</p>

        <div style="text-align:center;">
            <div id="splash-status-update"></div>
            <img src="images/spinner/spinner3.gif" />
        </div>
    </div>
</div>
<script type="text/javascript">
    var splashUpdate = function(message) {
        $('#splash-status-update').html(message);
    };
    splashUpdate("Loading application...");
</script>