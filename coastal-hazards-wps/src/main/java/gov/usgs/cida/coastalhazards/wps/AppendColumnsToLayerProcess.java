package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.coastalhazards.util.LayerImportUtil;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.DataStoreInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.data.AbstractDataStore;
import org.geotools.data.DataAccess;
import org.geotools.data.DataStore;
import org.geotools.data.FeatureSource;
import org.geotools.data.directory.DirectoryDataStore;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.data.simple.SimpleFeatureStore;
import org.geotools.feature.AttributeTypeBuilder;
import org.geotools.feature.NameImpl;
import org.geotools.feature.simple.SimpleFeatureTypeImpl;
import org.geotools.feature.type.FeatureTypeImpl;
import org.geotools.process.ProcessException;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.util.DefaultProgressListener;
import org.opengis.feature.Feature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.FeatureType;
import org.opengis.feature.type.Name;
import org.opengis.feature.type.PropertyDescriptor;

/**
 *
 * @author isuftin
 */
@DescribeProcess(
        title = "Append Columns To Layer",
description = "Append a set of columns to a given layer using provided data types and default values",
version = "1.0.0")
public class AppendColumnsToLayerProcess implements GeoServerProcess {

    private Catalog catalog;
    private LayerImportUtil importer;

    public AppendColumnsToLayerProcess(ImportProcess importer, Catalog catalog) {
        this.catalog = catalog;
        this.importer = new LayerImportUtil(catalog, importer);
    }

    @DescribeResult(name = "layerName", description = "Name of the new featuretype, with workspace")
    public String execute(
            @DescribeParameter(name = "layer", min = 1, description = "Input Layer To Append Columns To") SimpleFeatureCollection sfc,
            @DescribeParameter(name = "workspace", min = 1, description = "Workspace in which layer resides") String workspace,
            @DescribeParameter(name = "store", min = 1, description = "Store in which layer resides") String store,
            @DescribeParameter(name = "column", min = 1, max = Integer.MAX_VALUE, description = "Column Name|Column Type|Column Description|Default Value") String[] columns)
            throws ProcessException {

        WorkspaceInfo ws;
        ws = catalog.getWorkspaceByName(workspace);
        if (ws == null) {
            throw new ProcessException("Could not find workspace " + workspace);
        }

        DataStoreInfo storeInfo = catalog.getDataStoreByName(ws.getName(), store);
        if (storeInfo == null) {
            throw new ProcessException("Could not find store " + store + " in workspace " + workspace);
        }

        FeatureSource featureSource;
        try {
            featureSource = storeInfo.getDataStore(new DefaultProgressListener()).getFeatureSource(new NameImpl(sfc.getSchema().getTypeName()));
        } catch (IOException ioe) {
            throw new ProcessException(ioe);
        }
        
        SimpleFeatureStore sstore = (SimpleFeatureStore) featureSource;
        
        FeatureType ft = featureSource.getSchema();
        List<PropertyDescriptor> propertyDescriptors = new ArrayList(ft.getDescriptors());

        for (String column : columns) {
            String[] columnAttributes = column.split("\\|");
            if (columnAttributes.length != 4) {
                throw new ProcessException("column input must have four attributes split by a pipe character: \"Column Name|Column Type|Column Description|Default Value\"");
            }
            String name = columnAttributes[0];
            String type = columnAttributes[1];
            String description = columnAttributes[2];
            String defaultValue = columnAttributes[3];
            if (ft.getDescriptor(column) == null) {
                AttributeTypeBuilder atb = new AttributeTypeBuilder();

                atb.setName(name);
                atb.setMinOccurs(0);
                atb.setMaxOccurs(1);
                atb.setBinding(String.class);
                atb.setDefaultValue(defaultValue);
                AttributeDescriptor descriptor = atb.buildDescriptor(description);
                propertyDescriptors.add(descriptor);
            }
        }

        FeatureTypeImpl newFt = new FeatureTypeImpl(
                ft.getName(),
                propertyDescriptors,
                ft.getGeometryDescriptor(),
                ft.isAbstract(),
                ft.getRestrictions(),
                ft.getSuper(),
                ft.getDescription());
        try {
            DataAccess sds = featureSource.getDataStore();
            sds.updateSchema(newFt.getName(), ft);
        } catch (IOException ex) {
            throw new ProcessException(ex);
        }

        return null;
    }
}
