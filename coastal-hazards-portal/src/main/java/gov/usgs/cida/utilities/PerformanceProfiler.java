/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package gov.usgs.cida.utilities;

import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

/**
 *
 * @author thongsav
 */
public class PerformanceProfiler {
    private static final Logger log = LoggerFactory.getLogger("performance-profile");
	
	private static Cache<String, Long> startTimes = CacheBuilder.newBuilder()
			.expireAfterWrite(30, TimeUnit.MINUTES)
			.build();
	
	private static final String LOG_PATTERN = "{}\t{}\t{}";
	
	/**
	 * Creates a timer with the specified ID
	 * 
	 * @param id The ID to use for the new timer
	 */
	public static void startTimer(String id) {
		long startTime = System.currentTimeMillis();
		startTimes.put(id, startTime);
		log.trace(LOG_PATTERN,
				startTime, 
				"",
				"STARTING " + id);
	}
	
	/**
	 * Stops the timer with the specified ID and prints a trace log of the start
	 * time, total time, and timer ID.
	 * 
	 * @param id The ID of the timer to stop
	 */
	public static void stopTrace(String id) {
		long totalTime = -1;
		long endTime = System.currentTimeMillis();
		Long startTime = startTimes.getIfPresent(id);
		if (startTime != null) {
			totalTime = endTime - startTime;
		}
		
		log.trace(LOG_PATTERN,
				startTime, 
				totalTime,
				id);
	}

	/**
	 * Stops the timer with the specified ID and prints a debug log of the start
	 * time, total time, and timer ID.
	 * 
	 * @param id The ID of the timer to stop
	 */
	public static void stopDebug(String id) {
		long totalTime = -1;
		long endTime = System.currentTimeMillis();
		Long startTime = startTimes.getIfPresent(id);
		if (startTime != null) {
			totalTime = endTime - startTime;
		}
		
		log.debug(LOG_PATTERN,
				startTime, 
				totalTime,
				id);
	}
}
