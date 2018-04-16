package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import gov.usgs.cida.coastalhazards.gson.GsonUtil;
import gov.usgs.cida.coastalhazards.model.Service.ServiceType;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import gov.usgs.cida.coastalhazards.util.ogc.CSWService;
import gov.usgs.cida.coastalhazards.util.ogc.OGCService;
import gov.usgs.cida.coastalhazards.util.ogc.WFSService;
import gov.usgs.cida.coastalhazards.util.ogc.WMSService;
import gov.usgs.cida.utilities.Cacheable;
import gov.usgs.cida.utilities.IdGenerator;
import gov.usgs.cida.utilities.StringPrecondition;
import gov.usgs.cida.utilities.properties.JNDISingleton;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
import javax.persistence.CascadeType;
import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import org.apache.commons.lang.StringUtils;
import org.hibernate.annotations.IndexColumn;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.hibernate.annotations.Proxy;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "item")
@Proxy
public class Item implements Serializable, Cacheable {

	public static final String UBER_ID = JNDISingleton.getInstance().getProperty("coastal-hazards.item.uber.id", "uber");
	public static final int NAME_MAX_LENGTH = 255;
	public static final int ATTR_MAX_LENGTH = 255;

	public enum ItemType {
		aggregation,
		template,
		data,
		uber;
	}

	//There's a translation from the back-end to the UI for these terms:
	// storms = Extreme Storms
	// vulnerability = Shoreline Change
	// historical = Sea Level Rise
	public enum Type {

		storms,
		vulnerability,
		historical,
		mixed;
	}
	private static final long serialVersionUID = 1L;
	public static final String ITEM_TYPE = "item_type";
	// matches enum above, needed for annotations
	public static final String DATA_TYPE = "data";
	public static final String AGGREGATION_TYPE = "aggregation";
	private String id;
	private ItemType itemType;
	private String name;
	private Bbox bbox;
	/**
	 * @deprecated or rename to theme
	 */
	private Type type;
	/* Attribute this item displays, null for aggregation */
	private String attr;
	/* Whether this type is able to be ribboned */
	private boolean ribbonable;
	/* Whether to show children in navigation menu */
	private boolean showChildren;
	/* Whether to show this item at all, used in mediation */
	private transient boolean enabled;
	private Summary summary;
	private List<Service> services;
	private transient List<Item> children;
	/* Show only a subset of children */
	private List<String> displayedChildren;
	private Date lastUpdate;
	// Is this a storm that's currently active?
	private boolean activeStorm;
	// Is this a featured item?
	private boolean featured;

	@Id
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	@Enumerated(EnumType.STRING)
	@Column(name = ITEM_TYPE)
	public ItemType getItemType() {
		return itemType;
	}

	public void setItemType(ItemType itemType) {
		this.itemType = itemType;
	}

	@OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(columnDefinition = "bbox_id")
	public Bbox getBbox() {
		return bbox;
	}

	public void setBbox(Bbox bbox) {
		this.bbox = bbox;
	}

	@Column(name = "name", length = NAME_MAX_LENGTH)
	public String getName() {
		return name;
	}

	public void setName(String name) {
		StringPrecondition.checkStringArgument(name, NAME_MAX_LENGTH);
		this.name = name;
	}

	@Enumerated(EnumType.STRING)
	public Item.Type getType() {
		return type;
	}

	public void setType(Item.Type type) {
		this.type = type;
	}

	@Column(name = "attr", length = ATTR_MAX_LENGTH)
	public String getAttr() {
		return attr;
	}

	public void setAttr(String attr) {
		StringPrecondition.checkStringArgument(attr, ATTR_MAX_LENGTH);
		this.attr = (StringUtils.isBlank(attr)) ? null : attr;
	}

	public boolean isRibbonable() {
		return ribbonable;
	}

	public void setRibbonable(boolean ribbonable) {
		this.ribbonable = ribbonable;
	}

	@Column(name = "show_children")
	public boolean isShowChildren() {
		return showChildren;
	}

