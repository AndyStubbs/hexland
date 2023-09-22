var MapGenerator = (function() {
    
    function generateMap(width, height, gridWidth, gridHeight) {
        var map = {
            offset: {
                x: -0,
                y: -0
            },
            data: []
        };
        
        updateZoom(width, height, gridWidth, gridHeight, map);
        
        clearMap(map);
        var landGrids = createIsland(map);
        markOcean(map, 0, 0);
        calcElevation(map, landGrids);
        addTrees(map, landGrids);
        return map;
    }
    
    function updateZoom(width, height, gridWidth, gridHeight, map)
    {
        map.size = {
            width: width,
            height: height
        };
        map.gridSize = {
            width: gridWidth + 1,
            height: gridHeight + 1,
            halfWidth: gridWidth / 2 + 1,
            halfHeight: gridHeight / 2 + 1,
            quarterWidth: gridWidth / 4 + 1,
            quarterHeight: gridHeight / 4 + 1,
            hexDistanceX: gridWidth * .75 + 1
        };
    }
    
    function clearMap(map) {
        map.data = [];
        for(var x = 0; x < map.size.width; x++)
        {
            map.data.push([]);
            for(var y = 0; y < map.size.height; y++)
            {
                map.data[x][y] = {
                    color: "blue",
                    searched: false
                };
            }
        }
    }
    
    function createIsland(map)
    {
        var cx = Math.round(map.size.width / 2);
        var cy = Math.round(map.size.height / 2);
        noise.seed(Math.random());
        //noise.seed(100);
        var landGrids = [];
        for(var x = 0; x < map.size.width; x++)
        {
            for(var y = 0; y < map.size.height; y++)
            {
                var dx = x - cx;
                var dy = y - cy;
                var d = Math.sqrt(dx * dx + dy * dy);
                
                var value = noise.perlin2(x / 10, y / 10);
                var value2 = Math.round(value * 256) - d * 10;
                var color = "#8888FF";
                var tile = "water";
                var waterDistance = 0;
                var layers = [];
                if(value2 > -200)
                {
                    landGrids.push({x: x, y: y});
                    color = "green";
                    tile = "grass";
                }
                
                map.data[x][y] = { 
                    color: color,
                    tile: tile,
                    layers: layers,
                    waterDistance: waterDistance,
                    height: (value2 + 200) / 10,
                    treeList: [],
                    hasTrees: false
                };
            }
        }
        
        return landGrids;
    }
    
    function markOcean(map, x, y)
    {
        
        if(x >= map.data.length || x < 0 || y >= map.data[0].length || y < 0)
            return;
        
        if(!map.data[x][y].searched)
        {
            map.data[x][y].searched = true;
            
            if(map.data[x][y].tile === "water")
            {
                map.data[x][y].tile = "ocean";
            
                markOcean(map, x + 1, y);
                markOcean(map, x - 1, y);
                markOcean(map, x, y + 1);
                markOcean(map, x, y - 1);
            }
        }
    }
    
    function calcElevation(map, landGrids)
    {
        for(var i = 0; i < landGrids.length; i++)
        {
            var land = landGrids[i];
            var search = [];
            var searched = [];
            var waterDistance = 0;
            insertNextSearch(land, search, waterDistance, map, searched);
            while(search.length > 0)
            {
                var nextSearch = search.shift();
                waterDistance = nextSearch.waterDistance;
                var grid = map.data[nextSearch.x][nextSearch.y];
                
                if(grid.tile === "ocean")
                {
                    search = [];
                    grid = map.data[land.x][land.y];
                  
                    grid.waterDistance = waterDistance;
                    var height = waterDistance + grid.height;
                    
                    //Sand
                    if(waterDistance <= 2)
                    {
                        grid.color = "yellow";
                        grid.tile = "sand";
                    }
                    //Snow Mountain
                    /*
                    else if(waterDistance >= 15)
                    {
                        grid.color = "white";
                        grid.tile = "snowBackground";
                        grid.layers.splice(0, 0, "snow3");
                        if(Math.floor(Math.random() * 2) === 0)
                            grid.layers.splice(0, 0, "snow1");
                        else
                            grid.layers.splice(0, 0, "snow2");
                        
                    }*/
                    //Snow Mountain Mix
                    else if(height >= 35)
                    {
                        grid.color = "gray";
                        grid.tile = "snowBackground";
                        if(Math.floor(Math.random() * 3) === 0)
                            grid.layers.splice(0, 0, "mountainMix");
                        else if(Math.floor(Math.random() * 3) === 0)
                            grid.layers.splice(0, 0, "mountainMix2");
                        else
                            grid.layers.splice(0, 0, "snow3");
                        //addTrees(grid.layers, 1);
                    }
                    else if(height >= 30)
                    {
                        grid.color = "gray";
                        grid.tile = "mountainBackground";
                        grid.layers.splice(0, 0, "mountains2");
                        grid.treeList.push("trees1");
                        /*
                        if(Math.floor(Math.random() * 3) === 0)
                            grid.layers.splice(0, 0, "mountains");
                        else if(Math.floor(Math.random() * 3) === 0)
                            grid.layers.splice(0, 0, "mountains2");
                        else
                            grid.layers.splice(0, 0, "mountains3");
                          */  
                        //addTrees(grid.layers, 1);
                    }
                    //hills
                    else if(height >= 25)
                    {
                        grid.color = "olive";
                        grid.tile = "hillsBackground";
                         //if(Math.floor(Math.random() * 3) === 0)
                         //   grid.layers.splice(0, 0, "hills1");
                        if(Math.floor(Math.random() * 2) === 0)
                            grid.layers.splice(0, 0, "hills2");
                        else 
                            grid.layers.splice(0, 0, "hills3");
                        grid.treeList.push("trees1");    
                        //addTrees(grid.layers, 2);
                    }
                    else
                    {   
                        grid.treeList.push("trees1");
                        grid.treeList.push("trees2");
                        grid.treeList.push("trees3");
                        //addTrees(grid.layers, 3);
                    }
                }
                else
                {
                    var slope = 1;
                    if(grid.tile === "water")
                    {
                        slope = 0;
                    }
                    insertNextSearch({x: nextSearch.x + 1, y: nextSearch.y}, search, waterDistance + slope, map, searched);
                    insertNextSearch({x: nextSearch.x - 1, y: nextSearch.y}, search, waterDistance + slope, map, searched);
                    insertNextSearch({x: nextSearch.x, y: nextSearch.y + 1}, search, waterDistance + slope, map, searched);
                    insertNextSearch({x: nextSearch.x, y: nextSearch.y - 1}, search, waterDistance + slope, map, searched);
                }
            }
        }
    }
    
    function addTrees(map, landGrids)
    {
        var numForests = Math.floor(landGrids.length / 20);
        for(var i = 0; i < numForests; i++)    
        {
            var index = Math.floor(Math.random() * landGrids.length);
            var x = landGrids[index].x;
            var y = landGrids[index].y;
            if(map.data[x][y].treeList.length > 0)
                addForest(map, x, y, 5);
        }
    }
    
    function addForest(map, x, y, value)
    {
        var grid = map.data[x][y];
        value -= (4 - grid.treeList.length);
        if(grid.treeList.length > 0 && Math.floor(value * Math.random()) > 0)
        {
           grid.layers.push(grid.treeList[Math.floor(grid.treeList.length * Math.random())]);
           addForest(map, x + 1, y, value);
           addForest(map, x - 1, y, value);
           addForest(map, x, y + 1, value);
           addForest(map, x, y - 1, value);
        }
    }
    
    function insertNextSearch(coords, search, waterDistance, map, searched)
    {
        for(var i = 0; i < searched.length; i++)
        {
            if(searched[i].x === coords.x && searched[i].y === coords.y)
                return;
        }
        
        searched.push(coords);
        
        map.data[coords.x][coords.y].checked = true;
        var nextSearch = {
            x: coords.x,
            y: coords.y,
            waterDistance: waterDistance
        };
        var index = 0;
        if(search.length > 0)
        {
            while(index < search.length && waterDistance > search[index].waterDistance)
                index++;
        }
        search.splice(index, 0, nextSearch);
    }
    
    return {
        generateMap: generateMap,
        updateZoom: updateZoom
    }; 
})();