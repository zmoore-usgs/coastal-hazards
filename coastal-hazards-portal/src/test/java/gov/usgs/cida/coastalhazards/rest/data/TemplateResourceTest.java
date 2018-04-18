package gov.usgs.cida.coastalhazards.rest.data;

import gov.usgs.cida.coastalhazards.jpa.AliasManager;
import gov.usgs.cida.coastalhazards.jpa.ItemManager;
import gov.usgs.cida.coastalhazards.model.Alias;
import gov.usgs.cida.coastalhazards.model.Item;
import gov.usgs.cida.coastalhazards.model.summary.Summary;
import java.util.List;
import java.util.Set;
import javax.persistence.EntityNotFoundException;
import javax.persistence.PersistenceException;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;
import org.junit.Before;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyZeroInteractions;
import static org.mockito.Mockito.when;

/**
 *
 * @author jiwalker
 */
public class TemplateResourceTest {

	
	private TemplateResource instance;
	private ItemManager mockItemMan;
	private AliasManager mockAliasMan;
	
	@Before
	public void setup() {
		instance = new TemplateResource();
		mockItemMan = mock(ItemManager.class);
		mockAliasMan = mock(AliasManager.class);
	}
	/**
	 * Test of keywordsFromString method, of class TemplateResource.
	 */
	@Test
	public void testKeywordsFromString() {
		String keywords = "test|a list|of|keywords";
		Set<String> result = instance.keywordsFromString(keywords);
		assertThat(result.size(), is(equalTo(4)));
	}

	@Test
	public void testNoExceptionsThrownWhileOrphaningNullTemplateId() {
		instance.orphanOriginalTemplate(null, mockItemMan);
		verifyZeroInteractions(mockItemMan);
	}

	@Test
	public void testNoExceptionsThrownWhileOrphaningBlankTemplateId() {
		instance.orphanOriginalTemplate("", mockItemMan);
		verifyZeroInteractions(mockItemMan);
	}
	
	@Test(expected = EntityNotFoundException.class)
	public void testMissingTemplateThrowsExceptionWhileOrphaning() {
		String id = "foo";
		//simulate Item being missing from DB
		when(mockItemMan.load(id)).thenReturn(null);
		instance.orphanOriginalTemplate(id, mockItemMan);
	}
	
	@Test(expected = PersistenceException.class)
	public void testThatItemManagerOrphanFailureThrowsException() {
		String id = "foo";
		Item item = mock(Item.class);
		
		//simulate Item being present in DB
		when(mockItemMan.load(id)).thenReturn(item);
		//simulate failure orphaning item
		when(mockItemMan.orphan(item)).thenReturn(false);
		instance.orphanOriginalTemplate(id, mockItemMan);
	}
	
	public void testThatSuccessfulItemManagerOrphaningThrowsNoException() {
		String id = "foo";
		Item item = mock(Item.class);
		
		//simulate Item being present in DB
		when(mockItemMan.load(id)).thenReturn(item);
		//simulate success orphaning item
		when(mockItemMan.orphan(item)).thenReturn(true);
		instance.orphanOriginalTemplate(id, mockItemMan);
	}

	@Test(expected = PersistenceException.class)
	public void testThatFailedItemHoistingThrowsException() {
		String id = "foo";
		//simulate failure hoisting item
		when(mockItemMan.hoistItemToTopLevel(id)).thenReturn(false);
		instance.hoistNewTemplateToTopLevel(id, mockItemMan);
	}
	
	@Test
	public void testThatSuccessfulItemHoistingThrowsNoException() {
		String id = "foo";
		//simulate failure hoisting item
		when(mockItemMan.hoistItemToTopLevel(id)).thenReturn(true);
		instance.hoistNewTemplateToTopLevel(id, mockItemMan);
	}
	
	@Test(expected = IllegalArgumentException.class)
	public void testThatUpdatingNullAliasThrowsException() {
		instance.updateStormAlias(null, mockAliasMan, "doesn't matter");
	}
	
	@Test(expected = IllegalArgumentException.class)
	public void testThatUpdatingBlankAliasThrowsException() {
		instance.updateStormAlias("", mockAliasMan, "doesn't matter");
	}
	
	@Test
	public void testThatUpdatingNonExistentAliasCreatesANewAlias() {
		String aliasId = "foo";
		String templateId = "bar";
		
		Alias expectedAlias = new Alias();
		expectedAlias.setId(aliasId);
		expectedAlias.setItemId(templateId);

		//simulate record being missing from DB
		when(mockAliasMan.load(aliasId)).thenReturn(null);
		
		String originalTemplateId = instance.updateStormAlias(aliasId, mockAliasMan, templateId);
		assertNull(originalTemplateId);
		
		verify(mockAliasMan).save(eq(expectedAlias));
		verify(mockAliasMan, never()).update(any());
	}
	
	@Test
	public void testThatUpdatingExistentAliasWorks() {
		String aliasId = "foo";
		String existingTemplateId = "bar";
		String newTemplateId = "baz";
		
		Alias existingAlias = new Alias();
		existingAlias.setId(aliasId);
		existingAlias.setItemId(existingTemplateId);

		Alias updatedAlias = new Alias();
		existingAlias.setId(aliasId);
		existingAlias.setItemId(newTemplateId);
		
		//simulate record being missing from DB
		when(mockAliasMan.load(aliasId)).thenReturn(existingAlias);
		
		String aliasOriginalTemplateId = instance.updateStormAlias(aliasId, mockAliasMan, newTemplateId);
		assertEquals(existingTemplateId, aliasOriginalTemplateId);
		
		verify(mockAliasMan).update(eq(updatedAlias));
		verify(mockAliasMan, never()).save(any());
	}
}
