package gov.usgs.cida.coastalhazards.model;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import gov.usgs.cida.coastalhazards.model.ogc.WFSService;
import gov.usgs.cida.coastalhazards.model.ogc.WMSService;
import gov.usgs.cida.utilities.IdGenerator;
import java.io.Serializable;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name="item")
public class Item implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private String id;
    private String name;
    private String metadata;
    private String type;
    private String attr;
    private double[] bbox;
    private WFSService wfsService;
    private WMSService wmsService;
    private Summary summary;
    
    @Id
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Column(name="metadata")
    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }
    
    public WFSService getWfsService() {
        return wfsService;
    }

    public void setWfsService(WFSService wfsService) {
        this.wfsService = wfsService;
    }

    public WMSService getWmsService() {
        return wmsService;
    }

    public void setWmsService(WMSService wmsService) {
        this.wmsService = wmsService;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getAttr() {
        return attr;
    }

    public void setAttr(String attr) {
        this.attr = attr;
    }

    public double[] getBbox() {
        return bbox;
    }

    public void setBbox(double[] bbox) {
        this.bbox = bbox;
    }

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(columnDefinition = "summary_id")
    public Summary getSummary() {
        return summary;
    }

    public void setSummary(Summary summary) {
        this.summary = summary;
    }
    
    
    
    public static Item fromJSON(String json) {
        
        Item item;
        GsonBuilder gsonBuilder = new GsonBuilder();
//        gsonBuilder.registerTypeAdapter(Geometry.class, new GeometryDeserializer());
//        gsonBuilder.registerTypeAdapter(Envelope.class, new EnvelopeDeserializer());
//        gsonBuilder.registerTypeAdapter(CoordinateSequence.class, new CoordinateSequenceDeserializer());
        Gson gson = gsonBuilder.create();

        item = gson.fromJson(json, Item.class);
        if (item.getId() == null) {
            item.setId(IdGenerator.generate());
        }
        return item;
    }
    
    public String toJSON() {
        return new Gson().toJson(this);
    }

}
