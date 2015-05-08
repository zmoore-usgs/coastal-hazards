package gov.usgs.cida.coastalhazards;

import java.lang.reflect.Field;
import java.util.HashSet;
import java.util.Set;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class Attributes {

	public static final Set<String> set = new HashSet<>();
	
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
}
