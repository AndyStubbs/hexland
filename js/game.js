var game = (function () {
    var map;
    var lt = (new Date()).getTime();
    var frames = 0;
    var ct = 0;
    var isScrolling = false;
    var lastMouse = {
        x: -1,
        y: -1,
        moved: false
    };
    var selectedTile = false;
    var fps = 0;
    function init() {
        map = Map.create();
        MapDraw.setup({
            map: map,
            canvas: $("#canMap")[0]
        });
        $("#canMap")
            .on("mousedown", mouseDown)
            .on("mousemove", mouseMove)
            .on("mouseup", mouseUp)
            .bind('mousewheel', mouseScrollWheel);
        
        run();
    }
    
    function mouseScrollWheel(e) {
        if(e.originalEvent.wheelDelta /120 > 0) {
            MapDraw.zoom(1);
        }
        else{
            MapDraw.zoom(-1);
        }
    }
    
    function mouseDown(e) {
        isScrolling = true;
    }
    
    function mouseUp(e) {
        isScrolling = false;
        //If mouse didn't move
        if(!lastMouse.moved) {
            selectedTile = MapDraw.getTile(e.offsetX, e.offsetY);
            //selectedTile.terrainType = "Water";
            
            MapDraw.clearHighlightedTiles();
            MapDraw.highlightTile(selectedTile);            
        }
        lastMouse = {x: -1, y: -1, moved: false};
    }
    
    function mouseMove(e) {
        if(isScrolling) {
            var coords = {
                x: e.offsetX,
                y: e.offsetY,
                moved: false
            };            
            if(lastMouse.x !== -1) {
                coords.moved = true;
                var offsetX = lastMouse.x - coords.x;
                var offsetY = lastMouse.y - coords.y;
                MapDraw.scroll(offsetX, offsetY);
            }
            lastMouse = coords;
        }
    }
    
    function run() {
        //MapDraw.scroll(1, 1);
        MapDraw.draw();
        showFPS();
        requestAnimationFrame(run);        
    }
    
    function showFPS() {        
        var t = (new Date()).getTime();
        var dt = (t - lt) / 1000;
        lt = t;
        ct += dt;
        frames++;
        if(ct > 1) {            
            fps = frames / ct;            
            frames = 0;
            ct = 0;
            $("#msg").html(msg);
        }
        
        var msg = "zoom: " + MapDraw.getZoom() + "<br />";
        msg += "(" + MapDraw.getOffset().x + ", " + MapDraw.getOffset().y + ")<br />";
        msg += "FPS: " + fps.toFixed(2) + "<br />";
        if(selectedTile) {
            msg += "(" + selectedTile.location.x + ", " + selectedTile.location.y + ")<br />";
            msg += selectedTile.terrainType + "<br />";
            for(var n in selectedTile.neighbors) {
                msg += n + " " + selectedTile.neighbors[n].terrainType;
                msg += " (" + selectedTile.neighbors[n].location.x + ", " + 
                    selectedTile.neighbors[n].location.y + ")<br />";
            }
        }
        $("#msg").html(msg);
    }
    
    return {
        init: init
    };
})();

game.init();
