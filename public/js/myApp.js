var app = angular.module('myApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {

    $rootScope.authenticated = false;
    $rootScope.current_user = '';
    $rootScope.now_playing = {};
    $rootScope.search_string = "";

    //TODO: need to check user authentication (using session stored in mongodb) and keep logged in
    $http.get('/auth/session').success(function(data) {
        if (data && data !== "undefined" && data['user']) {
            $rootScope.authenticated = true;
            $rootScope.current_user = data['user']['username'];
            $rootScope.user_type = data['user']['user_type'];
            $rootScope.now_playing = {
                "created_by": $rootScope.current_user
            };
        }
        $("#mainscreen").data("username", $rootScope.current_user);
        var socket = io.connect();
        var user_name = $("#mainscreen").data("username");

        socket.emit('join', {
            username: user_name
        });

        socket.on("new_msg", function(data) {

            if ($("body").hasClass("chatopened") && $rootScope.now_playing.created_by == data.from) {
                var time = new Date();
                time = time.toString();
                time = time.split(":")[0] + ":" + time.split(":")[1];
                var music_type = data['music_type'];
                var request_location = data["location"];
                var request_time = data['time'];
                var id = data['id'];
                if (data['type'] == "request") {

                    var dom = " <div id = '" + id + "'class = 'chat_msg gig_request'> " +
                        data.msg + "      by  " + data.from + "      at  " + time +
                        "<div class = 'request_info'>  <p>requested song type :" + music_type + "</p>" +
                        " <p>requested gig time :" + request_time + "</p>" +
                        " <p>requested location :" + request_location + "</p>" +
                        "</div> <div class = 'confirm_button'> CONFIRM </div> ";

                    $(".chatmain").append(dom);
                    $("#" + id).data("request_info", data);
                } else {
                    var dom = " <div id = '" + id + "'class = 'chat_msg'> " + data.msg + "      by  " + data.from + "      at  " + time + "</div> ";
                    $(".chatmain").append(dom);
                }
                $('.chatmain').scrollTop($('.chatmain')[0].scrollHeight);
                //update the latest read time
                var url = "/update_notification"
                $.post(url, {
                    current_user: $rootScope.current_user
                }).done(function(data) {
                    console.log(data);
                    console.log("NOTIFICATION TIME UPDATED");
                });

            } else {
                alert(data.msg + "  received from " + data.from);
            }



        });

    });


    $rootScope.signout = function() {
        $http.get('auth/signout');
        $rootScope.authenticated = false;
        $rootScope.current_user = '';
    };
});



app.config(function($routeProvider) {
    $routeProvider

    //the login display
    .when('/login', {
        templateUrl: 'login.html',
        controller: 'authController'
    })
    //the signup display
    .when('/signup', {
        templateUrl: 'register.html',
        controller: 'authController'
    })
});



app.directive('fileModel', ['$parse',
    function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }
]);



app.service('fileUpload', ['$http',
    function($http) {
        this.uploadFileToUrl = function(file, uploadUrl) {
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).success(function() {
                alert("file successfully uploaded");
            }).error(function() {
                alert("file upload failed");
            });
        }
    }
]);


app.controller('searchController', function($scope, $rootScope, $http) {
    $scope.search_results = {};

    // $scope.view_post = function(post) {
    //     if (post.is_file) {
    //         //if file, change now_playing, jplayer
    //         $rootScope.now_playing = post
    //         $("#jquery_jplayer_1").jPlayer("setMedia", {
    //             title: post.original_name,
    //             mp3: post.url.substring(post.url.indexOf("/") + 1)
    //         });
    //     }
    // }

    // $scope.view_user = function(user) {

    // }

    // $scope.view_event = function(e) {

    // }
});


app.factory('postService', function($resource) {
    return $resource('/api/posts/:id');
});

