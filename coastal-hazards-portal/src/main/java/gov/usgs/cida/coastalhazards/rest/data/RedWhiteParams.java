package gov.usgs.cida.coastalhazards.rest.data;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class RedWhiteParams {

    public final int NUMBER_OF_BINS = 10;
    public final int STROKE_WIDTH = 3;
    public final int STROKE_OPACITY = 1;
    private String id;
    private String attr;
    private float[] thresholds;
    private String[] colors;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAttr() {
        return attr;
    }

    public void setAttr(String attr) {
        this.attr = attr;
    }

    public float[] getThresholds() {
        return thresholds;
    }

    public void setThresholds(float[] thresholds) {
        this.thresholds = thresholds;
    }

    public String[] getColors() {
        return colors;
    }

    public void setColors(String[] colors) {
        this.colors = colors;
    }

    public int getNUMBER_OF_BINS() {
        return NUMBER_OF_BINS;
    }

    public int getSTROKE_WIDTH() {
        return STROKE_WIDTH;
    }

    public int getSTROKE_OPACITY() {
        return STROKE_OPACITY;
    }
    
}
