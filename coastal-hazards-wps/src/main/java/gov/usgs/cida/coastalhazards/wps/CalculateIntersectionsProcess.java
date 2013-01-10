package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.geom.MultiLineString;
import com.vividsolutions.jts.geom.MultiPoint;
import com.vividsolutions.jts.geom.prep.PreparedGeometry;
import com.vividsolutions.jts.geom.prep.PreparedGeometryFactory;
import gov.usgs.cida.coastalhazards.util.CRSUtils;
import gov.usgs.cida.coastalhazards.util.UTMFinder;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import gov.usgs.cida.coastalhazards.wps.geom.UnionSimpleFeatureCollection;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.referencing.crs.CoordinateReferenceSystem;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
        title = "Calculate Intersections",
        description = "Create an intersection layer from the transects and shorelines",
        version = "1.0.0")
public class CalculateIntersectionsProcess implements GeoServerProcess {
    
    private static final CoordinateReferenceSystem REQUIRED_CRS_WGS84 = DefaultGeographicCRS.WGS84;
    
    @DescribeResult(name = "intersections", description = "Layer containing intersections of shorelines and transects")
    public String execute(
            @DescribeParameter(name = "shorelines", description = "Array of shoreline feature collections to find intersects on", min = 1, max = Integer.MAX_VALUE) FeatureCollection<SimpleFeatureType, SimpleFeature>[] shorelines,
            @DescribeParameter(name = "transects", description = "Feature collection of transects", min = 1, max = 1) FeatureCollection<SimpleFeatureType, SimpleFeature> transects,
            @DescribeParameter(name = "preserveAttrs", description = "List of attributes to preserve in resulting feature collection", min = 0, max = Integer.MAX_VALUE) String attrs,
            @DescribeParameter(name = "workspace", description = "Workspace in which to put resulting intersection", min = 1, max = 1) String workspace,
            @DescribeParameter(name = "store", description = "Store in which to put resulting intersection", min = 1, max = 1) String store,
            @DescribeParameter(name = "layer", description = "Layer name of resulting intersection", min = 1, max = 1) String layer) throws Exception {
        return new Process(shorelines, transects, attrs, workspace, store, layer).execute();
    }
    
    private class Process {
        // for each transect calculate intersections with coastlines
        // if it is a lidar dataset, need to get weighted average
        // retain identifiers of intersects or some sort
        // return Coordinate feature collection
        
        private FeatureCollection<SimpleFeatureType, SimpleFeature>[] shorelines;
        private FeatureCollection<SimpleFeatureType, SimpleFeature> transects;
        private String attrs;
        private String workspace;
        private String store;
        private String layer;
        
        private CoordinateReferenceSystem utmCrs;
        
        private Process(FeatureCollection<SimpleFeatureType, SimpleFeature>[] shorelines, 
                FeatureCollection<SimpleFeatureType, SimpleFeature> transects, 
                String attrs, 
                String workspace, 
                String store,
                String layer) {
            this.shorelines = shorelines;
            this.transects = transects;
            this.attrs = attrs;
            this.workspace = workspace;
            this.store = store;
            this.layer = layer;
        }
        
        private String execute() throws Exception {
            SimpleFeatureCollection unionedShorelines = 
                    UnionSimpleFeatureCollection.unionCollectionsWithoutPreservingAttributes(shorelines);
            
            CoordinateReferenceSystem shorelinesCrs = CRSUtils.getCRSFromFeatureCollection(unionedShorelines);
            CoordinateReferenceSystem transectsCrs = CRSUtils.getCRSFromFeatureCollection(transects);
            if (!CRS.equalsIgnoreMetadata(shorelinesCrs, REQUIRED_CRS_WGS84)) {
                throw new UnsupportedCoordinateReferenceSystemException("Shorelines are not in accepted projection");
            }
//            if (!CRS.equalsIgnoreMetadata(baselineCrs, REQUIRED_CRS_WGS84)) {
//                throw new UnsupportedCoordinateReferenceSystemException("Baseline is not in accepted projection");
//            }
            this.utmCrs = UTMFinder.findUTMZoneForFeatureCollection((SimpleFeatureCollection)unionedShorelines);
            if (this.utmCrs == null) {
                throw new IllegalStateException("Must have usable UTM zone to continue");
            }
            
            SimpleFeatureType featureType = buildSimpleFeatureType();
            MultiLineString shorelineGeom = CRSUtils.getLinesFromFeatureCollection(unionedShorelines, REQUIRED_CRS_WGS84, utmCrs);
            PreparedGeometry preparedGeometry = PreparedGeometryFactory.prepare(shorelineGeom);
            
//            MultiLineString transectGeom = CRSUtils.getLinesFromFeatureCollection(transects, transectsCrs, utmCrs);
//            transectGeom.intersection(preparedGeometry);
            
            
            
            return null;
        }
        
        private SimpleFeatureType buildSimpleFeatureType() {
            SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
            builder.setName("Intersections");
            builder.add("geom", MultiPoint.class, utmCrs);
            return builder.buildFeatureType();
        }
    }
}
