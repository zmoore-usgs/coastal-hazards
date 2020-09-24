package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.metadata.CRSParameters;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.summary.Publication;
import gov.usgs.cida.coastalhazards.model.util.ParsedMetadata;
import gov.usgs.cida.coastalhazards.xml.model.Bounding;
import gov.usgs.cida.coastalhazards.xml.model.Horizsys;
import gov.usgs.cida.coastalhazards.xml.model.Idinfo;
import gov.usgs.cida.coastalhazards.xml.model.Metadata;
import gov.usgs.cida.coastalhazards.xml.model.Spdom;
import java.io.ByteArrayInputStream;
import java.io.StringReader;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;
import org.geotools.referencing.CRS;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 *
 * @author isuftin
 */
public class MetadataUtil {
	
	private static final Logger log = LoggerFactory.getLogger(MetadataUtil.class);
	
	public static final String[] XML_PROLOG_PATTERNS = {"<\\?xml[^>]*>", "<!DOCTYPE[^>]*>"};

    public static Document parseMetadataBody(String postBody) {
        try {
            Document doc = null;
            doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(new InputSource(new StringReader(postBody)));
            doc.getDocumentElement().normalize();
            return doc;
        } catch(Exception e) {
            throw new RuntimeException(e);
        }
    }
    
    public static ParsedMetadata parseMetadataXmlFile(String postBody) {
		List<String> title = new ArrayList<>();
		List<String> srcUsed = new ArrayList<>();
		List<String> keywords = new ArrayList<>();
		List<Publication> data = new ArrayList<>();
		List<Publication> publication = new ArrayList<>();
		List<Publication> resource = new ArrayList<>();
        Bbox box = new Bbox();
        
        try {

            Document doc = parseMetadataBody(postBody);
            
            title.addAll(extractStringsFromCswDoc(doc, "/metadata/idinfo/citation/citeinfo/title"));
            srcUsed.addAll(extractStringsFromCswDoc(doc, "/metadata/dataqual/lineage/procstep/srcused"));
            
            box = getBoundingBoxFromFgdcMetadata(postBody);
            keywords.addAll(extractStringsFromCswDoc(doc, "//*/placekey"));
            keywords.addAll(extractStringsFromCswDoc(doc, "//*/themekey"));
            
            data.addAll(getResourcesFromXml(doc, "citation"));
            publication.addAll(getResourcesFromXml(doc, "lworkcit"));
            resource.addAll(getResourcesFromXml(doc, "crossref"));
            resource.addAll(getResourcesFromXml(doc, "srccite"));		
            
            ParsedMetadata metadata = new ParsedMetadata();
            metadata.setTitle(title);
            metadata.setSrcUsed(srcUsed);
            metadata.setBox(box);
            metadata.setKeywords(keywords);
            metadata.setData(data);
            metadata.setPublications(publication);
            metadata.setResources(resource);

            // Only some, generally raster, metadata xml files will include EPSG data
            try {
                String epsgCode = CRS.lookupIdentifier(getCrsFromFgdcMetadata(postBody), true);
                metadata.setEPSGCode(epsgCode);
            } catch (Exception e) {
                log.info("Unable to extract an EPSG code from metadata XML; This is not an error. Setting null EPSG code. Reason: " + e.getMessage());
            }

            return metadata;
        } catch (Exception e) {
            log.error("Failed to parse metadata xml document. Error: " + e.getMessage() + ". Stack Trace: " + e.toString());
        }
        
        return null;
    }
	
	public static String stripXMLProlog(String xml) {
		String xmlWithoutHeader = xml;
		for (String prolog : XML_PROLOG_PATTERNS) {
			xmlWithoutHeader = xmlWithoutHeader.replaceAll(prolog, "");
		}
		return xmlWithoutHeader;
	}

