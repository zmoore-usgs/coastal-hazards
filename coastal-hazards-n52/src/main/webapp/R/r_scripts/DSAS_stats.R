# wps.des: id=DSAS_stats, title=Digital Shoreline Analysis System Stats, abstract=stats available - LRR LCI WLR WCI SCE NSM EPR;
# wps.in: input, xml, block intersection text, text input from intersections layer with time elements and uncertainty;

# input is unique identifier for WPS, is a variable in R (will contain all parser text)
# xml is for WPS side of things, tells WPS how input should be formatted

localRun <- FALSE
# comment this out for WPS!!!
if (localRun){
  input <- "testOut.tsv"
  ptm <- proc.time() # for time of process
}

fileN    <- input # will have input as a string (long string read in)
reader   <- c("character","numeric","numeric")
conLevel <- 0.95
zRepV    <- 0.01 #replace value for when the uncertainty is zero
rateConv <- 365.25
delim    <- "\t"

hNum <- 1 # number of header lines in each block ** should be 1 now **
ignoreStr <- c("dist","uncy") # kill for JW....
c <- file(fileN,"r") #

t_i = 1 # time index
d_i = 2 # distance index
u_i = 3 # uncertainty index

nRead <- length(readLines(c))

# get block starts
blockI <- vector(length=nRead)
blckNm <- vector(length=nRead)

datesV     <- seq( as.Date("1600-01-01"), by=1, len=nRead)
distancesV <- vector(length=nRead)
uncyV      <- vector(length=nRead)


seek(con=c,where=0)
for (p in 1:nRead){
    r1 <- readLines(c,n=1) # read in all of file, line by line raw
    if (substring(r1,1,1) == '#') {
        blockI[p] = p
        blckNm[p] = substring(r1,3,)
    }
    else {
      # break up the string
      splitsTxt <- strsplit(r1,delim)
      sT <- splitsTxt[[1]]
      datesV[p] <- as.Date(sT[t_i],format="%Y-%m-%d")
      distancesV[p] <- as(sT[d_i],"numeric")
      uncyV[p] <- max(c(as(sT[u_i],"numeric"),zRepV))
    }
}

close(c)



# get block starts and number of blocks
rmvI <- (blockI==0)
blockI = blockI[!rmvI]
blckNm = blckNm[!rmvI]
numBlck= length(blockI)

LRR_rates   <- vector(length=numBlck)
LCI         <- vector(length=numBlck)
WLR_rates   <- vector(length=numBlck)
WCI			    <- vector(length=numBlck)
SCE_dist    <- vector(length=numBlck)
NSM_dist    <- vector(length=numBlck)
EPR_rates   <- vector(length=numBlck)

transect_ID <- blckNm

for (b in 1:numBlck){
    if (b==numBlck) enI <- nRead-1
    else enI <- blockI[b+1]-1
    stI <- blockI[b]+hNum
    
    #numLines = enI-stI+1
    # -- read in data according to data classes in reader
    #data <- read.table(fileN, sep=delim, header=FALSE, na.strings = ignoreStr, colClasses=reader,skip=stI-1)
    #data <-data[1:numLines,]
    #dates <- as.Date(data[,t_i],format="%Y-%m-%d")
    dates <- datesV[stI:enI]
    distance <- distancesV[stI:enI]
    uncy <- uncyV[stI:enI]
    useI  <- which(!is.na(dates)) & which(!is.na(distance)) & which(!is.na(uncy))
    
    dates <- dates[useI]

    if (length(dates) > 2){
        
      uncy <- uncy[useI]
      distance <- distance[useI]
      # call LRR
      rate <- dates
      mdl <- lm(formula=distance~rate)
      coef <- coefficients(mdl)
      CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
      rate <- coef["rate"]  # is m/day
        
      LRR_rates[b] <- rate*rateConv 
      LCI[b] <- (CI[2]-CI[1])/2 # LCI
        
      weights <- 1/(uncy^2)
      rate <- dates
      mdl <- lm(formula=distance~rate, weights=weights)
      coef <- coefficients(mdl)
      CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
      rate <- coef["rate"]
      WLR_rates[b] <- rate*rateConv 
      WCI[b] <- (CI[2]-CI[1])/2 # WCI
		
      SCE_dist[b] <- max(distance)-min(distance)
      firstDateIdx <- which.min(dates)
      lastDateIdx  <- which.max(dates)
		  NSM_dist[b] <- distance[firstDateIdx]-distance[lastDateIdx]
      dateDiff <- dates[lastDateIdx]-dates[firstDateIdx]
		  EPR_rates[b] <- NSM_dist[b]/(as(dates[lastDateIdx]-dates[firstDateIdx],"numeric"))*rateConv
    } 
}
statsout <-data.frame(transect_ID,LRR_rates,LCI,WLR_rates,WCI,SCE_dist,NSM_dist,EPR_rates)
colnames(statsout)<-c('transect_ID','LRR','LCI','WLR','WCI','SCE','NSM','EPR')

if (localRun) proc.time() - ptm

# output is an identifier and R variable (WPS identifier). The ouput is the name of the text file
# wps.out: output, text, output title, tabular output data to append to shapefile;
output = "output.txt"
write.table(statsout,file="output.txt",col.names=TRUE, quote=FALSE, row.names=FALSE, sep="\t")
