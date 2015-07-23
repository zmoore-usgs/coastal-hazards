<%-- This is used on the back of the card to provide JSON-LD microdata to search engines --%>
<script type="application/ld+json">
			{
			"@context": "http://schema.org",
			"@type": "Dataset",
			"name": "<%= item.getSummary().getMedium().getTitle()%>",
			"alternateName": "<%= item.getSummary().getTiny().getText()%>",
			"url": "<%= baseUrl + "/ui/info/item/" + item.getId()%>",
			"image": "<%= baseUrl + "/data/thumbnail/item/" + item.getId()%>",
			"about": "<%= item.getSummary().getMedium().getText().replaceAll("\"", "'") %>",
			"author": {
				"@context": "http://schema.org",
				"@type": "Organization",
				"legalName" : "United States Geological Survey"
			},
			"creator" : {
				"@context": "http://schema.org",
				"@type": "Organization",
				"legalName" : "United States Geological Survey"
			},
			"publisher" : {
				"@context": "http://schema.org",
				"@type": "Organization",
				"legalName" : "United States Geological Survey"
			},
			"dateModified" : "<%= DateFormatUtils.ISO_DATE_FORMAT.format(item.getLastModified()) %>",
			"distribution": {
				"contentUrl" : "<%= baseUrl + "/data/download/item/" + item.getId()%>",
				"encodingFormat": "zip"
			},
			"mainEntityOfPage": {
			"@type": "WebPage",
					"@id": "<%= baseUrl%>"
			},
			"description": "<%= item.getSummary().getFull().getText().replaceAll("\"", "'")%>",
			<%-- Some items do not have a bounding box, so do the check here --%>
			<% if (item.getBbox() != null) { %>
			"spatial" : {
				"@context": "http://schema.org",
				"@type": "Place",
				"geo": {
					"@type": "GeoShape",
					"box" : "<%= item.getBbox().makeEnvelope().getMinX() + " " + item.getBbox().makeEnvelope().getMinY() + " " + item.getBbox().makeEnvelope().getMaxX() + " " + item.getBbox().makeEnvelope().getMaxY()%>"
				}
			},
			"contentLocation" : {
				"@context": "http://schema.org",
				"@type": "Place",
				"geo": {
					"@type": "GeoShape",
					"box" : "<%= item.getBbox().makeEnvelope().getMinX() + " " + item.getBbox().makeEnvelope().getMinY() + " " + item.getBbox().makeEnvelope().getMaxX() + " " + item.getBbox().makeEnvelope().getMaxY()%>"
				}
			},
			<% } %>
		
			"keywords" : "<%= item.getSummary().getKeywords().replaceAll("\\|", ", ")%>"
		}
		</script>