# wps.des: id=ThumnailGenerator, title=Create thumbnails for items, abstract=Loads layers and draws map thumbnail;
# wps.in: url, string, item url, item to create thumbnail for;

library(itemSummaryService)

output 	<-	thumb.service(url)
# wps.out: output, png, output image, PNG for thumbnail image;