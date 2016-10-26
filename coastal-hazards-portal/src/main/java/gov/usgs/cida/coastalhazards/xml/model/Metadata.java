package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement ( name = "metadata" )
public class Metadata {
    Idinfo idinfo;
    
    public Idinfo getIdinfo(){
        return idinfo;
    }
    
    @XmlElement( name = "idinfo" )
    public void setIdnfo(Idinfo idinfo){
        this.idinfo = idinfo;
    }
}
