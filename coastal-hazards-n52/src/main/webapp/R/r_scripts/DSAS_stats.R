# wps.des: id=DSAS_stats, title=Digital Shoreline Analysis System Stats, abstract=stats available - LRR LCI WLR WCI SCE NSM EPR;
# wps.in: input, xml, block intersection text, text input from intersections layer with time elements and uncertainty;
# wps.in: ci, double, confidence interval, percentage for confidence level > 0.5 and < 1.0;
# input is unique identifier for WPS, is a variable in R (will contain all parser text)
# xml is for WPS side of things, tells WPS how input should be formatted

localRun <- FALSE
# comment this out for WPS!!!
if (localRun){
  Rprof("DSAS_profiler.txt")
  ci <- 0.95
  input <- "testOut.tsv"
  ptm <- proc.time() # for time of process
}

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
textBlck <- vector(length=numBlck,mode="character")

for (blockNumber in 1:numBlck){
  if (blockNumber==numBlck) {enI <- nRead-1}
  else{enI <- blockI[blockNumber+1]-1}
  stI <- blockI[blockNumber]+1
  textBlck[blockNumber] <- paste(fileLines[stI:enI],collapse=delim)
}

calcLRR <- function(dates,dist){
  rate <- dates
  mdl  <- lm(formula=dist~rate)
  coef <- coefficients(mdl)
  CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
  rate <- coef["rate"]  # is m/day
  
  LRR_rates <- rate*rateConv 
  LCI <- (CI[2]-CI[1])/2 # LCI
  return(c(LRR_rates,LCI))
}

calcWLR <- function(dates,dist,uncy){
  rate <- dates
  mdl  <- lm(formula=dist~rate, weights=(1/(uncy^2)))
  coef <- coefficients(mdl)
  CI   <- confint(mdl,"rate",level=conLevel)*rateConv 
  rate <- coef["rate"]
  WLR_rates <- rate*rateConv 
  WCI  <- (CI[2]-CI[1])/2 # WCI
  return(c(WLR_rates,WCI))
}
calcNSM <- function(dates,dist){
  firstDateIdx <- which.min(dates)
  lastDateIdx  <- which.max(dates)
  NSM_dist <- dist[firstDateIdx]-dist[lastDateIdx]
  EPR_rates <- NSM_dist/(as(dates[lastDateIdx]-dates[firstDateIdx],"numeric"))*rateConv
  return(c(NSM_dist,EPR_rates))
}

LRR <-  rep(NA,numBlck)
LCI <-  rep(NA,numBlck)
WLR <-  rep(NA,numBlck)
WCI <-  rep(NA,numBlck)
SCE <-  rep(NA,numBlck)
NSM <-  rep(NA,numBlck)
EPR <-  rep(NA,numBlck)

getDSAS <- function(blockText){  
  splitsTxt <- unlist(strsplit(blockText,delim))
  dates <- as(as.Date(splitsTxt[seq(t_i,length(splitsTxt),3)],format="%Y-%m-%d"),"numeric")
  dist  <- as(splitsTxt[seq(d_i,length(splitsTxt),3)],"numeric")
  uncy  <- as(splitsTxt[seq(u_i,length(splitsTxt),3)],"numeric")
  uncy[uncy<zRepV] <- zRepV
  
  useI  <- which(!is.na(dates)) & which(!is.na(dist)) & which(!is.na(uncy))
  dates <- dates[useI]
  dist  <- dist[useI]
  uncy  <- uncy[useI]
  
  if (length(dates) >= 3) {
    LRRout   <- calcLRR(dates,dist)
    WLRout   <- calcWLR(dates,dist,uncy)
    SCE   <- (max(dist)-min(dist))
    NSMout  <- calcNSM(dates,dist)
    return(c(LRRout,WLRout,SCE,NSMout))
  }
  else{return(rep(NA,7))}
  
}


for (b in 1:numBlck){
  DSASstats <- getDSAS(textBlck[b])
  LRR[b] <- DSASstats[1]
  LCI[b] <- DSASstats[2]
  WLR[b] <- DSASstats[3]
  WCI[b] <- DSASstats[4]
  SCE[b] <- DSASstats[5]
  NSM[b] <- DSASstats[6]
  EPR[b] <- DSASstats[7]
}

statsout <- data.frame("transect_ID"=blckNm,LRR,LCI,WLR,WCI,SCE,NSM,EPR)

if (localRun){
  proc.time() -ptm
  Rprof(NULL)
  summaryRprof(filename = "DSAS_profiler.txt",chunksize=5000)
}

# output is an identifier and R variable (WPS identifier). The ouput is the name of the text file
# wps.out: output, text, output title, tabular output data to append to shapefile;
output = "output.txt"
write.table(statsout,file="output.txt",col.names=TRUE, quote=FALSE, row.names=FALSE, sep="\t")
