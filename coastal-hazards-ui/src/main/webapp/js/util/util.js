var Util =  {
    
    getRandomColor : function() {
        // http://paulirish.com/2009/random-hex-color-code-snippets/
        var randomColor = '';
        var createRandomColor = function() {
            return '#'+Math.floor(Math.random()*16777215).toString(16)
        }
        
        while (randomColor.length != 7) {
            randomColor = createRandomColor();
        }
        return randomColor;
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
    makeGroups : function(groupItems, range) {
        LOG.info("Util.js::makeGroups:")
        var groupItem = groupItems[0];
        
        if (!isNaN(Date.parse(groupItem))) {
            if (range) {
                LOG.info("Util.js::makeGroups: Grouping by date range");
                var dateBegin = Date.create(groupItem);
                var dateEnd = Date.create(groupItem);
                $(groupItems.unique()).each(function(i, dateItem) {
                    var date = Date.create(dateItem);
                    if (date.isBefore(dateBegin)) {
                        dateBegin = date;
                    }
                        
                    if (date.isAfter(dateEnd)) {
                        dateEnd = date;
                    }
                })
                
                return Date.range(dateBegin,dateEnd).every('1 year');
            } else {
                LOG.info("Util.js::makeGroups: Grouping by available dates");
                var yearSet = [];
                var sortedUniqueGroupItems = groupItems.unique().sortBy(function(n){
                    return n.split('/')[2]
                })
                $(sortedUniqueGroupItems).each(function(i, dateItem) {
                    var date = Date.create('01/01/' + dateItem.split('/')[2]);
                    yearSet.push(date);
                })
                return yearSet.unique();
            }
        }

        else if (!isNaN(groupItem)) {
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
    createColorGroups : function(groups) {
        LOG.info('Util.js::createColorGroups: Creating color groups')
        var colorGroups = [];
        $(groups).each(function(i,group) {
            var color = Util.getRandomColor().capitalize(true);
            // Make sure that we don't already have this color in the colorGroups or white or black
            while (colorGroups.find(function(n){
                return n[0] === color
                }) || color === '#FFFFFF' || color === '#000000') {
                color = Util.getRandomColor().capitalize(true);
            }
            colorGroups.push([color, group]);
        })
        LOG.info('Util.js::createColorGroups: Created ' + colorGroups.length + ' color groups');
        return colorGroups;
    },
    getRandomLorem : function() {
        var loremArray = [ "consectetuer" ,  "adipiscing" ,  "cursus" ,  "nullam" ,  
        "egestas" ,  "condimentum" ,  "laoreet" ,  "mattis" ,  "eleifend" ,  
        "nonummy" ,  "praesent" ,  "mauris" ,  "elementum" ,  "bibendum" ,  
        "posuere" ,  "tincidunt" ,  "lectus" ,  "viverra" ,  "vestibulum" ,  
        "suspendisse" ,  "vulputate" ,  "aliquam" ,  "vehicula" ,  "maecenas" ,  
        "placerat" ,  "consequat" ,  "rhoncus" ,  "gravida" ,  "imperdiet" ,  
        "tellus" ,  "auctor" ,  "sollicitudin" ,  "vivamus" ,  "pellentesque" ,  
        "habitant" ,  "tristique" ,  "senectus" ,  "malesuada" ,  "turpis" ,  
        "tortor" ,  "faucibus" ,  "accumsan" ,  "ultricies" ,  "molestie" ,  
        "dictum" ,  "iaculis" ,  "venenatis" ,  "euismod" ,  "integer" ,  
        "dapibus" ,  "fringilla" ,  "aenean" ,  "porttitor" ,  "convallis" ,  
        "volutpat" ,  "quisque" ,  "dignissim" ,  "congue" ,  "sociis" ,  
        "natoque" ,  "penatibus" ,  "magnis" ,  "parturient" ,  "montes" ,  
        "nascetur" ,  "ridiculus" ,  "facilisis" ,  "luctus" ,  "feugiat" ,  
        "pulvinar" ,  "curabitur" ,  "phasellus" ,  "ultrices" ,  "fermentum" ,  
        "hendrerit" ,  "rutrum" ,  "tempus" ,  "libero" ,  "ullamcorper" ,  
        "ligula" ,  "mollis" ,  "suscipit" ,  "sodales" ,  "scelerisque" ,  
        "commodo" ,  "sagittis" ,  "lobortis" ,  "pharetra" ,  "interdum" ,  
        "ornare" ,  "aliquet" ,  "semper" ,  "blandit" ,  "tempor" ,  "aptent" ,  
        "taciti" ,  "sociosqu" ,  "litora" ,  "torquent" ,  "conubia" ,  "nostra" ,  
        "inceptos" ,  "hymenaeos" ];
        return loremArray[Math.floor(Math.random() * loremArray.length)]
    }
}




