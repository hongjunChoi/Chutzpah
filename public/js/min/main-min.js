var full_page_config=function(){$("#fullpage").fullpage({lockAnchors:!1,verticalCentered:!0,sectionsColor:["#252c3f","#4BBFC3","#7BAABE","#1c1f24"],afterLoad:function(t,a){4===a?($("#statusbar").css("bottom","-340px"),$("#artistinfo").delay(300).fadeIn("fast"),$("#searchbar").fadeOut("fast"),$("#section4 div.clearfix").fadeIn("slow")):($("#section4 div.clearfix").fadeOut("fast"),$("#statusbar").css("bottom","-400px"),$("#artistinfo").fadeOut("fast"),$("#searchbar").fadeIn("fast"))},afterRender:function(){}})};full_page_config(),$(document).ready(function(){$("#searchbutton").click(function(){$("header").toggleClass("top40")}),$("#button-volume").click(function(){$(this).find("path").toggle("fast")}),$("#button-control").click(function(){$(this).toggleClass("paused")});var t=!1,a=!1;$("#artistinfo").click(function(){t?($("#statusbar").css("bottom","-340px"),$(this).delay(400).queue(function(t){$(".carousel-control.left").removeClass("hidearrows"),$(".carousel-control.right").removeClass("hidearrows"),t()})):($(".carousel-control.left").addClass("hidearrows"),$(".carousel-control.right").addClass("hidearrows"),$(this).delay(400).queue(function(t){$("#statusbar").css("bottom","0px"),t()})),t=!t}),$("#contactbutton").click(function(){var t=$("<div><form><input></input></form></div>");$("#contactbar").prepend(t),t.addClass("contactform"),$("#statusbar").css("bottom","400px"),$("#contactbar").css("height","480px")})});