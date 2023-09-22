var MapDraw = (function () {
    var settings = {        
        zoom: 5,
        hexWidth: 32,
        hexHeight: 26,
        highlightColor: "rgba(255, 255, 255, 0.25)"
    };
    var canvas;
    var context;
    var map;
    
    //Offset by pixels
    var offsetX = 0;
    var offsetY = 0;
    var tileWidth;
    var tileHeight;
    var mapScreenWidth;
    var mapScreenHeight;
    var drawWidth;
    var drawHeight;
    var tilesPerScreenWidth;
    var tilesPerScreenHeight;
    var hex = {};
    var colWidth;
    var highLightedTiles = [];
    
    function setup(config) {
        $.extend(settings, config);
        canvas = settings.canvas;
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        context = canvas.getContext("2d");
        map = settings.map;
        calculateSizes();
        offsetX = mapScreenWidth / 2 + 30;
        offsetY = mapScreenHeight / 2 + 30;
        //offsetX = 15;
        //offsetY = 15;
        
        //spriteSheet = new Image();
        //spriteSheet.src = "terrain.png";
        //spriteSheet.onload = init2;
    }
    
    function calculateSizes() {
        tileWidth = settings.hexWidth * settings.zoom;
        tileHeight = settings.hexHeight * settings.zoom;
        colWidth = tileWidth - (tileWidth / 4);
        
        mapScreenWidth = colWidth * map.width;
        mapScreenHeight = tileHeight * map.height; 
        drawWidth = Math.min(canvas.width, colWidth * map.width);
        drawHeight = Math.min(canvas.height, tileHeight * map.height);
        hex.bottom = tileHeight;
        hex.right = tileWidth;
        hex.midLeft = tileWidth / 4;
        hex.midRight = colWidth;
        hex.midY = tileHeight / 2;
        hex.midX = tileWidth / 2;
        tilesPerScreenWidth = Math.ceil(drawWidth / colWidth) + 2;
        tilesPerScreenHeight = Math.ceil(drawHeight / tileHeight) + 2;
    }
    
    function getTile(x, y) {
        var addSpace = 0;
        var offX = offsetX - canvas.width / 2;
        var offY = offsetY - canvas.height / 2;
        var tileX = Math.floor(((offX + x) / mapScreenWidth) * map.width) + 1;
        if(tileX % 2 === 1) {
            addSpace = hex.midY;
        }
        var tileY = Math.floor(((offY + y + addSpace) / mapScreenHeight) * map.height);
        var tile = map.data[tileX][tileY];
        var d = calcPixelDistance(x, y, tile);
        var closestTile = tile;
        for(var n in tile.neighbors) {
            var nd = calcPixelDistance(x, y, tile.neighbors[n]);
            if(nd < d) {
                closestTile = tile.neighbors[n];
                d = nd;
            }
        }
        
        return closestTile;
    }
    
    function calcPixelDistance(x, y, tile) {
        var addHeight = 0;
        if(x % 2 === 1) {
            addHeight = hex.midY;
        }
        var offX = offsetX - canvas.width / 2;
        var offY = offsetY - canvas.height / 2;
        var tileCenterX = tile.screenLocation.x;
        var tileCenterY = tile.screenLocation.y;
        var dx = x - tileCenterX;
        var dy = y - tileCenterY;
        var d = dx * dx + dy * dy;
        return d;
    }
    
    function draw() {
        context.clearRect(0, 0, canvas.width, canvas.height);     
        var drawX = 0;
        var drawY = 0;
        var drawStartX = 0;
        var drawStartY = 0;        
        var offX = offsetX - canvas.width / 2;
        var offY = offsetY - canvas.height / 2;
        var pixelOffsetX = ((offX / colWidth) - Math.floor(offX / colWidth)) * colWidth;
        var pixelOffsetY = ((offY / tileHeight) - Math.floor(offY / tileHeight)) * tileHeight;
        var tileStartX = Math.floor((offX / mapScreenWidth) * map.width); 
        var tileStartY = Math.floor((offY / mapScreenHeight) * map.height); 
        
        if(tileStartX < 0) {
            pixelOffsetX += tileStartX * colWidth;
            tileStartX = 0;
        }
        if(tileStartY < 0) {
            pixelOffsetY += tileStartY * tileHeight;
            tileStartY = 0;
        }
        
        var tileEndX = tileStartX + tilesPerScreenWidth;
        var tileEndY = tileStartY + tilesPerScreenHeight;
        
        if(tileEndX >= map.width) {
            tileEndX = map.width - 1;
        }
        if(tileEndY >= map.height) {
            tileEndY = map.height - 1;
        }
        
        drawStartX -= pixelOffsetX + colWidth;
        drawStartY -= pixelOffsetY;
        drawX = drawStartX;
        drawY = drawStartY;
        
        context.strokeStyle = "black";
        for(var x = tileStartX; x <= tileEndX; x++) {
            for(var y = tileStartY; y <= tileEndY; y++) {
                var color;
                if(map.data[x][y].terrainType === "Plains") {
                    color = "green";
                } else if (map.data[x][y].terrainType === "Water") {
                    color = "blue";
                } else if (map.data[x][y].terrainType === "Hills") {
                    color = "rgb(139,69,19)";
                } else if (map.data[x][y].terrainType === "Mountains") {
                    color = "rgb(59,59,59)";
                }
                
                //drawRect(drawX, drawY, color);
                var tx = drawX;
                var ty = drawY;
                if(x % 2 === 1) {
                    //tx -= hex.midLeft;
                    ty -= hex.midY;
                }
                map.data[x][y].screenLocation.x = tx;
                map.data[x][y].screenLocation.y = ty;
                drawHex(tx, ty, color);
                //drawRect(tx, ty, color);
                if(settings.zoom > 2) {
                    printText("(" + x + ", " + y + ")", tx - hex.midX, ty - hex.midY, "white");
                }
                drawY += tileHeight;            
            }
            drawY = drawStartY;
            drawX += colWidth;
        }
        
        for(var i = 0; i < highLightedTiles.length; i++) {
            drawHex(highLightedTiles[i].screenLocation.x, highLightedTiles[i].screenLocation.y, 
                    settings.highlightColor);
        }
        
        /*context.strokeStyle = "red";        
        context.beginPath();
        context.rect(canvas.width / 2 - tileWidth / 2, canvas.height / 2 - tileHeight / 2, tileWidth, tileHeight);
        context.stroke();
        context.closePath();*/
    }
    
    function drawHex(x, y, color) {
        x -= hex.midX;
        y -= hex.midY;
        context.strokeStyle = "black";
        context.fillStyle = color;
        context.beginPath();
        context.moveTo(x, y + hex.midY);
        context.lineTo(x + hex.midLeft, y);
        context.lineTo(x + hex.midRight, y);
        context.lineTo(x + hex.right, y + hex.midY);
        context.lineTo(x + hex.midRight, y + hex.bottom);
        context.lineTo(x + hex.midLeft, y + hex.bottom);
        context.lineTo(x, y + hex.midY);
        context.fill();
        context.stroke();
        context.closePath();
    }
    
    function drawRect(x, y, color) {
        x -= hex.midX;
        y -= hex.midY;
        context.strokeStyle = "purple";
        context.beginPath();
        context.rect(x, y, tileWidth, tileHeight);
        //context.fillRect(x, y, tileWidth, tileHeight);       
        context.stroke();
        context.closePath();
    }
    
    function printText(msg, x, y, color) {
        context.fillStyle = color;
        context.font = "18px Tahoma";
        var txtWidth = context.measureText(msg).width;
        context.fillText(msg, x + tileWidth / 2 - txtWidth / 2, y + tileHeight / 2 + 5);
    }
    
    function scroll(x, y) {
        offsetX += x;
        offsetY += y;
    }
    
    function zoom(amount) {
        var ratX = offsetX / mapScreenWidth;
        var ratY = offsetY / mapScreenHeight;
        settings.zoom += amount;
        if(settings.zoom < 1) {
            settings.zoom = 1;
        }
        
        calculateSizes();
        offsetX = ratX * mapScreenWidth;
        offsetY = ratY * mapScreenHeight;        
    }
    
    function highlightTile(tile) {
        highLightedTiles.push(tile);
    }
    
    function clearHiglightedTiles() {
        highLightedTiles = [];
    }
    
    return {
        draw: draw,
        scroll: scroll,
        zoom: zoom,
        setup: setup,
        getTile: getTile,
        highlightTile: highlightTile,
        clearHighlightedTiles: clearHiglightedTiles,
        getZoom: function () { return settings.zoom; },
        getOffset: function () { return {x: offsetX, y: offsetY } }
    };
})();