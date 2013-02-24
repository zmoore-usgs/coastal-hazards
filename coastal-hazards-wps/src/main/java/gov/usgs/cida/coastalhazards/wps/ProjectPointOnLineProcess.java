package gov.usgs.cida.coastalhazards.wps;

import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.feature.FeatureCollection;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;

/**
 *
 * @author tkunicki
 */

@DescribeProcess(
    title = "ProjectPointOnLine",
    description = "Point projected onto nearest line segment in line calculated in CRS of line.",
    version = "1.0.0")
public class ProjectPointOnLineProcess implements GeoServerProcess {
    
    public ProjectPointOnLineProcess() {
    }
    
    @DescribeResult(name = "point", description = "Point projected onto nearest line segment of line")
    public String execute(
            @DescribeParameter(name="lines", description="feature collection with lines to project point upon", min = 1, max = 1)
                    FeatureCollection features,
            @DescribeParameter(name="point", description="point in EWKT format", min = 1, max = 1)
                    String pointEWKT
            ) throws Exception
    {
        return new Process(features, pointEWKT).execute();
    }
    
    public class Process {
        
        private final FeatureCollection featureCollection;
        private final String pointEWKT;
        
        Process(FeatureCollection featureCollection, String pointEWKT) {
            this.featureCollection = featureCollection;
            this.pointEWKT = pointEWKT;
        }
        
        public String execute() throws Exception {
            return pointEWKT;
        }
    }
}