app.controller('mainController', function(fileUpload, $scope, $rootScope, $sce, $http) {


    $scope.list_type = 1; //1: artists, 2: venues, 3: events
    //   var temp = postService.query();
    var files = [];
    var text_posts = [];
    var url = "/api/posts"

    $http.get(url, {
        params: {
            user_type: "artist"
        }
    }).success(function(data) {
        data.forEach(function(item) {
            if (item["is_file"] == true || item["is_file"] == "true") {
                item['created_at'] = convert_time(item['created_at']);
                files.push(item);
            } else {
                item['created_at'] = convert_time(item['created_at']);
                console.log(item);
                text_posts.push(item);
            }
        });

        $rootScope.artist_posts = text_posts;
        $rootScope.files = files;
        $("#artistlist").hide()
        $("#requestlist").hide()
        $("#eventlist").hide()
    });

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.post = function() {
        $scope.newPost.created_by = $rootScope.current_user;
        $scope.newPost.user_type = $rootScope.user_type;
        $scope.newPost.created_at = Date.now();
        var url = "/api/posts"
        $http.post(url, {
            newPost: $scope.newPost
        }).success(function(data) {
            $("#post_input_field").val("")
            console.log(data)
        });
    };

    $scope.search = function() {
        $rootScope.search_string = $scope.search_string
        if ($scope.search_string == "") {
            $scope.change_post_view_type();
            return;
        }
        $http.get('/api/search', {
            params: {
                search_string: $scope.search_string
            }
        }).success(function(data) {
            alert("00000")
            $rootScope.artist_posts = data.artist_posts;
            console.log(data.files)
            $rootScope.files = data.files;
            $rootScope.artists = data.artists;
            $rootScope.requests = data.requests
            $rootScope.events = data.events
        });
    };

    $scope.open_profile = function(user_data) {

    };

    $scope.show_event = function(event_data) {

    };

    $scope.load_post_comments = function(post_data) {

    };

    $scope.change_post_view_type = function() {

        $scope.clear_lists();
        var val = $(".cat-checkbox:checked").val()
        if (val == 1) {
            set_columns("Song", "Artist", "Date")
            $("#artist_postlist").show()
            $("#filelist").show()
            if ($rootScope.search_string == "") {
                $scope.load_artist_posts();
            }
        }
        if (val == 2) {
            $("#artistlist").show()
            set_columns("Artist", "genre", "description")
            if ($rootScope.search_string == "") {
                $scope.load_artists();
            }
        }
        if (val == 3) {
            set_columns("Gig requests", "Venue", "Date")
            if ($rootScope.search_string == "") {
                $scope.load_gig_requests();
            }
            $("#requestlist").show()
        }
        if (val == 4) {
            set_columns("Venue", "Artist", "Date")
            if ($rootScope.search_string == "") {
                $scope.load_gigs();
            }
            $("#eventlist").show()
        }

    }

    $scope.clear_lists = function() {
        $("#artist_postlist").hide()
        $("#filelist").hide()
        $("#artistlist").hide()
        $("#requestlist").hide()
        $("#eventlist").hide()
    }

    $scope.get_now_playing = function() {
        var data = $rootScope.now_playing;
        if (!('_id' in data)) {
            alert("please choose music beforehand!");
            $("#now_playing_info_wrapper").hide();
        } else {

            if ($("#now_playing_info_wrapper").css('display') == "block") {
                $("#now_playing_info_wrapper").hide();
            } else {
                / /
                $("#uploadwrapper").hide();
                $("#trending_wrapper").hide();
                $("#saved_wrapper").hide();
                $("#chat_list").hide();

                set_now_playing_info(data);
                $("#now_playing_info_wrapper").show();
            }

        }
    }

    $scope.upload = function() {
        $("#now_playing_info_wrapper").hide();
        $("#trending_wrapper").hide();
        $("#saved_wrapper").hide();
        $("#chat_list").hide();
        $("#uploadwrapper").show();

        var file = $scope.myFile;

        if (typeof file === "undefined") {
            return
        }

        var uploadUrl = "/api/upload_file";
        fileUpload.uploadFileToUrl(file, uploadUrl);
    };

    $scope.upload_comment = function() {
        var url = "/api/comment";

        $scope.comment.created_by = $rootScope.current_user;
        $scope.comment.post_id = $scope.post_id;
        $http.post(url, {
            comment: $scope.comment
        }).success(function(data) {
            $("#comment_input").val("");
        });
    };

    $scope.load_artist_posts = function() {
        var files = [];
        var text_posts = [];
        var url = "/api/posts"

        $http.get(url, {
            params: {
                user_type: "artist"
            }
        }).success(function(data) {
            data.forEach(function(item) {
                if (item["is_file"] == true || item["is_file"] == "true") {
                    item['created_at'] = convert_time(item['created_at']);
                    files.push(item);
                } else {
                    item['created_at'] = convert_time(item['created_at']);
                    text_posts.push(item);
                }
            });

            $rootScope.artist_posts = text_posts;
            $rootScope.files = files;
        });

    }

    $scope.load_artists = function() {
        var url = "/api/artists";
        $http.get(url, {}).success(function(data) {
            $rootScope.artists = data;
        })
    }

    $scope.load_gig_requests = function() {
        var url = "/api/gig_requests";

        $http.get(url, {}).success(function(data) {
            $rootScope.requests = data;
        })
    }

    $scope.load_gigs = function() {
        var url = "/api/events";

        $http.get(url, {}).success(function(data) {
            $rootScope.events = data;
        })
    }

    $scope.load_comments = function(post) {
        var id = post["_id"];
        var url = "/api/comment";
        //TODO: NEED TO GET POST ID FOR QUERYING COMMENTS
        $scope.post_id = id;
        $http.get(url, {
            params: {
                post_id: id
            }
        }).success(function(data) {

            $("#commentmain").empty();
            data.forEach(function(c) {
                $("#commentmain").append("<li>" + c.created_by + " said: " + c.text + " at : " + convert_time(c.created_at) + "</li>")
            });
            $(".commentField").show();

            return data;
        });
    };
    $scope.show_artist = function(artist) {

    }
    $scope.show_venue = function(venue) {

    }
    $scope.show_request = function(request) {

    }
    $scope.show_event = function(event) {

    }
    $scope.start_music = function(post) {
        console.log("starting music");
        $("body").removeClass("menuopened");
        $("body").removeClass("profileopened");
        $("body").removeClass("searchopened");
        $("body").removeClass("chatopened");

        $("#jquery_jplayer_1").jPlayer("setMedia", {
            title: post.original_name,
            mp3: post.url.substring(post.url.indexOf("/") + 1)
        });

        $scope.post_id = post._id;
        $scope.load_comments(post);
        $rootScope.now_playing = post
        $("body").addClass("menuopened");
        $("#now_playing_info_wrapper").hide();
        $scope.get_now_playing();
    }
});

