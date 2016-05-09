var app = angular.module('myApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {

    $rootScope.authenticated = false;
    $rootScope.current_user = '';
    $rootScope.now_playing = {};
    $rootScope.search_string = "";
    $rootScope.images_to_post = [];
    $rootScope.music_to_post = "";



    //TODO: need to check user authentication (using session stored in mongodb) and keep logged in
    $http.get('/auth/session').success(function(data) {
        if (data && data !== "undefined" && data['user']) {

            $rootScope.authenticated = true;
            $rootScope.current_user = data['user']['username'];
            $rootScope.user_type = data['user']['user_type'];
            $rootScope.user = data['user'];
            $rootScope.now_playing = {
                "created_by": $rootScope.current_user
            };
            set_user_images("/uploads/img/" + $rootScope.current_user)
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



app.service('fileUpload', ['$http', '$rootScope',
    function($http, $rootScope) {
        this.uploadFileToUrl = function(file, uploadUrl, callback) {
            var fd = new FormData();
            fd.append('file', file);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function successCallback(response) {
                // this callback will be called asynchronously
                // when the response is available
                callback(response.data);

            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(response);
            });
        }

        // this.uploadFileToPost = function(file, uploadUrl) {
        //     var fd = new FormData();
        //     fd.append('file', file);
        //     $http.post(uploadUrl, fd, {
        //         transformRequest: angular.identity,
        //         headers: {
        //             'Content-Type': undefined
        //         }
        //     }).then(function successCallback(response) {
        //         console.log(response)
        //         set_user_images(response.data.img_url)
        //         $rootScope.user.image_url = response.data.img_url
        //     }, function errorCallback(response) {
        //         // called asynchronously if an error occurs
        //         // or server returns response with an error status.
        //     });
        // }

        this.uploadImageToUrl = function(img, uploadUrl) {
            var fd = new FormData();
            fd.append('file', img);
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }).then(function successCallback(response) {
                alert("dddd")
                set_user_images("/uploads/img/" + $rootScope.user.username)
                $rootScope.user.image_url = response.data.img_url
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
            });
        }
    }
]);




app.factory('postService', function($resource) {
    return $resource('/api/posts/:id');
});

app.controller('mainController', function(fileUpload, $scope, $rootScope, $sce, $http) {


    $scope.list_type = 1; //1: artists, 2: venues, 3: events
    //   var temp = postService.query();
    var posts = [];
    var url = "/api/posts"


    $http.get(url, {}).success(function(data) {
        var posts = [];
        var music_list = [];
        data.forEach(function(item) {
            item.post_info['created_at'] = convert_time(item.post_info['created_at']);
            if (item.post_info["music_url"] != null && (typeof item.post_info["music_url"] != "undefined")) {
                music_list.push(item);
            } else {
                posts.push(item);
            }

        });

        $rootScope.files = music_list;
        $rootScope.artist_posts = posts;
        $("#artistlist").hide();
        $("#requestlist").hide();
        $("#eventlist").hide();
    });

    $scope.upload_image = function() {
        $(".file-upload").on('change', function() {
            $scope.readURL();
        });
        $(".file-upload").click();
    }

    $scope.readURL = function() {
        var img = $scope.imgFile;
        var uploadUrl = "/api/upload_img";
        fileUpload.uploadImageToUrl(img, uploadUrl);
    }



    $scope.add_image = function() {
        $(".img-upload").click();
    }

    $scope.add_image_to_holder = function() {

        input = $(".img-upload")
        file = input[0].files[0];
        var uploadUrl = "/api/upload_file"
        fileUpload.uploadFileToUrl(file, uploadUrl, function(file) {
            console.log(file);
            var path = file.path.substring(file.path.indexOf("/") + 1);
            $rootScope.images_to_post.push(path);
        })

    }

    $scope.add_music = function() {
        $(".music-upload").click();
    }

    $scope.add_music_to_holder = function() {

        input = $(".music-upload")
        file = input[0].files[0];
        var uploadUrl = "/api/upload_file"
        fileUpload.uploadFileToUrl(file, uploadUrl, function(file) {
            file.path = file.path.substring(file.path.indexOf("/") + 1);
            $rootScope.music_to_post = file;
            $("#music-holder").empty();
            console.log(file);
            $("#music-holder").append("<button>" + file.originalname + "</button>")
        })
    }

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.post = function() {
        ////// do not post if all empty ////// 
        alert("asdfasdf")
        $("body").removeClass("uploadopened");
        var text = $("#text_input_field").val();
        if (text == "") {
            $("#text_input_field").attr("placeholder", "Please Write Something To Post!");
            return;
        }
        $scope.newPost = {};
        $scope.newPost.created_by = $rootScope.current_user;
        $scope.newPost.user_type = $rootScope.user_type;
        $scope.newPost.created_at = Date.now();
        $scope.newPost.images = $rootScope.images_to_post;
        $scope.newPost.music_url = $rootScope.music_to_post.path;
        $scope.newPost.music_name = $rootScope.music_to_post.originalname;
        $scope.newPost.text = $("#text_input_field").val();
        console.log($scope.newPost);
        var url = "/api/posts";

        $http.post(url, {
            newPost: $scope.newPost
        }).success(function(data) {
            $("#text_input_field").val("");
            $(".music-upload").val("");
            $(".img-upload").val("");
            $("#music-holder").empty();
            $rootScope.images_to_post = [];
            $rootScope.music_to_post = "";
            $scope.refresh_view();
        });

    };

    $scope.refresh_view = function() {
        $scope.clear_lists();
        var val = $(".cat-checkbox:checked").val()
        if (val == 1) {
            set_columns("Posts", "Artist", "Date")
            $("#artist_postlist").show();
            $("#filelist").show();
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
            set_columns("Venue Name", "Location", "Music preference")
            if ($rootScope.search_string == "") {
                $scope.load_gig_requests();
            }
            $("#requestlist").show();
        }
        if (val == 4) {
            set_columns("Venue", "Artist", "Date")
            if ($rootScope.search_string == "") {
                $scope.load_gigs();
                console.log("=======EVENTS======");
                console.log($rootScope.events);
            }
            $("#eventlist").show();
        }
    }

    $scope.show_likes = function(event, like_info) {
        alert(JSON.stringify(like_info));
        //like info contains information about who liked what
        //make sure to use toggle or show
    }

    $scope.like = function(event, post) {
        var url = "/api/like"
        $http.post(url, {
            post_id: post['_id'],
            created_by: $rootScope.current_user
        }).success(function(data) {
            if (data == "like already exists") {
                return
            }

            var item = $(event.target).closest(".post_like");
            var dom = item.find(".like_count");

            console.log(item);
            console.log(dom);
            console.log("===");

            var new_count = parseInt(dom.html());
            dom.html(new_count + 1);
        });
    }

    $scope.search = function() {
        $rootScope.search_string = $scope.search_string
        console.log("searching: " + $scope.search_string)
        if ($scope.search_string == "") {
            $scope.refresh_view();
            return;
        }
        $http.get('/api/search', {
            params: {
                search_string: $scope.search_string
            }
        }).success(function(data) {
            console.log("========= search data ======")
            console.log(JSON.stringify(data));
            var artist_post_data = [];
            var artist_posts = data['artist_posts'];
            for (var i = 0; i < artist_posts.length; i++) {
                var time = artist_posts[i]['created_at'];
                artist_posts[i]['created_at'] = convert_time(time);
                var item = { 'post_info': artist_posts[i] }
                artist_post_data.push(item);
            }
            $rootScope.artist_posts = artist_post_data;

            var file_list_data = [];
            for (var i = 0; i < data.files.length; i++) {
                data.files[i]['created_at'] = convert_time(data.files[i]['created_at']);
                var item = { 'post_info': data.files[i] }
                file_list_data.push(item);
            }
            $rootScope.files = file_list_data;
            $rootScope.artists = data.artists;


            for (var i = 0; i < data.requests.length; i++) {
                data.requests[i]['created_at'] = convert_time(data.requests[i]['created_at']);
            }
            $rootScope.requests = data.requests;



            for (var i = 0; i < data.events.length; i++) {
                data.events[i]['time'] = convert_time(data.events[i]['time']);
            }
            $rootScope.events = data.events;
        });
    };

    $scope.open_profile = function(user_data) {

    };

    $scope.show_event = function(event_data) {

    };

    $scope.get_image_url = function(username) {
        url = "/uploads/img/" + username
        return url;
    }

    $scope.load_post_comments = function(event, post_data) {
        $rootScope.now_playing['created_by'] = post_data["created_by"];
        var url = "/api/comment";
        var post_id = post_data['_id'];
        $scope.post_id = post_id;
        var root_dom = $(event.target).closest(".post-item");
        root_dom.toggleClass('detailopened');
        var chat_field = root_dom.find('.commentField');
        var chat_list = root_dom.find('.commentmain');
        $http.get(url, {
            params: {
                post_id: post_id
            }
        }).success(function(data) {
            // $("li.detailopened").removeClass('detailopened');
            // $scope.toggleClass('detailopened');

            // $("#commentmain").parents("li.post-item").toggleClass('detailopened');

            console.log("========  LOAD POST COMMENT ========");
            console.log(data);

            $("#commentmain").empty();
            chat_list.empty();

            data.forEach(function(c) {
                chat_list.append("<li>" + c.created_by + " said: " + c.text + " at : " + convert_time(c.created_at) + "</li>")
            });
            chat_field.show();
        });
    };



    $scope.clear_lists = function() {
        $("#artist_postlist").hide();
        $("#filelist").hide();
        $("#artistlist").hide();
        $("#requestlist").hide();
        $("#eventlist").hide();
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
                $("#upload_wrapper").hide();
                $("#trending_wrapper").hide();
                $("#saved_wrapper").hide();
                $("#chat_list").hide();

                $scope.set_now_playing_info(data);
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
            $("#file_upload_form").val("");
            return;
        }
        var uploadUrl = "/api/upload_file";
        fileUpload.uploadFileToUrl(file, uploadUrl, function(res) {
            $scope.refresh_view();
        });
    };

    $scope.upload_comment = function(event, post) {
        var post_id = post['_id'];
        console.log("loading comment to post : id : ", post_id);
        var url = "/api/comment";
        var dom = $(event.target).closest(".commentField");
        var text = dom.find(".comment_input").val();

        $http.post(url, {
            comment: {
                'created_by': $rootScope.current_user,
                'post_id': post_id,
                'text': text
            }
        }).success(function(data) {
            console.log(data);
            console.log("=====");
            $(".comment_input").val("");
        });
    };

    $scope.load_artist_posts = function() {
        var posts = [];
        var url = "/api/posts"

        $http.get(url, {
            params: {
                user_type: "artist"
            }
        }).success(function(data) {
            data.forEach(function(item) {
                // if (item["is_file"] == true || item["is_file"] == "true") {
                //     item['created_at'] = convert_time(item['created_at']);
                //     files.push(item);
                // } else {
                //     item['created_at'] = convert_time(item['created_at']);
                //     text_posts.push(item);
                // }
                item.post_info['created_at'] = convert_time(item.post_info['created_at']);
                posts.push(item)
            });
            console.log("!!!!!!!   LOAD ARTIST POST !!!!!!");
            console.log(posts);
            $rootScope.artist_posts = posts;
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
        });
    }

    $scope.load_gigs = function() {
        var url = "/api/events";

        $http.get(url, {}).success(function(data) {

            $rootScope.events = data;
        })
    }




    function click_profile() {
        alert("adsfasdfafds");
        $("#userthumb").click();
    }



    //     $scope.load_post_comments = function(event, post_data) {
    //     $rootScope.now_playing['created_by'] = post_data["created_by"];
    //     var url = "/api/comment";
    //     var post_id = post_data['_id'];
    //     $scope.post_id = post_id;
    //     var root_dom = $(event.target).closest(".post-item");
    //     root_dom.toggleClass('detailopened');
    //     var chat_field = root_dom.find('.commentField');
    //     var chat_list = root_dom.find('.commentmain');
    //     $http.get(url, {
    //         params: {
    //             post_id: post_id
    //         }
    //     }).success(function(data) {
    //         // $("li.detailopened").removeClass('detailopened');
    //         // $scope.toggleClass('detailopened');

    //         // $("#commentmain").parents("li.post-item").toggleClass('detailopened');

    //         console.log("========  LOAD POST COMMENT ========");
    //         console.log(data);

    //         $("#commentmain").empty();
    //         chat_list.empty();

    //         data.forEach(function(c) {
    //             chat_list.append("<li>" + c.created_by + " said: " + c.text + " at : " + convert_time(c.created_at) + "</li>")
    //         });
    //         chat_field.show();
    //     });
    // };


    $scope.load_comments = function(post, div) {
        var id = post["_id"];
        var url = "/api/comment";
        //TODO: NEED TO GET POST ID FOR QUERYING COMMENTS
        $scope.post_id = id;
        $http.get(url, {
            params: {
                post_id: id
            }
        }).success(function(data) {

            div.empty();
            data.forEach(function(c) {
                console.log(c);
                div.append("<li>" + c.created_by + " said: " + c.text + " at : " + convert_time(c.created_at) + "</li>")
            });
            var chat_field = div.closest(".commentField");
            chat_field.show();
            div.closest(".postdetail").show();
            return data;
        });
    };


    $scope.open_profile = function() {
        var url = "/api/profile";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var user_name = $rootScope.now_playing['created_by'];


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
            $("#user_post_wrapper").empty();
            profile_posts.forEach(function(entry) {

                var time = convert_time(entry.created_at);
                var is_file = entry['is_file'];
                var item;
                var id = "profile_post_" + entry["_id"];

                if (is_file == "true" || is_file == true) {
                    item = "<li class = 'profile_post_item' id ='" + id + "' style = 'display:block'><h6>" +
                        entry.original_name + " </h6> <p>" + time + "</p> <p>" + entry.created_by + "</p><div class = 'profile_post_comments'></div></li>"
                } else {
                    item = "<li class = 'profile_post_item' id = '" + id + "' style = 'display:block'><h6>" +
                        entry.text + " </h6> <p>" + time + "</p> <p>" + entry.created_by + "</p></div><div class = 'profile_post_comments'></div></li>"
                }

                $("#user_post_wrapper").append(item);
                $("#" + id).data("profile_post", entry);
            });

            $("body").addClass("profileopened");

        });
    }


    $scope.show_artist = function(artist) {
        $rootScope.now_playing = { 'created_by': artist.username };
        $scope.open_profile();
    }

    $scope.show_venue = function(venue) {
        $rootScope.now_playing = { 'created_by': venue.username };
        $scope.open_profile();
    }


    $scope.show_event = function(event) {

    }


    $scope.start_music = function(event, post) {
        console.log("starting music");
        $("body").removeClass("menuopened");
        $("body").removeClass("profileopened");
        $("body").removeClass("searchopened");
        $("body").removeClass("chatopened");
        //update the latest read time
        var url = "/update_notification"
        $.post(url, {
            current_user: $rootScope.current_user
        }).done(function(data) {
            console.log(data);
            console.log("NOTIFICATION TIME UPDATED");
        });



        $("#jquery_jplayer_1").jPlayer("setMedia", {
            title: post.music_name,
            mp3: post.music_url

        });
        var dom = $(event.target).closest(".music_post_list");
        var detail_wrapper = dom.find(".postdetail-wrapper");
        detail_wrapper.css("display", "block");
        var chat_list = dom.find(".commentmain");
        $scope.post_id = post._id;
        $scope.load_comments(post, chat_list);
        $rootScope.now_playing = post
        $("body").addClass("menuopened");
        $("#now_playing_info_wrapper").hide();
        $scope.get_now_playing();
    }

    $scope.set_now_playing_info = function(data) {
        $("#now_playing_song_title").html(data.music_name);
        $("#now_playing_song_artist").html(data.created_by);
        $("#now_playing_song_date").html(data.created_at);
        var url = "/api/user";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var user_name = data.created_by;
        console.log("-------setnow")
        $http.get(url, {
            params: {
                username: user_name
            }
        }).success(function(data) {
            if (data.length > 0) {
                set_user_images(data[0].img_url)
            }
        });
    }
});



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
    //   set_user_images("/uploads/img/" + username)
    $("#user_profile_username").html(username);
    $("#user_profile_location").html(location);
    $("#user_profile_description").html(description);
    $("#user_profile_genre").html(genre);
    $(".current_user_profile").html(username);
    if (username == user) {
        $('#openchat').hide();
        $('.img-button').show();
    } else {
        $('#openchat').show();
        $('.img-button').hide();
    }
}

