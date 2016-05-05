$(document).ready(function() {
	var socket = io.connect();
	//todo : programmically get the username
	socket.emit('join', {
		username: "scottljy"
	});

	socket.on("new_msg", function(data) {
		// alert(data.msg + "  received from " + data.from);
		$(".chatmain").append( $("<p class='received'>") + data.msg + $("</p>") );
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
		closeAll();

		if (menuopened) {
			menuopened = false;
		}
	});

	$("#btn_search").click(function() {
		menuopen();
		$("body").addClass("searchopened");
	});

	// $("#userthumb").click(function(){
	// 	$("body").addClass("profileopened");
	// });
	$("#profileclose").click(function() {
		closeAll();
	});

	function menuopen() {
		if (!menuopened) { $("body").addClass("menuopened"); } 
		else { closeAll(); }
		menuopened = !menuopened;
	}

	//chat
	$("#openchat").click(function(){
		$("body").addClass("chatopened");
	});

	function closeAll(){
		$("body").removeClass("menuopened");
		$("body").removeClass("profileopened");
		$("body").removeClass("searchopened");
		$("body").removeClass("chatopened");
	}
});