	public static List<String> extractStringsFromCswDoc(Document cswDoc, String path) {
		XPathFactory xPathfactory = XPathFactory.newInstance();
        XPath xpath = xPathfactory.newXPath();
        List<String> result = new ArrayList<>();
        
        try {
            XPathExpression expr = xpath.compile(path);
			NodeList nl = (NodeList) expr.evaluate(cswDoc, XPathConstants.NODESET);
                        
			for(int i = 0; i < nl.getLength(); i++) {
				result.add(nl.item(i).getTextContent());
			}
        } catch (Exception e) {
            log.error("Failed to parse CSW Document Path: " + path);
        }
        
        return result;
    }
    
    public static String extractCollectionDateFromXml(Document xml, String attr) {
        XPathFactory xPathfactory = XPathFactory.newInstance();
        XPath xpath = xPathfactory.newXPath();
        
        try {
            XPathExpression expr = xpath.compile("//eainfo/detailed/attr");
			NodeList nl = (NodeList) expr.evaluate(xml, XPathConstants.NODESET);
			for(int i = 0; i < nl.getLength(); i++) {
                String nodeAttr = "";
                String nodeDefStr = "";

                // Extract Attr Node Details
				for(int j = 0; j < nl.item(i).getChildNodes().getLength(); j++) {
                    Node curChild = nl.item(i).getChildNodes().item(j);
                    if("attrlabl".equals(curChild.getNodeName())) {
                        nodeAttr = curChild.getTextContent().toLowerCase();
                    } else if("attrdef".equals(curChild.getNodeName())) {
                        nodeDefStr = curChild.getTextContent().toLowerCase();
                    }
                }

                // If this Attr Node is for our attr then parse out the collection date
                if(nodeAttr.equals(attr.toLowerCase())) {
                    String regex = ".*?(\\w+ \\d{4} to \\w+ \\d{4})\\.?";
                    Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
                    Matcher matcher = pattern.matcher(nodeDefStr);

                    //Populate Matches
                    while(matcher.find()) {
                        if(matcher.groupCount() >= 1) {
                            return matcher.group(1);
                        }
                    }
                }
            }

            log.error("Failed to find matching Attr node in metadata xml for attr: " + attr);
        } catch (Exception e) {
            log.error("Failed to parse CSW Document while extracing collection date for attr: " + attr);
        }
        
        return null;
    }
        
    public static Bbox getBoundingBoxFromFgdcMetadata(String inMetadata) throws JAXBException, UnsupportedEncodingException{
        
            Bbox bbox = new Bbox();
            //parse out the WGS84 bbox from the metadata xml
            Metadata metadata = null;

            // JAXB will require jaxb-api.jar and jaxb-impl.jar part of java 1.6. Much safer way to interrogate xml and maintain than regex
            try {
                    JAXBContext jaxbContext = JAXBContext.newInstance(Metadata.class);

                    Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
                    metadata = (Metadata) jaxbUnmarshaller.unmarshal(new ByteArrayInputStream(inMetadata.getBytes("UTF-8")));               

            }     catch (JAXBException e) { //schema used https: www.fgdc.gov/schemas/metadata/fgdc-std-001-1998-sect01.xsd
                        log.error("Unable to parse xml file. Has the schema changed? https://www.fgdc.gov/schemas/metadata/fgdc-std-001-1998-sect01.xsd :" + e.getMessage());
                        throw e;
            }  
        
            Idinfo idinfo = metadata.getIdinfo();
            Spdom spdom = idinfo.getSpdom();
            Bounding bounding = spdom.getBounding();
    
            double minx = bounding.getWestbc();
            double miny = bounding.getSouthbc();
            double maxx = bounding.getEastbc();
            double maxy = bounding.getNorthbc();
    
            bbox.setBbox(minx, miny, maxx, maxy);
        
            return bbox;
    }
    
