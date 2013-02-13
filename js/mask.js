/* 
 * @author Alin-Dragos Petculescu
 * InSkin Media
 * 
 * This library provides some masking functionality by making use of the GreenSock library
 * Requires GreenSock and Jquery!
 * 
 * */


var Maskable = function(name, element1, color){ //cover element1 with element2
	
	this.backgroundImage = false;
	this.foregroundColor = color;
	this.name = "";
	
	if(typeof name == "string"){
		this.name = name;
	}else{
		this.name = "mask" + Math.floor((Math.random()*1000));
	}
	
	if(typeof element1 != "undefined" && typeof color != "undefined"){
	
		//process target object
		if(typeof element1 == "object"){ //check if done using jquery selector
			this.backgroundImage = element1.attr("src");
		}else if(typeof element1 == "string"){
			if(element1.indexOf(".") != -1){ //check if it might be a url
				this.backgroundImage = element1;
			}
		}
			
		//check if we have both
		if(this.backgroundImage != false && this.foregroundColor != false){
			
			//here we create the holder div for element1
			element1.wrap('<div id="'+ this.name +'" style="position: relative;"/>');
			
			//overlap them via css
			element1.css("position","absolute");
			element1.css("top","0px");
			element1.css("left","0px");
			element1.css("z-index",1);
			
			//create dummy div on top ????? size seems to fail
			element2 = $('<div id="'+ this.name+'_overlay" />');
			element2.css("background-color", this.foregroundColor);
			element2.css("position","relative");
			element2.css("top","0px");
			element2.css("left","0px");
			element2.css("z-index",2);
			element2.css("opacity", 0.5);
			element2.appendTo($('#'+ this.name));
			
			element1.load(function(event){ //need to listen and resize
				
				$("#"+mk.name+"_overlay").css('width', $(event.target).width());
				$("#"+mk.name+"_overlay").css('height', $(event.target).height());
				
			});
			
			return true;
		
		}else{
			return false;
		}
	}else{
		return false;
	}
	
}

Maskable.prototype.addMask = function(element){
	
	if(typeof element == "object"){
		try{
			//add div around mask with maks name as class for id purposes
			element.wrap('<div class="'+ this.name +'" />');
			//refresh element
			element = $(element);
			//transfer position attributes from image to parent
			var right = element.css("right");
			element.css("right", "intial");
			var left = element.css("left");
			element.css("left", "0");
			var top = element.css("top");
			element.css("top", "0");
			var bottom = element.css("bottom");
			element.css("bottom", "0");
			var position = element.css("position");
			element.css("position", "relative");
			var zindex = element.css("z-index");
			element.css("z-index", "intial");
			
			element.parent().css("right", right);
			element.parent().css("left", left);
			element.parent().css("top", top);
			element.parent().css("bottom", bottom);
			element.parent().css("position", position);
			element.parent().css("z-index", 3); //might want to make this dynamic based on mask number in case of overlapping masks
			
			//height/width fix
			//element.parent().css("height", element.height()+"px");
			//element.parent().css("width", element.width()+"px");
			
			//console.log(this);
			
			//apply background image
			if(this.backgroundImage !== false){
				element.parent().css("background-image", "url("+ this.backgroundImage +")");
			}else if(this.backgroundColor !== false){
				element.parent().css("background-color", this.backgroundColor);
			}
			
			//move all to main div
			element.parent().appendTo("#"+ this.name);
			
			//determine offset of each individual mask parent based on where it is
			//need to fix when aligning with 'right' and 'bottom'
			var pos = $(element.parent()).position();
			$(element.parent()).css("background-position-x", (-pos.left)+"px");
			$(element.parent()).css("background-position-y", (-pos.top)+"px");
			
		}catch(err){
			return false
		}
	}else{
		return false;
	}
	
}

TweenMax.MaskTo = function(element, time, animation){
	
	//check for x, y animations
	if(typeof animation.css.x != "undefined"){
		animation.css["background-position-x"] = (parseInt(animation.css.x) > 0 ? "-" : "+")+"="+Math.abs(parseInt(animation.css.x));
	}
	
	if(typeof animation.css.y != "undefined"){
		animation.css["background-position-y"] = (parseInt(animation.css.y) > 0 ? "-" : "+")+"="+Math.abs(parseInt(animation.css.y));
	}
	
	console.log(animation);
	
	TweenMax.to(element.parent(), time, animation);	
}


