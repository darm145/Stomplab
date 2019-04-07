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
        });

    };
    
    

    return {
    	

        init: function (channel) {
            var can = document.getElementById("canvas");
            
            app.channel=channel;
            //websocket connection
            connectAndSubscribe(channel);
            can.addEventListener('click',app.clic);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            stompClient.send("/topic/newpoint."+app.channel,{},JSON.stringify(pt));
            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
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
        }
    };

})();