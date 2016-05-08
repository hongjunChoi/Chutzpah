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

    $("#btn_upload").click(function() {
        $("body").toggleClass("uploadopened");
    });


    $("#closechat").click(function() {
        $("body").removeClass("chatopened");
        //update the latest read time
        var url = "/update_notification"
        $.post(url, {
            current_user: $("#mainscreen").data("username")
        }).done(function(data) {
            console.log(data);
            console.log("NOTIFICATION TIME UPDATED");
        });
    });

    $("#profileclose").click(function() {
        closeAll();
    });


    $(document).on('click', '.confirm_button', function() {
        var request_data = $(this).closest('.chat_msg').data("request_info");
        alert(JSON.stringify(request_data));

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


    $(document).on('click', '.profile_post_item', function() {
        var post_data = $(this).data("profile_post");
        alert(JSON.stringify(post_data));
        if ((post_data.music_url != null) && (typeof post_data.music_url != "undefined")) {
            $("#jquery_jplayer_1").jPlayer("setMedia", {
                title: post_data.music_name,
                mp3: post_data.music_url.substring(post_data.music_url.indexOf("/") + 1)
            });
        }

        var id = post_data["_id"];
        var url = "/api/comment";
        $.get(url, {
            post_id: id
        }).done(function(data) {
            console.log(data);
            // $("#commentmain").empty();
            // data.forEach(function(c) {
            //  $("#commentmain").append("<li>" + c.created_by + " said: " + c.text + " at : " + convert_time(c.created_at) + "</li>")
            // });
            // $(".commentField").show();
        });


        var id = post_data["_id"];
        var url = "/api/comment";
        $.get(url, {
            post_id: id
        }).done(function(data) {
            console.log(data);
            // $("#commentmain").empty();


            // data.forEach(function(c) {
            //  $("#commentmain").append("<li>" + c.created_by + " said: " + c.text + " at : " + convert_time(c.created_at) + "</li>")
            // });
            // $(".commentField").show();
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
        //update the latest read time
        var url = "/update_notification"
        $.post(url, {
            current_user: $("#mainscreen").data("username")
        }).done(function(data) {
            console.log(data);
            console.log("NOTIFICATION TIME UPDATED");
        });
    });

    $(document).on('click', '#show_upload_form', function() {
        $("#now_playing_info_wrapper").hide();
        $("#trending_wrapper").hide();
        $("#saved_wrapper").hide();
        $("#chat_list").hide();
        $("#uploadwrapper").show();
    });

    function add_chat(info) {
        $(".chatmain").empty();
        for (var i = 0; i < info.length; i++) {
            var data = info[i];

            var time = convert_time(data.sent_at);
            var music_type = data.request_music_type;
            var request_location = data.request_location;
            var request_time = convert_time(data.request_time);
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

    function hide_all_right_panel() {
        $("#now_playing_info_wrapper").hide();
        $("#trending_wrapper").hide();
        $("#saved_wrapper").hide();
        $("#chat_list").hide();
    }

    function closeAll() {
        $("body").removeClass("menuopened");
        $("body").removeClass("profileopened");
        $("body").removeClass("searchopened");
        $("body").removeClass("chatopened");
        $("body").removeClass("uploadopened");
        //update the latest read time
        var url = "/update_notification"
        $.post(url, {
            current_user: $("#mainscreen").data("username")
        }).done(function(data) {
            console.log(data);
            console.log("NOTIFICATION TIME UPDATED");
        });
        hide_all_right_panel();
    }

    // Login & Register

    // Carousel
    $("#news-carousel").owlCarousel({
    	items: 1,
    	lazyLoad : true,
    	// navigation: true,
    	autoPlay: 4000,
    	stopOnHover: true,
    	singleItem:true,
    	slideSpeed:500
    });

    // Scroll control
    $("#logo").click(function(){
		$.scrollTo($("body"),200);
    });

    // Key Input (Space to play/pause)
    // Controller Previous/Next Button
    // Controller Volume Button
});
