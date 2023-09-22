var MapGraphics = (function () {
    var spriteSheet;
    var mapCanvas;
    var layersCanvas;
    var map;
    var gridWidth = 100;
    var gridHeight = 83;
    var mapWidth = 65;
    var mapHeight = 65;
    var zoom = 0.12;
    var frameId = false;
    
    function init() {
        spriteSheet = new Image();
        spriteSheet.src = "terrain.png";
        spriteSheet.onload = init2;
    }

    function init2() {
        var canvasSettings = {
            aspectWidth: 0, 
            fullscreen: true, 
            fixedWidth: 1600,
            fixedHeight: 900
        };

        mapCanvas = {
            canvas: document.getElementById("canMap")
        };
        mapCanvas.canvas.width = mapCanvas.canvas.offsetWidth;
        mapCanvas.canvas.height = mapCanvas.canvas.offsetHeight;        
        mapCanvas.context = mapCanvas.canvas.getContext("2d");
        
        //mapCanvas.canvas.onmouseup = MouseUp; 
        //mapCanvas.canvas.onmousedown = MouseDown;

        start();
    }
        
    function start()
    {
        if(frameId)
            cancelAnimationFrame(frameId);
        //document.getElementById("divLoading").style.display = "block";
        frameId = requestAnimationFrame(resumeStart);
        
        //
        
        //map.numGridsOnScreenX = Math.round(mapCanvas.canvas.width / gridWidth * 1.5) + 1;
        //map.numGridsOnScreenY = Math.round(mapCanvas.canvas.height / gridHeight) + 1;
        //map.hasChanged = true;
        //mapCanvas.context.translate(50, -50);
        //animateGame();
        //drawPerlinNoise(mapCanvas.canvas, mapCanvas.context);
    }
    
    function resumeStart()
    {
        map = MapGenerator.generateMap(mapWidth, mapHeight, gridWidth, gridHeight);
        setZoom(1);
        
        frameId = requestAnimationFrame(finishedLoading);
    }
    
    function finishedLoading()
    {
        //document.getElementById("divLoading").style.display = "none";
        frameId = requestAnimationFrame(animateGame);
    }
    
    function animateGame()
    {
        if(map.hasChanged)
            drawHexMap(mapCanvas.canvas, mapCanvas.context);
        
        map.hasChanged = false;
        frameId = requestAnimationFrame(animateGame);
    }
    
    function drawPerlinNoise(canvas, context)
    {
        noise.seed(Math.random());
        
        var size = 2;
        var cx = canvas.width / size / 2;
        var cy = canvas.height / size  / 2;
        for (var x = 0; x < canvas.width / size; x++) {
            
          for (var y = 0; y < canvas.height / size; y++) {
            // All noise functions return values in the range of -1 to 1.
            var dx = x - cx;
            var dy = y - cy;
            var d = Math.sqrt(dx * dx + dy * dy);
            // noise.simplex2 and noise.perlin2 for 2d noise
            //var value = noise.simplex2(x / 50, y / 50);
            //var value = noise.perlin3(x / 50, y / 50, d);
            var value = noise.perlin2(x / 50, y / 50);
            
            var color =  Math.round(Math.abs(value) * 256) / (d / 50);
            if(color > 55)
                color = 256;
            else
                color = 0;
            // ... or noise.simplex3 and noise.perlin3:
            //var value = noise.simplex3(x / 100, y / 100, time);
            context.fillStyle = "RGB(0, " + color + ", 0)";
            context.fillRect(x*size, y*size, size, size);
            //image[x][y].r = Math.abs(value) * 256; // Or whatever. Open demo.html to see it used with canvas.
          }
        }
    }
    
    function drawHexMap(canvas, context)
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        //layersContext.clearRect(0, 0, canvas.width, canvas.height);
        var xIndexEnd = map.offset.x + map.numGridsOnScreenX;
        if(xIndexEnd >= map.data.length)
            xIndexEnd = map.data.length - 1;
            
        var yIndexEnd = map.offset.y + map.numGridsOnScreenY;
        if(yIndexEnd >= map.data[0].length)
            yIndexEnd = map.data[0].length - 1;
            
        for(var xIndex = map.offset.x; xIndex < xIndexEnd; xIndex++)
        {
            var yOffset = 0;
            if(xIndex % 2 == 0)
                yOffset = map.gridSize.halfHeight;
            for(var yIndex = map.offset.y; yIndex < yIndexEnd; yIndex++)
            {
                var x = (xIndex - map.offset.x) * map.gridSize.hexDistanceX;
                var y = (yIndex - map.offset.y) * map.gridSize.height - yOffset;
                var strTitle = map.data[xIndex][yIndex].waterDistance + " " + map.data[xIndex][yIndex].tile;
                //strTitle = map.data[xIndex][yIndex].waterDistance;
                var strCoords = "<" + xIndex + ", " + yIndex + ">";
                
                var imageId = getImageId(map.data[xIndex][yIndex].tile);
                
                if(imageId != -1)
                {
                    drawHexImage(canvas, context, x, y, imageId);
                    for(var layerId = 0; layerId < map.data[xIndex][yIndex].layers.length; layerId++)
                    {
                        var layerImageId = getImageId(map.data[xIndex][yIndex].layers[layerId]);
                        if(layerImageId != -1)
                        {
                            //drawHexImage2(canvas, layersContext, x, y, layerImageId);
                            drawHexImage2(canvas, context, x, y, layerImageId);
                        }
                    }
                }
                else
                    drawHexGrid(canvas, context, x, y, map.gridSize, map.data[xIndex][yIndex].color, strTitle, strCoords);
            }
        }
    }
    
    function getImageId(imageName)
    {
        if(imageName === "ocean")
            return 0;
        else if(imageName === "sand")
            return 1;
        else if(imageName === "grass")
            return 2;
        else if(imageName === "mountains3")
            return 3;            
        else if(imageName === "trees1")
            return 4;
        else if(imageName === "trees2")
            return 5;
        else if(imageName === "trees3")
            return 6;
        else if(imageName === "mountains")
            return 7;
        else if(imageName === "hills2")
            return 8;
        else if(imageName === "hills3")
            return 9;
        else if(imageName === "snow1")
            return 10;
        else if(imageName === "snow2")
            return 11;
        else if(imageName === "water")
            return 12;
        else if(imageName === "mountains2")
            return 13;
        else if(imageName === "snow3")
            return 14;
        else if(imageName === "mountainMix")
            return 15;
        else if(imageName === "mountainMix2")
            return 16;
        else if(imageName === "mountainBackground")
            return 17;
        else if(imageName === "snowBackground")
            return 18;
        else if(imageName === "hillsBackground")
            return 19;
        else
            return -1;
    }
    
    function getSpriteData(imageId)
    {
        var y = 0;
        var x = 0;
        if(imageId > 9)
        {
            y = 100;
            x = (imageId - 10) * 100;
        }
        else
        {
            y = 0;
            x = imageId * 100;
        }
        
        return {
          x: x,
          y: y
        }; 
    }
    
    function drawHexImage(canvas, context, x, y, imageId)
    {
        var coords = getSpriteData(imageId);
        context.save();
        context.translate(x, y);
        context.drawImage(spriteSheet, coords.x, coords.y + 5, 100, 89, -map.gridSize.halfWidth, -map.gridSize.halfHeight, map.gridSize.width + 2, map.gridSize.height + 2);
        context.restore();
    }
    
    function drawHexImage2(canvas, context, x, y, imageId)
    {
        var coords = getSpriteData(imageId);
        context.save();
        context.translate(x, y);
        context.drawImage(spriteSheet, coords.x, coords.y, 100, 100, -map.gridSize.halfWidth, -map.gridSize.halfHeight, map.gridSize.width + 1, map.gridSize.height + 1);
        context.restore();
    }
    function drawHexGrid(canvas, context, x, y, size, color, title, coords)
    {
        context.save();
        context.translate(x, y);
        context.beginPath();
        //context.rect(-size.halfWidth, -size.halfHeight, size.width, size.height);
        context.moveTo(-size.halfWidth, 0);
        context.lineTo(-size.quarterWidth, -size.halfHeight);
        context.lineTo(size.quarterWidth, -size.halfHeight);
        context.lineTo(size.halfWidth, 0);
        context.lineTo(size.quarterWidth, size.halfHeight);
        context.lineTo(-size.quarterWidth, size.halfHeight);
        context.lineTo(-size.halfWidth, 0);
        context.strokeStyle = "black";
        context.fillStyle = color;
        context.fill();
        if(zoom >= 1)
        {
            context.stroke();
            context.fillStyle = "black";
            context.font = "12pt Arial"
            var width = context.measureText(coords).width;
            context.fillText(coords, -width / 2, -20);
            
            width = context.measureText(title).width;
            context.fillText(title, -width / 2, 5);
        }
        context.restore();
    }
    
    function moveMap(direction, distance)
    {
        map.hasChanged = true;
        if(direction == "left")
        {
            if(map.offset.x > distance)
                map.offset.x -= distance;
        }
        else if(direction == "right")
        {
            if(map.offset.x + 1 < (map.size.width - map.numGridsOnScreenX) - distance)
                map.offset.x += distance;
        }
        else if(direction == "up")
        {
            if(map.offset.y > distance)
                map.offset.y -= distance;
        }
        else if(direction == "down")
        {
            if(map.offset.y + 1 < (map.size.height - map.numGridsOnScreenY) - distance)
                map.offset.y += distance;
        }
    }
    
    function zoomOut()
    {
        setZoom(0.8);
    }
    
    function zoomIn()
    {
        setZoom(1.2);
    }
    
    function setZoom(amount)
    {
        zoom *= amount;
        MapGenerator.updateZoom(mapWidth, mapHeight, gridWidth * zoom, gridHeight * zoom, map);
        map.numGridsOnScreenX = Math.round(mapCanvas.canvas.width / (gridWidth * zoom) * 1.5) + 1;
        map.numGridsOnScreenY = Math.round(mapCanvas.canvas.height / (gridHeight * zoom)) + 1;
        map.hasChanged = true;
    }
    
    function mapClick(coords)
    {
        getMapCoords(coords);
    }
    
    
    function getMapCoords(mouseCoords)
    {
        var x = (mouseCoords.x - mapCanvas.canvas.offsetLeft) / mapCanvas.canvas.offsetWidth * mapCanvas.canvas.width;
        var y = (mouseCoords.y - mapCanvas.canvas.offsetTop) / mapCanvas.canvas.offsetHeight * mapCanvas.canvas.height;
        
        var yOffset = 0;
        var xIndex = Math.round(map.offset.x + (x / map.gridSize.hexDistanceX));
        
        if(xIndex % 2 == 0)
            yOffset = map.gridSize.halfHeight;
                
        var yIndex = Math.round(map.offset.y + (y / map.gridSize.height));
        //var y = (yIndex - map.offset.y) * map.gridSize.height - yOffset; 
        var yIndex = Math.round((y + yOffset) / map.gridSize.height + map.offset.y);
        var msg = xIndex + ", " + yIndex; 
        if(map.data[xIndex][yIndex].layers.length > 0)
            msg += map.data[xIndex][yIndex].layers[0];
        alert(msg);
    }
    
    return {
        init: init,        
        moveMap: moveMap,
        zoomOut: zoomOut,
        zoomIn: zoomIn,
        mapClick: mapClick
    };    
})();

MapGraphics.init();