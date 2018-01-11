package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.summary.Full;
import gov.usgs.cida.coastalhazards.model.summary.Legend;
import gov.usgs.cida.coastalhazards.model.summary.Medium;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.summary.Tiny;
import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.xml.parsers.DocumentBuilderFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.w3c.dom.Document;

public class StormUtil {    
    private static final Logger log = LoggerFactory.getLogger(StormUtil.class);
    public static final String STORM_TRACK_ITEM_ID = "DvDJ6Vcg";
    
    public static Summary buildStormTemplateSummary(Layer layer) {
        Summary summary = new Summary();
        Document cswDoc = getStormCswDocument(layer);
        
        if(cswDoc != null) {
            String title = MetadataUtil.extractFirstStringFromCswDoc(cswDoc, "/*/metadata/idinfo/citation/citeinfo/title");
            Map<String, String> titleParts = parseTitleParts(title);
            String cswAbstract =  MetadataUtil.extractFirstStringFromCswDoc(cswDoc, "/*/metadata/idinfo/descript/abstract");
            List<String> dataSrcList = MetadataUtil.extractStringsFromCswDoc(cswDoc, "/*/metadata/dataqual/lineage/srcinfo/srccite/citeinfo/title");
            String surgeDescription = buildSurgeDescription(cswDoc);

            Tiny tiny = buildTinyText(titleParts);
            Medium medium = buildMediumText(titleParts);
            Full full = buildFullText(titleParts, title, surgeDescription);
            Legend legend = buildLegendText(titleParts);
            
            summary.setTiny(tiny);
            summary.setMedium(medium);
            summary.setFull(full);
            summary.setLegend(legend);
        }

        return summary;
    }

    private static Legend buildLegendText(Map<String, String> titleParts) {
        Legend legend = new Legend();

        legend.setTitle(titleParts.get("name"));

        return legend;
    }

    private static Tiny buildTinyText(Map<String, String> titleParts) {
        Tiny tiny = new Tiny();

        tiny.setText(titleParts.get("name") + " Assessment of Potential Coastal-Change Impacts: NHC Adv. " + titleParts.get("advNum"));

        return tiny;
    }

    private static Medium buildMediumText(Map<String, String> titleParts) {
        Medium medium = new Medium();
        String mediumText = "Potential coastal change impacts during a direct landfall of " + titleParts.get("name") +
            ": " + titleParts.get("advFull");

        medium.setTitle(titleParts.get("name"));
        medium.setText(mediumText);

        return medium;
    }

    private static Full buildFullText(Map<String, String> titleParts, String title, String surgeDescription) {
        Full full = new Full();
        String fullText = "This dataset contains a coastal erosion hazards analysis for " +
            titleParts.get("name") + ". The analysis is based on a storm-impact scaling model " +
            "that combines observations of beach morphology with hydrodynamic models to predict how sandy beaches, " +
            "the first line of defense for many coasts exposed to tropical storms and hurricanes, will respond during " +
            "a direct landfall. Storm-induced total water levels, due to both surge and waves, are compared to beach " +
            "and dune elevations to determine the probabilities of three types of coastal change - collision (dune erosion), " +
            "overwash, and inundation. " + surgeDescription + " Maximum wave heights in 20-m water depth, obtained from the " +
            "NOAA WaveWatch3 model 7-day forecast, were used to compute wave runup elevations at the shoreline. " +
            "Dune elevations were extracted from lidar topographic surveys. \n\nDisclaimer: This product is based on " +
            "published research results of the USGS National Assessment of Coastal Change Hazards Project and is " +
            "intended to indicate the potential for coastal change caused by storm surge and wave runup. This product is " +
            "based on an analysis that simplifies complex coastal change processes to two important aspects - " +
            "measured dune elevations and predicted total water levels. As such, the actual changes " +
            "that occur during extreme storms may be different than what is described here. Results " +
            "apply to open coast environments and do not consider potential coastal change along " +
            "inland waters. The public should not base evacuation decisions on this product. Citizens " +
            "should follow the evacuation advice of local emergency management authorities. ";

        full.setTitle(title);
        full.setText(fullText);
        full.setPublications(new ArrayList<>());

        return full;
    }

    private static String buildSurgeDescription(Document cswDoc) {
        String desc = "The storm surge elevations along the open coast were obtained from the " +
        "National Oceanic and Atmospheric Administration";

        List<String> srcUsed = MetadataUtil.extractStringsFromCswDoc(cswDoc, "/*/metadata/dataqual/lineage/procstep/srcused");

        if (srcUsed.stream().anyMatch("psurge"::equalsIgnoreCase)) {
            desc += "'s (NOAA) probabilistic surge forecast (psurge), which is based on conditions specific to the " +
            "landfalling storm. Errors in hurricane forecasts are included in order to identify probable surge levels. " +
            "The 10% exceedance surge level was used to represent the worst-case scenario.";
        } else if (srcUsed.stream().anyMatch("estofs"::equalsIgnoreCase)) {
            desc += "'s (NOAA) ESTOFS (Extratropical Surge and Tide Operational Forecast System).";
        } else if (srcUsed.stream().anyMatch("moms"::equalsIgnoreCase)) {
            desc += "'s (NOAA) Sea, Lake, and Overland Surges from Hurricanes (SLOSH) model, maximum of the maximum (MOM).";
        } else {
            desc += " (NOAA).";
        }

        return desc;
    }

