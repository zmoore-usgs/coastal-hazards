package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;

public class Mapproj {
    
    String mapprojn;
    Mapprojp mapprojp;
    
    public String getMapprojn(){
        return mapprojn;
    }
    
    @XmlElement
    public void setMapprojn(String mapprojn){
        this.mapprojn = mapprojn;
    }
    
    public Mapprojp getMapprojp(){
        return mapprojp;
    }
    
    @XmlElement
    public void setMapprojp(Mapprojp mapprojp){
        this.mapprojp = mapprojp;
    }    
}
