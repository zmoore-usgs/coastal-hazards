package gov.usgs.cida.coastalhazards.sld;

import gov.usgs.cida.coastalhazards.exception.BadRequestException;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.rest.data.util.ItemUtil;
import gov.usgs.cida.coastalhazards.sld.Shorelines.ShorelineConfig;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.SortedSet;

import javax.ws.rs.core.Response;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.glassfish.jersey.server.mvc.Viewable;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class SLDGenerator {

	protected static final String style = "cch";
	protected static final int STROKE_WIDTH_DEFAULT = 3;
	protected static final float STROKE_OPACITY_DEFAULT = 1;
	static final LegendType LEGEND_TYPE_DEFAULT = LegendType.DISCRETE;
	protected final Item item;
	protected final Integer ribbon;
	protected final SLDConfig config;

	protected static final EnumMap<Item.Type, Map<String, SLDConfig>> generatorMap;

	static {
		EnumMap<Item.Type, Map<String, SLDConfig>> gmap = new EnumMap<>(Item.Type.class);

		Map<String, SLDConfig> stormsMap = new HashMap<>();
		sideEffectMapPut(stormsMap, Pcoi.pcoi);
		sideEffectMapPut(stormsMap, Extreme.extreme);
		sideEffectMapPut(stormsMap, DuneHeight.duneCrest);
		sideEffectMapPut(stormsMap, DuneHeight.duneToe);
		sideEffectMapPut(stormsMap, MeanWaterLevel.mean);
		sideEffectMapPut(stormsMap, TCx.tcx);
		gmap.put(Item.Type.storms, stormsMap);

		Map<String, SLDConfig> vulnerability = new HashMap<>();
		sideEffectMapPut(vulnerability, BayesianProbablityCVI.bayes);
		sideEffectMapPut(vulnerability, BayesianSLRCVI.rslr);
		sideEffectMapPut(vulnerability, BayesianWaveHeightCVI.mwh);
		sideEffectMapPut(vulnerability, BayesianTidalRangeCVI.tr);
		sideEffectMapPut(vulnerability, BayesianErateCVI.erate);
		sideEffectMapPut(vulnerability, OldSchoolComponentCVI.componentOldSchool);
		sideEffectMapPut(vulnerability, RasterAE.rasterConfig); //raster ae -adjusted elevation
		sideEffectMapPut(vulnerability, RasterPAE.rasterConfig); //raster pae -probability
		sideEffectMapPut(vulnerability, RasterCR.rasterConfig); //raster cr - coastal response
		sideEffectMapPut(vulnerability, RasterUvvr.rasterConfig); //raster uvvr - unvegetated/vegetated ratio
		sideEffectMapPut(vulnerability, OldSchoolOverallCVI.overallOldSchool);
		sideEffectMapPut(vulnerability, Uvvr.uvvr);
		sideEffectMapPut(vulnerability, FloodMask.floodMask);
		sideEffectMapPut(vulnerability, Forecast.forecast);
		sideEffectMapPut(vulnerability, ForecastUncy.forecastUncy);
		gmap.put(Item.Type.vulnerability, vulnerability);

		Map<String, SLDConfig> historical = new HashMap<>();
		sideEffectMapPut(historical, Shorelines.shorelines);
		sideEffectMapPut(historical, Rates.rates);
		gmap.put(Item.Type.historical, historical);

		Map<String, SLDConfig> mixed = new HashMap<>();
		gmap.put(Item.Type.mixed, mixed);

		generatorMap = gmap;
	}

	protected static void sideEffectMapPut(Map<String, SLDConfig> map, SLDConfig conf) {
		for (String attr : conf.attrs) {
			map.put(attr, conf);
		}
	}

	public static SLDGenerator getGenerator(Item item, String selectedId, Integer ribbon) {
		SLDGenerator generator = null;

		Item.Type itemDotType = item.getType();
		Item.ItemType itemType = item.getItemType();
		if (itemType == Item.ItemType.data) {
			String itemAttribute = item.getAttr();

			Map<String, SLDConfig> typeLookup = generatorMap.get(itemDotType);
			SLDConfig conf = typeLookup.get(StringUtils.upperCase(itemAttribute));

			if (null != conf) {
				generator = new SLDGenerator(item, selectedId, ribbon, conf);
			}
		} else if (itemType == Item.ItemType.aggregation || itemType == Item.ItemType.template) {
			SortedSet<String> aggAttributes = ItemUtil.gatherAttributes(item);
			Map<String, SLDConfig> typeLookup = generatorMap.get(itemDotType);
			// TODO enforce all attributes map to same SLD type
			SLDConfig conf = typeLookup.get(StringUtils.upperCase(aggAttributes.first()));
			generator = new SLDGenerator(item, selectedId, ribbon, conf);
		} else {
			throw new BadRequestException();
		}

		if (null == generator) {
			String message = String.format("No generator available for Type %s and ItemType %s.", itemType, itemDotType);
			throw new IllegalArgumentException(message);
		}

		return generator;
	}

	public static boolean isValidAttr(SLDConfig config, String attr) {
		return ArrayUtils.contains(config.getAttrs(), attr.toUpperCase());
	}

	/**
	 * Use SLDGenerator.getGenerator(item, ribbon) instead.
	 *
	 * @param item
	 * @param ribbon
	 * @param config
	 */
	protected SLDGenerator(Item item, String selectedId, Integer ribbon, SLDConfig config) {
		this.item = item;
		this.ribbon = ribbon;
		if (config instanceof ShorelineConfig) {
			ShorelineConfig slc = (ShorelineConfig) config;
			slc.finalize(selectedId);
			this.config = slc;
		} else {
			this.config = config;
		}
	}

	public Response generateSLD() {
		return Response.ok(new Viewable(this.config.getJspPath(), this)).build();
	}

	public Response generateSLDInfo() {
		Map<String, Object> sldInfo = new LinkedHashMap<>(1);
		sldInfo.put("title", this.item.getSummary().getTiny().getText());
		sldInfo.put("units", this.config.getUnits());
		sldInfo.put("style", this.config.getStyle());
		sldInfo.put("bins", this.config.getBins());
		sldInfo.put("legendType", this.config.getLegendType());
		String toJson = GsonUtil.getDefault().toJson(sldInfo, HashMap.class);
		return Response.ok(toJson).build();
	}

	public String[] getAttrs() {
		SortedSet<String> attrSet = ItemUtil.gatherAttributes(item);
		String[] attrs = attrSet.toArray(new String[0]);
		return attrs;
	}

	public String getId() {
		return this.item.fetchWmsService().getLayers();
	}

	public String getStyle() {
		return style;
	}

	public Integer getRibbon() {
		return this.ribbon;
	}

	public int getStrokeWidth() {
		return this.config.getStrokeWidth();
	}

	public float getStrokeOpacity() {
		return this.config.getStrokeOpacity();
	}

	/**
	 * Should deprecate this as we want to get attr from children Works now
	 * because item is mostly assumed to be leaf
	 *
	 * @return name of attribute
	 */
	public String getAttr() {
		return this.item.getAttr();
	}

	public float[] getThresholds() {
		return this.config.getThresholds();
	}

	public String[] getColors() {
		return this.config.getColors();
	}

	public int getBinCount() {
		return this.config.getColors().length;
	}

	public int[] getScales() {
		return this.config.getScales();
	}

	public int getScaleCount() {
		return this.config.getScales().length;
	}
}
