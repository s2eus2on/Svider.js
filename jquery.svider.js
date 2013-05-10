/**
 * @file
 * Svider 
 * The svelte slider
 * @author Scott Munn
 * @version 1.0
 *
 * @description It's a slider.  But you can autoplay it, center it, swipe it, and customize it.  Go crazy. 
 *
 * To Do
 * - Disable autoplay when center offset svider is clicked
 **/

var settings;
var svider_default_settings = {
	'autocenter':false,	// Whether to auto-center svider (common layout)
    'autoplay' : false, // bool, makes slides automatically transition.  
    'autoplay_slide_duration' : 4000, // determines length of slideshow in milliseconds when autoplaying
	"autoselect": true, // Whether the first panel should be selected. Used in layouts when nav must be clicked to show. You'll have to configure your own CSS for now
	"autosize": false, // Whether to automatically size the svider panels based on window / parent size
    'css_active_name': "current", // string, name of settings.css_active_name css class    
	get current_class() {return "."+this.css_active_name;}, // Has to be outside selector object
	"easing"	: "swing", // Name of easing function to use
    'fade_text' : true, // bool, fades out/in text when changing panels
    'fade_text_selectors' : "h1,.summary", // jQuery selectors, CSS selectors of text that will fade in/out, fade_text must be true
    'hide_transitions' : false, // bool.  True = "fade" transition.  False = "slide" transition
	"hover_activate": false, // Determine whether hovering over LI should auto-activate
    'svider_caption' : 'svider_current_description', // CSS selector of the "svider's caption".  This will be automatically updated by either finding .caption in the .svider-nav LI (these will be automatically hidden on load) or by attaching a TITLE attribute to the LI
	"orientation_event": "onorientationchange" in window ? "orientationchange" : "resize", // Sets up orientation change
    'resizable' : true, // If true, the .svider and .svider-viewport elements will resizable to the exact size of the active .svider-panel
	"selector" : { 						// Selectors for HTML elements
		"slider":".svider",			// Overall slider container
		"nav": ".svider-nav",			// Nav.  LI items become clickable
		"panel":".svider-panel",		// Single panel
		"panels":".svider-panels",		// Holds all panels
		"viewport":".svider-viewport" 	// Viewport, duh
	},
	"swipe": true, // Determines whether to allow swiping	
	"swipe_threshold":30, // Minimum pixel threshold to activate a swipe
    'touch_start_event' : ('ontouchstart' in document.documentElement) ? 'touchstart' : 'mousedown',	// Auto-detects touch event.  Set to one or the other to disable the remainder
    'touch_move_event' : ('ontouchmove' in document.documentElement) ? 'touchmove'   : 'mousemove', // Auto-detects touch event.  Set to one or the other to disable the remainder
	'touch_end_event' : ('ontouchend' in document.documentElement) ? 'touchend'   : 'mouseup', // Auto-detects touch event.  Set to one or the other to disable the remainder
	'touch_mode': "swipe", // Determines the touch behavior.  "Swipe" only listens for swipes, while "drag" will move elements to follow user action
    'transition_speed': 300 // int, millisecond speed of JS-based panel transition

};

