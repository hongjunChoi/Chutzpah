$(document).ready(function(){function e(){o?n():$("body").addClass("menuopened"),o=!o}function n(){$("body").removeClass("menuopened"),$("body").removeClass("profileopened"),$("body").removeClass("searchopened"),$("body").removeClass("chatopened")}var c=io.connect();c.emit("join",{username:"scd"}),c.on("new_msg",function(e){$(".chatmain").append($("<p class='received'>")+e.msg+$("</p>"))});var o=!1;$("nav ul li h4").click(function(){$(this).parent().hasClass("active")?$(this).parent().removeClass("active"):($("nav ul li.active").removeClass("active"),$(this).parent().addClass("active"))}),$("#btn_menu").click(function(){e()}),$("#logo").click(function(){n(),o&&(o=!1)}),$("#btn_search").click(function(){e(),$("body").addClass("searchopened")}),$("#profileclose").click(function(){n()}),$("#openchat").click(function(){$("body").addClass("chatopened")})});