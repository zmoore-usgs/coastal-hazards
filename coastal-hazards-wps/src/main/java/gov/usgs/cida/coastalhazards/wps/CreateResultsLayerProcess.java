/*
 * U.S.Geological Survey Software User Rights Notice
 * 
 * Copied from http://water.usgs.gov/software/help/notice/ on September 7, 2012.  
 * Please check webpage for updates.
 * 
 * Software and related material (data and (or) documentation), contained in or
 * furnished in connection with a software distribution, are made available by the
 * U.S. Geological Survey (USGS) to be used in the public interest and in the 
 * advancement of science. You may, without any fee or cost, use, copy, modify,
 * or distribute this software, and any derivative works thereof, and its supporting
 * documentation, subject to the following restrictions and understandings.
 * 
 * If you distribute copies or modifications of the software and related material,
 * make sure the recipients receive a copy of this notice and receive or can get a
 * copy of the original distribution. If the software and (or) related material
 * are modified and distributed, it must be made clear that the recipients do not
 * have the original and they must be informed of the extent of the modifications.
 * 
 * For example, modified files must include a prominent notice stating the 
 * modifications made, the author of the modifications, and the date the 
 * modifications were made. This restriction is necessary to guard against problems
 * introduced in the software by others, reflecting negatively on the reputation of the USGS.
 * 
 * The software is public property and you therefore have the right to the source code, if desired.
 * 
 * You may charge fees for distribution, warranties, and services provided in connection
 * with the software or derivative works thereof. The name USGS can be used in any
 * advertising or publicity to endorse or promote any products or commercial entity
 * using this software if specific written permission is obtained from the USGS.
 * 
 * The user agrees to appropriately acknowledge the authors and the USGS in publications
 * that result from the use of this software or in products that include this
 * software in whole or in part.
 * 
 * Because the software and related material are free (other than nominal materials
 * and handling fees) and provided "as is," the authors, the USGS, and the 
 * United States Government have made no warranty, express or implied, as to accuracy
 * or completeness and are not obligated to provide the user with any support, consulting,
 * training or assistance of any kind with regard to the use, operation, and performance
 * of this software nor to provide the user with any updates, revisions, new versions or "bug fixes".
 * 
 * The user assumes all risk for any damages whatsoever resulting from loss of use, data,
 * or profits arising in connection with the access, use, quality, or performance of this software.
 */

package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.coastalhazards.util.AttributeGetter;
import gov.usgs.cida.coastalhazards.util.Constants;
import gov.usgs.cida.coastalhazards.util.LayerImportUtil;
import gov.usgs.cida.coastalhazards.util.UTMFinder;
import gov.usgs.cida.coastalhazards.wps.exceptions.InputFileFormatException;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedCoordinateReferenceSystemException;
import gov.usgs.cida.coastalhazards.wps.exceptions.UnsupportedFeatureTypeException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.SortedMap;
import java.util.TreeMap;
import org.apache.commons.lang.StringUtils;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.ProjectionPolicy;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.data.DataUtilities;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeBuilder;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.referencing.FactoryException;
import org.opengis.referencing.NoSuchAuthorityCodeException;
import org.opengis.referencing.crs.CoordinateReferenceSystem;
import org.opengis.referencing.operation.TransformException;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@DescribeProcess(
    title = "Create Result Layer From Statistics",
    description = "Clone transect feature collection, append statistics results",
    version = "1.0.0")
public class CreateResultsLayerProcess implements GeoServerProcess {

    private LayerImportUtil importer;
    
    public CreateResultsLayerProcess(ImportProcess importProcess, Catalog catalog) {
        importer = new LayerImportUtil(catalog, importProcess);
    }
    
    @DescribeResult(name = "resultLayer", description = "Layer containing results of shoreline statistics")
    public String execute(@DescribeParameter(name = "results", description = "Block of text with TransectID and stats results", min = 1, max = 1) StringBuffer results,
            @DescribeParameter(name = "transects", description = "Feature collection of transects to join", min = 1, max = 1) FeatureCollection<SimpleFeatureType, SimpleFeature> transects,
            // TODO Intersects aren't used, this should be removed to avoid confusion
            @DescribeParameter(name = "intersects", description = "Feature collection of intersects used to calculate results", min = 0, max = 1) FeatureCollection<SimpleFeatureType, SimpleFeature> intersects,
            @DescribeParameter(name = "workspace", description = "Workspace in which to put results layer", min = 1, max = 1) String workspace,
            @DescribeParameter(name = "store", description = "Store in which to put results", min = 1, max = 1) String store,
            @DescribeParameter(name = "layer", description = "Layer name of results", min = 1, max = 1) String layer) throws Exception {
        
        return new Process(results, transects, workspace, store, layer).execute();
    }
    
    protected class Process {
        
        /* this is different from the one in Constants, this is a "contract" with the R process on the column name for TransectId*/
        public static final String TRANSECT_ID = "transect_ID";
        
        private String results;
        private FeatureCollection<SimpleFeatureType, SimpleFeature> transects;
        private String workspace;
        private String store;
        private String layer;
        
        protected Process(StringBuffer results,
                FeatureCollection<SimpleFeatureType, SimpleFeature> transects,
                String workspace,
                String store,
                String layer) {
            this.results = results.toString();
            this.transects = transects;
            this.workspace = workspace;
            this.store = store;
            this.layer = layer;
        }
        
