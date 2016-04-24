$(document).ready(function(){

	var menuopened = false;

	$("nav ul li h4").click(function(){
		$("nav ul li.active").removeClass('active');
		$(this).parent().addClass('active');
	});

	$("#btn_menu").click(function(){
		menuopen();
	});


	$("#logo").click(function(){
		$("body").removeClass("menuopened");
		$("body").removeClass("profileopened");

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
		}
		menuopened = !menuopened;
	}
});