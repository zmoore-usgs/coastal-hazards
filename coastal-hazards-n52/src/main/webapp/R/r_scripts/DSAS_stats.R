# wps.des: id=DSAS_stats, title=Digital Shoreline Analysis System Stats, abstract=stats available - LRR LCI WLR WCI SCE NSM EPR;
# wps.in: input, xml, block intersection text, text input from intersections layer with time elements and uncertainty;
# wps.in: ci, double, confidence interval, percentage for confidence level > 0.5 and < 1.0;
# input is unique identifier for WPS, is a variable in R (will contain all parser text)
# xml is for WPS side of things, tells WPS how input should be formatted

localRun <- TRUE
# comment this out for WPS!!!
if (localRun){
  ci <- 0.95
  input <- "testOut.tsv"
  ptm <- proc.time() # for time of process
}

numCores <- 8
library(foreach)
library(doMC)
registerDoMC(numCores)

if (ci>=1 || ci<=0.5){
  stop("confidence interval argument must be between 0.5 and 1.0 (non-inclusive)")
}

fileN    <- input # will have input as a string (long string read in)
conLevel <- ci
zRepV    <- 0.01 #replace value for when the uncertainty is zero
rateConv <- 365.25
delim    <- "\t"

hNum <- 1 # number of header lines in each block ** should be 1 now **
c <- file(fileN,"r") #

t_i = 1 # time index
d_i = 2 # distance index
u_i = 3 # uncertainty index

fileLines <- readLines(c)
close(c)
nRead <- length(fileLines)
#-#-# nRead <- nlines(c)  # from parser package. Count lines in C++

# get block starts and block names
blockI <- grep("# ", fileLines)
blckNm <- sub("# ","",fileLines[blockI])
numBlck<- length(blockI)

getDSAS <- function(blockNumber){   # get indices for start and end of block
  if (blockNumber==numBlck) {enI <- nRead-1}
  else{enI <- blockI[blockNumber+1]-1}
  stI <- blockI[blockNumber]+1
  splitsTxt <- unlist(strsplit(paste(fileLines[stI:enI],collapse=delim),delim))
  dates <- as.Date(splitsTxt[seq(t_i,length(splitsTxt),3)],format="%Y-%m-%d")
  dist  <- as(splitsTxt[seq(d_i,length(splitsTxt),3)],"numeric")
  uncy <- max(c(as(splitsTxt[seq(d_i,length(splitsTxt),3)],"numeric"),zRepV))
  useI  <- which(!is.na(dates)) & which(!is.na(dist)) & which(!is.na(uncy))
  dates <- dates[useI]
  dist  <- dist[useI]
  uncy  <- uncy[useI]
  
  if (length(dates) < 2) {
    LRR_rates <- NA
    LCI       <- NA
    WLR_rates <- NA
    WCI       <- NA
    SCE_dist  <- NA
    NSM_dist  <- NA
    EPR_dates <- NA
  }
  else{
    rate <- dates
    mdl  <- lm(formula=dist~rate)
    coef <- coefficients(mdl)
    CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
    rate <- coef["rate"]  # is m/day
    
    LRR_rates <- rate*rateConv 
    LCI <- (CI[2]-CI[1])/2 # LCI
    
    rate <- dates
    mdl  <- lm(formula=dist~rate, weights=(1/(uncy^2)))
    coef <- coefficients(mdl)
    CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
    rate <- coef["rate"]
    WLR_rates <- rate*rateConv 
    WCI  <- (CI[2]-CI[1])/2 # WCI
    
    SCE_dist <- max(dist)-min(dist)
    
    firstDateIdx <- which.min(dates)
    lastDateIdx  <- which.max(dates)
    NSM_dist <- dist[firstDateIdx]-dist[lastDateIdx]
    dateDiff <- dates[lastDateIdx]-dates[firstDateIdx]
    EPR_rates <- NSM_dist/(as(dates[lastDateIdx]-dates[firstDateIdx],"numeric"))*rateConv
    
  }
  return(data.frame("LRR"=LRR_rates,
                    "LCI"=LCI,
                    "WLR"=WLR_rates,
                    "WCI"=WCI,
                    "SCE"=SCE_dist,
                    "NSM"=NSM_dist,
                    "EPR"=EPR_rates))
}

listVals <- foreach(b=1:numBlck,.combine='rbind') %dopar% {
  getDSAS(b)
}

statsout <-data.frame(blckNm,listVals)
colnames(statsout)<-c('transect_ID','LRR','LCI','WLR','WCI','SCE','NSM','EPR')

if (localRun) proc.time() - ptm

# output is an identifier and R variable (WPS identifier). The ouput is the name of the text file
# wps.out: output, text, output title, tabular output data to append to shapefile;
output = "output.txt"
write.table(statsout,file="output.txt",col.names=TRUE, quote=FALSE, row.names=FALSE, sep="\t")
