package gov.usgs.cida.coastalhazards.sld;

import static gov.usgs.cida.coastalhazards.sld.Pcoi.attrs;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author dmsibley
 */
public class SLDConfig {
	private static final Logger log = LoggerFactory.getLogger(SLDConfig.class);
	
	protected final String jspPath;
	protected final String units;
	protected final String style;
	protected final int strokeWidth;
	protected final String[] attrs;
	protected final float[] thresholds;
	protected final String[] colors;
	protected final List<Map<String,Object>> bins;
	
	protected final int[] scales = new int[] {
		1000000000,
		50000000,
		25000000,
		10000000,
		5000000,
		2500000,
		1000000,
		500000,
		250000,
		100000,
		50000,
		25000,
		10000,
		5000,
		2500,
		1000,
		500,
		1
	};

	public SLDConfig(String jspPath, String units, String style, int strokeWidth, String[] attrs, float[] thresholds, String[] colors, List<Map<String,Object>> bins) {
		this.jspPath = jspPath;
		this.units = units;
		this.style = style;
		this.strokeWidth = strokeWidth;
		this.attrs = attrs;
		this.thresholds = thresholds;
		this.colors = colors;
		this.bins = bins;
	}
	
	public String getJspPath() {
		return this.jspPath;
	}
	
	public String getUnits() {
		return this.units;
	}
	
	public String getStyle() {
		return this.style;
	}
	
	public int getStrokeWidth() {
		return this.strokeWidth;
	}
	
	public String[] getAttrs() {
        return this.attrs;
    }
	
	public float[] getThresholds() {
        return this.thresholds;
    }

    public String[] getColors() {
        return this.colors;
    }
	
	public List<Map<String,Object>> getBins() {
		return this.bins;
	}
	
	public int[] getScales() {
		return this.scales;
	}
	
}
