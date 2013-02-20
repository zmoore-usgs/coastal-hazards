package gov.usgs.cida.coastalhazards.wps;

import com.vividsolutions.jts.index.strtree.STRtree;
import gov.usgs.cida.coastalhazards.util.CRSUtils;
import gov.usgs.cida.coastalhazards.util.GeoserverUtils;
import gov.usgs.cida.coastalhazards.wps.exceptions.LayerDoesNotExistException;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import gov.usgs.cida.coastalhazards.wps.geom.ShorelineSTRTreeBuilder;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.DataStoreInfo;
import org.geoserver.catalog.LayerInfo;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.data.DataAccess;
import org.geotools.data.FeatureSource;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.referencing.CRS;
import org.opengis.feature.Feature;
import org.opengis.feature.type.FeatureType;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import static gov.usgs.cida.coastalhazards.util.Constants.*;
import gov.usgs.cida.coastalhazards.util.UTMFinder;
import gov.usgs.cida.coastalhazards.wps.geom.Intersection;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import org.geotools.data.DataUtilities;
import org.geotools.feature.DefaultFeatureCollection;
import org.geotools.filter.FilterFactoryImpl;
import org.joda.time.DateTime;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.filter.FilterFactory;
import org.opengis.filter.PropertyIsEqualTo;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
        title = "Update Transects and Intersections",
        description = "Updates base_dist on transects and recalculate intersections for transect",
        version = "1.0.0")
public class UpdateTransectsAndIntersectionsProcess implements GeoServerProcess {
    
    private ImportProcess importProcess;
    private Catalog catalog;
    private GeoserverUtils gsUtils;
    private FilterFactory filterFactory;
    
    public UpdateTransectsAndIntersectionsProcess(ImportProcess importProcess, Catalog catalog) {
        this.importProcess = importProcess;
        this.catalog = catalog;
        this.gsUtils = new GeoserverUtils(catalog);
        this.filterFactory = new FilterFactoryImpl();
    }
    
    @DescribeResult(name = "intersections", description = "Feature collection of intersection points")
    public SimpleFeatureCollection execute(
            @DescribeParameter(name = "transectLayer", description = "layer containing transects", min = 1, max = 1) String transectLayer,
            @DescribeParameter(name = "intersectionLayer", description = "layer containing intersections", min = 1, max = 1) String intersectionLayer,
            @DescribeParameter(name = "baselineLayer", description = "layer containing baseline", min = 1, max = 1) String baselineLayer,
            @DescribeParameter(name = "shorelines", description = "shoreline features", min = 1, max = 1) SimpleFeatureCollection shorelines,
            @DescribeParameter(name = "transectID", description = "edited transect id", min = 1, max = Integer.MAX_VALUE) int[] transectIds,
            @DescribeParameter(name = "farthest", description = "use farthest intersection on shoreline (default: false)", min = 0, max = 1) Boolean useFarthest) throws Exception {
        return new Process(transectLayer, intersectionLayer, baselineLayer, shorelines, transectIds, useFarthest).execute();
    }
    
    private class Process {
        
        private LayerInfo transectLayer;
        private LayerInfo intersectionLayer;
        private LayerInfo baselineLayer;
        private SimpleFeatureCollection shorelines;
        private int[] transectIds;
        private boolean useFarthest;

        private Process(String transectLayer, String intersectionLayer, String baselineLayer, SimpleFeatureCollection shorelines, int[] transectIds, Boolean useFarthest) {
            this.transectLayer = catalog.getLayerByName(transectLayer);
            this.intersectionLayer = catalog.getLayerByName(intersectionLayer);
            this.baselineLayer = catalog.getLayerByName(baselineLayer);
            this.shorelines = shorelines;
            this.transectIds = transectIds;
            this.useFarthest = (null == useFarthest) ? false : useFarthest;
        }
        
        private SimpleFeatureCollection execute() throws Exception {
            if (null == transectLayer || null == intersectionLayer || null == baselineLayer) {
                throw new LayerDoesNotExistException("Input layers must exist");
            }
            
            DataStoreInfo transectDs = gsUtils.getDataStoreByName(
                                        transectLayer.getResource().getStore().getWorkspace().getName(),
                                        transectLayer.getResource().getStore().getName());
            DataAccess<? extends FeatureType, ? extends Feature> transectDa = gsUtils.getDataAccess(transectDs, null);
            FeatureSource<? extends FeatureType, ? extends Feature> transectSource = gsUtils.getFeatureSource(transectDa, transectLayer.getName());
        
            DataStoreInfo intersectionDs = gsUtils.getDataStoreByName(
                                        intersectionLayer.getResource().getStore().getWorkspace().getName(),
                                        intersectionLayer.getResource().getStore().getName());
            DataAccess<? extends FeatureType, ? extends Feature> intersectionDa = gsUtils.getDataAccess(intersectionDs, null);
            FeatureSource<? extends FeatureType, ? extends Feature> intersectionSource = gsUtils.getFeatureSource(intersectionDa, intersectionLayer.getName());
                    
            DataStoreInfo baselineDs = gsUtils.getDataStoreByName(
                                        baselineLayer.getResource().getStore().getWorkspace().getName(),
                                        baselineLayer.getResource().getStore().getName());
            DataAccess<? extends FeatureType, ? extends Feature> baselineDa = gsUtils.getDataAccess(baselineDs, null);
            FeatureSource<? extends FeatureType, ? extends Feature> baselineSource = gsUtils.getFeatureSource(baselineDa, baselineLayer.getName());
            
            CoordinateReferenceSystem shorelinesCrs = CRSUtils.getCRSFromFeatureCollection(shorelines);
            if (!CRS.equalsIgnoreMetadata(shorelinesCrs, REQUIRED_CRS_WGS84)) {
                throw new UnsupportedCoordinateReferenceSystemException("Shorelines are not in accepted projection");
            }
            CoordinateReferenceSystem utmCrs = UTMFinder.findUTMZoneCRSForCentroid((SimpleFeatureCollection)shorelines);
            if (utmCrs == null) {
                throw new IllegalStateException("Must have usable UTM zone to continue");
            }
            SimpleFeatureCollection transformedShorelines = CRSUtils.transformFeatureCollection(shorelines, REQUIRED_CRS_WGS84, utmCrs);
            
            STRtree strtree = new ShorelineSTRTreeBuilder(transformedShorelines).build();
            DefaultFeatureCollection intersectionCollection = new DefaultFeatureCollection((SimpleFeatureCollection)intersectionSource.getFeatures());
            List<SimpleFeature> returnFeatures = new LinkedList<SimpleFeature>();
            for (int id : transectIds) {
                PropertyIsEqualTo filter = filterFactory.equals(filterFactory.property(TRANSECT_ID_ATTR), filterFactory.literal(id));
                Collection<SimpleFeature> features = (Collection<SimpleFeature>)intersectionSource.getFeatures(filter);
                intersectionCollection.removeAll(features);
                Map<DateTime, Intersection> newIntersections = Intersection.calculateIntersections(null, strtree, useFarthest);
                for (DateTime key : newIntersections.keySet()) {
                    Intersection newIntersection = newIntersections.get(key);
                    SimpleFeature newFeature = newIntersection.createFeature(intersectionCollection.getSchema());
                    intersectionCollection.add(newFeature);
                }
             
                // modify transect base_dist if exists otherwise add new transect
            }
            
            return DataUtilities.collection(returnFeatures);
        }
    }
}
