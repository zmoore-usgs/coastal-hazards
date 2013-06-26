
storm.service = function(serviceEndpoint,attribute){
	subType	<-	attribute
	supportSubTypes <- c('PCOL1','PCOL2','PCOL3','PCOL4','PCOL5',
	                     'POVW1','POVW2','POVW3','POVW4','POVW5',
	                     'PIND1','PIND2','PIND3','PIND4','PIND5') # more to come...etc...

	if (!any(grepl(subType,supportSubTypes))){
		stop(c(subType,' is not supported for this type'))
		}

	# type definitions:
	typeDef <- list('POVW'='Overwash occurs when sand is transported landward over the beach and dune by waves and surge',
	                'PIND'='Inundation occurs when the beach and dune are completely and continuously submerged by surge and wave setup',
	                'PCOL'='Collision occurs when the dune toe is eroded by waves and surge')

	# need additional synonyms------
	synDataSrc <- list('lidar'=c('lidar','EAARL Topography'),
	                   'aerial photographs'=c('air photos','aerial photographs'),
	                   'NOAA SLOSH model'=c('SLOSH','Storm Surge Maximum of the Maximum'),
	                   'SWAN model'=c('Simulating WAves Nearshore','SWAN'),
	                   'coastal survey maps'=c('T-sheets','coastal survey maps'))        
	subTypeDataSrc <- names(synDataSrc)

	doc <- xmlInternalTreeParse(serviceEndpoint)

	title <- xmlValue(getNodeSet(doc,'//citation/citeinfo/title')[[1]])

	dataSrc <-  sapply(getNodeSet(doc,'//dataqual/lineage/srcinfo/srccite/citeinfo/title'),xmlValue)
	sourceStr <-  paste(dataSrc,collapse='|')

	useI = vector(length = length(subTypeDataSrc))

	for (i in 1:length(synDataSrc)){
	  for (k in 1:length(synDataSrc[[i]])){
	    if (grepl(as.character(synDataSrc[[i]][k]),sourceStr)){
	      useI[i] = TRUE
	    }
	  }
	}

	baseType<- substring(subType,1,4)
	stormNum <- substring(subType,5)

	detail <- paste(c('These probabilities apply to a generic representation of a category',
	                  stormNum,'hurricane'),collapse=' ')
	definition  <- typeDef[baseType]
	firstLine <-  paste(c('This datasets includes an element of ', title),collapse='')
	dataSources <- paste(c('Data sources:',paste(c(subTypeDataSrc[useI]),collapse=', ')),collapse=' ')
	summary <- paste(c(firstLine,definition,detail,dataSources),collapse='. ')
	
	summaryJSON	<- toJSON(list('summary'=list(
		'tiny'=list('text'='xxx'),
		'medium'=list('title'='XXX','text'=summary),
		'full'=list('title'='XXX','text'='XXX','publications'='XXX'))), method="C" )
	return(summaryJSON)
}