function set_now_playing_info(data) {
    $("#now_playing_song_title").html(data.original_name);
    $("#now_playing_song_artist").html(data.created_by);
    $("#now_playing_song_date").html(data.created_at);
}


function set_columns(col1, col2, col3) {
    $("#col1").text(col1);
    $("#col2").text(col2);
    $("#col3").text(col3);
}

function set_user_profile(info, user) {
    var username = info["username"];
    var location = info.user_location;
    var description = info.user_description;
    var genre = info.genre;
    $("#user_profile_username").html(username);
    $("#user_profile_location").html(location);
    $("#user_profile_description").html(description);
    $("#user_profile_genre").html(genre);
    $(".current_user_profile").html(username);
    if (username == user) {
        $('#openchat').hide();
    } else {
        $('#openchat').show();
    }
}

app.controller('profileController', function($scope, $rootScope, $http) {
    $scope.user_posts = [];
    $scope.user_info = {};

    $scope.get_profile_info = function() {
        var url = "/api/profile";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var user_name = $rootScope.now_playing.created_by;

        $http.get(url, {
            params: {
                username: user_name
            }
        }).success(function(data) {
            var user_info = data['info'];
            set_user_profile(user_info[0], $rootScope.current_user);
            var profile_posts = data["posts"];
            //TODO: SET USER INFORMATION IN LEFT PROFILE VIEW HERE 
            $scope.user_info = user_info;
            $scope.user_posts = profile_posts;
            $("body").addClass("profileopened");
            profile_posts.forEach(function(entry) {
                $("#user_post_wrapper").empty();
                var time = convert_time(entry.created_at);
                var is_file = entry['is_file'];
                var item;
                var id = "profile_post_" + entry["_id"];

                if (is_file == "true" || is_file == true) {
                    item = "<li class = 'profile_post_item' id ='" + id + "' style = 'display:block'><h6>" + entry.original_name + " </h6> <p>" + time + "</p> <p>" + entry.created_by + "</p></li>"
                } else {
                    item = "<li class = 'profile_post_item' id = '" + id + "' style = 'display:block'><h6>" + entry.text + " </h6> <p>" + time + "</p> <p>" + entry.created_by + "</p></li>"
                }

                $("#user_post_wrapper").append(item);
                $("#" + id).data("profile_post", entry);
            });

        });
    }



    $scope.get_chat = function() {

        $("#now_playing_info_wrapper").hide();
        // $("#uploadwrapper").hide();
        $("#trending_wrapper").hide();
        $("#saved_wrapper").hide();
        if ($("#chat_list").css("display") == "block") {
            $("#chat_list").hide();
        } else {
            $("#chat_list").show();
        }

        $http.get('/get_chat', {
            params: {
                user_name: $rootScope.current_user
            }
        }).success(function(obj) {

            var old_chat = obj["newchat"];
            var new_chat = obj["oldchat"];
            var chats = {};
            for (var i = 0; i < old_chat.length; i++) {
                var item = old_chat[i];
                var from = item.sent_from;
                if (from in chats) {
                    chats[from]["chats"].push(item);
                } else {
                    var list = [];
                    list.push(item)
                    chats[from] = {
                        "chats": list,
                        "count": 0
                    };
                }
            }

            for (var i = 0; i < new_chat.length; i++) {
                var item = new_chat[i];
                var from = item.sent_from;
                if (from in chats) {
                    chats[from]["chats"].push(item);
                    chats[from]["count"] = chats[from]["count"] + 1
                } else {
                    var list = [];
                    list.push(item)
                    chats[from] = {
                        "chats": list,
                        "count": 1
                    };
                }
            }
            console.log("====== this data is saved as data attribute on notification chats for toggle ======");
            console.log(chats);
            var total = 0;
            var keys = Object.keys(chats);
            $("#chat_list").empty();
            for (var i = 0; i < keys.length; i++) {
                var sent_from = keys[i];
                var new_chat_number = chats[sent_from]["count"];
                total = total + new_chat_number
                var id = "chat_" + sent_from;
                var item = "<li class = 'chat_list_item' id = " + id + ">" + sent_from + "   <span id = 'new_chat_count'> " + new_chat_number + "</span> </li>"
                $("#chat_list").append(item);
                $("#" + id).data("chats", chats[sent_from]);
            }
            $("#new_message_num").html(total);
        });
    };

    $scope.get_chat_from = function() {
        $http.get('api/get_chat_from', {
            params: {
                sent_from: $rootScope.now_playing.created_by,
                sent_to: $rootScope.current_user
            }
        }).success(function(data) {

            add_chat(data);
            $("body").addClass("chatopened");
            $('.chatmain').scrollTop($('.chatmain')[0].scrollHeight);

        });
    };

    $scope.send_request = function() {
        alert("send request");
        var url = "/send_chat";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var sent_to = $rootScope.now_playing.created_by;
        var text = $("#chat_input").val();
        var sent_from = $rootScope.current_user;

        $http.post(url, {
            chat_type: "request",
            sent_from: sent_from,
            text: text,
            sent_to: sent_to,
            request_music_type: "sample genre",
            request_location: "providence mall",
            request_time: Date.now()

        }).success(function(data) {
            $("#chat_input").val("");
            alert(JSON.stringify(data));
            var type = data['request_music_type'];
            var time = convert_time(data['request_time']);
            var locatiion = data['request_location'];
            var dom = " <div class = 'chat_msg gig_request'> successfully send gig request to  " +
                sent_to + "    <div class = 'request_info'>  <p>requested song type :" + type + "</p>" +
                " <p>requested gig time :" + time + "</p>" +
                " <p>requested location :" + location + "</p></div>";

            $(".chatmain").append(dom);
            $('.chatmain').scrollTop($('.chatmain')[0].scrollHeight);
        });
    }

    $scope.send_chat = function() {
        var url = "/send_chat";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var sent_to = $rootScope.now_playing.created_by;
        var text = $("#chat_input").val();
        var sent_from = $rootScope.current_user;


        $http.post(url, {
            chat_type: "msg",
            sent_from: sent_from,
            text: text,
            sent_to: sent_to

        }).success(function(data) {
            var time = data['sent_at'];
            time = convert_time(time);
            $("#chat_input").val("");
            var dom = " <div class = 'mychat_msg chat_msg'> " + text + "      at  " + time + "</div> ";
            $(".chatmain").append(dom);
            $('.chatmain').scrollTop($('.chatmain')[0].scrollHeight);
        });
    }

    function add_chat(info) {
        $(".chatmain").empty();
        for (var i = 0; i < info.length; i++) {
            var data = info[i];
            var time = convert_time(data['sent_at']);
            var music_type = data['request_music_type'];
            var request_location = data['request_location'];
            var request_time = data['request_time'];
            var id = data['_id'];

            if (data.chat_type == "request") {
                var dom = "";


                if (data['sent_from'] == $rootScope.current_user) {
                    dom = " <div class = 'chat_msg gig_request'> successfully send gig request to  " +
                        data.sent_to + "    <div class = 'request_info'>  <p>requested song type :" + music_type + "</p>" +
                        " <p>requested gig time :" + request_time + "</p>" +
                        " <p>requested location :" + request_location + "</p></div>";
                } else {
                    dom = " <div id = '" + id + "'  class = 'chat_msg gig_request'> " +
                        data.chat_text + "      by  " + data.sent_from + "      at  " + time +
                        "<div class = 'request_info'>  <p>requested song type :" + music_type + "</p>" +
                        " <p>requested gig time :" + request_time + "</p>" +
                        " <p>requested location :" + request_location + "</p>" +
                        "</div> <div class = 'confirm_button'> CONFIRM </div> ";
                }



                $(".chatmain").append(dom);
                $("#" + id).data("request_info", data);
            } else {
                var dom = " <div id = '" + id + "'class = 'chat_msg'> " + data.chat_text + "      by  " + data.sent_from + "      at  " + time + "</div> ";
                $(".chatmain").append(dom);
            }
        }

    }

});



