supportSubTypes <- c('PCOL1','PCOL2','PCOL3','PCOL4','PCOL5',
	'POVW1','POVW2','POVW3','POVW4','POVW5',
	'PIND1','PIND2','PIND3','PIND4','PIND5') # more to come...etc...

typeDef <- list('POVW'='Overwash occurs when sand is transported landward over the beach and dune by waves and surge',
	'PIND'='Inundation occurs when the beach and dune are completely and continuously submerged by surge and wave setup',
	'PCOL'='Collision occurs when the dune toe is eroded by waves and surge')
	
synDataSrc <- list('lidar'=c('lidar','EAARL Topography'),
	'aerial photographs'=c('air photos','aerial photographs'),
	'NOAA SLOSH model'=c('SLOSH','Storm Surge Maximum of the Maximum'),
	'SWAN model'=c('Simulating WAves Nearshore','SWAN'),
	'coastal survey maps'=c('T-sheets','coastal survey maps'))
	
