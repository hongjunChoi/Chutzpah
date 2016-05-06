var app = angular.module('myApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {

    $rootScope.authenticated = false;
    $rootScope.current_user = '';
    $rootScope.now_playing = {};

    //TODO: need to check user authentication (using session stored in mongodb) and keep logged in
    $http.get('/auth/session').success(function(data) {
        if (data && data !== "undefined" && data['user']) {
            $rootScope.authenticated = true;
            $rootScope.current_user = data['user']['username'];
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
                var time = new Date().toString();
                time = time.split(":")[0] + ":" + time.split(":")[1];
                var dom = " <div class = 'chat_msg'> " + data.msg + "      by  " + data.from + "      at  " + time + "</div> ";
                $(".chatmain").append(dom);
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

            }).error(function() {

            });
        }
    }
]);


app.controller('searchController', function($scope, $rootScope, $http) {
    $scope.search_results = {};
    $scope.search = function() {
        $http.get('/api/search', {
            params: {
                search_string: $scope.search_string
            }
        }).success(function(data) {
            $scope.search_results = data;
        });
    };
});


app.factory('postService', function($resource) {
    return $resource('/api/posts/:id');
});


app.controller('mainController', function(postService, fileUpload, $scope, $rootScope, $sce, $http) {

    $scope.posts = [];
    $scope.files = [];

    var temp = postService.query();
    var files = [];
    var text_posts = [];

    temp.$promise.then(function(data) {
        for (var i = 0; i < data.length; i++) {

            var item = data[i];

            if (item["is_file"] == true || item["is_file"] == "true") {
                files.push(item);
            } else {
                text_posts.push(item);
            }
        }

        $scope.posts = text_posts;
        $scope.files = files;
    });



    $scope.newPost = {
        created_by: '',
        text: '',
        created_at: ''
    };
    $scope.user_posts = {};

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.post = function() {
        alert("post")
        $scope.newPost.created_by = $rootScope.current_user;
        $scope.newPost.created_at = Date.now();
        postService.save($scope.newPost, function() {
            $scope.posts = postService.query();
            $scope.newPost = {
                created_by: '',
                text: '',
                created_at: ''
            };
        });
    };

    $scope.get_now_playing = function() {
        alert($rootScope.now_playing)
    }

    $scope.upload = function() {
        alert("upload file");
        var file = $scope.myFile;

        console.log('file is ');
        console.dir(file);

        var uploadUrl = "/api/upload_file";
        fileUpload.uploadFileToUrl(file, uploadUrl);
        alert(uploadUrl);
    };

    $scope.upload_comment = function() {
        alert("comment")
        var url = "/api/comment";
        alert("uploading")

        $scope.comment.created_by = $rootScope.current_user;
        $scope.comment.post_id = $scope.post_id;
        $http.post(url, {
            comment: $scope.comment
        }).success(function(data) {
            if (data.state == 'success') {

            } else {
                $scope.error_message = data.message;
            }
        });
    };

    $scope.load_comments = function(id) {
        var url = "/api/comment";
        //TODO: NEED TO GET POST ID FOR QUERYING COMMENTS
        $scope.post_id = id;
        $http.get(url, {
            params: {
                post_id: id
            }
        }).success(function(data) {
            console.log(data);

            $("#commentmain").empty();
            data.forEach(function(c) {
                $("#commentmain").append("<li>" + c.created_by + " said: " + c.text + " at : " + c.created_at + "</li>")
            });
            $(".commentField").show();

            return data;
        });
    };

    $scope.start_music = function(post) {
        console.log("starting music")
        $("#jquery_jplayer_1").jPlayer("setMedia", {
            title: post.original_name,
            mp3: post.url.substring(post.url.indexOf("/") + 1)
        });

        $scope.post_id = post._id;
        data = $scope.load_comments(post._id);

        $rootScope.now_playing = post
        $scope.load_comments(post._id)
    }
});

function set_user_profile(info) {
    var username = info["username"];
    var location = info.user_location;
    var description = info.user_description;
    var genre = info.genre;
    $("#user_profile_username").html(username);
    $("#user_profile_location").html(location);
    $("#user_profile_description").html(description);
    $("#user_profile_genre").html(genre);
    $("#contact_to").html(username);
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
            set_user_profile(user_info[0]);
            var profile_posts = data["posts"];
            //TODO: SET USER INFORMATION IN LEFT PROFILE VIEW HERE 
            $scope.user_info = user_info;
            $scope.user_posts = profile_posts;
            $("body").addClass("profileopened");
            profile_posts.forEach(function(entry) {
                var item = "<li style = 'display:block'><h6>" + entry.text + " </h6> <p>" + entry.created_at + "</p> <p>" + entry.created_by + "</p></li>"
                $("#user_post_wrapper").append(item);
            });

        });
    }

    $scope.confirm_request = function(req) {
        console.log("confirming & posting request")
        var url = "/api/event"
        $http.post(url, {
            artist: "ARTIST",
            venue: "VENUE"
        }).success(function(data) {
            alert("success" + data)
        })
    }

    $scope.get_chat_from = function() {

    }

    $scope.get_chat = function() {
        $http.get('/get_chat', {
            params: {
                user_name: $rootScope.current_user
            }
        }).success(function(obj) {
            console.log("========== GET CHAT RESULTS ==============");


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
            console.log(chats);
            var keys = Object.keys(chats);
            $("#chat_list").empty();
            for (var i = 0; i < keys.length; i++) {
                var sent_from = keys[i];
                var new_chat_number = chats[sent_from]["count"];
                var id = "chat_" + sent_from;
                var item = "<li id = " + id + ">" + sent_from + "   <span id = 'new_chat_count'> " + new_chat_number + "</span> </li>"
                $("#chat_list").append(item);
                $("#" + id).data("chats", chats[sent_from]);
            }
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

        });
    };


    $scope.send_chat = function() {
        var url = "/send_chat";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var sent_to = $rootScope.now_playing.created_by;
        var text = $("#chat_input").val();
        var sent_from = $rootScope.current_user;


        $http.post(url, {

            sent_from: sent_from,
            text: text,
            sent_to: sent_to

        }).success(function(data) {
            $("#chat_input").val("");
        });
    }

});


function add_chat(info) {
    for (var i = 0; i < info.length; i++) {
        var item = info[i];
        var time = convert_time(item.sent_at);
        var dom = " <div class = 'chat_msg'> " + item.chat_text + "      by  " + item.sent_from + "      at  " + time + "</div> ";
        $(".chatmain").append(dom);
    }

}

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
                $location.path('/profile');
            } else {
                $scope.error_message = data.message;
            }
        });
    };

    $scope.register = function() {

        if ($('#register_musician_tab').hasClass("active")) {
            $scope.user.user_type = 'musician';
        } else {
            $scope.user.user_type = 'host';
        }

        $http.post('/auth/signup', $scope.user).success(function(data) {
            if (data.state == 'success') {
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            } else {
                $scope.error_message = data.message;
            }
        });
    };
});