(function($){
	var methods = {
		click: function(options) {
			var settings = new cloneObject(svider_default_settings);
    
		    return this.each(function(){
		        if (options) { $.extend(settings,options); } // Merge provided options with defaults
		        if ($(this).hasClass(settings.css_active_name)) { return; } // When true, don't do anything 
		    
		        // Let's get a lot of stats and elements
		        var item = $(this),
		            svider = $(this).parents(settings.selector.slider).first(), // The containing svider
		            index = $(this).index(); // Figure out numeric value of element clicked
		
		        item.addClass(settings.css_active_name);
		        methods.go.apply(svider,[index,null,settings]);
		    }); 
		},
		
		init: function(options) {
			settings = new cloneObject(svider_default_settings);
			// Makes this function watch the #hash on the browser URL bar
			if ("onhashchange" in window) { $(window).bind("hashchange",function(){ methods.hash_changed(); }); }
		
			// Auto-initialize if a hash exists    
		    if (window.location.hash) {
		        var hash = window.location.hash;
		        var link = $(settings.selector.nav).find('li a[href="'+hash+'"]');
		        if (link.length == 1) {
		            index = link.parent("li").index();
		            link.parent("li").addClass(settings.css_active_name).siblings().removeClass(settings.css_active_name);
		            methods.update_hashlinks(hash);
		        }
		    }

		    // Assign the svider function to any number of sviders returned by the jQuery function
		    return this.each(function(){
		        var svider = $(this);
		        var settings = new cloneObject(svider_default_settings);
		        settings._m = $(svider);
		        settings._id = svider.attr("id");
		        
				if (svider.hasClass("hasBeensviderd")) { /*// console.log("The following svider has already received instruction and will not receive further instruction."); // console.log(svider); */}
				else {
					svider.trigger("init");
			        svider.addClass("hasBeensviderd");
			        
			        if (options) { $.extend(settings,options); } // Merge provided options with defaults

			        if (svider.hasClass("autocenter") || svider.attr("data-left-offset") == "center") { settings.autocenter = true;}
			        if (svider.hasClass("autoplay")) { settings.autoplay = true; }
					if (svider.hasClass("autosize")) { settings.autosize = true; } else { settings.autosize = false; }
					if (svider.hasClass("clickToFocus")) { settings.clickToFocus = true; }
					if (svider.hasClass("fixed")) { settings.resizable = false; } 
					if (svider.hasClass("hover-activate")) { settings.hover_activate = true; } else { settings.hover_activate = false;}
					if (svider.hasClass("no-autoselect")) { settings.autoselect = false; } else { settings.autoselect = true; }
					
					methods.setup_controls.apply(svider,[settings]);

					if (settings.autocenter)	{ methods.setup_autocenter.apply(svider,[settings]); }
					if (settings.autoplay)		{ methods.setup_autoplay.apply(svider,[settings]); }
					if (settings.autosize)		{ methods.setup_autosize.apply(svider,[settings]); }
					if (settings.clickToFocus) 	{ methods.setup_clickToFocus.apply(svider,[settings]); }
					if (settings.swipe)			{ methods.setup_swipe.apply(svider,[settings]); }

			        svider.each(function(){
			            var svider_instance = $(this),
			            	index = 0;
		
				        // Determine if panel should not be first
				            var current = svider_instance.find(settings.selector.nav).first().find(settings.current_class); // If the settings.css_active_name class is on one of the panels, auto-select it
				            if (current.length > 0) { // Go to the pre-selected settings.css_active_name panel
				                index = current.index();
				            }
			            
			            // Activate this svider
				            if (index == 0) {
				            	methods.go.apply(svider_instance,["initialize",null,settings]);
				            } else {
				            	methods.go.apply(svider_instance,[index,null,settings]);
				            }
			
				        // Setup infinite carousel
				            var total = svider_instance.find(settings.selector.panels).first().children(settings.selector.panel).length; // Used by infinite rotation
				            svider_instance.attr("data-original-length", total);	// Used by infinite rotation
			            
				            		//if (svider_instance.find(".counter .total").length > 0) { svider_instance.find(".counter .total").html(total);  } // Update the counter (1 of 6) if it exists
			            
			            // Setup resizablility
							if (settings.resizable) {
								var panel_height = svider_instance.find(settings.selector.panel).is(settings.css_active_name).clientHeight; // Get the height of this panel
								svider_instance.css({"height": panel_height+"px"}); 
				            	svider_instance.find(settings.selector.viewport).css({"height": panel_height+"px"});
							}
			        });         
				}
		    });
		},
		
		go: function(index,force_panel,my_settings) {
			if (my_settings == undefined) {
				var settings = new cloneObject(svider_default_settings);
			} else {
				var settings = my_settings;
			}
		    if (index == null) { index = 0; }

		    var instance = $(this); 
		
		    return this.each(function(){
		        var svider = $(this),
		        	force_refresh = false,
		            current_index = svider.find(settings.selector.panels).first().children(settings.current_class).index(),
		            total_index = svider.find(settings.selector.panels).first().children(settings.selector.panel).length - 1;
		        if (current_index == -1) { current_index = 0; } // -1 is given when none exists

		        // Parse the index value    
		        switch(index) {
		            case "initialize": // This is used when initializing a svider.  Prevents fade effect from occuring on load.
		            	if (settings.autoselect) {
		            		// console.log(settings);
			            	current_index = -1;
			                index = 0;
			                settings.fade_text = false;
			                var temp_hide_trans = true;
			                var fix_height = true;
		            	} else {
			            	index = null;
		            	}
		            break;
		            
		            case settings.css_active_name:
		            	index = current_index;
		            	force_refresh = true;
		            break;
		        
		            case "next":
		            	if (svider.hasClass("multiple")) {
			            	var fit = Math.floor(svider.width() / svider.find(settings.selector.panel).width());
			            	index = parseInt(current_index + fit);	
			            	
			            	if (total_index-fit <= index) {
				            	index = total_index-fit+1;
				            	svider.addClass("current-page-last");
			            	}
		            	} else {
			            	index = parseInt(current_index + 1);	
		            	}
		                
		            break;
		            
		            case "prev":
		            case "previous":
		            	if (svider.hasClass("multiple")) {
			            	var fit = Math.floor(svider.width() / svider.find(settings.selector.panel).width());
			            	index = parseInt(current_index - fit);	
			            	if (index < 0) { index = 0;}
			            	svider.addClass("current-page-first");
		            	} else {
			            	index = parseInt(current_index - 1);	
		            	}
		            break;
		            
		            case "first": index = 0; break;
		            case "last": index = total_index; break;
		            
		            case "random":
		                index = current_index; 
		                while (index == current_index) { // Always change the pane so it doesn't appear broken
		                    index = Math.floor(Math.random()*(parseInt(total_index)+1));
		                }
		            break;
		        }
		        
		        if (index == null) { return false; }

		        svider.addClass("has-selection").removeClass("current-page-first current-page-last");
			
		        if (svider.is(".infinite")) {
			    	methods.setup_infinite.apply(svider,[settings,index,total_index]);    
		        } else {
			        if (index < 0) { index = total_index;} // Fix values that are too low
			        if (index > total_index) { index = 0;} // Fix values that are too high
		        }
		        
		    	if (force_panel != null) { index = force_panel; }
		
				if (current_index != index || force_refresh) { // Only do the transition if we want a different panel 
					// Map necessary variables 
		            var container	= svider.find(settings.selector.panels).first(), 	// UL - holds panels
		            	viewport	= svider.find(settings.selector.viewport).first(), // Container's viewport
		            	nav			= svider.find(settings.selector.nav).first(),		// Container's controls
		                margin		= parseInt(container.css("margin-left").replace('px',''),10), 	// Container's left margin
		                panels 		= container.find(settings.selector.panel),			// All panels
		            	panel		= $(panels.get(index)),					 			// Current panel
		                panel_height= panel.outerHeight(), 								// Current panel's height
		                coordinates = panel.position(), 								// Current panel's coordinates
		                travelTo	= parseInt(coordinates.left,10) - parseInt(margin,10), // Left + inverse of margin
		                leftOffset = svider.attr("data-left-offset");					
		                // leftOffset - An optional left offset used when 
		                // 				calculating margin-left for sviders that 
		                // 				are slightly off center with visible 
		                // 				exterior panels
		
		    
		            // Update travelTo
						if (leftOffset && leftOffset != "center") { travelTo = travelTo - leftOffset;}
						
		            // Fix padding
			            var padding_left = parseInt(svider.css("padding-left").replace('px',''),10);
			            travelTo = travelTo - padding_left;
			            
		            // Update navigation
			            nav.find(settings.current_class).removeClass(settings.css_active_name); // Remove current from direct nav
			            nav.find("li:eq("+index+")").addClass(settings.css_active_name); // Give new current item the current class
		
			        // Update svider classes & trigger event
			        	if (index == 0) {
			        		var trigger = "first";
			        		var add_me = "current-panel-first";
			        		var remove_me = "current-panel-last";
			            } else if (index == total_index) {
			            	var trigger = "last";
			            	var add_me = "current-panel-last";
			            	var remove_me = "current-panel-first";
			            } else {
			            	var remove_me = "current-panel-first current-panel-last";
			            }
			        
			        	svider
			        		.removeClass(remove_me + " current-panel-"+ svider.attr("data-current-panel"))
			        		.attr("data-current-panel", (parseInt(index)+1))
			        		.addClass(add_me + " current-panel-"+(parseInt(index)+1));
			        	
			        	if (trigger) { svider.trigger(trigger); }
			        	
			        // Update panel classes
			            container.children(settings.current_class).removeClass(settings.css_active_name); // Remove current from nav
			            panel.addClass(settings.css_active_name);  // Give new current panel the current class
		
		            // Update child elements
		            	methods.update_caption(svider,nav,settings,index);
			            // svider.find(".counter .index").html(parseInt(index)+1); // Update a counter (1 of 6) if it exists
		
					// Make the transition
						travelTo = travelTo * -1;
			
			            if ((settings.hide_transitions && current_index != -1) || temp_hide_trans == true) {
			            	var transition_speed = 1;
			            } else {
			            	var transition_speed = settings.transition_speed
			            }
			            methods.move_svider(travelTo,container,settings,panel_height,transition_speed,viewport);
		        		        
			        if (fix_height) { methods.update_svider_height(viewport,container,settings,panel_height); }
			        if (nav) { methods.update_hashlinks(nav.find(settings.current_class).find("a").attr("href")); } // Update onpage links that link here
			        
			        setTimeout(function(){ svider.trigger("newPanel"); },300);
		        }
		    });
		},
		
		hash_changed: function() {
			var new_hash = window.location.hash;
		    var link = $(settings.selector.nav).find('li a[href*="'+new_hash+'"]');
		
		    $("._autoCurrentHash").removeClass("_autoCurrentHash");
		    $.each(link,function(){
		        var link_instance = $(this),
		            new_index = link_instance.parent("li").index(),
		            hash_change_instance = link_instance.parents(settings.selector.slider).first();
		        hash_change_instance.trigger("hashUpdate");
		        methods.go.apply(hash_change_instance,[new_index]);
		    });
		    methods.update_hashlinks(new_hash);
		},
		
		last:function(){ return $(this).each(function(){ methods.go.apply($(this),["last",null,settings]); });},
		
		move_svider: function(travelTo,container,settings,panel_height,speed,viewport) {

			container.animate({"margin-left": travelTo}, speed, settings.easing, function () {
				if (settings.resizable == true && panel_height) {
					container.animate({"height": panel_height+"px"}, (speed/2));
					if (viewport != undefined) {
						viewport.animate({"height": panel_height+"px"}, (speed/2)); 
					}
				}
			});
		},
		
		next:function(){ return $(this).each(function(){ methods.go.apply($(this),["next",null,settings]); });},
		prev:function(){ return $(this).each(function(){ methods.go.apply($(this),["prev",null,settings]); });},
		previous:function(){ return $(this).each(function(){ methods.go.apply($(this),["prev",null,settings]); });},

		setup_autocenter: function (settings) {
			console.log("Settings up autocenter");
			if (this.attr("data-left-offset") == "center") {
				var new_offset = ($(window).width() - this.find(settings.selector.panel).width())/2;
				this.attr("data-left-offset",new_offset).addClass("leftOffsetCentered");
				
				var leftOffsetCentered_timeout;
				$(window).on(settings.orientation_event,function(){
					clearTimeout(leftOffsetCentered_timeout);
					leftOffsetCentered_timeout = setTimeout(function(){
						// Fix auto-centered sviders
						var centers = $(".leftOffsetCentered");
						$.each(centers,function(i,el){
							el = $(el);
							var new_offset = ($(window).width() - el.find(settings.selector.panel).width())/2;
							el.attr("data-left-offset",new_offset).addClass("leftOffsetCentered");
							methods.go.apply(el,[settings.css_active_name,null,settings]);
						});
		
					},200);
				});
		
			}
		},

		setup_autoplay: function(settings) {
			console.log("Settings up autoplay");
			return this.each(function(){    
				var svider_instance = $(this);
		
			    // Prevents autoplay from continuing if the user is hovering over the svider
			    svider_instance.hover(
			        function() {$.data(this,'hover',true); },
			        function() {$.data(this,'hover',false); }
			    ).data('hover',false).data('autoplay',true);
			
				svider_instance.find(settings.selector.nav).click(function() { svider_instance.data('autoplay', false); }); // Stops autoplay on click of slide number
		
		        var this_autoplay = setInterval(function(){
		        	if (!svider_instance.data('hover') && svider_instance.data('autoplay')) { 
		        		methods.go.apply(svider_instance,["next",null,settings]);
		        	}
		        },svider_default_settings.autoplay_slide_duration);
		    
			    svider_instance.removeClass("autoplay-off").addClass("autoplay-on").hover(
			        function(){ clearInterval(this_autoplay); },
			        function(){ 
			            this_autoplay = setInterval(function(){
			                if (!svider_instance.data('hover') && svider_instance.data('autoplay')) { 
			                	methods.go.apply(svider_instance,["next",null,settings]);
			                }
			            },svider_default_settings.autoplay_slide_duration);
			        }
			    );
			    
			    $(".autoplay .pause").click(function(){
		            var svider = $(this).parents(svider_default_settings.selector.slider).first(),
		                autoplay = svider.data("autoplay");
		            if (autoplay) {
		                $(this).html("play");
		                svider.removeClass("autoplay-on").addClass("autoplay-off").data("autoplay",false);
		            } else {
		                $(this).html("pause");
		                svider.removeClass("autoplay-off").addClass("autoplay-on").data("autoplay",true);
		            }
		        });
		    });
		},

		setup_autosize: function (settings) {
			console.log("Checking autosize");

			return this.each(function(){
				if (settings.autosize) {
					console.log("Setting up autosize");

					var new_width = svider.width();

					svider.addClass("autosized").find(settings.selector.panel)
						.add(settings.selector.viewport,svider).width(new_width);
			
					var timeout;
			
					$(window).on(settings.orientation_event,function(){
						var new_width = svider.width();
						svider.find(settings.selector.panel).add(settings.selector.viewport,svider)
							.width(new_width).attr("data-width","yes");
						clearTimeout(timeout);
						timeout = setTimeout(function(){
							methods.go.apply(svider,[settings.css_active_name,null,settings]);
						},200);
					});
				}
			});
			
		},

		setup_clickToFocus: function(settings) {
			console.log("Settings up clickToFocus");
			return this.each(function(){
				
				$(this).find(settings.selector.panel).on("click",function(){
					if (!$(this).closest(settings.selector.slider).hasClass("swiping") && !$(this).hasClass(settings.css_active_name)) {
					//if (!$(this).hasClass(settings.css_active_name)) {
						var me = $(this).closest(settings.selector.slider);
						me.trigger("clickToFocus")
						methods.go.apply(me,[$(this).index()]);
					} else {
						// console.log("prevented");
					}
				});
			
				// Prevents these sviders from activating links when clicking panels	
				$(this).find(settings.selector.panel).find("a").on("click",function(e){
					if (!$(this).closest(settings.selector.panel).is(settings.current_class)) {
						methods.go.apply($(this).closest(settings.selector.slider),[$(this).closest(settings.selector.panel).index()]);
						return false;
					} 
				});
			});
			
		},

		setup_controls: function (settings) {
			return this.each(function(){
				var svider = $(this);
				svider.find(settings.selector.nav).find("li").on("click",function(e){ 
					svider.trigger("navClick");
					methods.click.apply($(this));
					return false;
				});
	
			    if (settings.hover_activate) { 
			    	svider.find(settings.selector.nav).find("li").on("mouseover",function(e){ 
			    		svider.trigger("navHover"); 
			    		methods.click.apply($(this));
			    	}); 
			    }
	
			    svider.find(".svider_prev").first().on("click", function(e){ 
			    	var me = $(this).parents(settings.selector.slider).first();
			    	me.trigger("prev");
			    	methods.go.apply(me,["prev", null, settings]);
			    	return false;
			    });
			    svider.find(".svider_next").first().on("click", function(e){ 
			    	var me = $(this).parents(settings.selector.slider).first();
			    	me.trigger("next");
			    	methods.go.apply(me,["next", null, settings]);
			    	return false;
			    });
			    svider.find(".svider_first").first().on("click", function(e){
			    	var me = $(this).parents(settings.selector.slider).first();
			    	me.trigger("first");
			    	methods.go.apply(me,["first", null, settings]);
			    	return false;
			    });
			    svider.find(".svider_last").first().on("click", function(e){ 
			    	var me = $(this).parents(settings.selector.slider).first();
			    	me.trigger("last");
			    	methods.go.apply(me,["last", null, settings]);
			    	return false;
			    });
			    svider.find(".svider_random").first().on("click", function(e){
			    	var me = $(this).parents(settings.selector.slider).first();
			    	me.trigger("random");
			    	methods.go.apply(me,["random", null, settings]);
			    	return false;
			    });
			    svider.find(".svider_deselect").first().on("click", function(e){ 
			    	var me = $(this).parents(settings.selector.slider).first();
			    	me.trigger("deselect").removeClass("has-selection");
			    	me.find(settings.current_class).removeClass(settings.css_active_name);
			    	methods.go.apply(me,["deselect", null, settings]);
			    	return false;
			    });
		    });
		},

		setup_infinite: function(svider,settings,index,total_index) {
			// If the "infinite" class is applied to the svider, the LI elements will be cloned so that it appears the carousel always continues in one direction.
	        // However, this currently only goes forward -- if looping backward from the first, it will loop all the way back.
	        if (svider.hasClass("infinite") == true) {
	            var panels_container = svider.find(settings.selector.panels).first(),
	            	panels = $(panels_container).children(settings.selector.panel),
	            	container_width = panels_container.width();
	            	
	            if (svider.attr("data-infinite-buffer")) {
		            var buffered_index = parseInt(svider.attr("data-infinite-buffer")) + index;
	            } else {
		            var buffered_index = index;
	            }
	            if (buffered_index == total_index || buffered_index > total_index) { // End, going to beginning // Change > to == on 5/4/12, builds infinite one ahead of when needed
	                panels.clone().appendTo(panels_container);
	                panels_container.width(container_width*2);
	                total_index = (total_index * 2) + 1;
	            }
	            
	            if (index < 0) { // beginning, going to end
	                index = total_index;
	              
	                panels.clone().prependTo(panels_container);
	                panels_container.width(container_width*2);
	                
	                total_index = (total_index * 2) + 1;
	                index = total_index;
	                var temp_hide_trans = true; // Because we don't want the user to see all the panels, hide the transition
	            } 
	        } else {
	            if (index < 0) { index = total_index;} // Fix values that are too low
	            if (index > total_index) { index = 0;} // Fix values that are too high
	        }
		},
		
		setup_swipe: function (settings) {
			var svider = $(this);
			//if (settings.swipe && !settings.clickToFocus) {
			if (settings.swipe) {
				console.log("Setting up swipe");
		        svider.on(settings.touch_start_event,function(e){
		
		        	$(this).addClass("touching");
		        	var x_origin = e.clientX,
			        	margin_origin = parseInt($(this).find(settings.selector.panels).css("margin-left"),10);
		
					if (settings.touch_start_event == "mousedown") { e.preventDefault(); /* Prevents highlight or grabbing elements on desktop browsers */ }
					var x = (e.pageX) ? e.pageX : e.originalEvent.changedTouches[0].pageX,
						y = (e.pageY) ? e.pageY : e.originalEvent.changedTouches[0].pageY;
					$(this).data({"start_x":x,"start_y":y});
					
					if (settings.touch_mode == "drag") {
						svider.addClass("touch-event-occurring");
						 svider.on(settings.touch_move_event, function(e){
				        	e.preventDefault();
				        	// To add -- support for touch screen
				        	var x = (e.pageX) ? e.pageX : e.originalEvent.changedTouches[0].pageX;
				        	var distance = x - parseInt(x_origin);
				        	var	new_margin = parseInt(margin_origin) + parseInt(distance);
				        	svider.find(settings.selector.panels).css("margin-left",new_margin);
		
				        });
			        }
		        });
		        
		        svider.on(settings.touch_end_event,function(e){	
		        	svider.off(settings.touch_move_event);
		        	setTimeout(function(){
			        	svider.removeClass("touch-event-occurring").removeClass("swiping");	
		        	},1000);
		        	
					var svider_moved = false; // Flag to ensure that movement occurs 
		        
		        	var x_swipe, y_swipe,
		        		x = (e.pageX) ? e.pageX : e.originalEvent.changedTouches[0].pageX,
						y = (e.pageY) ? e.pageY : e.originalEvent.changedTouches[0].pageY;
		
					var x_change = svider.data("start_x") - x,
						y_change = svider.data("start_y") - y;
		
		        	if (x_change < 0) { x_swipe = "left"; }
		        	else if (x_change > 0) { x_swipe = "right"; }
		        	
		        	if (y_change < 0) { y_swipe = "up"; }
		        	else if (y_change > 0) { y_swipe = "down"; }
					if (Math.abs(x_change) > Math.abs(y_change)) { // Ensures only swipes intended to be horizontal are registered
		   				if (Math.abs(x_change) > settings.swipe_threshold) {
		   					svider.addClass("swiping");
		   					// console.log("swipe registered");
		       				svider.trigger("swiped");
		       				if (x_swipe == "left") { 
		       					if (svider.find(settings.selector.panel).filter(settings.current_class).index() != 0) { 
		       						methods.go.apply(svider,["prev",null,settings]);
		       						svider_moved = true; 
		       					} else { // Bounce effect on the beginning (first panel) 
		       						var orig = parseInt(svider.find(settings.selector.panels).css("margin-left"),10);

		       						var bounce_this_far = 40;
		       						//if (svider.attr("data-left-offset")) { orig = orig + parseInt(svider.attr("data-left-offset")); }
		       						svider.find(settings.selector.panels)
		       							.animate({"margin-left":(orig + bounce_this_far)}, settings.transition_speed/2)
		       							.animate({"margin-left":(orig)}, settings.transition_speed, (jQuery.easing['easeOutBounce']) ? "easeOutBounce" : settings.easing); svider_moved = true; }
		       				} else if (x_swipe == "right") { 
		       				
		       					if (svider.find(settings.selector.panel).filter(settings.current_class).index() != (parseInt(svider.find(settings.selector.panel).length - 1))) { 
		       						methods.go.apply(svider,["next",null,settings]);
		       						svider_moved = true; 
			       					
		       					} else { // Bounce effect on the end (last panel)
		       						console.log();
		       						var orig = parseInt(svider.find(settings.selector.panels).css("margin-left"));
		       						svider.find(settings.selector.panels).animate({"margin-left":(orig - 40)}, settings.transition_speed/2).animate({"margin-left":(orig)}, settings.transition_speed, (jQuery.easing['easeOutBounce']) ? "easeOutBounce" : settings.easing); svider_moved = true; }
		       				}		       				
		   				} else { console.log("No");}
					} else {
						// Y change was greater than x change	
					}
		
					svider.data({"start_x":null,"end_x":null});
					
					// Auto-fix svider if drag is enabled and swipe wasn't enough to register
					if (settings.touch_mode == "drag" && (svider_moved == false && x_change > 0)) {
						methods.go.apply(svider,[settings.css_active_name,null,settings]);
					} 
					
					if (svider_moved) {
				        e.stopPropagation();
				        return false;
			        }
			        
		        	});
		        	
		        }
		},
		
		update_caption: function(svider,nav,settings,index) {
	        if (svider.find("."+settings.svider_caption).length) {
	            var caption = $(nav).find("li:eq("+index+") .caption").html(); // Let's check for a .caption element
	            if (caption == null) { var caption = $(nav).find("li:eq("+index+")").attr("title"); }
	            
	            if (caption) {
	                $(svider).find("."+settings.svider_caption).fadeTo(500,1).html(caption); // Change the caption
	            } else {
	                $(svider).find("."+settings.svider_caption).fadeTo(500,0); // Fade out the caption
	            }
	        }
        },
        
		update_hashlinks: function(hash) {
			$("._autoCurrentHash").removeClass("_autoCurrentHash");
			if (hash != "" && hash != "#") {
			    $('a[href*="'+hash+'"]').not(settings.selector.nav+' li a[href*="'+hash+'"]').addClass("_autoCurrentHash"); // Since these links already give themselves a current class
			}
		},
		
		update_svider_height: function (viewport,container,settings,panel_height) {
			if (settings.hide_transitions) {
		    	viewport.css({"height": panel_height+"px"}); 
		    	container.css({"height": panel_height+"px"});        	
			} else {
		        viewport.animate({"height": panel_height+"px"}, (settings.transition_speed/2)); 
		    	container.animate({"height": panel_height+"px"}, (settings.transition_speed/2));
			}
		}
	}

	$.fn.svider = function(method,options) {
		return this.each(function() {

			var settings = $.extend(svider_default_settings, options); // Merge settings with supplied
			
			// Call methods
			if ( methods[method] ) { 
		    	return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		    } else if ( typeof method === 'object' || ! method ) {
		    	return methods.init.apply( $(this), arguments );
		    } else {
		    	var error_msg = 'Method ' +  method + ' does not exist on jQuery.svider';
		    	if (typeof method == "number") {
			    	// Let's check if we should change the activate panel
			    	var svider_instance = $(this);
			    	console.log(svider_instance.find(settings.selector.panel).length);
			    	if (svider_instance.find(settings.selector.panel).length >= method+1) {
				    	methods.go.apply(svider_instance,[method,null,settings]);
				    	error_msg = false;
			    	} else {
				    	error_msg = "This slider does not have that many panels.  Make sure you're using index, not numeric, position."
			    	}
		    	} 
		    	
		    	if (error_msg) {
			    	$.error( error_msg );	
		    	}
		    	
		    }
		});
		 		
	}

		
	if ($(svider_default_settings.selector.slider).is(".fade").length > 0 ) { 
		$(svider_default_settings.selector.slider).is(".fade").not(".custom").svider("init",{"hide_transitions":true}); 
	} 
	
	if ($(svider_default_settings.selector.slider).not(".fade").not(".custom").length > 0) {
		$(svider_default_settings.selector.slider).not(".fade").not(".custom").svider();
		// If you have .custom sviders, you must call them yourself
	}

}(jQuery));

if (typeof cloneObject !=='function'){function cloneObject(e){for(i in e){if(typeof e[i]=="source"){this[i]=new cloneObject(e[i])}else{this[i]=e[i]}}}} // cloneObject utility function

///////////////
/// HISTORY ///
///////////////
/**
 * 1.0
 * - Replaces Marquee.js.  Cleans up code base, moves to proper jQuery plugin architecture, and fixes some issues that remained: clickToFocus sliders could not be swiped, and last panels did not bounce (swiping would activate "next", which would go to the beginning)
 **/
