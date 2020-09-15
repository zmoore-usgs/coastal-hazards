package gov.usgs.cida.coastalhazards.rest.data.util;

import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.google.gson.Gson;
import com.google.gson.JsonIOException;
import com.google.gson.stream.JsonReader;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

import gov.usgs.cida.coastalhazards.Attributes;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Item.ItemType;
import gov.usgs.cida.coastalhazards.model.summary.Full;
import gov.usgs.cida.coastalhazards.model.summary.Legend;
import gov.usgs.cida.coastalhazards.model.summary.Medium;
import gov.usgs.cida.coastalhazards.model.summary.Publication;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.model.summary.Tiny;
import gov.usgs.cida.coastalhazards.model.summary.Publication.PublicationType;
import gov.usgs.cida.coastalhazards.model.util.ParsedMetadata;

public class StormUtil {	
	private static final Logger log = LoggerFactory.getLogger(StormUtil.class);
	private static Map<String, Map<String, String>> stormSummaryDictionary;
	public static final String STORM_TRACK_ITEM_ID = "DvDJ6Vcg";
	private static final String STORM_SUMMARY_DICTIONARY_FILE="storm_summary_dictionary.json";
	private static final String STORM_DICT_TITLE="TITLE";
	private static final String STORM_DICT_DEFINITION="DEFINITION";
	private static final String STORM_DICT_KEYWORDS="KEYWORDS";
	private static final String TITLE_PART_NAME="name";
	private static final String TITLE_PART_TIME="time";
	private static final String TITLE_PART_ADV_NUM="advNum";
	private static final String TITLE_PART_ADV_FULL="advFull";

	static {
		Gson gson = new Gson();
		log.debug("Loading storm summary dictionary resource from classpath://"+STORM_SUMMARY_DICTIONARY_FILE);
		try(FileReader file = new FileReader(StormUtil.class.getClassLoader().getResource(STORM_SUMMARY_DICTIONARY_FILE).getFile())) {
			stormSummaryDictionary = gson.fromJson(new JsonReader(file), HashMap.class);
		} catch(IOException | JsonIOException e) {
			log.error("Failed to load storm summary dictionary: ", e);
			stormSummaryDictionary = new HashMap<>();
		};
	}
	
	public static Summary buildStormTemplateSummary(List<String> title, List<String> srcUsed) {
		Summary summary = new Summary();
		
		if (null != title && null != srcUsed) {
			String surgeDescription = buildSurgeDescription(srcUsed);
			
			Map<String, String> titleParts = parseTitleParts(title.get(0));
			Tiny tiny = buildStormTemplateTinyText(titleParts);
			Medium medium = buildStormTemplateMediumText(titleParts);
			Full full = buildStormTemplateFullText(titleParts, title.get(0), surgeDescription);
			Legend legend = buildStormTemplateLegendText(titleParts);
			
			summary.setTiny(tiny);
			summary.setMedium(medium);
			summary.setFull(full);
			summary.setLegend(legend);
		}

		return summary;
	}

	public static Summary buildStormChildSummary(Document metadataXml, ParsedMetadata parsedMetadata, String attr) {
		Summary summary = new Summary();
		
		if (parsedMetadata != null) {
			Map<String, String> titleParts = parseTitleParts(parsedMetadata.getTitle().get(0));
			Tiny tiny = buildStormChildTinyText(titleParts, attr);
			Medium medium = buildStormChildMediumText(metadataXml, titleParts, attr);
			Full full = buildStormChildFullText(metadataXml, titleParts, parsedMetadata, attr);
			Legend legend = new Legend();
			legend.setTitle(medium.getTitle());
			String keywords = String.join("|", parsedMetadata.getKeywords());
			String addlKeywords = stormSummaryDictionary.get(STORM_DICT_KEYWORDS).get(attr.toUpperCase());

			if(addlKeywords != null && !addlKeywords.isEmpty()) {
				keywords += "|" + addlKeywords;
			}
			
			summary.setTiny(tiny);
			summary.setMedium(medium);
			summary.setFull(full);
			summary.setLegend(legend);
			summary.setKeywords(keywords);
		}

		return summary;
	}

	private static Legend buildStormTemplateLegendText(Map<String, String> titleParts) {
		Legend legend = new Legend();

		legend.setTitle(titleParts.get(TITLE_PART_NAME));

		return legend;
	}

	private static Tiny buildStormTemplateTinyText(Map<String, String> titleParts) {
		Tiny tiny = new Tiny();

		tiny.setText(titleParts.get(TITLE_PART_NAME) + " Assessment of Potential Coastal-Change Impacts: NHC Adv. " + titleParts.get(TITLE_PART_ADV_NUM));

		return tiny;
	}

