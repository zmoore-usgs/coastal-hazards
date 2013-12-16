package gov.usgs.cida.coastalhazards.download;

import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
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
        wfs.setEndpoint("http://coastalmap.marine.usgs.gov/cmgp/National/cvi_WFS/MapServer/WFSServer");
        wfs.setTypeName("National_cvi_WFS:GulfofMexico_CVI");
        singleDownload.setWfs(wfs);
        singleDownload.addAttr("CVI");
        singleDownload.addAttr("SLRISK");
        singleDownload.stage(DownloadManager.createDownloadStagingArea(), missing);
    } 
    
}
