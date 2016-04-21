var app = angular.module('myApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
	
	$rootScope.authenticated = false;
	$rootScope.current_user = '';

	//TODO: need to check user authentication (using session stored in mongodb) and keep logged in
	$http.get('/auth/session').success(function(data){
		if(data && data !== "undefined" && data['user']){
			$rootScope.authenticated = true;
			$rootScope.current_user = data['user']['username'];
		}
		
   	});
	
	$rootScope.signout = function(){
    	$http.get('auth/signout');
    	$rootScope.authenticated = false;
    	$rootScope.current_user = '';
	};
});

app.config(function($routeProvider){
	$routeProvider

		// .when('/', {
		// 	templateUrl: 'main.html',
		// 	controller: 'mainController'
		// })

		//the login display
		// .when('/input_song', {
		// 	templateUrl: 'input_song.html',
		// 	controller: 'authController'
		// })

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

		// .when('/profile', {
		// 	templateUrl: 'profile.html',
		// 	controller: 'authController'
		// });
});


app.factory('postService', function($resource){
	return $resource('/api/posts/:id');
});


app.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          var model = $parse(attrs.fileModel);
          var modelSetter = model.assign;
          
          element.bind('change', function(){
             scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
             });
          });
       }
    };
 }]);
      
 app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
       var fd = new FormData();
       fd.append('file', file);
       $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
       })
    
       .success(function(){
       })
    
       .error(function(){
       });
    }
 }]);
app.controller('searchController', function($scope, $rootScope, $http){
  $scope.search = function() {
    alert($scope.search_string);
    
  };
});
app.controller('mainController', function(postService, fileUpload,  $scope, $rootScope, $sce, $http){
	$scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};

	$scope.trustSrc = function(src) {
    	return $sce.trustAsResourceUrl(src);
  	}

	$scope.post = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};


	 $scope.upload = function(){
       var file = $scope.myFile;
       
       console.log('file is ' );
       console.dir(file);
       
       var uploadUrl = "/api/upload_file";
       fileUpload.uploadFileToUrl(file, uploadUrl);
       alert(uploadUrl);
    };
});


app.controller('authController', function($scope, $http, $rootScope, $location){
  $scope.user = {username: '', password: '', location: '', bandname: '' , genre : '', user_type : ''};
  $scope.error_message = '';

  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/profile');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  $scope.register = function(){
  	
  	if($('#register_musician_tab').hasClass("active")){
  		$scope.user.user_type = 'musician';
  	}else{
  		$scope.user.user_type = 'host';
  	}


    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');

      }	
      else{
        $scope.error_message = data.message;
      }
    });
  };
});
