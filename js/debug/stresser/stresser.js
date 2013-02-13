/*
 * Author: Alin Petculescu
 * Company: InSkin Media
 * 
 * Description: Programatically adds animations
 * 
 */


(function(){
	
	if(typeof window.stresser == "undefined"){ //check if this is already registered and jQuery exists
		
		//define basic stress tester object
		function stresser(timeFactor, anim){
			
			//class vars
			this.anim = anim;
			this.timeFactor = timeFactor;
			this._gcanims = [];
			this._saveAnims = false;
			
			//config vars
			this._target = "area";
			this._path = "js/debug/stresser";
			this._imgPrefix = "img";
			this._startTop = 5;
			this._startLeft = 5;
			this._deltaTime = 0.75;
			this._padding = 100;
			this._stressPreffix = "stresser";
				
			//console vars
			this._stressConsoleVisible = false;
			this._stressConsoleInited = false;
			
			//init console (if possible)
			this.stressConsoleInit();	
		}
		
		//stresser methods	
		stresser.prototype.redoAnims = (function(number){
			
			//remove all animations
			//this can be done more efficient with TweenMax functions
			while(this.countInstances() > 0){
				  this.removeAnim();
			}
			
			//populate
			while(this.countInstances() < number){
				  this.addAnim();
			}
			
			//repopulate console
			this.consoleUpdate();
			
		});
		
		stresser.prototype.addAnim = (function(){

			//select an image color and id
			var rand = Math.floor((Math.random()*12)); //should get number of images avail dynamically
			var id = this.countInstances() + 1;
			
			//determine top position
			var top = parseInt($('#img'+(id-1)).css("top"));
			if(isNaN(top)) { top = this._startTop;}
			
			//determine left position
			var first = false;
			var left = parseInt($('#img'+(id-1)).css("left"));
			if(isNaN(left)) { first = true; left = this._startLeft;}
			
			//check if it doesn't fit on that row and it's not first
			if((left + this._padding) > $("#"+this._target).width()){
				top += this._padding; //increment top if it doesn't
				left = this._startLeft; //and reset left
			}
			else if(!first){
				left+= this._padding;
			}
			
			//compose style
			var style = "position: absolute; top: "+ top +"px; left: "+ left + "px; z-index: "+ id +" ;";
			
			//create an image and append to target DOM element
			$("#"+this._target).append('<img id="'+ this._imgPrefix + "" + id +'" src="'+ this._path +'/images/'+ rand +'.png" style="'+ style +'"/>');
			
			//add a tween based on animation
			var t = TweenMax.to($('#'+ this._imgPrefix + '' + id), this._deltaTime * this.timeFactor, this.anim);
			
			//save if animation saving enabled
			if(this._saveAnims){
				this._gcanims.push(t);
			}
			
		});
		
		stresser.prototype.removeAnim = (function(){

			//locate latest anim and target object
			var tweens = window.TweenMax.getAllTweens();
			var targetImg = tweens[tweens.length-1].target[0];
			
			//kill anim, automatically removes it from the list
			tweens[tweens.length-1].kill();
			
			//remove image from DOM
			$(targetImg).remove();
			
		});
		
		stresser.prototype.consoleUpdate = (function(){
			
			$('#'+this._stressPreffix +'_number_val').val(window.stresser.countInstances());
			$('#'+this._stressPreffix +'_padding_val').val(window.stresser._padding);
			$('#'+this._stressPreffix +'_timefactor_val').val(window.stresser.timeFactor);
			$('#'+this._stressPreffix +'_anim_val').val(JSON.stringify(window.stresser.anim));

		});
		
		stresser.prototype.countInstances = (function(){
			
			return window.TweenMax.getAllTweens().length;
			
		});
		
		stresser.prototype.stressConsoleInit = (function(){
			
			//hope jquery is included
			if (!jQuery) { 
				return false;
			}
			else{
				//insert a special div that holds the console when body is ready
				$(document).ready(function(){
					
					var divString = '<div id="'+ window.stresser._stressPreffix +'_main" style="display:none; position: fixed; top: 200px; right: 100px; width: 200px; background-color: skyblue; padding: 5px; border-radius: 5px; box-shadow: 2px 2px 2px grey; z-index: 9999; opacity:0.9;">\
										<span style="width: 50%;">Number:</span>\
										<input val="10" id="'+ window.stresser._stressPreffix +'_number_val" style="font-weight: bold; width: 50%;"/>\
										<span style="width: 50%;">Padding:</span>\
										<input val="10" id="'+ window.stresser._stressPreffix +'_padding_val" style="font-weight: bold; width: 50%;"/>\
										<span style="width: 50%;">TimeFactor:</span>\
										<input val="2" id="'+ window.stresser._stressPreffix +'_timefactor_val" style="font-weight: bold; width: 50%;"/>\
										<span style="width: 50%;">Anim:</span><br/>\
										<textarea id="'+ window.stresser._stressPreffix +'_anim_val" style="font-weight: bold; width: 98%; height: 200px;"></textarea>\
									</div>';
					
					$("body").append(divString);
					
					//change number
					$('#'+ window.stresser._stressPreffix +'_number_val').change(function() {
						  
						  //attempt to get int value
						  var number = parseInt($(this).val());
						  
						  //redo anims
						  window.stresser.redoAnims(number);
						  
					});
					
					//change timefactor
					$('#'+ window.stresser._stressPreffix +'_timefactor_val').change(function() { 
						  
						  //attempt to get int value
						  window.stresser.timeFactor = parseFloat($(this).val());
						  
						  //redo anims
						  window.stresser.redoAnims(window.stresser.countInstances()); 
						  
					});
					
					//change padding value
					$('#'+ window.stresser._stressPreffix +'_padding_val').change(function() { 
						  
						  //attempt to get int value
						  window.stresser._padding = parseInt($(this).val());
						  
						  //redo anims
						  window.stresser.redoAnims(window.stresser.countInstances()); 
						  
					});
					
					//change animation
					$('#'+ window.stresser._stressPreffix +'_anim_val').change(function() {
						try{  
							
							//attempt to parse animation object
							var obj = $.parseJSON($(this).val());
							
							//set stresser attributes
							window.stresser.anim = obj;
							
							//redo anims
							window.stresser.redoAnims(window.stresser.countInstances());	
							
						} catch(err) {
							alert("Malformed Animation"); //problem
						}
					});
					
					//show/hide on F2
					$(document).keydown(function(event) {
						  
						if ( event.which == 113 ) {
						     event.preventDefault();
						     //select console
						     var console = $('#'+ window.stresser._stressPreffix +'_main');
						     
						     if(console.is(":visible")){ 
						    	 console.hide();
						    	 window.stresser._stressConsoleVisible = false;
						     }
						     else{
						    	 console.show();
						    	 window.stresser._stressConsoleVisible = true;
						     }
						   }
						
					});
					
					window.stresser.consoleUpdate();
					
				});
				
				this._stressConsoleInited = true;
				
				return true;
			}
			
		});

		//initialise stresser
		window.stresser = new stresser(2, {css:{opacity:0, rotation:-360, skewX:30, skewY:30, scaleX:0.5, scaleY:0.5,x:-20, y:-20}, ease:Power0.easeIn, repeat:-1, yoyo:true}); //instantiate and attach to window
		
	}
	else{
		return false;
	}
	
})();