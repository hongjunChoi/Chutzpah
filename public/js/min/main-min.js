$(document).ready(function(){function e(){o?$("body").removeClass("menuopened"):$("body").addClass("menuopened"),o=!o}var o=!1;$("nav ul li h4").click(function(){$("nav ul li.active").removeClass("active"),$(this).parent().addClass("active")}),$("#btn_menu").click(function(){e()}),$("#logo").click(function(){$("body").removeClass("menuopened"),$("body").removeClass("profileopened"),o&&(o=!1)}),$("#userthumb").click(function(){$("body").addClass("profileopened")}),$("#profileclose").click(function(){$("body").removeClass("profileopened")})});