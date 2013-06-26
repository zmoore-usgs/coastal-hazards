# wps.des: id=SummaryGenerator, title=Parse metadata into summary for Coastal Change Hazards, abstract=Generates tiny medium and full summaries;
# wps.in: input, xml, FGDC xml metadata, uploaded metadata for building the summaries;
# wps.in: attr, string, attribute, attribute for which to create the summaries;

# find theme

library(itemSummaryService)

item.summary = function(input,attr){

themeNames	<-	names(subTypeMap)
theme	<-	NULL
for (i in 1:length(themeNames)){
	if (any(attr %in% unlist(subTypeMap[i]))){
		theme	<- names(subTypeMap[i])
		break
	}
}
if (is.null(theme)){stop(paste(c(attr,'not supported by this service'),collapse=' '))}

# should overload 'summary.service' to take a storm, historical, and vulnerability object?
if (theme=='historical'){
	summary	<-	historical.service(input,attr)
} else if (theme=='vulnerability'){
	summary	<-	vulnerability.service(input,attr)
} else if (theme=='storm'){
	summary	<-	storm.service(input,attr)
}

sink('output.json')
cat(summary)
sink()

output 	<-	'output.json'
}
# wps.out: output, text, output title, JSON object for item summary;