    public static CoordinateReferenceSystem getCrsFromFgdcMetadata(String inMetadata) throws FactoryException, JAXBException, UnsupportedEncodingException{
        //create the WKT to instantiate a CRS object from org.geotools.referencing
            
            CRSParameters crsParms = new CRSParameters();
            
            Metadata metadata = null;
            try {
                    JAXBContext jaxbContext = JAXBContext.newInstance(Metadata.class);

                    Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
                    metadata = (Metadata) jaxbUnmarshaller.unmarshal(new ByteArrayInputStream(inMetadata.getBytes("UTF-8")));               

            }     catch (JAXBException e) { //schema used https: www.fgdc.gov/schemas/metadata/fgdc-std-001-1998-sect01.xsd
                        log.error("Unable to parse xml file. Has the schema changed? https:www.fgdc.gov/schemas/metadata/fgdc-std-001-1998-sect01.xsd :" + e.getMessage());
                        throw e;
            }  
            
            Horizsys horizsys = metadata.getSpref().getHorizsys();
                            
            String ellips = horizsys.getGeodetic().getEllips();
            String horizdn = horizsys.getGeodetic().getHorizdn();
            double denflat = horizsys.getGeodetic().getDenflat();
            double semiaxis = horizsys.getGeodetic().getSemiaxis();
            
            String mapprojn = horizsys.getPlanar().getMapproj().getMapprojn();
            double feast = horizsys.getPlanar().getMapproj().getMapprojp().getFeast();
            double fnorth = horizsys.getPlanar().getMapproj().getMapprojp().getFnorth();
            double latprjo = horizsys.getPlanar().getMapproj().getMapprojp().getLatprjo();
            double longcm = horizsys.getPlanar().getMapproj().getMapprojp().getLongcm();
            double stdparll = horizsys.getPlanar().getMapproj().getMapprojp().getStdparll();
            
            // these defaults were derived from the first 3 raster files meta-data CR, AE, PAE
            // Hoping that these can be optional or located in future metadata in which case 
            // an if check should be performed and the value replaced if it doesn't match the default
            String defaultGcs = "GCS_North_American_1983";
            String defaultPrimeM = "Greenwich\",0.0]";
            String defaultUnit = "Degree\",0.0174532925199433]]";
            String defaultProjection = "Albers";
            String defaultLengthUnit = "Meter";
            double defaultLengthValue = 1.0;                
            
            crsParms.setEllips(ellips);
            crsParms.setHorizdn(horizdn);
            crsParms.setDenflat(denflat);
            crsParms.setSemiaxis(semiaxis);
            crsParms.setMapprojn(mapprojn);
            crsParms.setFeast(feast);
            crsParms.setFnorth(fnorth);
            crsParms.setLatprjo(latprjo);
            crsParms.setLongcm(longcm);
            crsParms.setStdparll(stdparll);
            
            crsParms.setGcs(defaultGcs);
            crsParms.setPrimeM(defaultPrimeM);
            crsParms.setUnit(defaultUnit);
            crsParms.setProjection(defaultProjection);
            crsParms.setLengthUnit(defaultLengthUnit);
            crsParms.setLengthValue(defaultLengthValue);
                            
            // to look up the EPSG code use Integer eCode = CRS.lookupEpsgCode(crs, true); yields 5070 and/or String idCode = CRS.lookupIdentifier(crs, true); yields EPSG:5070 
            return CRS.parseWKT(buildWkt(crsParms));// same as FactoryFinder.getCRSFactory(null).createFromWKT(wkt);
        }       
       
