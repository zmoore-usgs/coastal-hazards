package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.geom.Geometry;
import com.vividsolutions.jts.geom.GeometryFactory;
import com.vividsolutions.jts.geom.Point;
import com.vividsolutions.jts.geom.PrecisionModel;
import gov.usgs.cida.coastalhazards.util.CRSUtils;
import gov.usgs.cida.coastalhazards.util.UTMFinder;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureIterator;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.geometry.jts.JTS;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.referencing.CRS;
import org.geotools.referencing.crs.DefaultGeographicCRS;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.GeometryType;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.MathTransform;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
        title = "Calculate Intersections",
        description = "Create an intersection layer from the transects and shorelines, will currently only work for non-lidar data",
        version = "1.0.0")
public class CalculateIntersectionsProcess implements GeoServerProcess {
    
    private static final CoordinateReferenceSystem REQUIRED_CRS_WGS84 = DefaultGeographicCRS.WGS84;
    
    @DescribeResult(name = "intersections", description = "Layer containing intersections of shorelines and transects")
    public String execute(
            @DescribeParameter(name = "shorelines", description = "Array of shoreline feature collections to find intersects on", min = 1, max = 1) FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines,
            @DescribeParameter(name = "transects", description = "Feature collection of transects", min = 1, max = 1) FeatureCollection<SimpleFeatureType, SimpleFeature> transects,
            @DescribeParameter(name = "workspace", description = "Workspace in which to put resulting intersection", min = 1, max = 1) String workspace,
            @DescribeParameter(name = "store", description = "Store in which to put resulting intersection", min = 1, max = 1) String store,
            @DescribeParameter(name = "layer", description = "Layer name of resulting intersection", min = 1, max = 1) String layer) throws Exception {
        return new Process(shorelines, transects, workspace, store, layer).execute();
    }
    
    private class Process {
        // for each transect calculate intersections with coastlines
        // if it is a lidar dataset, need to get weighted average
        // retain identifiers of intersects or some sort
        // return Coordinate feature collection
        
        private FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines;
        private FeatureCollection<SimpleFeatureType, SimpleFeature> transects;
        private String workspace;
        private String store;
        private String layer;
        
        private CoordinateReferenceSystem utmCrs;
        private GeometryFactory pointFactory;
        private Map<Integer, Geometry> transectMap;
        private SimpleFeatureType outputFeatureType;
        private MathTransform shorelineTransform;
        private MathTransform transectTransform;
        
        private Process(FeatureCollection<SimpleFeatureType, SimpleFeature> shorelines, 
                FeatureCollection<SimpleFeatureType, SimpleFeature> transects, 
                String workspace, 
                String store,
                String layer) {
            this.shorelines = shorelines;
            this.transects = transects;
            this.workspace = workspace;
            this.store = store;
            this.layer = layer;
            
            this.pointFactory = new GeometryFactory(new PrecisionModel(PrecisionModel.FLOATING));
            this.transectMap = new LinkedHashMap<Integer, Geometry>();
            
            this.outputFeatureType = null;
            this.shorelineTransform = null;
            this.transectTransform = null;
        }
        
        private String execute() throws Exception {
            
            CoordinateReferenceSystem shorelinesCrs = CRSUtils.getCRSFromFeatureCollection(shorelines);
            CoordinateReferenceSystem transectsCrs = CRSUtils.getCRSFromFeatureCollection(transects);
            if (!CRS.equalsIgnoreMetadata(shorelinesCrs, REQUIRED_CRS_WGS84)) {
                throw new UnsupportedCoordinateReferenceSystemException("Shorelines are not in accepted projection");
            }
//            if (!CRS.equalsIgnoreMetadata(baselineCrs, REQUIRED_CRS_WGS84)) {
//                throw new UnsupportedCoordinateReferenceSystemException("Baseline is not in accepted projection");
//            }
            SimpleFeatureCollection shorelineCollection = (SimpleFeatureCollection)shorelines;
            SimpleFeatureCollection transectCollection = (SimpleFeatureCollection)transects;
            this.utmCrs = UTMFinder.findUTMZoneForFeatureCollection(shorelineCollection);
            if (this.utmCrs == null) {
                throw new IllegalStateException("Must have usable UTM zone to continue");
            }
            
            this.outputFeatureType = buildSimpleFeatureType(shorelineCollection);
            
            this.shorelineTransform = CRS.findMathTransform(shorelinesCrs, utmCrs, true);
            this.transectTransform = CRS.findMathTransform(transectsCrs, utmCrs, true);
            
            SimpleFeatureIterator transectIterator = transectCollection.features();
            int[] transectIds = new int[transectCollection.size()];
            int idIndex = 0;
            while (transectIterator.hasNext()) {
                SimpleFeature feature = transectIterator.next();
                Integer id = (Integer)feature.getAttribute(GenerateTransectsProcess.TRANSECT_ID_ATTR);
                transectIds[idIndex++] = id;
                
                Geometry transectGeom = (Geometry)feature.getDefaultGeometry();
                Geometry transformedGeom = JTS.transform(transectGeom, transectTransform);
                this.transectMap.put(id, transformedGeom);
            }
            
            SimpleFeatureIterator shoreIterator = shorelineCollection.features();
            while (shoreIterator.hasNext()) {
                SimpleFeature feature = shoreIterator.next();
                Geometry shoreGeom = (Geometry)feature.getDefaultGeometry();
                Geometry transformedGeom = JTS.transform(shoreGeom, shorelineTransform);
                for (int i : transectIds) {
                    Geometry intersection = transformedGeom.intersection(transectMap.get(i));
                }
                
            }
            
            //MultiLineString shorelineGeom = CRSUtils.getLinesFromFeatureCollection(shorelines, REQUIRED_CRS_WGS84, utmCrs);
            //            MultiLineString transectGeom = CRSUtils.getLinesFromFeatureCollection(transects, transectsCrs, utmCrs);
            //            transectGeom.intersection(preparedGeometry);
            

            return null;
        }
        
        private SimpleFeatureType buildSimpleFeatureType(SimpleFeatureCollection simpleFeatures) {
            SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
            SimpleFeatureType schema = simpleFeatures.getSchema();
            List<AttributeType> types = schema.getTypes();
            
            builder.setName("Intersections");
            builder.add("geom", Point.class, utmCrs);
            builder.add("transect_id", Integer.class);
            for (AttributeType type : types) {
                if (type instanceof GeometryType) {
                    // ignore the geom type of intersecting data
                }
                else {
                    builder.addBinding(type);
                }
            }
            return builder.buildFeatureType();
        }
        
        // Thought these would be longer, but I'll leave them here
        private SimpleFeature createFeatureInUTMZone(Point point) {
            return SimpleFeatureBuilder.build(this.outputFeatureType, new Object[]{point}, null);
        }
    }
}
