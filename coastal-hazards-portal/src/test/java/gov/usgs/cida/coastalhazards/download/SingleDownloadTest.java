package gov.usgs.cida.coastalhazards.download;

import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import org.junit.Ignore;
import org.junit.Test;

/**
 *
 * @author jiwalker
 */
public class SingleDownloadTest {
    
    /**
     * Same problem with external resource, but this is good for gutcheck test
     * @throws IOException 
     */
    @Test
    @Ignore
    public void quickStagingTest() throws IOException {
        List<String> missing = new LinkedList<>();
        SingleDownload singleDownload = new SingleDownload();
        singleDownload.setName("test");
        WFSService wfs = new WFSService();
        wfs.setEndpoint("http://cida-wiwsc-cchdev:8081/geoserver/wfs");
        wfs.setTypeName("proxied:sandy_example");
        singleDownload.setWfs(wfs);
        singleDownload.addAttr("PCOL");
        singleDownload.addAttr("POVW");
        singleDownload.stage(DownloadUtility.createDownloadStagingArea(), missing);
    }
    
    @Test
    @Ignore
    public void testRemoveSHAPELEN() throws IOException {
        List<String> missing = new LinkedList<>();
        SingleDownload singleDownload = new SingleDownload();
        singleDownload.setName("test");
        WFSService wfs = new WFSService();
        wfs.setEndpoint("http://olga.er.usgs.gov/stpgis/services/Vulnerability/GOM_erosion_hazards/MapServer/WFSServer");
        wfs.setTypeName("Vulnerability_GOM_erosion_hazards:Gulf_of_Mexico_Erosion_Hazards");
        singleDownload.setWfs(wfs);
        singleDownload.stage(DownloadUtility.createDownloadStagingArea(), missing);
    }
    
}
