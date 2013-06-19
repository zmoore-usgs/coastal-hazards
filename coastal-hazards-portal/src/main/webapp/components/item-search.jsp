<div id='item-search-modal' class='modal fade' tabindex="-1" role="dialog" aria-labelledby="item-search-modal-label" aria-hidden="true">
	<div class="modal-header">
		<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
		<h3 id='item-search-modal-label'>Items Search</h3>
	</div>
	<div id='item-search-modal-body' class='modal-body'>
		<div id='item-search-container' class='container-fluid'>

			<div id='item-search-row-map row-fluid'>
				<label for="item-search-map">Search by extent:</label>
				<div id='item-search-map'></div>
			</div>
			<div id='item-search-input-table-row' class='row-fluid'>
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
			<div id='item-search-row-keyword row-fluid'>
				<label for='item-search-keyword-input-label'>Search by keywords (comma separated): </label>
				<input type="text" id="item-search-keyword-input" />
			</div>
			<div id='item-search-row-theme row-fluid'>
				<label for='item-search-theme-input'>Search by theme: </label>
				<select id='item-search-theme-input' multiple="multiple">
					<option value=""></option>
					<option value="historical">Historical</option>
					<option value="storms">Storms</option>
					<option value="vulnerability">Vulnerability</option>
				</select>
			</div>

			<div id='item-search-row-popularity row-fluid'>
				<label for='item-search-popularity-input'>Search by popularity (0 to <span id='item-search-popularity-input' style="border: 0; font-weight: bold;"></span>):</label>
				
				<div id="slider-popularity-range"></div>
			</div>
		</div>
	</div>
	<div class="modal-footer">
		<button class="btn btn-primary" id='item-search-submit'>Search</button>
		<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
	</div>
</div>