function convert_time(time) {
    var year = time.split("-")[0];
    var month = time.split("-")[1];
    var day = time.split("-")[2];
    day = day.split("T")[0];
    var time = time.split("T")[1];
    var hour = time.split(":")[0];
    var min = time.split(":")[1];
    var string_formatted_time = year + "/" + month + "/" + day + "     " + hour + ":" + min;
    return string_formatted_time;
}

app.controller('authController', function($scope, $http, $rootScope, $location) {
    $scope.user = {
        username: '',
        password: '',
        location: '',
        bandname: '',
        genre: '',
        user_type: ''
    };
    $scope.error_message = '';

    $scope.login = function() {
        $http.post('/auth/login', $scope.user).success(function(data) {

            if (data.state == 'success') {

                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $rootScope.user_type = data.user.user_type;
                $location.path('/profile');
            } else {
                $scope.error_message = data.message;
            }
        });
    };

    $scope.change_user_type = function() {
        $("#register_musician").hide()
        $("#register_host").hide()
        $("#register_fan").hide()
        var user_type = $('.user-checkbox:checked').val()
        if (user_type == 1) {
            $("#register_musician").show()
        }
        if (user_type == 2) {
            $("#register_host").show()
        }
        if (user_type == 3) {
            $("#register_fan").show()
        }
    }

    $scope.register = function() {
        var user_type = $('.user-checkbox:checked').val()

        if (user_type == 1) {
            $scope.user.user_type = 'artist';
        }
        if (user_type == 2) {
            $scope.user.user_type = 'venue';
        }
        if (user_type == 3) {
            $scope.user.user_type = 'fan';
        }

        $http.post('/auth/signup', $scope.user).success(function(data) {
            if (data.state == 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $rootScope.user_type = data.user.user_type;
                $location.path('/');
            } else {
                $scope.error_message = data.message;
            }
        });
    };
});