	public void setShowChildren(boolean showChildren) {
		this.showChildren = showChildren;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	@OneToOne(cascade = CascadeType.ALL)
	@JoinColumn(columnDefinition = "summary_id")
	public Summary getSummary() {
		return summary;
	}

	public void setSummary(Summary summary) {
		this.summary = summary;
	}

	@OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
	@JoinTable(name = "service_item",
			joinColumns = {
				@JoinColumn(name = "item_id", referencedColumnName = "id")
			},
			inverseJoinColumns = {
				@JoinColumn(name = "service_id", referencedColumnName = "id")
			})
	@IndexColumn(name = "list_index")
	public List<Service> getServices() {
		return services;
	}

	public void setServices(List<Service> services) {
		this.services = (services == null) ? new LinkedList<Service>() : services;
	}

	@ManyToMany(fetch = FetchType.LAZY)
	@LazyCollection(LazyCollectionOption.EXTRA)
	@JoinTable(
			name = "aggregation_children",
			joinColumns = {
				@JoinColumn(name = "aggregation_id", referencedColumnName = "id")},
			inverseJoinColumns = {
				@JoinColumn(name = "item_id", referencedColumnName = "id")})
	@IndexColumn(name = "list_index")
	public List<Item> getChildren() {
		return children;
	}

	public List<String> proxiedChildren() {
		List<String> ids = new ArrayList<>();
		List<Item> items = getChildren();
		if (items != null) {
			for (Item item : items) {
				ids.add(item.getId());
			}
		}
		return ids;
	}

	/**
	 * For Gson serialization, we want null rather than empty lists
	 *
	 * @param children
	 */
	public void setChildren(List<Item> children) {
		this.children = (children == null || children.isEmpty()) ? null : children;
	}

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "displayed_children",
			joinColumns = @JoinColumn(name = "item_id"))
	@IndexColumn(name = "list_index")
	@Column(name = "child_id")
	public List<String> getDisplayedChildren() {
		return displayedChildren;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "last_update")
	@Override
	public Date getLastModified() {
		return lastUpdate;
	}

	public void setLastModified(Date timestamp) {
		this.lastUpdate = timestamp;
	}
	
	/**
	 * Defines whether a storm is currently active
	 * @return 
	 */
	@Column(name="active_storm")
	public boolean isActiveStorm() {
		return activeStorm;
	}

	/**
	 * Set whether or not a storm is currently active
	 * @param isActiveStorm 
	 */
	public void setActiveStorm(boolean isActiveStorm) {
		this.activeStorm = isActiveStorm;
	}

	public boolean isFeatured() {
		return featured;
	}

	public void setFeatured(boolean featured) {
		this.featured = featured;
	}

	@PrePersist
	@PreUpdate
	protected void timestamp() {
		this.lastUpdate = new Date();
	}
	
	public void setDisplayedChildren(List<String> displayedChildren) {
		this.displayedChildren = displayedChildren;
	}

	public String toJSON(boolean subtree) {
		Gson gson;
		if (subtree) {
			gson = GsonUtil.getSubtreeGson();
		}
		else {
			gson = GsonUtil.getIdOnlyGson();
		}
		return gson.toJson(this);
	}

	public static Item fromJSON(String json) {

		Item node;
		Gson gson = GsonUtil.getSubtreeGson();

		node = gson.fromJson(json, Item.class);
		if (node.getId() == null || StringUtils.isBlank(node.getId())) {
			node.setId(IdGenerator.generate());
		}
		return node;
	}

	/**
	 * I'm creating a new item rather than modifying references (hence final)
	 *
	 * @param from item to copy values from
	 * @param to item to retain ids for
	 * @return new Item that is fully hydrated
	 */
	public static Item copyValues(final Item from, final Item to) {
		Item item = new Item();
		
		if (to != null && to.getItemType() != from.getItemType()) {
			throw new UnsupportedOperationException("Cannot change item type");
		}
		String id = from.getId();
		Bbox toBbox = null;
		Summary toSummary = null;
		if (to != null) {
			id = to.getId();
			toBbox = to.getBbox();
			toSummary = to.getSummary();
		}
		item.setId(id);
		item.setItemType(from.getItemType());
		item.setType(from.getType());
		item.setName(from.getName());
		item.setAttr(from.getAttr());
		item.setBbox(Bbox.copyValues(from.getBbox(), toBbox));
		item.setSummary(Summary.copyValues(from.getSummary(), toSummary));
		item.setRibbonable(from.isRibbonable());
		item.setShowChildren(from.isShowChildren());
		item.setEnabled(from.isEnabled());
		item.setServices(from.getServices());
		item.setChildren(from.getChildren());
		item.setDisplayedChildren(from.getDisplayedChildren());
		item.setActiveStorm(from.isActiveStorm());
		item.setFeatured(from.isFeatured());

		return item;
	}
	
