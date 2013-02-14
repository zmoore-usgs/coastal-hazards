# wps.des: id=DSAS_squigglePlot, title=Digital Shoreline Analysis System squggle plot, abstract=plots and saves rate stats;
# wps.in: input, xml, block rates text, text input from stats with base_dist baseline_ID LRR and LCI;

# input is unique identifier for WPS, is a variable in R (will contain all parser text)
# xml is for WPS side of things, tells WPS how input should be formatted

localRun <- TRUE
# comment this out for WPS!!!
if (localRun){
  input <- "squiggleOut.tsv"
  ptm <- proc.time() # for time of process
}

#numH     <- 1 # number of headers
fileN    <- input # will have input as a string (long string read in)
delim    <- "\t"
sdMult   <- 2.5 # multiplier for axis 

BD_i = 1 # baseline distance index
ID_i = 2 # baseline ID index
RT_i = 3 # rate index
CI_i = 4 # confidence interval index

rateVals <- read.table(fileN,header=TRUE)

rwBD <- rateVals[,BD_i]/1000
rwID <- rateVals[,ID_i]
rwRT <- rateVals[,RT_i]
rwCI <- rateVals[,CI_i]*365.25 # FIX WITH DSAS_stats fix ****

nLines <- length(rwBD)# total length excluding header
baseL <- duplicated(rwID)
numBase <- sum(!baseL)
indx <- seq(1,nLines)
dropI <- c(indx[!baseL],nLines)

mxY <- mean(rwRT+rwCI)+sdMult*sd(rwRT+rwCI)
mnY <- mean(rwRT-rwCI)-sdMult*sd(rwRT-rwCI)

# resort values
png("testf.png", width=8, height=4, units="in")
plot(c(0,max(rwBD)*1.02),c(mnY,mxY),type="n",xlab="Distance alongshore (kilometers)",ylab="Rate of change (m yr^-1)")
lines(c(0,max(rwBD)),c(0,0),col="gray",lwd=2,pch=1)

for (p in 1:numBase){
  indx_1 <- dropI[p]
  indx_2 <- dropI[p+1]-1
  dist <- rwBD[indx_1:indx_2]
  rate <- rwRT[indx_1:indx_2]
  CI_up <- rate+rwCI[indx_1:indx_2]
  CI_dn <- rate-rwCI[indx_1:indx_2]
  
  polygon(c(dist,rev(dist)),c(CI_up,rev(CI_dn)),col="gray",border=NA)
  
  lines(dist,rate,lwd=2.5)
}

if (localRun) proc.time() - ptm
# output is an identifier and R variable (WPS identifier). The ouput is the name of the text file
# wps.out: output, text, output title, tabular output data to append to shapefile;
#output = "output.txt"
#write.table(statsout,file="output.txt",col.names=TRUE, quote=FALSE, row.names=FALSE, sep="\t")