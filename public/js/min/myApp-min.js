function set_columns(e,t,s){$("#col1").text(e),$("#col2").text(t),$("#col3").text(s)}function set_user_profile(e,t){var s=e.username,o=e.user_location,i=e.user_description,n=e.genre;$("#user_profile_username").html(s),$("#user_profile_location").html(o),$("#user_profile_description").html(i),$("#user_profile_genre").html(n),$(".current_user_profile").html(s),s==t?($("#openchat").hide(),$(".img-button").show()):($("#openchat").show(),$(".img-button").hide())}function set_user_images(e){console.log("-------------------------"),"undefined"!=typeof e&&($("#userthumb").attr("src",e),$("#loginthumb").attr("src",e),$("#profile_image").attr("src",e))}function convert_time(e){var t=e.split("-")[0],s=e.split("-")[1],o=e.split("-")[2];o=o.split("T")[0];var e=e.split("T")[1],i=e.split(":")[0],n=e.split(":")[1],a=t+"/"+s+"/"+o+"     "+i+":"+n;return a}var app=angular.module("myApp",["ngRoute","ngResource"]).run(function(e,t){e.authenticated=!1,e.current_user="",e.now_playing={},e.search_string="",e.images_to_post=[],e.music_to_post="",t.get("/auth/session").success(function(t){t&&"undefined"!==t&&t.user&&(e.authenticated=!0,e.current_user=t.user.username,e.user_type=t.user.user_type,e.user=t.user,e.now_playing={created_by:e.current_user},set_user_images("/uploads/img/"+e.current_user)),$("#mainscreen").data("username",e.current_user);var s=io.connect(),o=$("#mainscreen").data("username");s.emit("join",{username:o}),s.on("new_msg",function(t){if($("body").hasClass("chatopened")&&e.now_playing.created_by==t.from){var s=new Date;s=s.toString(),s=s.split(":")[0]+":"+s.split(":")[1];var o=t.music_type,i=t.location,n=t.time,a=t.id;if("request"==t.type){var r=" <div id = '"+a+"'class = 'chat_msg gig_request'> "+t.msg+"      by  "+t.from+"      at  "+s+"<div class = 'request_info'>  <p>requested song type :"+o+"</p> <p>requested gig time :"+n+"</p> <p>requested location :"+i+"</p></div> <div class = 'confirm_button'> CONFIRM </div> ";$(".chatmain").append(r),$("#"+a).data("request_info",t)}else{var r=" <div id = '"+a+"'class = 'chat_msg'> "+t.msg+"      by  "+t.from+"      at  "+s+"</div> ";$(".chatmain").append(r)}$(".chatmain").scrollTop($(".chatmain")[0].scrollHeight)}else alert(t.msg+"  received from "+t.from)})}),e.signout=function(){t.get("auth/signout"),e.authenticated=!1,e.current_user=""}});app.config(function(e){e.when("/login",{templateUrl:"login.html",controller:"authController"}).when("/signup",{templateUrl:"register.html",controller:"authController"})}),app.directive("fileModel",["$parse",function(e){return{restrict:"A",link:function(t,s,o){var i=e(o.fileModel),n=i.assign;s.bind("change",function(){t.$apply(function(){n(t,s[0].files[0])})})}}}]),app.service("fileUpload",["$http","$rootScope",function(e,t){this.uploadFileToUrl=function(t,s,o){var i=new FormData;i.append("file",t),e.post(s,i,{transformRequest:angular.identity,headers:{"Content-Type":void 0}}).then(function n(e){o(e.data)},function a(e){console.log(e)})},this.uploadImageToUrl=function(s,o){var i=new FormData;i.append("file",s),e.post(o,i,{transformRequest:angular.identity,headers:{"Content-Type":void 0}}).then(function n(e){alert("dddd"),set_user_images("/uploads/img/"+t.user.username),t.user.image_url=e.data.img_url},function a(e){})}}]),app.factory("postService",function(e){return e("/api/posts/:id")}),app.controller("mainController",function(e,t,s,o,i){function n(){alert("adsfasdfafds"),$("#userthumb").click()}t.list_type=1;var a=[],r="/api/posts";i.get(r,{}).success(function(e){var t=[],o=[];e.forEach(function(e){e.post_info.created_at=convert_time(e.post_info.created_at),null!=e.post_info.music_url&&"undefined"!=typeof e.post_info.music_url?o.push(e):t.push(e)}),s.files=o,s.artist_posts=t,$("#artistlist").hide(),$("#requestlist").hide(),$("#eventlist").hide()}),t.upload_image=function(){$(".file-upload").on("change",function(){t.readURL()}),$(".file-upload").click()},t.readURL=function(){var s=t.imgFile,o="/api/upload_img";e.uploadImageToUrl(s,o)},t.add_image=function(){$(".img-upload").click()},t.add_image_to_holder=function(){input=$(".img-upload"),file=input[0].files[0];var t="/api/upload_file";e.uploadFileToUrl(file,t,function(e){console.log(e);var t=e.path.substring(e.path.indexOf("/")+1);s.images_to_post.push(t)})},t.add_music=function(){$(".music-upload").click()},t.add_music_to_holder=function(){input=$(".music-upload"),file=input[0].files[0];var t="/api/upload_file";e.uploadFileToUrl(file,t,function(e){e.path=e.path.substring(e.path.indexOf("/")+1),s.music_to_post=e,$("#music-holder").empty(),console.log(e),$("#music-holder").append("<button>"+e.originalname+"</button>")})},t.trustSrc=function(e){return o.trustAsResourceUrl(e)},t.post=function(){alert("asdfasdf"),$("body").removeClass("uploadopened");var e=$("#text_input_field").val();if(""==e)return void $("#text_input_field").attr("placeholder","Please Write Something To Post!");t.newPost={},t.newPost.created_by=s.current_user,t.newPost.user_type=s.user_type,t.newPost.created_at=Date.now(),t.newPost.images=s.images_to_post,t.newPost.music_url=s.music_to_post.path,t.newPost.music_name=s.music_to_post.originalname,t.newPost.text=$("#text_input_field").val(),console.log(t.newPost);var o="/api/posts";i.post(o,{newPost:t.newPost}).success(function(e){$("#text_input_field").val(""),$(".music-upload").val(""),$(".img-upload").val(""),$("#music-holder").empty(),s.images_to_post=[],s.music_to_post="",t.refresh_view()})},t.refresh_view=function(){t.clear_lists();var e=$(".cat-checkbox:checked").val();1==e&&(set_columns("Posts","Artist","Date"),$("#artist_postlist").show(),$("#filelist").show(),""==s.search_string&&t.load_artist_posts()),2==e&&($("#artistlist").show(),set_columns("Artist","genre","description"),""==s.search_string&&t.load_artists()),3==e&&(set_columns("Venue Name","Location","Music preference"),""==s.search_string&&t.load_gig_requests(),$("#requestlist").show()),4==e&&(set_columns("Venue","Artist","Date"),""==s.search_string&&(t.load_gigs(),console.log("=======EVENTS======"),console.log(s.events)),$("#eventlist").show())},t.show_likes=function(e,t){alert(JSON.stringify(t))},t.like=function(e,t){var o="/api/like";i.post(o,{post_id:t._id,created_by:s.current_user}).success(function(t){if("like already exists"!=t){var s=$(e.target).closest(".post_like"),o=s.find(".like_count");console.log(s),console.log(o),console.log("===");var i=parseInt(o.html());o.html(i+1)}})},t.search=function(){return s.search_string=t.search_string,console.log("searching: "+t.search_string),""==t.search_string?void t.refresh_view():void i.get("/api/search",{params:{search_string:t.search_string}}).success(function(e){console.log("========= search data ======"),console.log(JSON.stringify(e));for(var t=[],o=e.artist_posts,i=0;i<o.length;i++){var n=o[i].created_at;o[i].created_at=convert_time(n);var a={post_info:o[i]};t.push(a)}s.artist_posts=t;for(var r=[],i=0;i<e.files.length;i++){e.files[i].created_at=convert_time(e.files[i].created_at);var a={post_info:e.files[i]};r.push(a)}s.files=r,s.artists=e.artists;for(var i=0;i<e.requests.length;i++)e.requests[i].created_at=convert_time(e.requests[i].created_at);s.requests=e.requests;for(var i=0;i<e.events.length;i++)e.events[i].time=convert_time(e.events[i].time);s.events=e.events})},t.open_profile=function(e){},t.show_event=function(e){},t.load_post_comments=function(e,o){s.now_playing.created_by=o.created_by;var n="/api/comment",a=o._id;t.post_id=a;var r=$(e.target).closest(".post-item");r.toggleClass("detailopened");var c=r.find(".commentField"),l=r.find(".commentmain");i.get(n,{params:{post_id:a}}).success(function(e){console.log("========  LOAD POST COMMENT ========"),console.log(e),$("#commentmain").empty(),l.empty(),e.forEach(function(e){l.append("<li>"+e.created_by+" said: "+e.text+" at : "+convert_time(e.created_at)+"</li>")}),c.show()})},t.clear_lists=function(){$("#artist_postlist").hide(),$("#filelist").hide(),$("#artistlist").hide(),$("#requestlist").hide(),$("#eventlist").hide()},t.get_now_playing=function(){var e=s.now_playing;"_id"in e?"block"==$("#now_playing_info_wrapper").css("display")?$("#now_playing_info_wrapper").hide():($("#upload_wrapper").hide(),$("#trending_wrapper").hide(),$("#saved_wrapper").hide(),$("#chat_list").hide(),t.set_now_playing_info(e),$("#now_playing_info_wrapper").show()):(alert("please choose music beforehand!"),$("#now_playing_info_wrapper").hide())},t.upload=function(){$("#now_playing_info_wrapper").hide(),$("#trending_wrapper").hide(),$("#saved_wrapper").hide(),$("#chat_list").hide(),$("#uploadwrapper").show();var s=t.myFile;if("undefined"==typeof s)return void $("#file_upload_form").val("");var o="/api/upload_file";e.uploadFileToUrl(s,o,function(e){t.refresh_view()})},t.upload_comment=function(e,t){var o=t._id;console.log("loading comment to post : id : ",o);var n="/api/comment",a=$(e.target).closest(".commentField"),r=a.find(".comment_input").val();i.post(n,{comment:{created_by:s.current_user,post_id:o,text:r}}).success(function(e){console.log(e),console.log("====="),$(".comment_input").val("")})},t.load_artist_posts=function(){var e=[],t="/api/posts";i.get(t,{params:{user_type:"artist"}}).success(function(t){t.forEach(function(t){t.post_info.created_at=convert_time(t.post_info.created_at),e.push(t)}),console.log("!!!!!!!   LOAD ARTIST POST !!!!!!"),console.log(e),s.artist_posts=e})},t.load_artists=function(){var e="/api/artists";i.get(e,{}).success(function(e){s.artists=e})},t.load_gig_requests=function(){var e="/api/gig_requests";i.get(e,{}).success(function(e){s.requests=e})},t.load_gigs=function(){var e="/api/events";i.get(e,{}).success(function(e){for(var t=0;t<e.length;t++)e[t].time=convert_time(e[t].time);s.events=e})},t.load_comments=function(e,s){var o=e._id,n="/api/comment";t.post_id=o,i.get(n,{params:{post_id:o}}).success(function(e){s.empty(),e.forEach(function(e){console.log(e),s.append("<li>"+e.created_by+" said: "+e.text+" at : "+convert_time(e.created_at)+"</li>")});var t=s.closest(".commentField");return t.show(),s.closest(".postdetail").show(),e})},t.open_profile=function(){var e="/api/profile",o=s.now_playing.created_by;i.get(e,{params:{username:o}}).success(function(e){var o=e.info;set_user_profile(o[0],s.current_user);var i=e.posts;t.user_info=o,t.user_posts=i,$("#user_post_wrapper").empty(),i.forEach(function(e){var t=convert_time(e.created_at),s=e.is_file,o,i="profile_post_"+e._id;o="true"==s||1==s?"<li class = 'profile_post_item' id ='"+i+"' style = 'display:block'><h6>"+e.original_name+" </h6> <p>"+t+"</p> <p>"+e.created_by+"</p><div class = 'profile_post_comments'></div></li>":"<li class = 'profile_post_item' id = '"+i+"' style = 'display:block'><h6>"+e.text+" </h6> <p>"+t+"</p> <p>"+e.created_by+"</p></div><div class = 'profile_post_comments'></div></li>",$("#user_post_wrapper").append(o),$("#"+i).data("profile_post",e)}),$("body").addClass("profileopened")})},t.show_artist=function(e){s.now_playing={created_by:e.username},t.open_profile()},t.show_venue=function(e){s.now_playing={created_by:e.username},t.open_profile()},t.show_request=function(e){},t.show_event=function(e){},t.start_music=function(e,o){console.log("starting music"),$("body").removeClass("menuopened"),$("body").removeClass("profileopened"),$("body").removeClass("searchopened"),$("body").removeClass("chatopened");var i="/update_notification";$.post(i,{current_user:s.current_user}).done(function(e){console.log(e),console.log("NOTIFICATION TIME UPDATED")}),$("#jquery_jplayer_1").jPlayer("setMedia",{title:o.music_name,mp3:o.music_url});var n=$(e.target).closest(".music_post_list"),a=n.find(".postdetail-wrapper");a.css("display","block");var r=n.find(".commentmain");t.post_id=o._id,t.load_comments(o,r),s.now_playing=o,$("body").addClass("menuopened"),$("#now_playing_info_wrapper").hide(),t.get_now_playing()},t.set_now_playing_info=function(e){$("#now_playing_song_title").html(e.music_name),$("#now_playing_song_artist").html(e.created_by),$("#now_playing_song_date").html(e.created_at);var t="/api/user",s=e.created_by;console.log("-------setnow"),i.get(t,{params:{username:s}}).success(function(e){e.length>0&&set_user_images(e[0].img_url)})}}),app.controller("profileController",function(e,t,s,o){function i(e){$(".chatmain").empty();for(var t=0;t<e.length;t++){var o=e[t],i=convert_time(o.sent_at),n=o.request_music_type,a=o.request_location,r=o.request_time,c=o._id;if("request"==o.chat_type){var l="";l=o.sent_from==s.current_user?" <div class = 'chat_msg gig_request'> successfully send gig request to  "+o.sent_to+"    <div class = 'request_info'>  <p>requested song type :"+n+"</p> <p>requested gig time :"+r+"</p> <p>requested location :"+a+"</p></div>":" <div id = '"+c+"'  class = 'chat_msg gig_request'> "+o.chat_text+"      by  "+o.sent_from+"      at  "+i+"<div class = 'request_info'>  <p>requested song type :"+n+"</p> <p>requested gig time :"+r+"</p> <p>requested location :"+a+"</p></div> <div class = 'confirm_button'> CONFIRM </div> ",$(".chatmain").append(l),$("#"+c).data("request_info",o)}else{var l=" <div id = '"+c+"'class = 'chat_msg'> "+o.chat_text+"      by  "+o.sent_from+"      at  "+i+"</div> ";$(".chatmain").append(l)}}}t.user_posts=[],t.user_info={},t.get_profile_info=function(){var e="/api/profile",i=s.now_playing.created_by;o.get(e,{params:{username:i}}).success(function(e){var o=e.info;set_user_profile(o[0],s.current_user);var i=e.posts;t.user_info=o,t.user_posts=i,$("#user_post_wrapper").empty(),$("body").addClass("profileopened"),i.forEach(function(e){var t=convert_time(e.created_at),s=e.is_file,o,i="profile_post_"+e._id;o="true"==s||1==s?"<li class = 'profile_post_item' id ='"+i+"' style = 'display:block'><h6>"+e.original_name+" </h6> <p>"+t+"</p> <p>"+e.created_by+"</p><div class = 'profile_post_comments'></div></li>":"<li class = 'profile_post_item' id = '"+i+"' style = 'display:block'><h6>"+e.text+" </h6> <p>"+t+"</p> <p>"+e.created_by+"</p></div><div class = 'profile_post_comments'></div></li>",$("#user_post_wrapper").append(o),$("#"+i).data("profile_post",e)})})},t.upload_image=function(){$(".file-upload").on("change",function(){t.readURL()}),$(".file-upload").click()},t.readURL=function(){var s=t.imgFile,o="/api/upload_img";e.uploadImageToUrl(s,o)},t.get_chat=function(){$("#now_playing_info_wrapper").hide(),$("#trending_wrapper").hide(),$("#saved_wrapper").hide(),"block"==$("#chat_list").css("display")?$("#chat_list").hide():$("#chat_list").show(),o.get("/get_chat",{params:{user_name:s.current_user}}).success(function(e){for(var t=e.newchat,s=e.oldchat,o={},i=0;i<t.length;i++){var n=t[i],a=n.sent_from;if(a in o)o[a].chats.push(n);else{var r=[];r.push(n),o[a]={chats:r,count:0}}}for(var i=0;i<s.length;i++){var n=s[i],a=n.sent_from;if(a in o)o[a].chats.push(n),o[a].count=o[a].count+1;else{var r=[];r.push(n),o[a]={chats:r,count:1}}}console.log("====== this data is saved as data attribute on notification chats for toggle ======"),console.log(o);var c=0,l=Object.keys(o);$("#chat_list").empty();for(var i=0;i<l.length;i++){var u=l[i],p=o[u].count;c+=p;var _="chat_"+u,n="<li class = 'chat_list_item' id = "+_+">"+u+"   <span id = 'new_chat_count'> "+p+"</span> </li>";$("#chat_list").append(n),$("#"+_).data("chats",o[u])}$("#new_message_num").html(c)})},t.get_chat_from=function(){o.get("api/get_chat_from",{params:{sent_from:s.now_playing.created_by,sent_to:s.current_user}}).success(function(e){i(e),$("body").addClass("chatopened"),$(".chatmain").scrollTop($(".chatmain")[0].scrollHeight);var t="/update_notification";$.post(t,{current_user:s.current_user}).done(function(e){console.log(e),console.log("NOTIFICATION TIME UPDATED")})})},t.send_request=function(){$("#chatreq").addClass("active");var e="/send_chat",t=s.now_playing.created_by,i=$("#chat_input").val(),n=s.current_user;o.post(e,{chat_type:"request",sent_from:n,text:i,sent_to:t,request_music_type:"sample genre",request_location:"providence mall",request_time:Date.now()}).success(function(e){$("#chat_input").val("");var s=e.request_music_type,o=convert_time(e.request_time),i=e.request_location,n=" <div class = 'chat_msg gig_request'> successfully send gig request to  "+t+"    <div class = 'request_info'>  <p>requested song type :"+s+"</p> <p>requested gig time :"+o+"</p> <p>requested location :"+location+"</p></div>";$(".chatmain").append(n),$(".chatmain").scrollTop($(".chatmain")[0].scrollHeight)})},t.send_chat=function(){var e="/send_chat",t=s.now_playing.created_by,i=$("#chat_input").val(),n=s.current_user;o.post(e,{chat_type:"msg",sent_from:n,text:i,sent_to:t}).success(function(e){var t=e.sent_at;t=convert_time(t),$("#chat_input").val("");var s=" <div class = 'mychat_msg chat_msg'> "+i+"      at  "+t+"</div> ";$(".chatmain").append(s),$(".chatmain").scrollTop($(".chatmain")[0].scrollHeight)})}}),app.controller("authController",function(e,t,s,o){e.user={username:"",password:"",location:"",bandname:"",genre:"",user_type:""},e.error_message="",e.login=function(){t.post("/auth/login",e.user).success(function(t){"success"==t.state?(s.authenticated=!0,s.current_user=t.user.username,s.user_type=t.user.user_type,o.path("/profile")):e.error_message=t.message})},e.change_user_type=function(){$("#register_musician").hide(),$("#register_host").hide(),$("#register_fan").hide();var e=$(".user-checkbox:checked").val();$(".register-checkbox.active").removeClass("active"),1==e&&($("#register_musician").show(),$("#register-checkbox1").addClass("active")),2==e&&($("#register_host").show(),$("#register-checkbox2").addClass("active")),3==e&&($("#register_fan").show(),$("#register-checkbox3").addClass("active"))},e.register=function(){var s=$(".user-checkbox:checked").val();1==s&&(e.user.user_type="artist"),2==s&&(e.user.user_type="venue"),3==s&&(e.user.user_type="fan"),t.post("/auth/signup",e.user).success(function(t){"success"==t.state?(alert("email-verification sent!"),o.path("/")):e.error_message=t.message})}});