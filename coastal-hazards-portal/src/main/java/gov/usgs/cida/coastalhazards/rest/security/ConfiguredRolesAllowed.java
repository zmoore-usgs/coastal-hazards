package gov.usgs.cida.coastalhazards.rest.security;

import java.lang.annotation.*;
import static java.lang.annotation.ElementType.*;
import static java.lang.annotation.RetentionPolicy.*;

/**
 *
 * @author zmoore
 */
@Retention(RUNTIME)
@Target({TYPE, METHOD})
public @interface ConfiguredRolesAllowed {
	String value();
}