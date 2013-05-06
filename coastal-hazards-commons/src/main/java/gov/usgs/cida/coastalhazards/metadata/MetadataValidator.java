package gov.usgs.cida.coastalhazards.metadata;

import java.io.File;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class MetadataValidator {
    
    private File metadataFile;
    
    public MetadataValidator(File metadataFile) {
        this.metadataFile = metadataFile;
    }
    
    public boolean validateFGDC() {
        return false;
    }
    
}
