$(document).ready(function() {
	var socket = io.connect();
	//todo : programmically get the username
	socket.emit('join', {
		username: "scottljy"
	});

	socket.on("new_msg", function(data) {
		// alert(data.msg + "  received from " + data.from);
		$(".chatmain").append($("<p class='received'>") + data.msg + $("</p>"));
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

	function add_chat(info) {
		for (var i = 0; i < info.length; i++) {
			var item = info[i];
			var time = convert_time(info.sent_at);
			var dom = " <div> " + info.chat_text + "      by  "
			info.sent_from + "      at  " + time + "</div>"
		}

	}

	function convert_time(time) {
		alert(time.toDateString());
		return time.toDateString();
	}

});