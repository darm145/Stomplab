package edu.eci.arsw.collabpaint;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;
@Controller
public class STOMPMessagesHandler {
	
	@Autowired
	SimpMessagingTemplate msgt;
	//HashMap<String,List<Point>> channels=new HashMap<String,List<Point>>();
	ConcurrentHashMap<String, List<Point>> channels= new ConcurrentHashMap<String, List<Point>>();
	
	
    
	@MessageMapping("/newpoint.{numdibujo}")    
	public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
		//ConcurrentMap guarantees memory consistency on key/value operations in a multi-threading environment.
		if(!channels.containsKey(numdibujo)) {
			channels.put(numdibujo,Collections.synchronizedList(new ArrayList<>()));
		}
		
		synchronized(channels.get(numdibujo)) {
			List<Point>points=channels.get(numdibujo);
			System.out.println("Nuevo punto recibido en el servidor!:"+pt+"servidor numero:"+numdibujo);
			msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
			points.add(pt);
			if(points.size()==4) {
				msgt.convertAndSend("/topic/newpolygon."+numdibujo, points);
				points.clear();
			}
			
		}
		
	}
}