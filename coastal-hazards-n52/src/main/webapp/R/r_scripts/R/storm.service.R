
storm.service = function(WFSendpoint,attName){
	subType	<-	attName
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

	doc <- xmlInternalTreeParse('http://olga.er.usgs.gov/data/NACCH/SE_erosion_hazards_metadata.xml')

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

	return(summary)
}

#'historicalService
#'
#'a \code{itemSummaryService} function for ...
#'
#'@param junk
#'@param junk2
#'@return summary
#'@export
#'@docType functions
#'@rdname historicalService
#'@keywords historicalService
historicalService = function(WFSendpoint,attName){
	subType <- attName
	rootDir<- '/Users/jread/Documents/R/coastal-hazards/coastal-hazards-wps/target/test-classes/gov/usgs/cida/coastalhazards/jersey/'

	supportSubTypes <- c('Shorelines','Linear Regression Rate') # more to come...


	if (!any(grepl(subType,supportSubTypes))){stop(c(subType,' is not supported for this type'))}

	# need additional synonyms------
	synDataSrc <- list('lidar'=c('lidar','EAARL Topography'),
	                   'aerial photographs'=c('air photos','aerial photographs'),
	                   'NOAA SLOSH model'=c('SLOSH','Storm Surge Maximum of the Maximum'),
	                   'SWAN model'=c('Simulating WAves Nearshore','SWAN'),
	                   'coastal survey maps'=c('T-sheets','coastal survey maps'))        
	subTypeDataSrc <- names(synDataSrc)

	doc <- xmlInternalTreeParse(paste(c(rootDir,'NewJerseyN_shorelines.shp.xml'),collapse=''))

	purpose <- strsplit(xmlValue(getNodeSet(doc,'//descript/purpose')[[1]]),'.  ') # purpose in text form

	# FIND data sources, match to dictionary layperson terms
	useI = vector(length = length(subTypeDataSrc))
	for (i in 1:length(synDataSrc)){
	  for (k in 1:length(synDataSrc[[i]])){
	    if (grepl(as.character(synDataSrc[[i]][k]),purpose[[1]][2])){
	      useI[i] = TRUE
	    }
	  }
	}

	detail <- NULL
	if (subType!='Shorelines'){ # additional line and details needed
	  # get process source (could be DSASweb in the future) and version***
	  for (j in 1:length(purpose[[1]])){
	    if (grepl("(DSAS)",purpose[[1]][j])){
	      print(purpose[[1]][j])
	      stI <- regexpr('version ',purpose[[1]][j])[1]
	      detail<- paste(c(subType,' is a shoreline change metric calculated using the ',
	        'Digital Shoreline Analysis System v',substring(purpose[[1]][j],stI+nchar('version '))),
	                     collapse='')
	      break
	    }
	  }
	}


	dataSources <- paste(c('Data sources:',paste(c(subTypeDataSrc[useI]),collapse=', ')),collapse=' ')
	summary <- paste(c(purpose[[1]][1],detail,dataSources),collapse='. ')
}

#' @export
# '@docType functions
# '@rdname vulnerabilityService
# '@keywords vulnerabilityService
vulnerabilityService = function(WFSendpoint,attName){
	summary	<-	NULL
	return(summary)
}