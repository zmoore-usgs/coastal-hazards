package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Item.ItemType;
import gov.usgs.cida.coastalhazards.model.Item.Type;
import gov.usgs.cida.coastalhazards.model.Layer;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.summary.Full;
import gov.usgs.cida.coastalhazards.model.summary.Legend;
import gov.usgs.cida.coastalhazards.model.summary.Medium;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.summary.Tiny;
import gov.usgs.cida.coastalhazards.model.summary.Publication.PublicationType;
import gov.usgs.cida.utilities.IdGenerator;
import gov.usgs.cida.coastalhazards.model.summary.Publication;
import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
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

    public static Map<String, Object> createStormChildMap(String layerId) {
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

        Item track = saveStormTrack();

        if(track != null) {
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

            trackChild.put("id", track.getId());
            trackChild.put(visibleKey, true);
            childList.add(trackChild);

            childMap.put("children", childList);
        }
        
        return childMap;
    }

    private static Item saveStormTrack() {
        Item stormTrack = null;

        //If the Storm Track item has not yet been created then create it
        try(ItemManager manager = new ItemManager()) {
            stormTrack = manager.load(STORM_TRACK_ITEM_ID);
        }

        if(stormTrack == null) {
            stormTrack = baseTrackItem();
            stormTrack.setId(STORM_TRACK_ITEM_ID);
            stormTrack.setItemType(ItemType.aggregation);
            stormTrack.setShowChildren(true);
            stormTrack.setChildren(trackChildren());

            if(stormTrack.getChildren() != null) {
                List<String> childIds = new ArrayList<>();
                for(Item child : stormTrack.getChildren()) {
                    childIds.add(child.getId());
                }

                stormTrack.setDisplayedChildren(childIds);
                stormTrack = saveTrackItem(stormTrack);
            } else {
                stormTrack = null;
            }
        }

        return stormTrack;
    }

    private static Summary trackSummary() {
        Summary stormSummary = new Summary();
        stormSummary.setTiny(new Tiny());
        stormSummary.setMedium(new Medium());
        stormSummary.setFull(new Full());

        stormSummary.getTiny().setText("NWS NHC Forecasted Tropical Cyclone");
        stormSummary.getMedium().setTitle("NWS NHC Forecast");
        stormSummary.getMedium().setText("The latest Tropical Cyclone Forecast from the NWS National Hurricane Center (NHC), updated hourly.");
        stormSummary.getFull().setTitle("NWS NHC Forecasted Tropical Cyclone");
        stormSummary.getFull().setText("The nowCOAST 'wwa' Web Map Service (WMS) provides layers containing near real-time watches, warnings " +
                                        "and advisories from the National Weather Service (NWS).  This layer shows the latest Tropical Cyclone " +
                                        "Track and Cone Forecast from the NWS National Hurricane Center (NHC), updated hourly. The 'wwa' WMS " +
                                        "is one of several map services provided by NOAA's nowCOAST project (http://nowcoast.noaa.gov), a " +
                                        "product of the NOAA/NOS/OCS Coast Survey Development Laboratory.");
        stormSummary.getFull().setPublications(trackSummaryPublications());
        stormSummary.setKeywords("Hurricane|Track|NOAA|nowCOAST");

        return stormSummary;
    }

    private static List<Publication> trackSummaryPublications() {
        List<Publication> publications = new ArrayList<>();
        Publication nowCoast = new Publication();

        nowCoast.setType(PublicationType.resources);
        nowCoast.setTitle("NOAA's nowCOAST");
        nowCoast.setLink("https://nowcoast.noaa.gov/");

        publications.add(nowCoast);
        
        return publications;
    }

    private static Bbox trackBbox() {
        Bbox stormBbox = new Bbox();
        stormBbox.setBbox(-101.8, 17.6, -62.4, 46.0);
        return stormBbox;
    }

    private static List<Service> trackChildServices(String serviceParam) {
        List<Service> childServices = new ArrayList<>();

        Service sourceWms = new Service();
        sourceWms.setEndpoint("http://nowcoast.noaa.gov/arcgis/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer/WmsServer?");
        sourceWms.setType(ServiceType.source_wms);
        sourceWms.setServiceParameter(serviceParam);

        Service proxyWms = new Service();
        sourceWms.setEndpoint("http://nowcoast.noaa.gov/arcgis/services/nowcoast/wwa_meteocean_tropicalcyclones_trackintensityfcsts_time/MapServer/WmsServer?");
        sourceWms.setType(ServiceType.proxy_wms);
        sourceWms.setServiceParameter(serviceParam);

        childServices.add(sourceWms);
        childServices.add(proxyWms);

        return childServices;
    }

    private static List<Item> trackChildren() {
        List<Item> children = null;

        Item polyChild = baseTrackItem();
        polyChild.setId(IdGenerator.generate());
        polyChild.setItemType(ItemType.data);
        polyChild.setAttr("NHC_TRACK_POLY");
        polyChild.setServices(trackChildServices("6"));
        polyChild = saveTrackItem(polyChild);

        Item linChild = baseTrackItem();
        linChild.setId(IdGenerator.generate());
        linChild.setItemType(ItemType.data);
        linChild.setAttr("NHC_TRACK_LIN");
        linChild.setServices(trackChildServices("3"));
        linChild = saveTrackItem(linChild);

        Item ptChild = baseTrackItem();
        ptChild.setId(IdGenerator.generate());
        ptChild.setItemType(ItemType.data);
        ptChild.setAttr("NHC_TRACK_PT");
        ptChild.setServices(trackChildServices("8,7,4"));
        ptChild = saveTrackItem(ptChild);

        if(polyChild != null && linChild != null && ptChild != null) {
            children = new ArrayList<>();
            children.add(polyChild);
            children.add(linChild);
            children.add(ptChild);
        }

        return children;
    }

    private static Item baseTrackItem() {
        Item baseItem = new Item();

        baseItem.setName("track");
        baseItem.setType(Type.storms);
        baseItem.setActiveStorm(false);
        baseItem.setRibbonable(false);
        baseItem.setShowChildren(true);
        baseItem.setFeatured(false);
        baseItem.setEnabled(true);
        baseItem.setLastModified(Date.from(Instant.now()));
        baseItem.setBbox(Bbox.copyValues(trackBbox(), new Bbox()));
        baseItem.setSummary(trackSummary());

        return baseItem;
    }

    private static Item saveTrackItem(Item toSave) {
        String id = null;
        Item saved = null;

        try(ItemManager manager = new ItemManager()) {
            id = manager.persist(toSave);

            if(id != null) {
                saved = manager.load(id);
            }
        } catch (Exception e) {
            log.error(e.getMessage() + "\nStack Trace: " + e.getStackTrace());
        }
        
        return saved;
    }
}