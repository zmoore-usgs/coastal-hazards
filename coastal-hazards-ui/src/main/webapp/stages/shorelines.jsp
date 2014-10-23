<!-- Shorelines -->
<div class="tab-pane container-fluid active" id="shorelines">
	<div class="row-fluid">
		<div class="span4"><h3>Shorelines</h3></div>
		<div class="span8" id="shorelines-alert-container"></div>
	</div>
	<ul class="nav nav-tabs" id="action-shorelines-tablist">
		<li class="active"><a  data-toggle="tab" href="#shorelines-view-tab">View</a></li>
		<li><a data-toggle="tab" href="#shorelines-manage-tab">Manage</a></li>
	</ul>
	<div class="tab-content">
		<div class="tab-pane active" id="shorelines-view-tab">
			<select id="shorelines-list" class="feature-list"></select>
			<div class="tabbable">
				<ul class="nav nav-tabs" id="shoreline-table-navtabs">
				</ul>
				<div class="tab-content" id="shoreline-table-tabcontent">
				</div>
			</div>
		</div>
		<div class="tab-pane" id="shorelines-manage-tab">
			<div id="shorelines-uploader" class="uploader"></div>
			<button class="btn btn-success" id="shorelines-triggerbutton"><i class="icon-arrow-up icon-white"></i>Upload</button>
			<button class="btn btn-success" disabled id="shorelines-downloadbutton"><i class="icon-arrow-down icon-white"></i>Download</button>
			<button id="shorelines-remove-btn" disabled class="btn btn-success">
				<i class="icon-remove icon-white"></i>
				&nbsp;Remove
			</button>
		</div>
	</div>
</div> <!-- /Shorelines -->