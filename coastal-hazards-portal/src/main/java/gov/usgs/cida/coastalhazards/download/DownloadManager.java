package gov.usgs.cida.coastalhazards.download;

import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.Session;
import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.UUID;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class DownloadManager {

    public static File createDownloadStagingArea() throws IOException {
        String downloadDir = JNDISingleton.getInstance().getProperty("coastal-hazards.files.directory.download",
                System.getProperty("java.io.tmpdir"));
        UUID uuid = UUID.randomUUID();
        File tmpDir = new File(downloadDir + File.separator + uuid.toString());
        FileUtils.forceMkdir(tmpDir);
        return tmpDir;
    }
    
    /**
     * This will need some refactoring because it is real messy
     * @param stageThis
     * @param stagingDir 
     */
    public static void stageItemDownload(Item stageThis, File stagingDir) throws IOException {
        List<SingleDownload> downloadList = new LinkedList<>();
        SingleDownload download = new SingleDownload();

        Queue<Item> itemQueue = new LinkedList<>();
        itemQueue.add(stageThis);
        // Important that there are no cycles in the data model, this could go on forever
        // TODO enforce acyclic model somewhere in the Items themselves
        // (i.e. an item that sees itself in the subtree throws an exception)
        while (itemQueue.peek() != null) {
            Item currentItem = itemQueue.poll();
            WFSService wfs = currentItem.getWfsService();
            if (wfs.isValid() && !wfs.equals(download.getWfs())) {
                if (download.isValid()) {
                    downloadList.add(download);
                }
                download = new SingleDownload();
                download.setWfs(wfs);
                download.setName(currentItem.getName());
            }
            
            String attr = currentItem.getAttr();
            if (StringUtils.isNotBlank(attr)) {
                download.addAttr(attr);
            }
            
            List<Item> children = currentItem.getChildren();
            itemQueue.addAll(children);
        }
        // left over download should be assembled
        if (download.isValid()) {
            downloadList.add(download);
        }
        
        List<String> namesUsed = new ArrayList<>();
        for (SingleDownload stagedDownload : downloadList) {
            while (namesUsed.contains(stagedDownload.getName())) {
                stagedDownload.incrementName();
            }
            namesUsed.add(stagedDownload.getName());
            
            // TODO try/catch this to isolate/retry problem downloads
            stagedDownload.stage(stagingDir);
        }
    }
    
    /**
     * TODO stage all the items with some smarts about naming and such
     * @param stageThis
     * @param stagingDir 
     */
    public static void stageSessionDownload(Session stageThis, File stagingDir) {
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