    private static Map<String, String> parseTitleParts(String title) {
        Map<String, String> parts = new HashMap<>();
        List<String> partList = new ArrayList<>();

        String regex = "((Hurricane|[A-Za-z-]*[Tt]ropical \\w+|Extratropical Storm) \\w+).*:\\s*((NHC Advisory (\\d+), )?(.*))";
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(title);
        //Populate Matches
        while(matcher.find()) {
            if(matcher.groupCount() >= 5) {
                parts.put("name", matcher.group(1));
                parts.put("advFull", matcher.group(3));
                parts.put("advNum", matcher.group(5));
                parts.put("time", matcher.group(6));
            } else {
                log.error("Failed to parse title '" + title + "' into parts. Regex returned " + Integer.toString(matcher.groupCount()) + " groups.");
            }
        };

        return parts;
    }

    private static Document getStormCswDocument(Layer layer) {
        Document doc = null;
        Service cswService = getCswServiceFromLayer(layer);
        
        if(cswService != null) {
            String endpoint = cswService.getEndpoint();
            String cswData = HttpUtil.fetchDataFromUri(endpoint);

            if(cswData != null && cswData.length() > 0) {
                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                factory.setNamespaceAware(false);

                try {
                    doc = factory.newDocumentBuilder().parse(new ByteArrayInputStream(cswData.getBytes()));
                } catch (Exception e) {
                    log.error("Failed to parse storm csw document. Error: " + e.getMessage() + ". Stack Trace: " + e.getStackTrace());
                }
                
            }
        }

        return doc;
    }

    private static Service getCswServiceFromLayer(Layer layer) {
        Service cswService = null;
        List<Service> services = layer.getServices();

        if(services.size() > 0) {
            for(Service service : services) {
                if(service.getType() == ServiceType.csw){
                    cswService = service;
                    break;
                }
            }
        }

        return cswService;
    }

    public static Map<String, Object> createStormChildMap(String layerId, boolean active, String trackId) {
        Map<String, Object> childMap = new HashMap<>();
        List< Map<String, Object> > childList = new ArrayList<>();
        final String attrKey = "attr";
        final String layerIdKey = "layerId";
        final String visibleKey = "visible";

        Map<String, Object> pcolChild = new HashMap<>();
        Map<String, Object> povwChild = new HashMap<>();
        Map<String, Object> pindChild = new HashMap<>();
        Map<String, Object> dhighChild = new HashMap<>();
        Map<String, Object> dlowChild = new HashMap<>();
        Map<String, Object> meanChild = new HashMap<>();
        Map<String, Object> extremeChild = new HashMap<>();
        Map<String, Object> trackChild = new HashMap<>();

        pcolChild.put(attrKey, "PCOL");
        pcolChild.put(layerIdKey, layerId);
        pcolChild.put(visibleKey, true);
        childList.add(pcolChild);

        povwChild.put(attrKey, "POVW");
        povwChild.put(layerIdKey, layerId);
        povwChild.put(visibleKey, true);
        childList.add(povwChild);

        pindChild.put(attrKey, "PIND");
        pindChild.put(layerIdKey, layerId);
        pindChild.put(visibleKey, true);
        childList.add(pindChild);

        dhighChild.put(attrKey, "DHIGH");
        dhighChild.put(layerIdKey, layerId);
        dhighChild.put(visibleKey, false);
        childList.add(dhighChild);

        dlowChild.put(attrKey, "DLOW");
        dlowChild.put(layerIdKey, layerId);
        dlowChild.put(visibleKey, false);
        childList.add(dlowChild);

        meanChild.put(attrKey, "MEAN");
        meanChild.put(layerIdKey, layerId);
        meanChild.put(visibleKey, false);
        childList.add(meanChild);

        extremeChild.put(attrKey, "EXTREME");
        extremeChild.put(layerIdKey, layerId);
        extremeChild.put(visibleKey, false);
        childList.add(extremeChild);

        if(active && trackId != null && trackId.length() > 0) {
            trackChild.put("id", trackId);
            trackChild.put(visibleKey, true);
            childList.add(trackChild);
        } else if(active) {
            log.error("Storm is active but no track ID provided.");
            return null;
        }

        childMap.put("children", childList);
        
        return childMap;
    }
}