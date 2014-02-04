// $.getJSON("test.js").success(function(data) {
//     alert(data.video_id);
// });

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    	width: '500',
    	height: '315',
    	videoId: youtube_id,
        enablejsapi: '1',
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
    checkVideo();
}

var stop_time = false;
function onPlayerStateChange(event) {
    setTimeout(checkVideo, 1000);
}

function stopVideo() {
	player.stopVideo();
}

function pauseVideo() {
	player.pauseVideo();
}

var temp = 0;
function checkVideo() {
	var t = Math.floor(player.getCurrentTime());
	// console.log(t)
	verticalTimeline(t)
	if (t%30==0 && t != 0 && t-temp>1) {
		player.pauseVideo();
		temp = t;
		askQuestion(t);
	} else if (player.getPlayerState()==0) {
		askQuestion();
	} else {
		setTimeout(checkVideo, 1000);
	}
}

function verticalTimeline(t) {
	num_steps = Object.keys(step_times).length
	for (i = 1; i < num_steps; i++) {
		step = 'step'+i
		if (t==step_times[step]) {
			$(".time_marker").css("color", "white")
			$($("#"+step).children()[0]).css("color", "red");
		}
	}
}

function askQuestion(t) {
	$("#player").hide()
	ceiling = t
	floor = t-30.0
	$(".frozen").css("color", "black")
	for (step in step_times) {
		if (step_times[step]<ceiling && step_times[step]>floor) {
			$("#"+step).css("color", "#59BDE8");
		}
	}
	$('.dq_input').fadeIn(500);
	$('.dq_help').hide();
	$('.dq_instr').hide();
}

function placeSubtitle(subtitle, time) {
	for (var i = 0; i < Object.keys(step_times).length - 1; i++) {
		if (time > step_times[Object.keys(step_times)[i]] && time < step_times[Object.keys(step_times)[i+1]]) {
			$('#'+Object.keys(step_times)[i+1]).before($(subtitle))
		}
	}
}

function submitSubgoal() {
	$(".frozen").css("color", "black")
	var inp_text = $('.q_input').val();
	time = player.getCurrentTime()-30;

	// frontend update
	var $li = $("<li class='movable subgoal'><span class='sub'>"+inp_text+"</span>" + 
		"<button type='button' class='delButton permButton'>Delete</button>" + 
		"<button type='button' class='editButton permButton'>Edit</button>" + 
		"<button type='button' class='saveButton permButton'>Save</button></li>");
	$li.fadeIn(1000)
	placeSubtitle($li, time)
	$('.q_input').val('');
	player.playVideo();
	$('.dq_input').hide();
	$("#player").show()
	$('.dq_help').show();
	setTimeout(checkVideo, 1000);

	// backend update
	$.ajax({
		type: "POST",
		url: "/subgoal/create/",
		data: {
			// to avoid 403 forbidden error in Django+Ajax POST calls
			// https://racingtadpole.com/blog/django-ajax-and-jquery/
			csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
			stage: stage,
			// note: this is Django object ID, not Youtube ID.
			video_id: video["id"], 
			time: time,
			label: inp_text,
			// hard-coded for now since there's no login
			// TODO: add the current user's info
			learner_id: 1
		},
	}).done(function(data){
		console.log("success:", data["success"]);
		$li.attr("data-subgoal-id", data["subgoal_id"]);
		// TODO: do something for failure
	}).fail(function(){
		console.log("ajax failed");
	}).always(function(){
	});	
}

$("body").on('keypress', '.q_input', function(e) {
	if (e.which == 13) {
		submitSubgoal();
	}
});	

$("body").on('click', '.submitButton', function(e) {
	submitSubgoal();
});

$("body").on('click', '.ppButton', function(e) {
	player.playVideo();
	$('.dq_input').hide();
	$('.dq_help').show();
	$("#player").show()
	// $('.dq_instr').hide();
	setTimeout(checkVideo, 1000);
});

$("body").on('click', '.frozen', function(e) {
	// $(this).siblings().css('font-weight', 'normal')
	// $(this).css('font-weight', 'bold')
	step = $(this).attr("id")
	time = step_times[step]

	$(".frozen").css("color", "black")
	$(".time_marker").css("color", "white")
	$($(this).children()[0]).css("color", "red")

	var t = Math.floor(player.getCurrentTime());
	verticalTimeline(t)

	player.seekTo(time)
});

$("body").on('click', 'span.sub', function(e) {
	// console.log(this)
	el = $($(this).parent()).next()
	// console.log(this)
	step = $(el).attr("id")
	time = step_times[step]
	player.seekTo(time)

	console.log("subgoal clicked")
});


$(document).ready(function() {
	$('.dq_input').hide();
	$('.dq_help').hide();
});

