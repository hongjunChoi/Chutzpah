var app = angular.module('myApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {

    $rootScope.authenticated = false;
    $rootScope.current_user = '';

    //TODO: need to check user authentication (using session stored in mongodb) and keep logged in
    $http.get('/auth/session').success(function(data) {
        if (data && data !== "undefined" && data['user']) {
            $rootScope.authenticated = true;
            $rootScope.current_user = data['user']['username'];
        }
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
            console.log(item["is_file"]);
            if (item["is_file"] == true || item["is_file"] == "true") {
                files.push(item)
            } else {
                text_posts.push(item)
            }
        }
        $scope.posts = text_posts;
        $scope.files = files;
    });

    console.log($scope.posts);
    console.log($scope.files)


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


    $scope.upload = function() {
        var file = $scope.myFile;

        console.log('file is ');
        console.dir(file);

        var uploadUrl = "/api/upload_file";
        fileUpload.uploadFileToUrl(file, uploadUrl);
        alert(uploadUrl);
    };

    $scope.upload_comment = function() {
        var url = "/api/comment";
        $scope.comment.created_by = $rootScope.current_user;
        $scope.comment.post_id = 1;
        $http.post(url, {
            comment: $scope.comment
        }).success(function(data) {
            if (data.state == 'success') {

            } else {
                $scope.error_message = data.message;
            }
        });
    };

    $scope.load_comments = function() {
        var url = "/api/comment";
        //TODO: NEED TO GET POST ID FOR QUERYING COMMENTS
        $scope.post_id = 1;
        $http.get(url, {
            post_id: $scope.post_id
        }).success(function(data) {
            if (data.state == 'success') {

            } else {
                $scope.error_message = data.message;

            }
        });
    };

    $scope.start_music = function(post) {
        
        console.log("starting music")
        console.info(post.url.substring(post.url.indexOf("/")+1))
              $("#jquery_jplayer_1").jPlayer({
        ready: function () {
          $(this).jPlayer("setMedia", {
            title: "Bubble",
            m4a: post.url.substring(post.url.indexOf("/")+1)
          });
        },
        cssSelectorAncestor: "#jp_container_1",
        swfPath: "/js",
        supplied: "m4a, oga",
        useStateClassSkin: true,
        autoBlur: false,
        smoothPlayBar: true,
        keyEnabled: true,
        remainingDuration: true,
        toggleDuration: true
      });
    }

    $scope.get_profile_info = function() {

    }

});


app.controller('profileController', function($scope, $rootScope, $http) {
    $scope.user_posts = [];

    $scope.get_profile_info = function() {
        var url = "/api/profile";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var user_name = $rootScope.current_user;

        $http.get(url, {
            params: {
                username: user_name
            }
        }).success(function(data) {
            var user_info = data['info'];
            var profile_posts = data["posts"];
            //TODO: SET USER INFORMATION IN LEFT PROFILE VIEW HERE 
            $scope.user_posts = profile_posts;
            $("body").addClass("profileopened");
            console.log($scope.user_posts);
            profile_posts.forEach(function(entry) {
                $("#user_post_wrapper").append("<li>" + entry + "</li>");
            });

        });
    }


    $scope.get_chat = function() {
        $http.get('/get_chat', {
            params: {
                user_name: $rootScope.current_user
            }
        }).success(function(data) {
            alert("get chat success");
            console.log("get chat results")
            console.log(data);
        });
    };


    $scope.send_chat = function() {
        var url = "/send_chat";
        //NEED TO PROGRAMMICALLY OBTAIN USER ID USING DATA ATTRIBUTE
        var sent_to = "scottljy";
        alert("sent chat front end");
        $http.post(url, {
            sent_from: $rootScope.current_user,
            text: "abcd",
            sent_to: sent_to
        }).success(function(data) {
            alert("send chat success");
            console.log('send chat result ');
            console.log(data);

        });
    }

});



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