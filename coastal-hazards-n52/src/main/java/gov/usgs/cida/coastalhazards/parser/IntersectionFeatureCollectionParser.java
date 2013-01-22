package gov.usgs.cida.coastalhazards.parser;

import java.io.InputStream;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.n52.wps.io.data.IData;
import org.n52.wps.io.datahandler.parser.AbstractParser;
import org.geotools.data.DataUtilities;
import org.n52.wps.io.data.binding.complex.GTVectorDataBinding;

/**
 *
 * @author jiwalker
 */
public class IntersectionFeatureCollectionParser extends AbstractParser {

    @Override
    public GTVectorDataBinding parse(InputStream input, String mimetype, String schema) {
        
        
        //GTVectorDataBinding binding = new GTVectorDataBinding(new GMLStreamingFeatureCollection(tempFile));
        
        throw new UnsupportedOperationException("Not supported yet.");
    }
    
}
