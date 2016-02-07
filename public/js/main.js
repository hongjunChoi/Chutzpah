$(document).ready(function() {

	$('#fullpage').fullpage({
		// anchors: ['loginpage', 'genrepage', 'firstgenre'],
		lockAnchors: false,
		verticalCentered: true,
		sectionsColor: ['#252c3f', '#4BBFC3', '#7BAABE'],
		afterLoad: function(anchorlink, index){
			// if (index == 1){
			// 	$("header").css("top", "-80px");
			// }
			// else{
			// 	$("header").css("top", "0");
			// }

			if (index == 3){
				$("#statusbar").css("bottom", "0px");
				// $("#statusbar").css("bottom", "380px");
				$("#artistinfo").delay(300).fadeIn("fast");
			}
			else{
				$("#statusbar").css("bottom", "-82px");
				$("#artistinfo").fadeOut("fast");
			}
		},
		afterRender: function(){
			
		}
	});


	//button input
	$("#searchbutton").click(function(){
		$("header").toggleClass("top40");

	});

	//controller
	$("#button-volume").click(function(){
		$(this).find("path").toggle("fast");
	});
});