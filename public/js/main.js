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


	$("#closechat").click(function() {
		$("body").removeClass("chatopened");
	});

	$("#profileclose").click(function() {
		closeAll();
	});

	$(document).on('click', '.confirm_button', function() {
		var request_data = $(this).closest('.chat_msg').data("request_info");
		var url = "/api/events";
		var location = request_data.request_location;
		var time = request_data.request_time;
		var music_type = request_data.request_music_type;
		var venue = request_data.sent_from;
		var artist = request_data.sent_to;

		$.post(url, {
			artist: artist,
			venue: venue,
			time: time,
			location: location,
			genre: music_type
		}).done(function(data) {
			alert(" confirm successful ");
		});
	});


	function menuopen() {
		if (!menuopened) {
			$("body").addClass("menuopened");
		} else {
			closeAll();
		}
		menuopened = !menuopened;
	}

	$(document).on('click', '.chat_list_item', function() {
		var chat_data = $(this).data("chats");
		add_chat(chat_data.chats);
		$("#userthumb").click();
		$("body").addClass("chatopened");
	});

	function add_chat(info) {
		$(".chatmain").empty();
		for (var i = 0; i < info.length; i++) {
			var data = info[i];
			var time = convert_time(data.sent_at);
			var music_type = data.music_type;
			var request_location = data.location;
			var request_time = data.time;
			var id = data['_id'];

			if (data.chat_type == "request") {
				var dom = " <div id = '" + id + "'  class = 'chat_msg gig_request'> " +
					data.chat_text + "      by  " + data.sent_from + "      at  " + time +
					"<div class = 'request_info'>  <p>requested song type :" + music_type + "</p>" +
					" <p>requested gig time :" + request_time + "</p>" +
					" <p>requested location :" + request_location + "</p>" +
					"</div> <div class = 'confirm_button'> CONFIRM </div> ";

				$(".chatmain").append(dom);
				$("#" + id).data("request_info", data);

			} else {
				var dom = " <div id = '" + id + "'class = 'chat_msg'> " + data.chat_text + "      by  " + data.sent_from + "      at  " + time + "</div> ";
				$(".chatmain").append(dom);
			}
		}
	}

	function closeAll() {
		$("body").removeClass("menuopened");
		$("body").removeClass("profileopened");
		$("body").removeClass("searchopened");
		$("body").removeClass("chatopened");
	}


});