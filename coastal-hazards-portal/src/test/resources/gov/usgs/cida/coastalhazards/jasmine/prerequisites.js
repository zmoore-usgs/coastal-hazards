// Top level global object
var CCH = {};

// The LOG4JS logger being used throughout the project. This should just be a
// passthrough function
CCH.LOG = function () {
	return {
		trace: function (args) {
			return args;
		},
		debug: function (args) {
			return args;
		},
		info: function (args) {
			return args;
		},
		warn: function (args) {
			return args;
		},
		error: function (args) {
			return args;
		},
		fatal: function (args) {
			return args;
		},
		off: function (args) {
			return args;
		}
	};
};