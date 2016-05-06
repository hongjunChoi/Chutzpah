$(document).ready(function() {


	var menuopened = false;

	$("nav ul li h4").click(function() {
		if ($(this).parent().hasClass('active')) {
			$(this).parent().removeClass('active');
		} else {
			$("nav ul li.active").removeClass('active');
			$(this).parent().addClass('active');
		}
	});

	$("#btn_menu").click(function() {
		menuopen();
	});


	$("#logo").click(function() {
		closeAll();

		if (menuopened) {
			menuopened = false;
		}
	});

	$("#openchat").click(function(){
		$("body").addClass("chatopened");
	});
	$("#closechat").click(function(){
		$("body").removeClass("chatopened");
	});
	// $("#btn_search").click(function() {
	// 	menuopen();
	// 	$("body").addClass("searchopened");
	// });

	$("#profileclose").click(function() {
		closeAll();
	});

	function menuopen() {
		if (!menuopened) {
			$("body").addClass("menuopened");
		} else {
			closeAll();
		}
		menuopened = !menuopened;
	}



	function closeAll() {
		$("body").removeClass("menuopened");
		$("body").removeClass("profileopened");
		$("body").removeClass("searchopened");
		$("body").removeClass("chatopened");
	}


});