        private static String buildWkt(CRSParameters parms)
                {
                StringBuilder builder = new StringBuilder(500);
                final String lineSep = System.getProperty("line.separator", "\n");
                
                builder.append("PROJCS[")
                .append("\"")  // quote
                .append(parms.getMapprojn())
                .append("\"")  // quote
                .append(",")   // comma
                .append(lineSep)
                
                .append("GEOGCS[")
                .append("\"")  // quote
                .append(parms.getGcs())  // replace if the Gcs is found in the meta-data
                .append("\"")  // quote
                .append(",")   // comma
                .append(lineSep)
                
                .append("DATUM[")
                .append("\"")  // quote
                .append(parms.getHorizdn())
                .append("\"")  // quote
                .append(",")   // comma
                .append(lineSep)                
                               
                .append("SPHEROID[")
                .append("\"")  // quote
                .append(parms.getEllips())
                .append("\"")  // quote
                .append(",")   // comma                
                .append(parms.getSemiaxis())
                .append(",")   // comma
                .append(parms.getDenflat())
                .append("]]")
                .append(",")   // comma
                .append(lineSep)
                
                .append("PRIMEM[")
                .append("\"")  // quote
                .append(parms.getPrimeM())
                .append(",")
                .append(lineSep)
                
                .append("UNIT[")
                .append("\"")  // quote
                .append(parms.getUnit())  //get pa
                .append(",")
                .append(lineSep)
             
                .append("PROJECTION[")
                .append("\"")  // quote
                .append(parms.getProjection())
                .append("\"]")  // quote
                .append(",")
                .append(lineSep)
                
                .append(getParameterNode("False_Easting",parms.getFeast()))
                .append(",")
                .append(lineSep)
                
                .append(getParameterNode("False_Northing",parms.getFnorth()))
                .append(",")
                .append(lineSep)

                .append(getParameterNode("Central_Meridian",parms.getLongcm()))
                .append(",")
                .append(lineSep)                
                
                .append(getParameterNode("Standard_Parallel_1",29.5)) //#TODO# relace with value
                .append(",")
                .append(lineSep)
                
                .append(getParameterNode("Standard_Parallel_2",parms.getStdparll()))
                .append(",")
                .append(lineSep)

                .append(getParameterNode("Latitude_Of_Origin",parms.getLatprjo()))
                .append(",") 
                .append(lineSep)
                
                .append("UNIT[")
                .append("\"")  // quote
                .append(parms.getLengthUnit()) //Meter
                .append("\"")  // quote
                .append(",")
                .append(parms.getLengthValue())
                .append("]]");
                   
                return builder.toString();
        }   
             
        private static String getParameterNode(String name, double value){
            //exp PARAMETER["False_Easting",0.0]
            StringBuilder sb = new StringBuilder(50);
            
            sb.append("PARAMETER[")
              .append("\"")  // quote
              .append(name)
              .append("\"")  // quote
              .append(",")   // comma
              .append(value)
              .append("]");
            
            return sb.toString();
        }
        
        public static List<Publication> getResourcesFromXml(Document doc, String path){
            
            //data is /citation/citeinfo/onlink and /citation/citeinfo/title
            //publications is //lworkcit/citeinfo/onlink and //lworkcit/citeinfo/title
            //resources is //crossref/citeinfo/onlink and //crossref/citeinfo/title
            // and is //srccite/citeinfo/onlink and //srccite/citeinfo/title
            
            XPathFactory xPathfactory = XPathFactory.newInstance();
            XPath xpath = xPathfactory.newXPath();
            List<Publication> result = new ArrayList<>();
            Publication.PublicationType pubType;
            String fullPath = "//*/" + path + "/citeinfo/title";
            
            //Find correct publication type
            if("citation".equals(path)){
                pubType = Publication.PublicationType.data;
            } else if("lworkcit".equals(path)){
                pubType = Publication.PublicationType.publications;
            } else{
                pubType = Publication.PublicationType.resources;
            }
            
            //Find titles, find related links to titles, then create and add pubs.
            try {
                XPathExpression expr = xpath.compile(fullPath);
                NodeList nl = (NodeList) expr.evaluate(doc, XPathConstants.NODESET);

                for(int i = 0; i < nl.getLength(); i++) {
                    NodeList siblingNodes = nl.item(i).getParentNode().getChildNodes();
                    for(int j = 0; j < siblingNodes.getLength(); j++){ //iterate over sibling nodes to find all links
                        if(siblingNodes.item(j).getNodeName().equals("onlink")){
                            Publication toAdd = new Publication();
                            toAdd.setLink(siblingNodes.item(j).getTextContent()); //link
                            toAdd.setTitle(nl.item(i).getTextContent()); //Title
                            toAdd.setType(pubType); //pubType
                            result.add(toAdd);
                        }
                    }
                }
                
            } catch (Exception e) {
                log.error("Failed to link titles of publications with link: " + e);
            }

            return result;
	}

}
