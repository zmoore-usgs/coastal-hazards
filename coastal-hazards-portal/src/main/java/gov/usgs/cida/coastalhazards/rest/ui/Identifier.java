package gov.usgs.cida.coastalhazards.rest.ui;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
public class Identifier {
    
    public Identifier() {
        super();
    }
    
    public Identifier(String id, IdentifierType type) {
        super();
        this.id = id;
        this.type = type;
    }

    public enum IdentifierType {
        VIEW,
        ITEM,
        INFO;
    }
    
    private String id;
    private IdentifierType type;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public IdentifierType getType() {
        return type;
    }

    public void setType(IdentifierType type) {
        this.type = type;
    }
}
