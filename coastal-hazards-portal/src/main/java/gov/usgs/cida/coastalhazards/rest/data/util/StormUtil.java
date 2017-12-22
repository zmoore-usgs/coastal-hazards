package gov.usgs.cida.coastalhazards.rest.data.util;

import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Bbox;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Item.ItemType;
import gov.usgs.cida.coastalhazards.model.Item.Type;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import gov.usgs.cida.coastalhazards.model.Service;
import gov.usgs.cida.coastalhazards.model.summary.Full;
import gov.usgs.cida.coastalhazards.model.summary.Medium;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.summary.Tiny;
import gov.usgs.cida.coastalhazards.model.summary.Publication.PublicationType;
import gov.usgs.cida.coastalhazards.model.summary.Publication;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

public class StormUtil {
    public static List< Map<String, Object> > createStormChildMap(String layerId) {
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

        return childList;
    }

    public static Item saveStormTrack() {
        Item stormTrack = null;
        final String STORM_TRACK_ITEM_ID = "DvDJ6Vcg";

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
            }
        }

        return stormTrack;
    }

    private static final Summary trackSummary() {
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

    private static final List<Publication> trackSummaryPublications() {
        List<Publication> publications = new ArrayList<>();
        Publication nowCoast = new Publication();

        nowCoast.setType(PublicationType.resources);
        nowCoast.setTitle("NOAA's nowCOAST");
        nowCoast.setLink("https://nowcoast.noaa.gov/");

        publications.add(nowCoast);
        
        return publications;
    }

    private static final Bbox trackBbox() {
        Bbox stormBbox = new Bbox();
        stormBbox.setBbox(-101.8, 17.6, -62.4, 46.0);
        return stormBbox;
    }

    private static final List<Service> trackChildServices(String serviceParam) {
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

    private static final List<Item> trackChildren() {
        List<Item> children = null;

        Item polyChild = baseTrackItem();
        polyChild.setItemType(ItemType.data);
        polyChild.setAttr("NHC_TRACK_POLY");
        polyChild.setServices(trackChildServices("6"));
        polyChild = saveTrackItem(polyChild);

        Item linChild = baseTrackItem();
        linChild.setItemType(ItemType.data);
        linChild.setAttr("NHC_TRACK_LIN");
        linChild.setServices(trackChildServices("3"));
        linChild = saveTrackItem(linChild);

        Item ptChild = baseTrackItem();
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

    private static final Item baseTrackItem() {
        Item baseItem = new Item();

        baseItem.setName("track");
        baseItem.setType(Type.storms);
        baseItem.setActiveStorm(false);
        baseItem.setRibbonable(false);
        baseItem.setShowChildren(false);
        baseItem.setFeatured(false);
        baseItem.setEnabled(true);
        baseItem.setLastModified(Date.from(Instant.now()));
        baseItem.setBbox(Bbox.copyValues(trackBbox(), new Bbox()));
        baseItem.setSummary(Summary.copyValues(trackSummary(), new Summary()));

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
        }
        
        return saved;
    }
}