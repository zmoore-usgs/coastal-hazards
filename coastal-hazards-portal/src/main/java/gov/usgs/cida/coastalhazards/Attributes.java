package gov.usgs.cida.coastalhazards;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class Attributes {

	static final Set<String> set = new HashSet<>();

	public static final String E_RATE = "E_RATE";
	public static final String ERATE = "ERATE";

	public static final String PSTABLE = "PSTABLE";
	public static final String PEROS1 = "PEROS1";
	public static final String PEROS2 = "PEROS2";
	public static final String PACCRETI_1 = "PACCRETI_1";
	public static final String PACCRETION = "PACCRETION";
	public static final String PACC1 = "PACC1";
	public static final String PACC2 = "PACC2";
	public static final String PEROSION1 = "PEROSION1";
	public static final String PEROSION2 = "PEROSION2";

	public static final String SLR = "SLR";
	public static final String RSLR = "RSLR";

	public static final String TR = "TR";
	public static final String TIDES = "TIDES";

	public static final String MWH = "MWH";
	public static final String WAVES = "WAVES";

	public static final String DLOW = "DLOW";
	public static final String DHIGH = "DHIGH";

	public static final String EXTREME = "EXTREME";
	public static final String EXTREME1 = "EXTREME1";
	public static final String EXTREME2 = "EXTREME2";
	public static final String EXTREME3 = "EXTREME3";
	public static final String EXTREME4 = "EXTREME4";
	public static final String EXTREME5 = "EXTREME5";

	public static final String MEAN = "MEAN";
	public static final String MEAN1 = "MEAN1";
	public static final String MEAN2 = "MEAN2";
	public static final String MEAN3 = "MEAN3";
	public static final String MEAN4 = "MEAN4";
	public static final String MEAN5 = "MEAN5";

	public static final String SLOPERISK = "SLOPERISK";
	public static final String GEOM = "GEOM";
	public static final String ERRRISK = "ERRRISK";
	public static final String TIDERISK = "TIDERISK";
	public static final String SLRISK = "SLRISK";
	public static final String WAVERISK = "WAVERISK";

	public static final String CVIRISK = "CVIRISK";

	public static final String PCOL = "PCOL";
	public static final String PCOL1 = "PCOL1";
	public static final String PCOL2 = "PCOL2";
	public static final String PCOL3 = "PCOL3";
	public static final String PCOL4 = "PCOL4";
	public static final String PCOL5 = "PCOL5";

	public static final String POVW = "POVW";
	public static final String POVW1 = "POVW1";
	public static final String POVW2 = "POVW2";
	public static final String POVW3 = "POVW3";
	public static final String POVW4 = "POVW4";
	public static final String POVW5 = "POVW5";

	public static final String PIND = "PIND";
	public static final String PIND1 = "PIND1";
	public static final String PIND2 = "PIND2";
	public static final String PIND3 = "PIND3";
	public static final String PIND4 = "PIND4";
	public static final String PIND5 = "PIND5";

	public static final String WLR = "WLR";
	public static final String NSM = "NSM";
	public static final String SCE = "SCE";
	public static final String EPR = "EPR";
	public static final String LRR = "LRR";

	public static final String DATE_ = "DATE_";
	public static final String DATE = "DATE";

	public static final String NHC_TRACK_POLY = "NHC_TRACK_POLY";
	public static final String NHC_TRACK_LIN = "NHC_TRACK_LIN";
	public static final String NHC_TRACK_PT = "NHC_TRACK_PT";
	public static final String NHC_TRACK_WWLIN = "NHC_TRACK_WWLIN";
	public static final String NHC_TRACK_PT_72DATE = "NHC_TRACK_PT_72DATE";
	public static final String NHC_TRACK_PT_120DATE = "NHC_TRACK_PT_120DATE";
	public static final String NHC_TRACK_PT_0NAMEDATE = "NHC_TRACK_PT_0NAMEDATE";
	public static final String NHC_TRACK_PT_MSLPLABELS = "NHC_TRACK_PT_MSLPLABELS";
	public static final String NHC_TRACK_PT_72WLBL = "NHC_TRACK_PT_72WLBL";
	public static final String NHC_TRACK_PT_120WLBL = "NHC_TRACK_PT_120WLBL";
	public static final String NHC_TRACK_PT_72CAT = "NHC_TRACK_PT_72CAT";
	public static final String NHC_TRACK_PT_120CAT = "NHC_TRACK_PT_120CAT";

	public static final String UVVR = "UVVR"; //vulnerability index

	public static final String FORECASTPE = "FORECASTPE"; //shoreline forecast
	public static final String FORECAST_U = "FORECAST_U"; //U - Uncertainty, shapefile fields 10-character limit
	
	public static final String TCT = "TCT";
	public static final String TC2 = "TC2";
	public static final String TC5 = "TC5";

	public static final String FL_MASK_ID = "FL_MASK_ID";

	//raster attr
	public static final String GRAY_INDEX = "GRAY_INDEX";
	public static final String AE = "AE";  //adjusted elevation
	public static final String PAE = "PAE";  //adjusted elevation probability
	public static final String CR = "CR";  //coastal response
	public static final String UVVR_RASTER = "UVVR_RASTER"; //unvegetated to vegetated ratio, raster

	static {
		Field[] fields = Attributes.class.getFields();
		for (Field field : fields) {
			try {
				if (!field.isSynthetic() && field.getType() == String.class) {
					set.add((String)field.get(null));
				}
			} catch (IllegalArgumentException | IllegalAccessException ex) {
				// don't care
			}
		}
	}

	public static boolean contains(String attribute) {
		return set.contains(attribute);
	}

	public static Set<String> getAllAttrs() {
		return set;
	}

	public static Set<String> getRasterAttrs() {
		Set<String> raster = new HashSet<>();
		raster.add(GRAY_INDEX);
		raster.add(AE);
		raster.add(PAE);
		raster.add(CR);
		raster.add(UVVR_RASTER);
		return raster;
	}

	public static Set<String> getStormTrackAttrs() {
		Set<String> tracks = new HashSet<>();
		tracks.add(NHC_TRACK_POLY);
		tracks.add(NHC_TRACK_LIN);
		tracks.add(NHC_TRACK_PT);
		tracks.add(NHC_TRACK_WWLIN);
		tracks.add(NHC_TRACK_PT_72DATE);
		tracks.add(NHC_TRACK_PT_120DATE);
		tracks.add(NHC_TRACK_PT_0NAMEDATE);
		tracks.add(NHC_TRACK_PT_MSLPLABELS);
		tracks.add(NHC_TRACK_PT_72WLBL);
		tracks.add(NHC_TRACK_PT_120WLBL);
		tracks.add(NHC_TRACK_PT_72CAT);
		tracks.add(NHC_TRACK_PT_120CAT);
		return tracks;
	}
	
	public static Set<String> getPCOIAttrs() {
		Set<String> pcois = new HashSet<>();
		pcois.add(PCOL);
		pcois.add(PCOL1);
		pcois.add(PCOL2);
		pcois.add(PCOL3);
		pcois.add(PCOL4);
		pcois.add(PCOL5);

		pcois.add(POVW);
		pcois.add(POVW1);
		pcois.add(POVW2);
		pcois.add(POVW3);
		pcois.add(POVW4);
		pcois.add(POVW5);

		pcois.add(PIND);
		pcois.add(PIND1);
		pcois.add(PIND2);
		pcois.add(PIND3);
		pcois.add(PIND4);
		pcois.add(PIND5);
		return pcois;
	}
	
	public static Set<String> getRibbonableAttrs() {
		Set<String> ribbonableAttrs = new HashSet<>();
		ribbonableAttrs.addAll(getPCOIAttrs());
		ribbonableAttrs.add(TR);
		ribbonableAttrs.add(TIDES);
		ribbonableAttrs.add(MWH);
		ribbonableAttrs.add(WAVES);
		ribbonableAttrs.add(DLOW);
		ribbonableAttrs.add(DHIGH);
		ribbonableAttrs.add(EXTREME);
		ribbonableAttrs.add(EXTREME1);
		ribbonableAttrs.add(EXTREME2);
		ribbonableAttrs.add(EXTREME3);
		ribbonableAttrs.add(EXTREME4);
		ribbonableAttrs.add(EXTREME5);
		ribbonableAttrs.add(MEAN);
		ribbonableAttrs.add(MEAN1);
		ribbonableAttrs.add(MEAN2);
		ribbonableAttrs.add(MEAN3);
		ribbonableAttrs.add(MEAN4);
		ribbonableAttrs.add(MEAN5);
		return ribbonableAttrs;
	}

	public static Set<String> getPolygonAttrs() {
		Set<String> polys = new HashSet<>();
		polys.add(UVVR);
		polys.add(FL_MASK_ID);
		return polys;
	}
}
