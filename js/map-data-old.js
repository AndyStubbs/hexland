var map = (function () {
    var data;
    var settings = {};
    var lands = [];
    var waters = [];
    var canvas;
    var context;
    
    function createLand(x, y, landVal) {
        var land = {
            land: landVal,
            neighbors: {},
            location: {x: x, y: y}
        };

        if(land.land === 0) {
            land.terrainType = "Plains";
            lands.push(land);
        } else {
            land.terrainType = "Water";
            waters.push(land);
        }
        
        data[y][x] = land;
    }
    
    function addNeighbors() {
        for(var y = 0; y < settings.height; y++) {
            for(var x = 0; x < settings.width; x++) {
                var land = data[y][x];
                
                //North - South Connection
                if(y > 0) {
                    land.neighbors["n"] = data[y - 1][x];
                    data[y - 1][x].neighbors["s"] = land;
                }

                //North West - South East Connection
                if(x > 0 && y > 0) {
                    land.neighbors["nw"] = data[y - 1][x - 1];
                    data[y - 1][x - 1].neighbors["se"] = land;
                }

                //South West - North East Connection
                if(x > 0) {
                    land.neighbors["sw"] = data[y][x - 1];
                    data[y][x - 1].neighbors["ne"] = land;
                }        
            }
        }
    }
    
    function setupCanvas() {
        canvas = document.getElementById("canMap");
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        context = canvas.getContext("2d");
    }
    
    function create(config) {
        setupCanvas();
        var defaults = {
            width: 80,
            height: 50,
            hillsPct: 0.15,
            hillsSize: 3,
            mountainsPct: 0.05,
            waterFillPct: 0.4
        };
        $.extend(settings, defaults, config);
        
        var cnt2 = 0;        
        var maxLandTiles = (settings.width * settings.height) - (settings.width * 2 + settings.height * 2);
        var landPct = 1 - settings.waterFillPct;
        var minLands = Math.ceil(maxLandTiles * landPct);
        var mapSize = settings.width + settings.height;
        
        do {
            data = [];            
            lands = [];
            waters = [];
        
            for(var y = 0; y < settings.height; y++) {
                data.push([]);
                for(var x = 0; x < settings.width; x++) {
                    var d = calcDistanceToCenter(x, y);
                    var chance = Math.random() - (d / mapSize);
                    var landVal = 1;
                    if(chance > settings.waterFillPct) {
                        landVal = 0;                        
                    }              
                    if(x === 0 || y === 0 || x === settings.width - 1 || y === settings.height - 1) {
                        landVal = 1;
                    }
                    createLand(x, y, landVal);
                }
            }

            //Smooth the map
            for(var i = 0; i < 5; i++) {
                smoothMap2();
            }
            
            cnt2++;
        } while(lands.length < minLands && cnt2 < 50);       
        
        addNeighbors();
    }
    
    function calcDistanceToCenter(x, y) {
        var cx = settings.width / 2;
        var cy = settings.height / 2;
        var dx = x - cx;
        var dy = y - cy;
        var d = Math.sqrt(dx * dx + dy * dy);
        return d;
    }
    
    function smoothMap() {
        lands = [];
        waters = [];
		for(var y = 0; y < settings.height - 1; y++) {
			for(var x = 0; x < settings.width - 1; x++) {
				var wallTiles = getSurroundingWallCount(x, y);
				if(wallTiles > 4) {
					data[y][x].land = 1;                    
				} else if(wallTiles < 4) {
					data[y][x].land = 0;                   
				} 
                if(data[y][x].land === 0) {
                    data[y][x].terrainType = "Plains";                    
                    lands.push(data[y][x]);
                } else {
                    waters.push(data[y][x]);
                    data[y][x].terrainType = "Water";
                }
			}
		}
	}
    
    function smoothMap2() {
        lands = [];
        waters = [];
		var cnt = settings.width * settings.height;
        
        while(cnt > 0) {
            y = Math.floor(Math.random() * settings.height);
            x = Math.floor(Math.random() * settings.width);
            
            var wallTiles = getSurroundingWallCount(x, y);
            if(wallTiles > 4) {
                data[y][x].land = 1;                    
            } else if(wallTiles < 4) {
                data[y][x].land = 0;                   
            } 
            if(data[y][x].land === 0) {
                data[y][x].terrainType = "Plains";                    
                lands.push(data[y][x]);
            } else {
                waters.push(data[y][x]);
                data[y][x].terrainType = "Water";
            }
            
            cnt--;
        }
    }
    
    function getSurroundingWallCount(x, y) {
		var wallCount = 0;
		for(var nx = x - 1; nx <= x + 1; nx++) {
			for(var ny = y - 1; ny <= y + 1; ny++) {
				if(nx >= 0 && nx < settings.width && ny >= 0 && ny < settings.height) {
					if(nx != x || ny != y) {						
						wallCount += data[ny][nx].land;
					}
				} else {
					wallCount++;
				}
			}
		}
		return wallCount;
	}
    
    function draw() {
        var size = 10;
        
        for(var y = 0; y < data[0].length; y++) {
            for(var x = 0; x < data.length; x++) {
                if(data[y][x].terrainType === "Water") {
                    context.fillStyle = "blue";
                } else {
                    context.fillStyle = "green";
                }
                context.fillRect(x * size, y * size, size, size)
            }
        }
    }
    
    return {
        create: create,
        draw: draw
    };
})();

map.create();
map.draw();