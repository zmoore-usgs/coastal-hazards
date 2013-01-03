package gov.usgs.cida.coastalhazards.wps;

import java.net.URL;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.PrecisionModel;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.geotools.feature.FeatureCollection;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.FeatureType;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
        title = "Generate Transects",
        description = "Create a transect layer from the baseline and shorelines",
        version = "1.0.0")
public class GenerateTransectsProcess implements GeoServerProcess {
    
    private static final CoordinateReferenceSystem ACCEPTED_CRS = DefaultGeographicCRS.WGS84;

    /* May actually want to return reference to new layer*/
    @DescribeResult(name = "transects", description = "Layer containing Transects normal to baseline")
    public URL execute(
            @DescribeParameter(name = "shorelines", min = 1, max = 1) SimpleFeatureCollection shorelines,
            @DescribeParameter(name = "baseline", min = 1, max = 1) SimpleFeatureCollection baseline,
            @DescribeParameter(name = "spacing", min = 1, max = 1) Float spacing) throws Exception {
        return null;
    }
    
    private class Process {
        
        private final FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines;
        private final FeatureCollection<SimpleFeatureType, SimpleFeature> baseline;
        private final float spacing;
        
        private final GeometryFactory geometryFactory;
        
        private Process(SimpleFeatureCollection shorelines,
                SimpleFeatureCollection baseline,
                float spacing) {
            this.shorelines = shorelines;
            this.baseline = baseline;
            this.spacing = spacing;
            
            geometryFactory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));
        }
        
        private URL execute() throws Exception {
            CoordinateReferenceSystem shorelinesCrs = findCRS(shorelines);
            CoordinateReferenceSystem baselineCrs = findCRS(baseline);
            if (!shorelinesCrs.equals(ACCEPTED_CRS)) {
                throw new UnsupportedCoordinateReferenceSystemException("Shorelines are not in accepted projection");
            }
            if (!baselineCrs.equals(ACCEPTED_CRS)) {
                throw new UnsupportedCoordinateReferenceSystemException("Baseline is not in accepted projection");
            }
            return null;
        }
        
        private CoordinateReferenceSystem findCRS(FeatureCollection simpleFeatureCollection) {
            FeatureCollection shorelineFeatureCollection = (FeatureCollection)simpleFeatureCollection;
            FeatureType ft = shorelineFeatureCollection.getSchema();
            CoordinateReferenceSystem coordinateReferenceSystem = ft.getCoordinateReferenceSystem();
            return coordinateReferenceSystem;
        }
    }
}