	public Item instantiateTemplate(List<Service> withServices) {
		Item item = new Item();
		
		if (this.getItemType() != ItemType.template) {
			throw new UnsupportedOperationException("Only templates may be instantiated");
		}
		
		item.setId(IdGenerator.generate());
		item.setItemType(Item.ItemType.data);
		
		item.setType(getType());
		item.setName(getName());
		item.setAttr(getAttr());
		item.setBbox(Bbox.copyValues(getBbox(), null));
		item.setSummary(Summary.copyValues(getSummary(), null));
		item.setRibbonable(isRibbonable());
		item.setEnabled(isEnabled());
		
		List<Service> tmpServices = getServices();
		tmpServices.addAll(withServices);
		item.setServices(tmpServices);
		
		return item;
	}
	
	/**
	 * Get the WMSService to display from the services
	 *
	 * @return
	 */
	public WMSService fetchWmsService() {
		WMSService wmsService = null;
		OGCService ogc = fetchOgcService(ServiceType.proxy_wms);
		if (ogc instanceof WMSService) {
			wmsService = (WMSService) ogc;
		}
		return wmsService;
	}

	public CSWService fetchCswService() {
		CSWService cswService = null;
		OGCService ogc = fetchOgcService(ServiceType.csw);
		if (ogc instanceof CSWService) {
			cswService = (CSWService) ogc;
		}
		return cswService;
	}

	public WFSService fetchWfsService() {
		WFSService wfsService = null;
		OGCService ogc = fetchOgcService(ServiceType.proxy_wfs);
		if (ogc instanceof WFSService) {
			wfsService = (WFSService) ogc;
		}
		return wfsService;
	}

	private OGCService fetchOgcService(ServiceType type) {
		OGCService ogc = Service.ogcHelper(type, services);
		return ogc;
	}

	@Override
	public int hashCode() {
		int hash = 7;
		hash = 97 * hash + Objects.hashCode(this.id);
		hash = 97 * hash + Objects.hashCode(this.itemType);
		hash = 97 * hash + Objects.hashCode(this.name);
		hash = 97 * hash + Objects.hashCode(this.bbox);
		hash = 97 * hash + Objects.hashCode(this.type);
		hash = 97 * hash + Objects.hashCode(this.attr);
		hash = 97 * hash + (this.ribbonable ? 1 : 0);
		hash = 97 * hash + (this.showChildren ? 1 : 0);
		hash = 97 * hash + (this.enabled ? 1 : 0);
		hash = 97 * hash + Objects.hashCode(this.summary);
		hash = 97 * hash + Objects.hashCode(this.services);
		hash = 97 * hash + Objects.hashCode(this.children);
		hash = 97 * hash + Objects.hashCode(this.displayedChildren);
		hash = 97 * hash + Objects.hashCode(this.lastUpdate);
		hash = 97 * hash + (this.activeStorm ? 1 : 0);
		hash = 97 * hash + (this.featured ? 1 : 0);
		return hash;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		final Item other = (Item) obj;
		if (this.ribbonable != other.ribbonable) {
			return false;
		}
		if (this.showChildren != other.showChildren) {
			return false;
		}
		if (this.enabled != other.enabled) {
			return false;
		}
		if (this.activeStorm != other.activeStorm) {
			return false;
		}
		if (this.featured != other.featured) {
			return false;
		}
		if (!Objects.equals(this.id, other.id)) {
			return false;
		}
		if (!Objects.equals(this.name, other.name)) {
			return false;
		}
		if (!Objects.equals(this.attr, other.attr)) {
			return false;
		}
		if (this.itemType != other.itemType) {
			return false;
		}
		if (!Objects.equals(this.bbox, other.bbox)) {
			return false;
		}
		if (this.type != other.type) {
			return false;
		}
		if (!Objects.equals(this.summary, other.summary)) {
			return false;
		}
		if (!Objects.equals(this.services, other.services)) {
			return false;
		}
		if (!Objects.equals(this.children, other.children)) {
			return false;
		}
		if (!Objects.equals(this.displayedChildren, other.displayedChildren)) {
			return false;
		}
		if (!Objects.equals(this.lastUpdate, other.lastUpdate)) {
			return false;
		}
		return true;
	}
}
