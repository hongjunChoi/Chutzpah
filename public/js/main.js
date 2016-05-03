$(document).ready(function() {
	var socket = io.connect();
	//todo : programmically get the username
	socket.emit('join', {
		username: "scottljy"
	});

	socket.on("new_msg", function(data) {
		alert(data.msg + "  received from " + data.from);
	});

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
		$("body").removeClass("menuopened");
		$("body").removeClass("profileopened");

		if (menuopened) {
			menuopened = false;
		}
<<<<<<< HEAD
	});	
=======
	});
>>>>>>> 6e100d5a668fa1df5b29d2633d72b141a1cd5d2a

	// $("#userthumb").click(function(){
	// 	$("body").addClass("profileopened");
	// });
<<<<<<< HEAD
	$("#profileclose").click(function(){
=======
	$("#profileclose").click(function() {
>>>>>>> 6e100d5a668fa1df5b29d2633d72b141a1cd5d2a
		$("body").removeClass("profileopened");
	});

	function menuopen() {
		if (!menuopened) {
			$("body").addClass("menuopened");
		} else {
			$("body").removeClass("menuopened");
		}
		menuopened = !menuopened;
	}
});