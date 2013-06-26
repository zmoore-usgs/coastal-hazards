/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.coastalhazards.model;

import java.util.ArrayList;
import java.util.List;
import org.junit.Test;
import static org.junit.Assert.*;

/**
 *
 * @author jiwalker
 */
public class AuthorizedUserTest {
    
    @Test
    public void testListContains() {
        List<AuthorizedUser> users = new ArrayList<AuthorizedUser>();
        AuthorizedUser a = new AuthorizedUser();
        a.setName("User A");
        a.setEmail("email@test.com");
        users.add(a);
        
        AuthorizedUser b = new AuthorizedUser();
        b.setName("User B");
        b.setEmail("email@test.com");
        assertTrue(users.contains(b));
    }
}