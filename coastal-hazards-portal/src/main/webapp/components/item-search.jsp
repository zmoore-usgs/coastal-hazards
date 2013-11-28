<div id='item-search-modal' class='modal fade' tabindex="-1" role="dialog" aria-labelledby="item-search-modal-label" aria-hidden="true">
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3 id='item-search-modal-label'>Items Search</h3>
	</div>
	<div id='item-search-modal-body' class='modal-body'>
		<div id='item-search-container' class='container'>

			<div id='item-search-row-map' class="row">
				<label for="item-search-map">Search by extent:</label>
				<div id='item-search-map'></div>
			</div>
			<div id='item-search-input-table-row' class='row'>
				<center>
					<table id='item-search-input-table'>
						<tr>
							<td></td>
							<td class="pull-right">North:</td>
							<td><div id='item-search-map-input-north' class='item-search-row-map-input'></div></td>
							<td></td>
						</tr>
						<tr>
							<td>West:</td>
							<td><div id='item-search-map-input-west'  class='item-search-row-map-input'></div></td>
							<td class="pull-right">East:</td>
							<td><div id='item-search-map-input-east'  class='item-search-row-map-input'></div></td>
						</tr>
						<tr>
							<td></td>
							<td class="pull-right">South:</td>
							<td><div id='item-search-map-input-south'  class='item-search-row-map-input'></div></td>
							<td></td>
						</tr>
					</table>
				</center>
			</div>
			<div id='item-search-row-keyword' class="row">
				<label for='item-search-keyword-input-label'>Search by keywords (comma separated): </label>
				<input type="text" id="item-search-keyword-input" />
			</div>
			<div id='item-search-row-theme' class="row">
				<span id='item-search-theme' class='span6'>
					<label for='item-search-theme-input'>Search by theme: </label>
					<select id='item-search-theme-input' multiple="multiple">
						<option value="historical">Historical</option>
						<option value="storms">Storms</option>
						<option value="vulnerability">Vulnerability</option>
					</select>
				</span>
				<span id='item-search-row-popularity' class='span6'>
					<label id="popularity-sort-label" for='popularity-sort'>Sort by popularity?</label><input id="popularity-sort-checkbox" type="checkbox" checked="checked" name="popularity-sort"/>
				</span>
			</div>



		</div>
	</div>
	<div class="modal-footer">
		<button class="btn btn-primary" id='item-search-submit'>Search</button>
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>
</div>