package gov.usgs.cida.coastalhazards.metadata;

/**
 * Simple transfer object for CRS parameters
 * @author smlarson
 */
public class CRSParameters {
                private String gcs;
                private String primeM;
                private String unit;
                private String projection;
                private String lengthUnit;
                private double lengthValue;
                private String ellips;
                private String horizdn;
                private double denflat;
                private double semiaxis;
                private String mapprojn;
                private double feast;
                private double fnorth;
                private double latprjo;
                private double longcm;
                private double stdparll;

    /**
     * @return the gcs
     */
    public String getGcs() {
        return gcs;
    }

    /**
     * @param gcs the gcs to set
     */
    public void setGcs(String gcs) {
        this.gcs = gcs;
    }

    /**
     * @return the primeM
     */
    public String getPrimeM() {
        return primeM;
    }

    /**
     * @param primeM the primeM to set
     */
    public void setPrimeM(String primeM) {
        this.primeM = primeM;
    }

    /**
     * @return the unit
     */
    public String getUnit() {
        return unit;
    }

    /**
     * @param unit the unit to set
     */
    public void setUnit(String unit) {
        this.unit = unit;
    }

    /**
     * @return the projection
     */
    public String getProjection() {
        return projection;
    }

    /**
     * @param projection the projection to set
     */
    public void setProjection(String projection) {
        this.projection = projection;
    }

    /**
     * @return the lengthUnit
     */
    public String getLengthUnit() {
        return lengthUnit;
    }

    /**
     * @param lengthUnit the lengthUnit to set
     */
    public void setLengthUnit(String lengthUnit) {
        this.lengthUnit = lengthUnit;
    }

    /**
     * @return the lengthValue
     */
    public double getLengthValue() {
        return lengthValue;
    }

    /**
     * @param lengthValue the lengthValue to set
     */
    public void setLengthValue(double lengthValue) {
        this.lengthValue = lengthValue;
    }

    /**
     * @return the ellips
     */
    public String getEllips() {
        return ellips;
    }

    /**
     * @param ellips the ellips to set
     */
    public void setEllips(String ellips) {
        this.ellips = ellips;
    }

    /**
     * @return the horizdn
     */
    public String getHorizdn() {
        return horizdn;
    }

    /**
     * @param horizdn the horizdn to set
     */
    public void setHorizdn(String horizdn) {
        this.horizdn = horizdn;
    }

    /**
     * @return the denflat
     */
    public double getDenflat() {
        return denflat;
    }

    /**
     * @param denflat the denflat to set
     */
    public void setDenflat(double denflat) {
        this.denflat = denflat;
    }

    /**
     * @return the semiaxis
     */
    public double getSemiaxis() {
        return semiaxis;
    }

    /**
     * @param semiaxis the semiaxis to set
     */
    public void setSemiaxis(double semiaxis) {
        this.semiaxis = semiaxis;
    }

    /**
     * @return the mapprojn
     */
    public String getMapprojn() {
        return mapprojn;
    }

    /**
     * @param mapprojn the mapprojn to set
     */
    public void setMapprojn(String mapprojn) {
        this.mapprojn = mapprojn;
    }

    /**
     * @return the feast
     */
    public double getFeast() {
        return feast;
    }

    /**
     * @param feast the feast to set
     */
    public void setFeast(double feast) {
        this.feast = feast;
    }

    /**
     * @return the fnorth
     */
    public double getFnorth() {
        return fnorth;
    }

    /**
     * @param fnorth the fnorth to set
     */
    public void setFnorth(double fnorth) {
        this.fnorth = fnorth;
    }

    /**
     * @return the latprjo
     */
    public double getLatprjo() {
        return latprjo;
    }

    /**
     * @param latprjo the latprjo to set
     */
    public void setLatprjo(double latprjo) {
        this.latprjo = latprjo;
    }

    /**
     * @return the longcm
     */
    public double getLongcm() {
        return longcm;
    }

    /**
     * @param longcm the longcm to set
     */
    public void setLongcm(double longcm) {
        this.longcm = longcm;
    }

    /**
     * @return the stdparll
     */
    public double getStdparll() {
        return stdparll;
    }

    /**
     * @param stdparll the stdparll to set
     */
    public void setStdparll(double stdparll) {
        this.stdparll = stdparll;
    }
                
}
