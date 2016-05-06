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
		alert("asdfasdf");
		var request_data = $(this).closest('.chat_msg').data("request_info");
		console.log("============ confirm button clicked ==================");
		console.log(request_data);
		console.log("======================================================");

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



	function closeAll() {
		$("body").removeClass("menuopened");
		$("body").removeClass("profileopened");
		$("body").removeClass("searchopened");
		$("body").removeClass("chatopened");
	}


});