function set_user_images(url) {
    console.log("-------------------------")
    if (typeof url === "undefined")
        return

    $("#userthumb").attr("src", url);
    $("#loginthumb").attr("src", url);
    $("#profile_image").attr("src", url);
}

app.controller('profileController', function(fileUpload, $scope, $rootScope, $http) {
    $scope.user_posts = [];
    $scope.user_info = {};

    $scope.get_profile_info = function() {
        var url = "/api/profile";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var user_name = $rootScope.now_playing['created_by'];


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
            $("#user_post_wrapper").empty();
            $("body").addClass("profileopened");
            profile_posts.forEach(function(entry) {

                var time = convert_time(entry.created_at);
                var is_file = entry['is_file'];
                var item;
                var id = "profile_post_" + entry["_id"];

                if (is_file == "true" || is_file == true) {
                    item = "<li class = 'profile_post_item' id ='" + id + "' style = 'display:block'><h6>" +
                        entry.original_name + " </h6> <p>" + time + "</p> <p>" + entry.created_by + "</p><div class = 'profile_post_comments'></div></li>"
                } else {
                    item = "<li class = 'profile_post_item' id = '" + id + "' style = 'display:block'><h6>" +
                        entry.text + " </h6> <p>" + time + "</p> <p>" + entry.created_by + "</p></div><div class = 'profile_post_comments'></div></li>"
                }

                $("#user_post_wrapper").append(item);
                $("#" + id).data("profile_post", entry);
            });

        });
    }

    $scope.upload_image = function() {
        $(".file-upload").on('change', function() {
            $scope.readURL();
        });
        $(".file-upload").click();
    }

    $scope.readURL = function() {
        var img = $scope.imgFile;
        var uploadUrl = "/api/upload_img";
        fileUpload.uploadImageToUrl(img, uploadUrl);
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
            //update the latest read time
            var url = "/update_notification"
            $.post(url, {
                current_user: $rootScope.current_user
            }).done(function(data) {
                console.log(data);
                console.log("NOTIFICATION TIME UPDATED");
            });

        });
    };

    $scope.open_request_form = function() {
        $("#chatreq").toggleClass("active");
    }

    $scope.send_request = function() {

        var url = "/send_chat";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var sent_to = $rootScope.now_playing.created_by;
        var text = $("#chat_input").val();
        var sent_from = $rootScope.current_user;
        // alert($("#chatreq-type").val() + "   " + $("#chatreq-loc").val() + "    " + $("#chatreq-time").val());
        $http.post(url, {
            chat_type: "request",
            sent_from: sent_from,
            text: text,
            sent_to: sent_to,
            request_music_type: $("#chatreq-type").val(),
            request_location: $("#chatreq-loc").val(),
            request_time: $("#chatreq-time").val()

        }).success(function(data) {
            $("#chat_input").val("");
            $("#chatreq").removeClass("active");
            var type = data['request_music_type'];
            var time = (data['request_time']);
            var location = data['request_location'];
            alert(location);
            var dom = " <div class = 'chat_msg gig_request'> successfully send gig request to  " +
                sent_to + "    <div class = 'request_info'>  <p>requested song type : " + type + "</p>" +
                " <p>requested gig time : " + time + "</p>" +
                " <p>requested location : " + location + "</p></div>";

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
            var dom = " <div class = 'mychat_msg chat_msg'> " + text + "<span>at " + time + "</span></div> ";
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
        $("#register_musician").hide();
        $("#register_host").hide();
        $("#register_fan").hide();
        var user_type = $('.user-checkbox:checked').val()
        $(".register-checkbox.active").removeClass('active');
        if (user_type == 1) {
            $("#register_musician").show();
            $("#register-checkbox1").addClass('active');
        }
        if (user_type == 2) {
            $("#register_host").show();
            $("#register-checkbox2").addClass('active');
        }
        if (user_type == 3) {
            $("#register_fan").show();
            $("#register-checkbox3").addClass('active');
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
                alert("email-verification sent!")
                    // $rootScope.authenticated = false;
                    // // console.log(data);
                    // // $rootScope.current_user = data.user.username;
                    // // $rootScope.user_type = data.user.user_type;
                $location.path('/');
            } else {
                $scope.error_message = data.message;
            }
        });
    };
});
