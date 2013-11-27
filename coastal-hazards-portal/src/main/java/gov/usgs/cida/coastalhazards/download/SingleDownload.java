package gov.usgs.cida.coastalhazards.download;

import gov.usgs.cida.coastalhazards.export.FeatureCollectionExport;
import gov.usgs.cida.coastalhazards.export.WFSExportClient;
import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
import java.io.File;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.geotools.data.simple.SimpleFeatureCollection;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class SingleDownload {

    private WFSService wfs;
    private List<String> attrs;
    private String name;

    private static final Pattern incrementPattern = Pattern.compile("(.*)(\\d+)$");

    public SingleDownload() {
        wfs = null;
        attrs = new LinkedList<>();
        name = null;
    }

    /**
     * Write shapefile for this download to the staging directory
     * Currently only supports WGS84 output
     * @param stagingDir temporary staging directory
     * @throws IOException usually means cannot contact server
     */
    public void stage(File stagingDir) throws IOException {
        WFSExportClient wfsClient = new WFSExportClient();
        wfsClient.setupDatastoreFromEndpoint(wfs.getEndpoint());
        String[] typeNames = wfsClient.getTypeNames();
        if (!ArrayUtils.contains(typeNames, wfs.getTypeName())) {
            // make this a new typed exception
            // also, while I wrote this I forgot that logging exists ...
            throw new RuntimeException("typeName not supported for specified service");
        }
        SimpleFeatureCollection featureCollection = wfsClient.getFeatureCollection(wfs.getTypeName());
        FeatureCollectionExport export = new FeatureCollectionExport(featureCollection, stagingDir, name);
        for (String attr : attrs) {
            export.addAttribute(attr);
        }
        
        export.writeToShapefile();
    }

    public WFSService getWfs() {
        return wfs;
    }

    public void setWfs(WFSService wfs) {
        this.wfs = wfs;
    }

    public List<String> getAttrs() {
        return attrs;
    }

    public void addAttr(String attr) {
        this.attrs.add(attr);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    /**
     * Some goofy regex stuff that I probably didn't need to do today
     */
    public void incrementName() {
        if (name == null) {
            name = "file1";
        }
        else {
            Matcher incrementMatcher = incrementPattern.matcher(name);
            if (incrementMatcher.matches()) {
                String firstPart = incrementMatcher.group(1);
                int numberPart = Integer.parseInt(incrementMatcher.group(2));
                name = firstPart + String.valueOf(numberPart + 1);
            } else {
                name = name + "1";
            }
        }
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 47 * hash + Objects.hashCode(this.wfs);
        hash = 47 * hash + Objects.hashCode(this.attrs);
        hash = 47 * hash + Objects.hashCode(this.name);
        return hash;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final SingleDownload other = (SingleDownload) obj;
        if (!Objects.equals(this.wfs, other.wfs)) {
            return false;
        }
        if (!Objects.equals(this.attrs, other.attrs)) {
            return false;
        }
        if (!Objects.equals(this.name, other.name)) {
            return false;
        }
        return true;
    }

    public boolean isValid() {
        return (wfs != null && wfs.isValid() && StringUtils.isNotBlank(name) && !attrs.isEmpty());
    }

}
