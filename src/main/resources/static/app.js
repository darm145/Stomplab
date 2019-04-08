var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var channel=null;
    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    var addPolygonToCanvas = function (points) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(points[0].x,points[0].y);
        ctx.lineTo(points[1].x,points[1].y);
        ctx.lineTo(points[2].x,points[2].y);
        ctx.lineTo(points[3].x,points[3].y);
        ctx.closePath();
        ctx.stroke();
    };
    
    var clearCanvas = function () {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0,0,canvas.width,canvas.height);
    };
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function (channel) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            // 2 par el topico y lo que realizara al recibir un evento
            stompClient.subscribe('/topic/newpoint.'+channel, function (eventbody) {
                var pointReceived=JSON.parse(eventbody.body);
                app.receivePoint(parseInt(pointReceived.x),parseInt(pointReceived.y));
            });
            stompClient.subscribe('/topic/newpolygon.'+channel, function (eventbody) {
                var points=JSON.parse(eventbody.body);
                //TODO DRAW POLYGON
                app.drawPolygon(points);
                
            });
        });

    };
    
    

    return {
    	

        init: function (channel) {
            var can = document.getElementById("canvas");
            
            app.channel=channel;
            app.disconnect();
            //websocket connection
            connectAndSubscribe(channel);
            can.addEventListener('click',app.clic);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/app/newpoint."+app.channel,{},JSON.stringify(pt));
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            //setConnected(false);
            console.log("Disconnected");
        },
        receivePoint:function(x,y){
        	var pt=new Point(x,y);
            addPointToCanvas(pt);
        },
        clic: function(event){
        	var canvas=document.getElementById("canvas");
        	var delta=canvas.getBoundingClientRect();
        	
        	app.publishPoint(event.pageX-delta.left,event.pageY-delta.top);
        },
        drawPolygon:function(points){
        	addPolygonToCanvas(points);
        	
        },
        errase:function(){
        	clearCanvas();
        }
    };

})();