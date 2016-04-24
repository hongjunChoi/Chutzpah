
$(document).ready(function(){

	var menuopened = false;


	//button input
	$("#searchbutton").click(function() {
		$("header").toggleClass("top40");
	});

	$("#btn_menu").click(function(){
		menuopen();
	});

	$("#btn_search").click(function(){
		menuopen();
		$("body").addClass("searchopened");
	});	

	$("#navsearch").click(function(){
		$("body").toggleClass("searchopened");
	});
	//controller
	$("#button-volume").click(function() {
		$(this).find("path").toggle("fast");
	});

	$("#button-control").click(function() {
		$(this).toggleClass("paused");
	});

	$("#logo").click(function(){
		$("body").removeClass("menuopened");
		$("body").removeClass("searchopened");

		if(menuopened){
			menuopened = false;
		}
	});	

	$("#userthumb").click(function(){
		$("body").addClass("profileopened");
	});

	$("#profileclose").click(function(){
		$("body").removeClass("profileopened");
	});

	function menuopen(){
		if(!menuopened){
			$("body").addClass("menuopened");
		}
		else{
			$("body").removeClass("menuopened");
			$("body").removeClass("searchopened");
		}
		menuopened = !menuopened;
	}
	// //dropdown menu init
	// $( "#profile-menu" ).menu({position: {at: "left bottom"}});

	
	// 	//button input
	// 	$("#searchbutton").click(function(){
	// 		$("header").toggleClass("top40");

	// });

	// //controller
	// $("#button-volume").click(function(){
	// 	$(this).find("path").toggle("fast");
	// });

	// $("#button-control").click(function(){
	// 	$(this).toggleClass("paused");
	// });


	// //artist page
	// var artistbaropened = false;
	// var contactopened = false;

	// $("#artistinfo").click(function(){
	// 	if(artistbaropened){

	// 		$("#statusbar").css("bottom", "-340px");
	// 		$(this).delay(400).queue(function (next){
	// 			$(".carousel-control.left").removeClass("hidearrows");
	// 			$(".carousel-control.right").removeClass("hidearrows");
	// 			next();
	// 		});
	// 	}
	// 	else{
	// 		$(".carousel-control.left").addClass("hidearrows");
	// 		$(".carousel-control.right").addClass("hidearrows");
	// 		$(this).delay(400).queue(function (next){
	// 			$("#statusbar").css("bottom", "0px");
	// 			next();
	// 		});
	// 	}
	// 	artistbaropened = !artistbaropened;
	// });

	// //contact request
	// $("#contactbutton").click(function(){
	// 	var $contactForm = $("<div><form><input></input></form></div>");
	// 	$("#contactbar").prepend($contactForm);
	// 	$contactForm.addClass("contactform");
	// 	$("#statusbar").css("bottom", "400px");
	// 	$("#contactbar").css("height", "480px");

	// 	// $("#contactbar").fadeOut("slow", function(){
	// 	// 	$("#statusbar").css("bottom", "400px");
	// 	// });
	// });


		// var full_page_config = function(){
	// 	$('#fullpage').fullpage({
	// 		// anchors: ['loginpage', 'genrepage', 'firstgenre'],
	// 		lockAnchors: false,
	// 		verticalCentered: true,
	// 		sectionsColor: ['#252c3f', '#4BBFC3', '#7BAABE', '#1c1f24'],
	// 		afterLoad: function(anchorlink, index){
	// 			// if (index === 1){
	// 			// 	$("header").css("top", "-80px");
	// 			// }
	// 			// else{
	// 			// 	$("header").css("top", "0");
	// 			// }

	// 			if (index === 4){
	// 				$("#statusbar").css("bottom", "-340px");
	// 				// $("#statusbar").css("bottom", "380px");
	// 				$("#artistinfo").delay(300).fadeIn("fast");
	// 				$("#searchbar").fadeOut("fast");
	// 				$("#section4 div.clearfix").fadeIn("slow");
	// 			}
	// 			else{
	// 				$("#section4 div.clearfix").fadeOut("fast");
	// 				$("#statusbar").css("bottom", "-400px");
	// 				$("#artistinfo").fadeOut("fast");
	// 				$("#searchbar").fadeIn("fast");
	// 			}
	// 		},
	// 		afterRender: function(){

	// 		}
	// 	});
	// };

	// full_page_config();
});