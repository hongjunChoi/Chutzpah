var app=angular.module("myApp",["ngRoute","ngResource"]).run(function(e,t){e.authenticated=!1,e.current_user="",t.get("/auth/session").success(function(t){t&&"undefined"!==t&&t.user&&(e.authenticated=!0,e.current_user=t.user.username)}),e.signout=function(){t.get("auth/signout"),e.authenticated=!1,e.current_user=""}});app.config(function(e){e.when("/login",{templateUrl:"login.html",controller:"authController"}).when("/signup",{templateUrl:"register.html",controller:"authController"}).when("/profile",{templateUrl:"profile.html",controller:"authController"})}),app.factory("postService",function(e){return e("/api/posts/:id")}),app.controller("mainController",function(e,t,r,s){t.posts=e.query(),t.newPost={created_by:"",text:"",created_at:""},t.trustSrc=function(e){return s.trustAsResourceUrl(e)},t.post=function(){t.newPost.created_by=r.current_user,t.newPost.created_at=Date.now(),e.save(t.newPost,function(){t.posts=e.query(),t.newPost={created_by:"",text:"",created_at:""}})}}),app.controller("authController",function(e,t,r,s){e.user={username:"",password:"",location:"",bandname:"",genre:"",user_type:""},e.error_message="",e.login=function(){t.post("/auth/login",e.user).success(function(t){"success"==t.state?(r.authenticated=!0,r.current_user=t.user.username,s.path("/profile")):e.error_message=t.message})},e.register=function(){$("#register_musician_tab").hasClass("active")?e.user.user_type="musician":e.user.user_type="host",t.post("/auth/signup",e.user).success(function(t){"success"==t.state?(r.authenticated=!0,r.current_user=t.user.username,s.path("/")):e.error_message=t.message})}});