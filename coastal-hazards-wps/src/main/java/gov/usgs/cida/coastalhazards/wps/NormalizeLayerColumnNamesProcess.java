package gov.usgs.cida.coastalhazards.wps;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.ImmutableSortedSet;
import gov.usgs.cida.coastalhazards.util.GeoserverUtils;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.geoserver.catalog.Catalog;
import org.geoserver.catalog.DataStoreInfo;
import org.geoserver.catalog.WorkspaceInfo;
import org.geoserver.wps.gs.GeoServerProcess;
import org.geoserver.wps.gs.ImportProcess;
import org.geotools.data.DataAccess;
import org.geotools.data.DataUtilities;
import org.geotools.data.FeatureSource;
import org.geotools.data.simple.SimpleFeatureCollection;
import org.geotools.feature.FeatureCollection;
import org.geotools.feature.FeatureIterator;
import org.geotools.feature.NameImpl;
import org.geotools.feature.simple.SimpleFeatureBuilder;
import org.geotools.feature.simple.SimpleFeatureTypeImpl;
import org.geotools.feature.type.AttributeDescriptorImpl;
import org.geotools.process.ProcessException;
import org.geotools.process.factory.DescribeParameter;
import org.geotools.process.factory.DescribeProcess;
import org.geotools.process.factory.DescribeResult;
import org.opengis.feature.Feature;
import org.opengis.feature.simple.SimpleFeature;
import org.opengis.feature.simple.SimpleFeatureType;
import org.opengis.feature.type.AttributeDescriptor;
import org.opengis.feature.type.AttributeType;
import org.opengis.feature.type.FeatureType;
import org.opengis.feature.type.Name;

@DescribeProcess(
		title = "Normalize Layer Column Names",
		description = "Given a layer, workspace, and store, the column names will be normalized to upper-case.",
		version = "1.0.0")
public class NormalizeLayerColumnNamesProcess implements GeoServerProcess {

	private final Catalog catalog;
	private final ImportProcess importProcess;
	/**
	 * Geoserver relies on case-sensitive attributes. We cannot reformat these attributes.
	 * In addition, we do not write SLDs against these attributes, so we don't need to care.
	 */
	public static final ImmutableSet<String> COLUMN_NAMES_TO_IGNORE = (
		new ImmutableSortedSet.Builder<>(String.CASE_INSENSITIVE_ORDER)
			.add(
					"the_geom",
					"id"
			)
		).build();
	
	public NormalizeLayerColumnNamesProcess(ImportProcess importer, Catalog catalog) {
		this.catalog = catalog;
		this.importProcess = importer;
	}

	@DescribeResult(name = "layerName", description = "Name of the normalized featuretype, with workspace")
	public String execute(
			@DescribeParameter(name = "layer", min = 1, description = "Input Layer To Normalize Columns On") String layer,
			@DescribeParameter(name = "workspace", min = 1, description = "Workspace in which layer resides") String workspace,
			@DescribeParameter(name = "store", min = 1, description = "Store in which layer resides") String store
	)
			throws ProcessException {
		GeoserverUtils gsUtils = new GeoserverUtils(catalog);
		WorkspaceInfo ws = gsUtils.getWorkspaceByName(workspace);
		DataStoreInfo ds = gsUtils.getDataStoreByName(ws.getName(), store);
		DataAccess<? extends FeatureType, ? extends Feature> da = gsUtils.getDataAccess(ds, null);
		FeatureSource<? extends FeatureType, ? extends Feature> featureSource = gsUtils.getFeatureSource(da, layer);
		FeatureType featureType = featureSource.getSchema();
		List<AttributeDescriptor> attributeList = new ArrayList(featureType.getDescriptors());
		List<SimpleFeature> sfList = new ArrayList<>();
		FeatureCollection<? extends FeatureType, ? extends Feature> featureCollection = gsUtils.getFeatureCollection(featureSource);
		AttributeDescriptor attributeDescriptor;
		int length = attributeList.size();
		for (int i = 0; i < length; i++) {
			attributeDescriptor = attributeList.get(i);
			Name attributeName = attributeDescriptor.getName();
			if(null == attributeName){
				continue;
			}
			String attributeTitle = attributeName.toString();
			
			AttributeType type = attributeDescriptor.getType();
			Name newName;
			if(COLUMN_NAMES_TO_IGNORE.contains(attributeTitle)){
				newName = new NameImpl(attributeTitle);
			}
			else{
				newName = new NameImpl(attributeTitle.toUpperCase(Locale.ENGLISH));
			}
			int minOccurs = attributeDescriptor.getMinOccurs();
			int maxOccurs = attributeDescriptor.getMaxOccurs();
			boolean isNillable = attributeDescriptor.isNillable();
			Object defaultValue = attributeDescriptor.getDefaultValue();
			AttributeDescriptor renamedAttributeDescriptor = new AttributeDescriptorImpl(type, newName, minOccurs, maxOccurs, isNillable, defaultValue);
			attributeList.set(i, renamedAttributeDescriptor);
		}

		SimpleFeatureType newFeatureType = new SimpleFeatureTypeImpl(
				featureType.getName(),
				attributeList,
				featureType.getGeometryDescriptor(),
				featureType.isAbstract(),
				featureType.getRestrictions(),
				featureType.getSuper(),
				featureType.getDescription());

		SimpleFeatureBuilder sfb = new SimpleFeatureBuilder(newFeatureType);

		FeatureIterator<? extends Feature> features = null;
		try {
			features = featureCollection.features();
			while (features.hasNext()) {
				SimpleFeature feature = (SimpleFeature) features.next();
				SimpleFeature newFeature = SimpleFeatureBuilder.retype(feature, sfb);
				List<Object> oldAttributes = feature.getAttributes();
				List<Object> newAttributes = newFeature.getAttributes();
				// If the feature type contains attributes in which the original 
				// feature does not have a value for, 
				// the value in the resulting feature is set to null.
				// Need to copy it back from the original feature
				for (int aInd = 0; aInd < newAttributes.size(); aInd++) {
					Object oldAttribute = oldAttributes.get(aInd);
					Object newAttribute = newAttributes.get(aInd);

					if (newAttribute == null && oldAttribute != null) {
						newFeature.setAttribute(aInd, oldAttribute);
					}
				}
				sfList.add(newFeature);
			}
		} finally {
			if (null != features) {
				features.close();
			}
		}

		SimpleFeatureCollection collection = DataUtilities.collection(sfList);

		return gsUtils.replaceLayer(collection, layer, ds, ws, importProcess);
	}
}
