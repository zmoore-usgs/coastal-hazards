package gov.usgs.cida.coastalhazards.wps;

import gov.usgs.cida.coastalhazards.util.LayerImportUtil;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.geoserver.catalog.AttributeTypeInfo;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.DataStoreInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.catalog.impl.AttributeTypeInfoImpl;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.data.directory.DirectoryDataStore;
import org.geotools.data.shapefile.ShapefileDataStore;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.AttributeTypeBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeImpl;
import org.geotools.feature.type.AttributeTypeImpl;
import org.geotools.process.ProcessException;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.geotools.util.DefaultProgressListener;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.AttributeType;

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

        String layerName = sfc.getSchema().getTypeName();
        WorkspaceInfo ws;
        ws = catalog.getWorkspaceByName(workspace);
        if (ws == null) {
            throw new ProcessException("Could not find workspace " + workspace);
        }

        DataStoreInfo storeInfo = catalog.getDataStoreByName(ws.getName(), store);
        if (storeInfo == null) {
            throw new ProcessException("Could not find store " + store + " in workspace " + workspace);
        }

        SimpleFeatureType sft = sfc.getSchema();
        List<AttributeDescriptor> attributeDescriptors = new ArrayList(sft.getAttributeDescriptors());

        for (String column : columns) {
            String[] columnAttributes = column.split("\\|");
            if (columnAttributes.length != 4) {
                throw new ProcessException("column input must have four attributes split by a pipe character: \"Column Name|Column Type|Column Description|Default Value\"");
            }
            String name = columnAttributes[0];
            String type = columnAttributes[1];
            String description = columnAttributes[2];
            String defaultValue = columnAttributes[3];
            if (sft.getDescriptor(column) == null) {
                AttributeTypeBuilder atb = new AttributeTypeBuilder();
                
                atb.setName(name);
                atb.setMinOccurs(0);
                atb.setMaxOccurs(1);
                atb.setBinding(String.class);
                atb.setDefaultValue(defaultValue);
                AttributeDescriptor descriptor = atb.buildDescriptor(description);
                attributeDescriptors.add(descriptor);
            }
        }

        SimpleFeatureType ft = new SimpleFeatureTypeImpl(
                sft.getName(),
                attributeDescriptors,
                sft.getGeometryDescriptor(),
                sft.isAbstract(),
                sft.getRestrictions(),
                sft.getSuper(),
                sft.getDescription());
        try {
            DefaultProgressListener progressListener = new DefaultProgressListener();
            DirectoryDataStore sds = (DirectoryDataStore) storeInfo.getDataStore(progressListener);
            sds.updateSchema(sft.getName(), ft);
        } catch (IOException ex) {
            throw new ProcessException("column input must have four attributes split by a pipe character: \"Column Name|Column Type|Column Description|Default Value\"");
        }

        return null;
    }
}
