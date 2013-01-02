package gov.usgs.cida.coastalhazards.wps;

import java.net.URL;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.coverage.grid.GridCoverage2D;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
        title = "Generate Transects",
        description = "Create a transect layer from the baseline and shorelines",
        version = "1.0.0")
public class GenerateTransectsProcess implements GeoServerProcess {

    /* May actually want to return reference to new layer*/
    @DescribeResult(name = "transects", description = "Layer containing Transects normal to baseline")
    public URL execute(
            @DescribeParameter(name = "shorelines", min = 1) SimpleFeatureCollection shorelines,
            @DescribeParameter(name = "baseline", min = 1, max = 1) SimpleFeatureCollection baseline,
            @DescribeParameter(name = "spacing", min = 1, max = 1) Float spacing) throws Exception {
        return null;
    }
    
    private class Process {
        
        private Process(SimpleFeatureCollection shorelines,
                SimpleFeatureCollection baseline,
                float spacing) {
            
        }
        
        private URL execute() throws Exception {
            return null;
        }
    }
}
