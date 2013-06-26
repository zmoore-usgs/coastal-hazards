package gov.usgs.cida.coastalhazards.model;

import java.io.Serializable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 *
 * @author Jordan Walker <jiwalker@usgs.gov>
 */
@Entity
@Table(name = "authorized_users")
public class AuthorizedUser implements Serializable {

    private transient long id;
    private String name;
    private String email;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Slightly dangerous .equals, ignores name and id.
     * Doing this to hijack the List.contains
     * @param o
     * @return whether email is the same
     */
    @Override
    public boolean equals(Object o) {
        boolean equals = false;
        if (o instanceof AuthorizedUser) {
            AuthorizedUser compareTo = (AuthorizedUser)o;
            equals = this.getEmail().equals(compareTo.getEmail());
        }
        return equals;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 17 * hash + (this.email != null ? this.email.hashCode() : 0);
        return hash;
    }

}
