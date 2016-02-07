$(document).ready(function() {
	//button input
	$("#searchbutton").click(function(){
		$("header").toggleClass("top40");

	});

	//controller
	$("#button-volume").click(function(){
		$(this).find("path").toggle("fast");
	});
});