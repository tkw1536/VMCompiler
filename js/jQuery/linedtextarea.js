/**
 * jQuery Lined Textarea Plugin 
 *   http://alan.blog-city.com/jquerylinedtextarea.htm
 *
 * Copyright (c) 2010 Alan Williamson
 * 
 * Version: 
 *    $Id: jquery-linedtextarea.js 464 2010-01-08 10:36:33Z alan $
 *
 * Released under the MIT License:
 *    http://www.opensource.org/licenses/mit-license.php
 * 
 * Usage:
 *   Displays a line number count column to the left of the textarea
 *   
 *   Class up your textarea with a given class, or target it directly
 *   with JQuery Selectors
 *   
 *   $(".lined").linedtextarea({
 *   	selectedLine: 10,
 *    selectedClass: 'lineselect'
 *   });
 *
 * History:
 *   - 2010.01.08: Fixed a Google Chrome layout problem
 *   - 2010.01.07: Refactored code for speed/readability; Fixed horizontal sizing
 *   - 2010.01.06: Initial Release
 *
 */

var nastyOnclickHack = false;
var currentlyClicked = -1;

(function($) {

	$.fn.linedtextarea = function(options) {
		
		// Get the Options
		var opts = $.extend({}, $.fn.linedtextarea.defaults, options);
	
		/*
			Little helper function to get number of empty lines between two given ones
		*/
		var getEmptyLinesNum = function( offset1, offset2) {
			var content = document.getElementById("VMC_textarea").value.split("\n");

			for(var i = content.length - 1 ; i < Math.max(offset1, offset2) ; i++) {
				content.push("");
			}

			num = 0;

			if (offset1 < offset2) {
				var extract = content.slice(offset1-1, offset2-1);
			} else if (offset2 < offset1) {
				var extract = content.slice(offset2, offset1);
			}

			for(var c in extract) {
				num += (extract[c] === "") ? 1 : 0;
			}

			return num;
		}
	
		
		/*
		 * Helper function to make sure the line numbers are always
		 * kept up to the current system
		 */
		fillOutLines = function(codeLines, h, lineNo, change){ // yeah, I am global
			if (typeof change === 'undefined') {
				while ( (codeLines.height() - h ) <= 0 ){
					codeLines.append("<div id='numberedLine_"+lineNo+"' class='lineno' onclick='javascript:nastyOnclickHack=true;currentlyClicked="+lineNo+"'>" + lineNo + "</div>");
					lineNo++;
				}
			}
			else {
				if (change) {
					if(currentlyClicked != -1) {
						fillOutLines(null, null, null, false);
					}
					for (var d in codeLinesDiv[0].children) {
						var elem = codeLinesDiv[0].children[d];
						var num = elem.innerHTML;
						if (typeof num === 'undefined'){}
						else {
							var emptyNum = getEmptyLinesNum(num, currentlyClicked);
							var ind = num - currentlyClicked;
							emptyNum *= (ind <= 0)? 1 : -1;
							console.log(ind + " - " + emptyNum + " = " + (ind + emptyNum));
							$("#numberedLine_" + num).html(ind + emptyNum);
						}
					}
				}
				else {
					for (var d in codeLinesDiv[0].children) {
						$("#numberedLine_" + d).html(d);
					}
				}
			}
			return lineNo;
		};
		
		
		/*
		 * Iterate through each of the elements are to be applied to
		 */
		return this.each(function() {
			var lineNo = 1;
			var textarea = $(this);
			
			/* Turn off the wrapping of as we don't want to screw up the line numbers */
			textarea.attr("wrap", "off");
			textarea.css({resize:'none'});
			var originalTextAreaWidth	= textarea.outerWidth();

			/* Wrap the text area in the elements we need */
			textarea.wrap("<div class='linedtextarea'></div>");
			var linedTextAreaDiv	= textarea.parent().wrap("<div class='linedwrap' style='width:" + originalTextAreaWidth + "px'></div>");
			var linedWrapDiv 			= linedTextAreaDiv.parent();
			
			linedWrapDiv.prepend("<div class='lines' style='width:50px'></div>");
			
			var linesDiv	= linedWrapDiv.find(".lines");
			linesDiv.height( textarea.height() + 6 );
			
			
			/* Draw the number bar; filling it out where necessary */
			linesDiv.append( "<div class='codelines'></div>" );
			codeLinesDiv	= linesDiv.find(".codelines");
			lineNo = fillOutLines( codeLinesDiv, linesDiv.height(), 1 );

			/* Move the textarea to the selected line */ 
			if ( opts.selectedLine != -1 && !isNaN(opts.selectedLine) ){
				var fontSize = parseInt( textarea.height() / (lineNo-2) );
				var position = parseInt( fontSize * opts.selectedLine ) - (textarea.height()/2);
				textarea[0].scrollTop = position;
			}

			
			/* Set the width */
			var sidebarWidth					= linesDiv.outerWidth();
			var paddingHorizontal 		= parseInt( linedWrapDiv.css("border-left-width") ) + parseInt( linedWrapDiv.css("border-right-width") ) + parseInt( linedWrapDiv.css("padding-left") ) + parseInt( linedWrapDiv.css("padding-right") );
			var linedWrapDivNewWidth 	= originalTextAreaWidth - paddingHorizontal;
			var textareaNewWidth			= originalTextAreaWidth - sidebarWidth - paddingHorizontal - 20;

			textarea.width( textareaNewWidth );
			linedWrapDiv.width( linedWrapDivNewWidth );
			

			
			/* React to the scroll event */
			textarea.scroll( function(tn){
				var domTextArea		= $(this)[0];
				var scrollTop 		= domTextArea.scrollTop;
				var clientHeight 	= domTextArea.clientHeight;
				codeLinesDiv.css( {'margin-top': (-1*scrollTop) + "px"} );
				lineNo = fillOutLines( codeLinesDiv, scrollTop + clientHeight, lineNo );
			});


			/* Should the textarea get resized outside of our control */
			textarea.resize( function(tn){
				var domTextArea	= $(this)[0];
				linesDiv.height( domTextArea.clientHeight + 6 );
			});

		});
	};

  // default options
  $.fn.linedtextarea.defaults = {
  	selectedLine: -1,
  	selectedClass: 'lineselect'
  };
})(jQuery);

$(document).click(function() {
  if(nastyOnclickHack) {
    fillOutLines(null, null, null, true);
    nastyOnclickHack = false;
  } else {
    if (currentlyClicked != -1) {
      fillOutLines(null, null, null, false);
    }
    currentlyClicked = -1;
  }
});
