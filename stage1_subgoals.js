// $.getJSON("test.js").success(function(data) {
//     alert(data.video_id);
// });

generate_steps(video_data.video_steps)
load_video_title(video_data.video_title)



function generate_steps(steps) {
    for (step in steps) {
        new_step = "<li class='frozen' id='"+step+"'>"+steps[step]+"</li>"
        $(".video_steps").append(new_step);
    }
}

function load_video_title(title) {
    $("#video_title").append(title)
}

step_times = video_data.step_times
video_id = video_data.video_id

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
    	videoId: video_id,
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

function askQuestion(t) {
	ceiling = t
	floor = t-30.0
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
	var $li = $("<li class='movable'><span class='sub'>"+inp_text+"</span><button type='button' class='delButton permButton'>Delete</button><button type='button' class='editButton permButton'>Edit</button><button type='button' class='saveButton permButton'>Save</button></li>");
	time = player.getCurrentTime()-30;
	$li.fadeIn(1000)
	placeSubtitle($li, time)
	$('.q_input').val('');
	player.playVideo();
	$('.dq_input').hide();
	$('.dq_help').show();
	setTimeout(checkVideo, 1000);
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
	// $('.dq_instr').hide();
	setTimeout(checkVideo, 1000);
});

$("body").on('click', '.frozen', function(e) {
	console.log($(this).attr("id"))
	step = $(this).attr("id")
	time = video_data.step_times[step]
	console.log(time)
	player.seekTo(time)
});

$("body").on('click', 'span.sub', function(e) {
	console.log(this)
	el = $($(this).parent()).next()
	// console.log(this)
	step = $(el).attr("id")
	time = video_data.step_times[step]
	player.seekTo(time)

	console.log("subgoal clicked")
});


$(document).ready(function() {
	$('.dq_input').hide();
	$('.dq_help').hide();
});