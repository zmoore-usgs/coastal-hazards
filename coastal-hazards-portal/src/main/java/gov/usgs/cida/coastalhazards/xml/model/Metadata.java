package gov.usgs.cida.coastalhazards.xml.model;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement ( name = "metadata" )
public class Metadata {
    Idinfo idinfo;
    Spref spref;
    
    public Idinfo getIdinfo(){
        return idinfo;
    }
    
    @XmlElement( name = "idinfo" )
    public void setIdnfo(Idinfo idinfo){
        this.idinfo = idinfo;
    }
    
    public Spref getSpref(){
        return spref;
    }
    
    @XmlElement( name = "spref" )
    public void setSpref(Spref spref){
        this.spref = spref;
    }    
}
