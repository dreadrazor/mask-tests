/*
 * Author: Alin Petculescu
 * Company: InSkin Media
 * 
 * Description: Implements a hook that tracks how much time GreenSock TweenMax renders take (on average)
 * 
 */


(function(){
	
	if(typeof window.perfMon == "undefined"){ //check if this is already registered
		
		//define basic stats gathering object
		function perfMon(){
			
			//define some config/state vars
			this._perfMonPreffix = "perfMon";
			this._perfMonConsoleInited = false;
			this._perfMonConsoleVisible = false;
			this._sampleSize = 10000; //how many renders is a decent sample size
			
			//class vars
			this.stats = [];
			this.avg = 0;
			this.active = true;
			this.peak = 0;
			
			//extra info fed in
			this.info;
			
			//init console (if possible)
			this.perfConsoleInit();
		}
		
		//perfMon methods
		perfMon.prototype.pushValue = (function(val){
			
			if(isNaN(val)){ return false } //sanity check
			else{
				
				var prevWeight = this.avg * this.stats.length; //calculate previous stat weight
				this.avg = (prevWeight + val) / (this.stats.length + 1); //factor in new value
				
				//reset stats every 10000 renders
				if(this.stats.length > this._sampleSize){

					if(this.stats.length > this._sampleSize / 5){ //only start peaks recording after 20% has passed
						//replace peak if new
						if(this.avg > this.peak){
							this.peak = this.avg;
						}
					}
					
					//reset stats, but keep the avg to normalize
					this.stats = [this.avg];
					
				}
				
				//add value to stat array
				this.stats.push(val);
				
				//if console is visible, update it
				this.perfMonConsoleUpdate();
			}
		}); 

		
		//this inits the console
		perfMon.prototype.perfConsoleInit = (function(){
			
			//hope jquery is included
			if (!jQuery) { 
				return false;
			}
			else{
				
				//insert a special div that holds the console when body is ready
				$(document).ready(function(){
					
					var divString = '<div id="'+ window.perfMon._perfMonPreffix +'_main" style="display:none; position: fixed; top: 100px; right: 100px; width: 200px; background-color: skyblue; padding: 5px; border-radius: 5px; box-shadow: 2px 2px 2px grey; z-index: 9999; opacity:0.9;">\
										<div id="'+ window.perfMon._perfMonPreffix +'_current" style="width: 100%;">\
											<span>Average Render</span>\
											<span id="'+ window.perfMon._perfMonPreffix +'_current_val" style="font-weight: bold;"></span>\
											<span>ms</span>\
										</div>\
										<div "'+ window.perfMon._perfMonPreffix +'_peak" style="width: 100%;">\
											<span>Peak Render</span>\
											<span id="'+ window.perfMon._perfMonPreffix +'_peak_val" style="font-weight: bold;"></span>\
											<span>ms</span>\
										</div>\
										<div id="'+ window.perfMon._perfMonPreffix +'_info" style="width: 100%;">\
											<span id="'+ window.perfMon._perfMonPreffix +'_info_val"></span>\
										</div>\
									 </div>';
					
					$("body").append(divString);
					
				});
				
				//show/hide on F2
				$(document).keydown(function(event) {
					  if ( event.which == 113 ) {
					     event.preventDefault();
					     
					     //select console
					     var console = $('#'+window.perfMon._perfMonPreffix +'_main');
					     var fps = $("#stats"); //this may or may not be present. 
					  
					     
					     if(console.is(":visible")){ 
					    	 console.hide();
					    	 window.perfMon._perfMonConsoleVisible = false;
					    	 if(fps && fps.is(":visible")) fps.hide();
					     }
					     else{
					    	 console.show();
					    	 window.perfMon._perfMonConsoleVisible = true;
					    	 if(fps && !fps.is(":visible")) fps.show();
					     }
					   }
					});
				
				this._perfMonConsoleInited = true;
				
				return true;
			}
			
		});
		
		perfMon.prototype.perfMonConsoleUpdate = (function(){
			
			if(this._perfMonConsoleVisible && this._perfMonConsoleInited){
				$('#'+this._perfMonPreffix +'_current_val').html(Math.round(this.avg * 1000) / 1000);
				$('#'+this._perfMonPreffix +'_peak_val').html(Math.round(this.peak * 1000) / 1000);
				$('#'+this._perfMonPreffix +'_info_val').html(this.info);
			}
			
		})
		
		if(typeof window.TweenMax == "function"){ //check if Tweenmax present
			
			window.perfMon = new perfMon(); //instantiate and attach to window
			window.oldRender = window.TweenMax.prototype.render; //save old render function
			
			//replace with perfMon version
			window.TweenMax.prototype.render = function(time, suppressEvents, force){
				
				var start = new Date().valueOf();
				oldRender.call(this, time, suppressEvents, force);
				var end = new Date().valueOf();
				
				//console.log(start+" to "+end);
				if(window.perfMon.active){
					window.perfMon.pushValue(end-start);
				}
				
			}
				
		}
		
	}
	else{
		return false;
	}
	
})();