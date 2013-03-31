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
reader   <- c("character","numeric","numeric")
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


#proc.time() - ptm
getDSAS <- function(blockNumber){   # get indices for start and end of block
  if (b==numBlck) enI <- nRead-1
  else enI <- blockI[b+1]-1
  stI <- blockI[b]+1
  dates <- vector(length=length(sTeD[1]:sTeD[2]))
  dist  <- vector(length=length(sTeD[1]:sTeD[2]))
  uncy  <- vector(length=length(sTeD[1]:sTeD[2]))
  for (i in sTeD[1]:sTeD[2]){
    splitsTxt <- strsplit(fileLines[i],delim)
    sT <- splitsTxt[[1]]
    dates[i-sTeD[1]+1] <- as.Date(sT[t_i],format="%Y-%m-%d")
    dist[i-sTeD[1]+1] <- as(sT[d_i],"numeric")
    uncy[i-sTeD[1]+1] <- max(c(as(sT[u_i],"numeric"),zRepV))
  }
  useI  <- which(!is.na(dates)) & which(!is.na(dist)) & which(!is.na(uncy))
  dates <- dates[useI]
  dist  <- dist[useI]
  uncy  <- usny[useI]
  if (length(dates) < 2) {
    LRR_rates=NA
    LCI=NA
    WLR_rates=NA
    WCI=NA
    SCE_dist=NA
    NSM_dist=NA
    EPR_dates=NA)
  }
  else {
    rate <- dates
    mdl  <- lm(formula=dist~rate)
    coef <- coefficients(mdl)
    CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
    rate <- coef["rate"]  # is m/day
    
    LRR_rates <- rate*rateConv 
    LCI <- (CI[2]-CI[1])/2 # LCI
    
    mdl <- lm(formula=dist~rate, weights=1/(uncy^2))
    coef <- coefficients(mdl)
    CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
    rate <- coef["rate"]
    WLR_rates <- rate*rateConv 
    WCI <- (CI[2]-CI[1])/2 # WCI
    
    SCE_dist <- max(dist)-min(dist)
    
    firstDateIdx <- which.min(dates)
    lastDateIdx  <- which.max(dates)
    NSM_dist <- dist[firstDateIdx]-dist[lastDateIdx]
    dateDiff <- dates[lastDateIdx]-dates[firstDateIdx]
    EPR_rates <- NSM_dist/(as(dates[lastDateIdx]-dates[firstDateIdx],"numeric"))*rateConv
    
  }
  return(data.frame('LRR'=LRR_rates,'LCI'=LCI,'WLR'=WLR_rates,'WCI'=WCI,
                    'SCE'=SCE_dist,'NSM'=NSM_dist,'EPR'=EPR_rates))

transect_ID <- blckNm
getIdxs <- function(b){   # get indices for start and end of block
  if (b==numBlck) enI <- nRead-1
  else enI <- blockI[b+1]-1
  stI <- blockI[b]+1
  return(c(stI,enI))
}

readBlock <- function(sTeD){
  dates <- vector(length=length(sTeD[1]:sTeD[2]))
  dist  <- vector(length=length(sTeD[1]:sTeD[2]))
  uncy  <- vector(length=length(sTeD[1]:sTeD[2]))
  for (i in sTeD[1]:sTeD[2]){
    splitsTxt <- strsplit(fileLines[i],delim)
    sT <- splitsTxt[[1]]
    dates[i-sTeD[1]+1] <- as.Date(sT[t_i],format="%Y-%m-%d")
    dist[i-sTeD[1]+1] <- as(sT[d_i],"numeric")
    uncy[i-sTeD[1]+1] <- max(c(as(sT[u_i],"numeric"),zRepV))
  }
  useI  <- which(!is.na(dates)) & which(!is.na(dist)) & which(!is.na(uncy))
  return(list(dates[useI],dist[useI],uncy[useI]))
}

LRRfun <- function(DSAS_list){
  if(length(DSAS_list[[1]]) < 2) {
    LRR_rates <- NA
    LCI <- NA
  }
  else {
    # call LRR
    rate <- DSAS_list[[1]]
    mdl <- lm(formula=DSAS_list[[2]]~rate)
    coef <- coefficients(mdl)
    CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
    rate <- coef["rate"]  # is m/day
    
    LRR_rates <- rate*rateConv 
    LCI <- (CI[2]-CI[1])/2 # LCI
  }
  return(data.frame("LRR"=LRR_rates,"LCI"=LCI))
}

WLRfun <- function(DSAS_list){
  if(length(DSAS_list[[1]]) < 2) {
    WLR_rates <- NA
    WCI <- NA
  }
  else {
    # call WLR
    rate <- DSAS_list[[1]]
    mdl <- lm(formula=DSAS_list[[2]]~rate, weights=1/(DSAS_list[[3]]^2))
    coef <- coefficients(mdl)
    CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
    rate <- coef["rate"]
    WLR_rates <- rate*rateConv 
    WCI <- (CI[2]-CI[1])/2 # WCI
  }
  return(data.frame("WLR"=WLR_rates,"WCI"=WCI))
}

SCEfun <- function(DSAS_list){
  distance <- DSAS_list[[2]]
  SCE_dist <- max(distance)-min(distance)
  return(data.frame("SCE"=SCE_dist))
}

NSMfun <- function(DSAS_list){
  dates <- DSAS_list[[1]]
  distance <- DSAS_list[[2]]
  firstDateIdx <- which.min(dates)
  lastDateIdx  <- which.max(dates)
  NSM_dist <- distance[firstDateIdx]-distance[lastDateIdx]
  dateDiff <- dates[lastDateIdx]-dates[firstDateIdx]
  EPR_rates <- NSM_dist/(as(dates[lastDateIdx]-dates[firstDateIdx],"numeric"))*rateConv
  return(data.frame("NSM"=NSM_dist,"EPR"=EPR_rates))
}
  
listVals <- foreach(b=1:numBlck,.combine='rbind') %dopar% {
  getDSAS(b)
}
proc.time() - ptm


statsout <-data.frame(transect_ID,listVals)
colnames(statsout)<-c('transect_ID','LRR','LCI','WLR','WCI','SCE','NSM','EPR')

if (localRun) proc.time() - ptm

# output is an identifier and R variable (WPS identifier). The ouput is the name of the text file
# wps.out: output, text, output title, tabular output data to append to shapefile;
output = "output.txt"
write.table(statsout,file="output.txt",col.names=TRUE, quote=FALSE, row.names=FALSE, sep="\t")
