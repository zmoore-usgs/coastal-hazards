describe('CCH', function () {
	it('should be an object', function () {
		expect(CCH).toBeDefined();
	});
});

describe('CCH.LOG', function () {
	it('should be defined', function () {
		expect(CCH.LOG).toBeDefined();
	});
	
	it('should be an instantiable object', function () {
		var log = new CCH.LOG();
		expect(log).toBeDefined();
	});
	
	it('should have the breadth of log level calls available', function () {
		var log = new CCH.LOG();
		var inputOutput = "TEST";
		expect(log.trace(inputOutput)).toBe(inputOutput);
		expect(log.debug(inputOutput)).toBe(inputOutput);
		expect(log.info(inputOutput)).toBe(inputOutput);
		expect(log.warn(inputOutput)).toBe(inputOutput);
		expect(log.error(inputOutput)).toBe(inputOutput);
		expect(log.fatal(inputOutput)).toBe(inputOutput);
	});
});