        protected String execute() {
            importer.checkIfLayerExists(workspace, layer);
            String[] columnHeaders = getColumnHeaders(results);
            Map<Long, Double[]> resultMap = parseTextToMap(results, columnHeaders);
            List<SimpleFeature> joinedFeatures = joinResultsToTransects(columnHeaders, resultMap, transects);
            CoordinateReferenceSystem utmZone = null;
            try {
                utmZone = UTMFinder.findUTMZoneCRSForCentroid((SimpleFeatureCollection)transects);
            } catch (NoSuchAuthorityCodeException ex) {
                throw new UnsupportedCoordinateReferenceSystemException("Could not find utm zone", ex);
            } catch (FactoryException ex) {
                throw new UnsupportedCoordinateReferenceSystemException("Could not find utm zone", ex);
            } catch (TransformException ex) {
                throw new UnsupportedCoordinateReferenceSystemException("Could not find utm zone", ex);
            }
            SimpleFeatureCollection collection = DataUtilities.collection(joinedFeatures);
            String imported = importer.importLayer(collection, workspace, store, layer, utmZone, ProjectionPolicy.REPROJECT_TO_DECLARED);
            return imported;
        }

        protected Map<Long, Double[]> parseTextToMap(String results, String[] headers) {
            String[] lines = results.split("\n");
            Map<Long, Double[]> resultMap = new HashMap<Long, Double[]>();
            int transectColumn = -1;
            for (String line : lines) {
                String[] columns = line.split("\t");
                if (transectColumn < 0) {
                    // ignore the first line
                    for (int i=0; i<headers.length; i++) {
                        if (headers[i].equals(TRANSECT_ID)) {
                            transectColumn = i;
                        }
                    }
                    if (transectColumn < 0) {
                        throw new InputFileFormatException("Stats did not contain column named " + TRANSECT_ID);
                    }
                }
                else {
                    Long transectId = null;
                    Double[] values = new Double[columns.length-1];
                    int j = 0;
                    for (int i=0; i<columns.length; i++) {
                        if (i == transectColumn) {
                            String id = columns[i].replaceAll("\"", "");
                            transectId = Long.parseLong(id);
                        }
                        else {
                            // may need to remove " here too
                            values[j] = Double.parseDouble(columns[i]);
                            j++;
                        }
                    }
                    resultMap.put(transectId, values);
                }
            }
            return resultMap;
        }

        protected List<SimpleFeature> joinResultsToTransects(String[] columnHeaders, Map<Long, Double[]> resultMap, FeatureCollection<SimpleFeatureType, SimpleFeature> transects) {
                     
            SimpleFeatureType transectFeatureType = transects.getSchema();
            List<AttributeDescriptor> descriptors = transectFeatureType.getAttributeDescriptors();
            SimpleFeatureTypeBuilder builder = new SimpleFeatureTypeBuilder();
            builder.setName("Results");
            builder.addAll(descriptors);
            for (String header: columnHeaders) {
                if (!header.equals(TRANSECT_ID)) {
                    builder.add(header, Double.class);
                }
            }
            SimpleFeatureType joinedFeatureType = builder.buildFeatureType();
            
            SortedMap<Double, List<Object>> distanceToAttribureMap = new TreeMap<Double, List<Object>>();
            FeatureIterator<SimpleFeature> features = null;
            try { 
                features = transects.features();
                AttributeGetter getter = new AttributeGetter(joinedFeatureType);
                while (features.hasNext()) {
                    SimpleFeature feature = features.next();
                    Object transectIdAsObject = getter.getValue(Constants.TRANSECT_ID_ATTR, feature);
                    long transectId = ((Number)transectIdAsObject).longValue();
                    Double baseDistance = (Double)getter.getValue(Constants.BASELINE_DIST_ATTR, feature);
                    if (baseDistance == null) {
                        throw new UnsupportedFeatureTypeException("Transects must include base_dist attribute");
                    }
                    Double[] values = resultMap.get(transectId);
                    List<Object> joinedAttributes = new ArrayList<Object>(joinedFeatureType.getAttributeCount());
                    joinedAttributes.addAll(feature.getAttributes());
                    joinedAttributes.addAll(Arrays.asList(values));
                    distanceToAttribureMap.put(baseDistance, joinedAttributes);
                
                }
            } finally {
                if (features != null) { features.close(); }
            }
            int joinedFeatureCount = distanceToAttribureMap.size();
            SequentialFeatureIDGenerator fidGenerator = new SequentialFeatureIDGenerator(joinedFeatureCount);
            List<SimpleFeature> joinedFeatureList = new ArrayList<SimpleFeature>(distanceToAttribureMap.size()); 
            for (List<Object> attributes : distanceToAttribureMap.values()) {
                joinedFeatureList.add(SimpleFeatureBuilder.build(
                        joinedFeatureType,
                        attributes,
                        fidGenerator.next()));
            }
            
            return joinedFeatureList;
        }

        private String[] getColumnHeaders(String results) {
            String[] lines = results.split("\n");
            if (lines.length <= 1) {
                throw new InputFileFormatException("Results must have at least 2 rows");
            }
            String[] header = lines[0].split("\t");
            for (int i=0; i<header.length; i++) {
                header[i] = header[i].replaceAll("\"", "");
            }
            return header;
        }
    }
    
    public static class SequentialFeatureIDGenerator {
        final String base;
        final int digits;
        final int count;
        int index = 0;
        public SequentialFeatureIDGenerator(int featureCount) {
            this.count = featureCount;
            this.base = SimpleFeatureBuilder.createDefaultFeatureId() + "-";
            this.digits = (int)Math.ceil(Math.log10(featureCount));
        }
        public String next() {
            if (index < count) {
                return base + StringUtils.leftPad(Integer.toString(index++), digits, '0');
            }
            throw new NoSuchElementException("FIDs have been exhausted for this generator: " + index++ + " < " + count);
        }
    }
}