	private static Tiny buildStormChildTinyText(Map<String, String> titleParts, String attr) {
		Tiny tiny = new Tiny();
		String tinyText = "";

		switch(attr.toUpperCase()) {
			case Attributes.PIND:
			case Attributes.PIND1:
			case Attributes.PIND2:
			case Attributes.PIND3:
			case Attributes.PIND4:
			case Attributes.PIND5:
			case Attributes.PCOL:
			case Attributes.PCOL1:
			case Attributes.PCOL2:
			case Attributes.PCOL3:
			case Attributes.PCOL4:
			case Attributes.PCOL5:
			case Attributes.POVW:
			case Attributes.POVW1:
			case Attributes.POVW2:
			case Attributes.POVW3:
			case Attributes.POVW4:
			case Attributes.POVW5:
				tinyText = stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()) + " during " + titleParts.get(TITLE_PART_NAME) + 
				": NHC Adv. " + titleParts.get(TITLE_PART_ADV_NUM);
				break;
			case Attributes.DHIGH:
			case Attributes.DLOW:
				tinyText = stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()) + " prior to " + titleParts.get(TITLE_PART_NAME);
				break;
			case Attributes.MEAN:
			case Attributes.MEAN1:
			case Attributes.MEAN2:
			case Attributes.MEAN3:
			case Attributes.MEAN4:
			case Attributes.MEAN5:
			case Attributes.EXTREME:
			case Attributes.EXTREME1:
			case Attributes.EXTREME2:
			case Attributes.EXTREME3:
			case Attributes.EXTREME4:
			case Attributes.EXTREME5:
				tinyText = "Modeled " + stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()) + " during " + titleParts.get(TITLE_PART_NAME) + 
				": NHC Adv. " + titleParts.get(TITLE_PART_ADV_NUM);
				break;
			default: 
				log.warn("Failed to build tiny text for unrecognized storm child attr: " + attr);
		}

		tiny.setText(tinyText);

		return tiny;
	}

	private static Medium buildStormTemplateMediumText(Map<String, String> titleParts) {
		Medium medium = new Medium();
		String mediumText = "Potential coastal change impacts during a direct landfall of " + titleParts.get(TITLE_PART_NAME) +
			": " + titleParts.get(TITLE_PART_ADV_FULL);

		medium.setTitle(titleParts.get(TITLE_PART_NAME));
		medium.setText(mediumText);

		return medium;
	}

	private static Medium buildStormChildMediumText(Document metadataXml, Map<String, String> titleParts, String attr) {
		Medium medium = new Medium();
		String mediumText = "";

		medium.setTitle(stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()));

		switch(attr.toUpperCase()) {
			case Attributes.PIND:
			case Attributes.PIND1:
			case Attributes.PIND2:
			case Attributes.PIND3:
			case Attributes.PIND4:
			case Attributes.PIND5:
			case Attributes.PCOL:
			case Attributes.PCOL1:
			case Attributes.PCOL2:
			case Attributes.PCOL3:
			case Attributes.PCOL4:
			case Attributes.PCOL5:
			case Attributes.POVW:
			case Attributes.POVW1:
			case Attributes.POVW2:
			case Attributes.POVW3:
			case Attributes.POVW4:
			case Attributes.POVW5:
				mediumText = "Probability of " + stormSummaryDictionary.get(STORM_DICT_DEFINITION).get(attr.toUpperCase()) + " during " +
					titleParts.get(TITLE_PART_NAME) + ": " + titleParts.get(TITLE_PART_ADV_FULL);
				break;
			case Attributes.DHIGH:
			case Attributes.DLOW:
				mediumText = stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()) + " (m, NAVD88) for open coast sandy beaches every 1 km alongshore.";
				break;
			case Attributes.MEAN:
			case Attributes.MEAN1:
			case Attributes.MEAN2:
			case Attributes.MEAN3:
			case Attributes.MEAN4:
			case Attributes.MEAN5:
				mediumText = "The storm-induced mean water levels (m, NAVD88), at the shoreline for " + titleParts.get(TITLE_PART_NAME) + ": " + titleParts.get(TITLE_PART_ADV_FULL) + ".";
				break;
			case Attributes.EXTREME:
			case Attributes.EXTREME1:
			case Attributes.EXTREME2:
			case Attributes.EXTREME3:
			case Attributes.EXTREME4:
			case Attributes.EXTREME5:
				mediumText = "The storm-induced extreme (98% exceedance) water levels (m, NAVD88), at the shoreline for " + titleParts.get(TITLE_PART_NAME) + ": " + titleParts.get(TITLE_PART_ADV_FULL) + ".";
				break;
			default: 
				log.warn("Failed to build medium text for unrecognized storm child attr: " + attr);
		}

		medium.setText(mediumText);

		return medium;
	}

	private static Full buildStormChildFullText(Document metadataXml, Map<String, String> titleParts, ParsedMetadata parsedMetadata, String attr) {
		Full full = new Full();
		
		// Add resources, data, and publications
		HashSet<Publication> pubs = new HashSet<>();
		pubs.addAll(transformPublications(parsedMetadata.getResources()));
		pubs.addAll(transformPublications(parsedMetadata.getData()));
		pubs.addAll(transformPublications(parsedMetadata.getPublications()));
		full.setPublications(new ArrayList<>(pubs));

		// Build title and text
		String fullText = "";
		String fullTitle = "";

		switch(attr.toUpperCase()) {
			case Attributes.PIND:
			case Attributes.PIND1:
			case Attributes.PIND2:
			case Attributes.PIND3:
			case Attributes.PIND4:
			case Attributes.PIND5:
			case Attributes.PCOL:
			case Attributes.PCOL1:
			case Attributes.PCOL2:
			case Attributes.PCOL3:
			case Attributes.PCOL4:
			case Attributes.PCOL5:
			case Attributes.POVW:
			case Attributes.POVW1:
			case Attributes.POVW2:
			case Attributes.POVW3:
			case Attributes.POVW4:
			case Attributes.POVW5:
				String runupOrSetup = attr.toUpperCase().contains(Attributes.PIND) ? "setup" : "runup";
				String setupOrElevation = attr.toUpperCase().contains(Attributes.PIND) ? "setup" : "runup elevation";
				fullTitle = stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()) + " during " + titleParts.get(TITLE_PART_NAME) + ": " + titleParts.get(TITLE_PART_ADV_FULL);
				fullText = "These data represent the probability of " + stormSummaryDictionary.get(STORM_DICT_DEFINITION).get(attr.toUpperCase()) + " during " +
					titleParts.get(TITLE_PART_NAME) + ". Estimates were based on observations of dune morphology and modeled storm surge and wave " + runupOrSetup + ". " + 
					buildSurgeDescription(parsedMetadata.getSrcUsed()) + " Maximum wave heights in 20-m water depth, obtained from the NOAA WaveWatch3 model 7-day forecast, were used to compute wave " +
					setupOrElevation + " at the shoreline. Dune elevations were extracted from lidar surveys.";
				break;
			case Attributes.DHIGH:
			case Attributes.DLOW:
				String fullDef = stormSummaryDictionary.get(STORM_DICT_DEFINITION).get(attr.toUpperCase());
				fullTitle = stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()) + " prior to " + titleParts.get(TITLE_PART_NAME);
				fullText = "This dataset contains " + fullDef.substring(0, fullDef.indexOf(",")) + " (m, NAVD88) for the United States coastline. The " + 
					fullDef + " was extracted for open coast sandy beaches from gridded lidar topography every 10 m alongshore and then averaged in 1-km bins. " +
					"Lidar surveys were collected from " + MetadataUtil.extractCollectionDateFromXml(metadataXml, attr) + ".";
				break;
			case Attributes.MEAN:
			case Attributes.MEAN1:
			case Attributes.MEAN2:
			case Attributes.MEAN3:
			case Attributes.MEAN4:
			case Attributes.MEAN5:
				fullTitle = "Modeled " + stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()).toLowerCase() + " during " + titleParts.get(TITLE_PART_NAME) + ": " + titleParts.get(TITLE_PART_ADV_FULL);;
				fullText = "This dataset contains modeled storm-induced mean water levels, which includes both waves and surge, at the shoreline during " + titleParts.get(TITLE_PART_NAME) +
				". Values were computed by summing modeled storm surge and parameterized wave setup, the increase in mean water level at the shoreline due to breaking waves. " + 
				buildSurgeDescription(parsedMetadata.getSrcUsed()) + " Maximum wave heights in 20-m water depth, obtained from the NOAA WaveWatch3 model 7-day forecast, were used to compute " +
				"wave setup at the shoreline.";
				break;
			case Attributes.EXTREME:
			case Attributes.EXTREME1:
			case Attributes.EXTREME2:
			case Attributes.EXTREME3:
			case Attributes.EXTREME4:
			case Attributes.EXTREME5:
				fullTitle = "Modeled " + stormSummaryDictionary.get(STORM_DICT_TITLE).get(attr.toUpperCase()).toLowerCase() + " during " + titleParts.get(TITLE_PART_NAME) + ": " + titleParts.get(TITLE_PART_ADV_FULL);;
				fullText = "This dataset contains modeled storm-induced extreme (98% exceedance) water levels, which includes wave runup and storm surge, at the shoreline during " + titleParts.get(TITLE_PART_NAME) +
				". Values were computed by summing modeled storm surge and parameterized wave runup. " + 
				buildSurgeDescription(parsedMetadata.getSrcUsed()) + " Maximum wave heights in 20-m water depth, obtained from the NOAA WaveWatch3 model 7-day forecast, were used to compute " +
				"wave runup elevations at the shoreline.";
				break;
			default: 
				log.warn("Failed to build full text for unrecognized storm child attr: " + attr);
		}

		full.setText(fullText);
		full.setTitle(fullTitle);

		return full;
	}

	private static List<Publication> transformPublications(List<Publication> sourcePubs) {
		List<Publication> newPubs = new ArrayList<>();

		if(sourcePubs != null && !sourcePubs.isEmpty()) {
			for (Publication pub : sourcePubs) {
				Publication newPub = Publication.copyValues(pub, null);
				newPub.setType(PublicationType.resources);
				newPubs.add(newPub);
			}
		}

		return newPubs;
	}

	private static Full buildStormTemplateFullText(Map<String, String> titleParts, String title, String surgeDescription) {
		Full full = new Full();
		String fullText = "This dataset contains a coastal erosion hazards analysis for " +
			titleParts.get(TITLE_PART_NAME) + ". The analysis is based on a storm-impact scaling model " +
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

	private static String buildSurgeDescription(List<String> srcUsed) {
		String desc = "The storm surge elevations along the open coast were obtained from the " +
		"National Oceanic and Atmospheric Administration";

		if (srcUsed.stream().anyMatch("psurge"::equalsIgnoreCase) || srcUsed.stream().anyMatch("p-surge"::equalsIgnoreCase)) {
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

		String regex = "((Hurricane|[A-Za-z-]*[Tt]ropical \\w+|Extratropical Storm) \\w+).*:\\s*((NHC Advisory (\\d+), )?(.*))";
		Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
		Matcher matcher = pattern.matcher(title);
		//Populate Matches
		while(matcher.find()) {
			if(matcher.groupCount() >= 5) {
				parts.put(TITLE_PART_NAME, matcher.group(1));
				parts.put(TITLE_PART_ADV_FULL, matcher.group(3));
				parts.put(TITLE_PART_ADV_NUM, matcher.group(5));
				parts.put(TITLE_PART_TIME, matcher.group(6));
			} else {
				log.error("Failed to parse title '" + title + "' into parts. Regex returned " + Integer.toString(matcher.groupCount()) + " groups.");
			}
		};

		return parts;
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

		pcolChild.put(attrKey, Attributes.PCOL);
		pcolChild.put(layerIdKey, layerId);
		pcolChild.put(visibleKey, true);
		childList.add(pcolChild);

		povwChild.put(attrKey, Attributes.POVW);
		povwChild.put(layerIdKey, layerId);
		povwChild.put(visibleKey, true);
		childList.add(povwChild);

		pindChild.put(attrKey, Attributes.PIND);
		pindChild.put(layerIdKey, layerId);
		pindChild.put(visibleKey, true);
		childList.add(pindChild);

		dhighChild.put(attrKey, Attributes.DHIGH);
		dhighChild.put(layerIdKey, layerId);
		dhighChild.put(visibleKey, false);
		childList.add(dhighChild);

		dlowChild.put(attrKey, Attributes.DLOW);
		dlowChild.put(layerIdKey, layerId);
		dlowChild.put(visibleKey, false);
		childList.add(dlowChild);

		meanChild.put(attrKey, Attributes.MEAN);
		meanChild.put(layerIdKey, layerId);
		meanChild.put(visibleKey, false);
		childList.add(meanChild);

		extremeChild.put(attrKey, Attributes.EXTREME);
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

	public static Item findTrackChildItem(Item stormItem) {
		if(stormItem.getChildren() != null && stormItem.getItemType() == ItemType.template && stormItem.getType() == Item.Type.storms) {
			for(Item child : stormItem.getChildren()) {
				if(child.getName() != null && child.getName().equals("track") && child.getItemType() == ItemType.aggregation) {
					return child;
				}
			}
		}

		return null;
	}
}