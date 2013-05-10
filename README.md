Svider.js
=========

Svider is a svelte slider, aimed at being customizable and fast.  Requires jQuery, compatible with 1.9+.

# Usage 

Svider.js will work by automatically when you use the provided HTML and CSS, and include the jQuery and Svider.js.  

## HTML
Here's an example of the setup used by Svider.js.

	<div class="svider">
		<div class="svider-nav">
			<ol>
				<li><a href="#">1</a></li>
				<!-- More elements go here as needed -->
			</ol>
		</div>
		<div class="svider-viewport">
			<ol class="svider-panels">
				<li class="svider-panel">Awesome stuff goes here</li>
				<!-- More panels go here as needed -->
			</ol>
		</div>
	</div>

#### An explanation
	
- **.svider** - The main element which holds the entire slider
- **.svider-nav** - Holds navigation elements.  A list should be nested within it.  When clicking a list item, the corresponding panel will be activated.  For example, clicking the third item would activate the third panel.
- **.svider-panel** - A panel.  Your content typically goes here.
- **.svider-panels** - Holds the slider panels.  This handles the slider's animation.
- **.svider-viewport** - Holds the panels container.  When overflow:hidden is used, it'll hide non-active panels.  This element can be removed if you don't mind the non-active panels being visible.

## CSS
The only CSS you have to customize is to set the width of your Svider, like this:

	#mySvider, #mySvider .svider-viewport, #mySvider .svider-panel {
		width: 600px; 
		// You must explicitly state the width for these 3 selectors for any svider element.  
		// Change the ID to reflect your svider.  
		// It must be the same width for all 3 selectors.
    }

Otherwise, include these styles to get the slider structure working.  

	.svider { 
	    overflow:hidden;
	    position:relative;
	}
	
	.svider-viewport {
	    height: auto;
	    overflow: hidden;
	}
	
	.svider-panels {
	    height:auto;
	    padding:0;
	    margin:0;
	    list-style: none;
	    width:10000px; 
	    // Adjust width as needed so that all .svider-panel elements fit
	}
	
	.svider .svider-panel {
	    clear: none !important;
	    float: left !important;
	}
	
	.svider-nav ol, .svider-nav ul {
	    margin:0px !important;
	    padding:0;
	    list-style:none;
	}
	
	.svider-nav li {
	    cursor:pointer;
	}
	
	.svider-nav li.current { 
	    cursor:default;
	}
	
## JavaScript
You shouldn't have to initialize on your own unless you want to pass in your own configuration.  Here's how you would do that - for example, to disable swipe controls.  When customizing a Svider, add the "custom" class so that Svider.js doesn't automatically initialize your Svider before you get the chance to.

** Javascript code **

	$("#mySvider").svider("init",function(){"swipe":false});

** HTML for this example **

	<div class='svider custom'> . . . </div>

# Customization options

The easiest way to customize a Svider is simply to add one of the following as a class on the .svider element.  For example, `<div class='svider autoplay clickToFocus autocenter'>. . .</div>` would create an autoplaying Svider which is centered on the page and allows you to click non-active panels to activate them.  (In addition to any navigational elements, and swiping, which is enabled by default.)

* **autosize** - Automatically adjusts the height of your slider, in case different panels have different heights
* **autoplay** - Automatically cycles through panels
* **autocenter** - For layouts where the slider is centered, this automatically figures out how to position itself
* **clickToFocus** - When enabled, clicking on a non-active panel will make it become activate
* **swipe** - Allows swipe to go back and forth.  Works with both touch or by dragging the mouse.  Enabled by default.


# Methods

* $("#mySvider").svider("next") - Go to the next panel
* $("#mySvider").svider("prev") - Go to the previous panel
* $("#mySvider").svider(#) - Replace the # with a number, and it'll go to this panel.  Use index position - so if you want to go to the first panel, you'll use 0 instead of 1.
	* $("#mySvider").svider(1) - Go to the second panel (uses index position)

# Backwards Compatability

Svider.js replaces [Marquee.js](http://github.com/Skotlake/Marquee.js). If you used that, no problem!  Svider.js is entirely backwards compatibile with one small catch - all references to "marquee" have been replace with "svider", meaning the classes have changed from marquee-panels to svider-panels, etc.  You don't have to update your HTML and CSS, though - just pass in a settings object when initializing your slider to overwrite the default used classes.

	var svider_default_settings = {
		. . . some options . . .
		"selector" : {	// Selectors for HTML elements
			"slider":".svider",		// Overall slider container
			"nav": ".svider-nav",		// Nav.  LI items become clickable
			"panel":".svider-panel",	// Single panel
			"panels":".svider-panels",	// Holds all panels
			"viewport":".svider-viewport"	// Viewport, duh
		}
	}
	
So in the above, you'd use ".marquee" instead of ".svider", ".marquee-nav" instead of ".svider-nav", etc.  Also make sure that any references in your CSS have been changed from "svider" to "marquee", if necessary.

**Why is it called Svider?** 
I wanted to emphasize speed and customizability, so I'm calling it Svider, the svelte slider.  In addition, the "marquee" name might be a bit confusing for those of us who used the **marquee** element back in the Geocities/Angelfire days.

# Author - Scott Munn

- [http://twitter.com/scottmunn](http://twitter.com/scottmunn)
- [http://scottmunn.com](http://scottmunn.com)


# Copyright and license

Copyright 2013 Scott Munn

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this work except in compliance with the License. You may obtain a copy of the License in the LICENSE file, or at:

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.