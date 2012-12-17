var Util =  {
    
    getRandomColor : function() {
        var Colors = {};
        Colors.names = {
            aqua: "#00ffff",
            azure: "#f0ffff",
            beige: "#f5f5dc",
            black: "#000000",
            blue: "#0000ff",
            brown: "#a52a2a",
            cyan: "#00ffff",
            darkblue: "#00008b",
            darkcyan: "#008b8b",
            darkgrey: "#a9a9a9",
            darkgreen: "#006400",
            darkkhaki: "#bdb76b",
            darkmagenta: "#8b008b",
            darkolivegreen: "#556b2f",
            darkorange: "#ff8c00",
            darkorchid: "#9932cc",
            darkred: "#8b0000",
            darksalmon: "#e9967a",
            darkviolet: "#9400d3",
            fuchsia: "#ff00ff",
            gold: "#ffd700",
            green: "#008000",
            indigo: "#4b0082",
            khaki: "#f0e68c",
            lightblue: "#add8e6",
            lightcyan: "#e0ffff",
            lightgreen: "#90ee90",
            lightgrey: "#d3d3d3",
            lightpink: "#ffb6c1",
            lightyellow: "#ffffe0",
            lime: "#00ff00",
            magenta: "#ff00ff",
            maroon: "#800000",
            navy: "#000080",
            olive: "#808000",
            orange: "#ffa500",
            pink: "#ffc0cb",
            purple: "#800080",
            violet: "#800080",
            red: "#ff0000",
            silver: "#c0c0c0",
            white: "#ffffff",
            yellow: "#ffff00"
        }
        
        var result;
        var count = 0;
        for (var prop in  Colors.names) {
            if (Math.random() < 1/++count) {
                result = prop;
            }
        }
        return Colors.names[result];
    
        
    },
    randomGUID : function () {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
    
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    randomUUID : function() {
        var s = [], itoh = '0123456789ABCDEF';
 
        // Make array of random hex digits. The UUID only has 32 digits in it, but we
        // allocate an extra items to make room for the '-'s we'll be inserting.
        for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);
 
        // Conform to RFC-4122, section 4.4
        s[14] = 4;  // Set 4 high bits of time_high field to version
        s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
 
        // Convert to hex chars
        for (var i = 0; i <36; i++) s[i] = itoh[s[i]];
 
        // Insert '-'s
        s[8] = s[13] = s[18] = s[23] = '-';
 
        return s.join('');
    },
    makeGroups : function(groupItems) {
        var firstGroupItem = groupItems[0];
        
        if (!isNaN(Date.parse(firstGroupItem))) {
            LOG.info("Grouping by date/decade");
            var dateBegin = Date.create(firstGroupItem);
            var dateEnd = Date.create(firstGroupItem);
            $(groupItems).each(function(i, dateItem) {
                var date = Date.create(dateItem);
                if (date.isBefore(dateBegin)) {
                    dateBegin = date;
                }
                
                if (date.isAfter(dateEnd)) {
                    dateEnd = date;
                }
            })
            return Date.range(dateBegin,dateEnd).every('10 years');
        } else if (!isNaN(firstGroupItem)) {
            LOG.info("Grouping by number");
            var groups = groupItems.sortBy();
            $(groups).each(function(i,v) {
                groups[i] = Number.ceil(v);
            })
            return groups.unique();
            
        } else if (typeof firstGroupItem === 'string') {
            LOG.info("Grouping by string");
        }
    },
    createColorGroup : function(groups) {
        var colorGroups = [];
        $(groups).each(function(i,group) {
            colorGroups.push([Util.getRandomColor().capitalize(true), group]);
        })
        return colorGroups;
    }
}




