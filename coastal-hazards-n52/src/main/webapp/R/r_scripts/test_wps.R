# wps.des: test, test, test;
# wps.in: input, xml, input, test;

file <- file(input)
text <- readLines(file)
output <- "out.txt"
write(text, output)

# wps.out: output, text, output, test;