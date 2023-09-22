var Map = (function () {
    var data;
    var settings = {
        width: 40,
        height: 40,
        landMin: 300,
        landMax: 350,
        noiseDensity: 0.15,
        minIslandSize: 100,
        hillsPct: 0.25, 
        hillsSpread: 0.5,
        hillsShrink: 0.5,
        mountainsPcts: [0.05, 0.15, 0.25, 0.35, 0.45, 0.55]        
    };
    var lands = [];
    var waters = [];
    var hills = [];
    var mountains = [];
    var canvas;
    var context;
    
    function createLand(x, y, landVal) {
        var land = {
            land: landVal,
            neighbors: {},
            location: {x: x, y: y},
            screenLocation: {x: -1, y: -1}
        };

        setLand(land);
        
        data[x][y] = land;
    }
    
    function setLand(land) { 
        if(land.land > 0) {
            land.terrainType = "Plains";
            lands.push(land);
            land.landIndex = lands.length - 1;
            land.waterIndex = -1;
        } else {
            land.terrainType = "Water";
            waters.push(land);
            land.waterIndex = waters.length - 1;
            land.landIndex = -1;
        }        
    }
    
    function addNeighbors() {
        for(var y = 0; y < settings.height; y++) {
            for(var x = 0; x < settings.width; x++) {
                var land = data[x][y];
                
                if(y > 0) {
                    land.neighbors["n"] = data[x][y - 1];
                }
                if(y + 1 < settings.height) {
                    land.neighbors["s"] = data[x][y + 1];
                }
                
                if(x % 2 === 0) {
                    if(x > 0) {
                        land.neighbors["nw"] = data[x - 1][y];
                    }
                    if(x > 0 && y + 1 < settings.height) {
                        land.neighbors["sw"] = data[x - 1][y + 1];
                    }
                    if(x < settings.width) {
                        land.neighbors["ne"] = data[x + 1][y];
                    }
                    if(x < settings.width && y + 1 < settings.height) {
                        land.neighbors["se"] = data[x + 1][y + 1];
                    }
                } else {
                    if(x > 0 && y > 0) {
                        land.neighbors["nw"] = data[x - 1][y - 1];
                    }
                    if(x > 0) {
                        land.neighbors["sw"] = data[x - 1][y];
                    }
                    if(x + 1< settings.width && y > 0) {
                        land.neighbors["ne"] = data[x + 1][y - 1];
                    }
                    if(x + 1 < settings.width) {
                        land.neighbors["se"] = data[x + 1][y];
                    }
                }    
            }
        }
    }
    
    function addHills() {
        var hillsMax = lands.length * settings.hillsPct;
        while(hills.length < hillsMax) {
            var hill = lands[Math.floor(Math.random() * lands.length)];
            burnMap(hill, hills, settings.hillsSpread, settings.hillsShrink, "Hills");
        }
    }
    
    function burnMap(land, landArr, chance, change, terrainType) {
        if(land.landIndex > -1 && land.terrainType !== terrainType) {
            landArr.push(land);   
            land.terrainType = terrainType;
            for(var n in land.neighbors) {
                if(Math.random() < chance) {
                    burnMap(land.neighbors[n], landArr, chance * change, change, terrainType);
                }
            }            
        }
    }
    
    function addMountains() {
        for(var i = 0; i < hills.length; i++) {
            var hillCount = 0;
            var isNearWater = false;
            for(var n in hills[i].neighbors) {
                var neighbor = hills[i].neighbors[n];
                if(neighbor.terrainType === "Mountains" || neighbor.terrainType === "Hills") {
                    hillCount++;
                }
                if(neighbor.terrainType === "Water") {
                    isNearWater = true;
                    break;
                }
            }
            if(!isNearWater) {
                var chance = settings.mountainsPcts[hillCount];
                if(Math.random() < chance) {
                    hills[i].terrainType = "Mountains";
                    mountains.push(hills[i]);
                }
            }
        }
    }
    
    function create(config) {      
        $.extend(settings, config);         
        var maxDistance = Math.sqrt(settings.width * settings.width + settings.height * settings.height);
                
        var maxTries = 100;
        while((lands.length < settings.landMin || lands.length > settings.landMax) && maxTries-- > 0) {
            noise.seed(Math.random());
            data = [];
            lands = [];
            waters = [];
            for(var x = 0; x < settings.width; x++) {        
                data.push([]);
                for(var y = 0; y < settings.height; y++) {
                    var d = calcDistanceToCenter(x, y) / maxDistance * 4.2;

                    zValue = settings.noiseDensity * 2;

                    var noiseValue = noise.perlin3(x * settings.noiseDensity, y * settings.noiseDensity, zValue) + 0.75;
                    var landVal = noiseValue - d;

                    createLand(x, y, landVal);
                }
            }
            
            addNeighbors();
            removeSmallIslands();
        }
        
        addHills();
        addMountains();
        
        return {
            data: data,
            width: data.length,
            height: data[0].length
        };
    }
    
    function debug() {
        var context = setupCanvas();
        var map = create();
        context.font = "15pt Arial";        
        draw(context, 0, 0, 20);        
        context.fillStyle = "white";
        context.fillText(lands.length, 10, 500);
        
        return map;
    }
    
    function setupCanvas() {
        canvas = document.getElementById("canMap");
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        context = canvas.getContext("2d");
        return context;
    }
    
    function calcDistanceToCenter(x, y) {
        var cx = settings.width / 2;
        var cy = settings.height / 2;
        var dx = x - cx;
        var dy = y - cy;
        var d = Math.sqrt(dx * dx + dy * dy);
        return d;
    }
    
    function removeSmallIslands() {        
        //Reset visited flag for all lands
        for(var i = 0; i < lands.length; i++) {
            lands[i].visited = false;
        }
        var removeList = [];
        for(var x = 0; x < settings.width; x++) {
            for(var y = 0; y < settings.width; y++) {
                var land = data[x][y];
                if(!land.visited && land.land > 0) {                    
                    var landSize = getIslandSize(x, y);
                    //draw(0, 0);
                    if(landSize < settings.minIslandSize) {                    
                        removeList.push(land);
                    } 
                }
            }
        }
        
        //Reset visited flag for all lands
        for(var i = 0; i < lands.length; i++) {
            lands[i].visited = false;
        }
        
        for(var i = 0; i < removeList.length; i++) {
            clearIsland(removeList[i].location.x, removeList[i].location.y);
        }
    }
    
    function clearIsland(x, y) {
        var land = data[x][y];
        land.visited = true;
        land.land = 0;
        lands.splice(land.landIndex, 1);
        setLand(land);
        land.terrainType = "cleared";
        for(var i in land.neighbors) {
            if(!land.neighbors[i].visited && land.neighbors[i].land > 0) {                
                clearIsland(land.neighbors[i].location.x, land.neighbors[i].location.y);
            }
        }
    }
    
    function getSurroundingLandCount(x, y) {
        var land = data[x][y];
        var landCount = 0;
        for(var i in land.neighbors) {
            if(land.neighbors[i].land > 0) {
                landCount++;
            }
        }
        return landCount;
    }
    
    function getIslandSize(x, y) {
        var land = data[x][y];
        var count = 0;        
        var landChecks = [land];
        land.visited = true;  
        while(landChecks.length > 0 && count < 10000) {
            count++;
            land = landChecks[0];   
            //land.terrainType = "visited";
            for(var i in land.neighbors) {
                var neighbor = land.neighbors[i];
                if(!neighbor.visited && neighbor.land > 0) {
                    neighbor.visited = true;
                    landChecks.push(neighbor);
                }
            }
            landChecks.splice(0, 1);
        }
        return count;
    }
        
    function draw(context, offsetX, offsetY, size) {        
        
        for(var y = 0; y < data.length; y++) {
            for(var x = 0; x < data[0].length; x++) {
                if(data[x][y].terrainType === "Water") {
                    context.fillStyle = "blue";
                } else if(data[x][y].terrainType === "Plains") {
                    context.fillStyle = "green";
                } else {
                    context.fillStyle = "red";
                }
                context.fillRect(x * size + offsetX, y * size + offsetY, size, size);
            }
        }
    }
    
    return {
        create: create,
        debug: debug
    };
})();
