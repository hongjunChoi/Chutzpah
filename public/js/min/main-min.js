var full_page_config=function(){$("#fullpage").fullpage({lockAnchors:!1,verticalCentered:!0,sectionsColor:["#252c3f","#4BBFC3","#7BAABE"],afterLoad:function(t,a){4===a?($("#statusbar").css("bottom","0px"),$("#artistinfo").delay(300).fadeIn("fast")):($("#statusbar").css("bottom","-82px"),$("#artistinfo").fadeOut("fast"))},afterRender:function(){}})};$("#searchbutton").click(function(){$("header").toggleClass("top40")}),$("#button-volume").click(function(){$(this).find("path").toggle("fast")});var artistbaropen=!1;$("#artistinfo").click(function(){artistbaropen?($("#statusbar").css("bottom","-82px"),$("#artistbar").css("bottom","-360px")):($("#statusbar").css("bottom","360px"),$("#artistbar").css("bottom","0px")),artistbaropen=!artistbaropen}),full_page_config();