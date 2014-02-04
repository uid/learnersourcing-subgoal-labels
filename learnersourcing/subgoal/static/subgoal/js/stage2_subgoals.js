// $.getJSON("test.js").success(function(data) {
//     alert(data.video_id);
// });

var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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

// var stop_time = false;
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
var subs = [];
// is subgoal_groups ordered? if not, it might result in not stopping at the right time.
time_to_stop = step_times[Object.keys(subgoal_groups)[0]]

function checkVideo() {
	var t = Math.floor(player.getCurrentTime());
	verticalTimeline(t)
	// console.log(time_to_stop)
	// console.log(t)
	if (t==time_to_stop && t != 0 && t-temp>1) {
		console.log('here')
		player.pauseVideo();
		temp = t;
		step = step_from_time(t)
		subs = subgoal_groups[step];
		window.stepTime = time_groups[step]
		console.log(subgoal_groups)
		console.log(step)
		askQuestion(subs)
		time_to_stop = calculate_new_time(time_to_stop)
	} else if (player.getPlayerState()==0) {
		player.pauseVideo();
		temp = t;
		subs = subgoal_groups['end'];
		window.stepTime = time_groups[step]
		askQuestion(subs)
	} else {
		setTimeout(checkVideo, 1000);
	}
}

function step_from_time(time) {
	for (step in step_times) {
		if (step_times[step]==time) {
			return step
		}
	}
}

function calculate_new_time(tts) {
	for (i=0; i<Object.keys(subgoal_groups).length-1; i++) {
		if (tts == step_times[Object.keys(subgoal_groups)[i]]) {
			new_tts = step_times[Object.keys(subgoal_groups)[i+1]]
		}
	}
	console.log(new_tts)
	return new_tts
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

function askQuestion(subs) {
	// console.log('here')
	$("#player").hide()
	$(".mult_choice_options").empty('')
	for (var sub in subs) {
		var val = $('.'+subs[sub]).text();
		var subgoal_id = $('.'+subs[sub]).parent().attr("data-subgoal-id");
		$(".mult_choice_options").append("<input type='radio' name='step1' class='q_choice' value='" + subgoal_id + "'><label>"+val+"</label></input><br>")
	}
	$(".mult_choice_options").append("<input type='radio' name='step1' value='new' class='q_choice q_new'>I have a better answer: <input type='text' class='q_input'></input><br><input type='radio' name='step1' value='none' class='q_none'><label>None apply</label></input><br><input type='radio' name='step1' value='repeat' class='q_repeat'><label>This is a repeat</label></input><br>")
	$('.dq_input_2').fadeIn(500);
	$('.dq_help').hide();
	$('.dq_instr').hide();
}

function placeSubtitle(subtitle, time) {
	for (var i = 0; i < Object.keys(step_times).length - 1; i++) {
		if (time >= step_times[Object.keys(step_times)[i]] && time < step_times[Object.keys(step_times)[i+1]]) {
			console.log("MATCH", Object.keys(step_times)[i])
			$('#'+Object.keys(step_times)[i+1]).before($(subtitle))
		}
	}
}

function submitSubgoal() {
	$(".frozen").css("color", "black")
	text = $('input[name=step1]:radio:checked + label').text()
	sublist = $(".sub");
	var time = 0;
	// within this subgoal group, remove everything that does not match the selected item.
	for (sub in subs) {
		if ($('.'+subs[sub]).text() != text) {
			// for now, whatever's the latest in the group will get the time assigned.
			if (isInt(formatted_subgoals[subs[sub]]["time"]))
				time = formatted_subgoals[subs[sub]]["time"];
			$('.'+subs[sub]).parents()[0].remove()
		} else {
		}
	}
	// when another label was inserted.
	if (typeof $('input[name=step1]:radio:checked + input').val() !== "undefined") {
		console.log('here', time)
		var inp_text = $('input[name=step1]:radio:checked + input').val()
		var $li = $("<li class='movable subgoal'><span contenteditable='true' class='sub'>" + inp_text + "</span>" + 
			"<button type='button' class='delButton'>Delete</button>" + 
			"<button type='button' class='editButton'>Edit</button>" + 
			"<button type='button' class='saveButton'>Save</button></li>");
		$li.fadeIn(1000)
		// OLD: possibly a bug
		// placeSubtitle($li, window.stepTime - 1)
		// NEW: follow time of a subgoal displayed as a choice
		placeSubtitle($li, time)

		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/create/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"], 
				time: time,
				label: inp_text,
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
	} else {
		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/vote/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"], 
				answer: $('input[name=step1]:radio:checked').val(),
				learner_id: 1
			},
		}).done(function(data){
			console.log("success:", data["success"]);
			// $li.attr("data-subgoal-id", data["subgoal_id"]);
			// TODO: do something for failure
		}).fail(function(){
			console.log("ajax failed");
		}).always(function(){
		});				
	}
	player.playVideo();
	$('.dq_input_2').fadeOut(250);
	$('.dq_help').fadeIn(500);
	$("#player").show()
	setTimeout(checkVideo, 1000);

}

$("body").on('keypress', '.q_input', function(e) {
	if (e.which == 13) {
		submitSubgoal();
	}
});

$("body").on('click', '.q_input', function(e) {
	$(".q_new").prop('checked', 'true')
});	

$("body").on('keypress', '.q_choice', function(e) {
	if (e.which == 13) {
		submitSubgoal();
	}
});	

$("body").on('click', '.submitButton', function(e) {
	submitSubgoal();
});

$("body").on('click', '.ppButton', function(e) {
	player.playVideo();
	$('.dq_input_2').hide();
	$('.dq_help').show();
	$("#player").show()
	// $('.dq_instr').hide();
	setTimeout(checkVideo, 1000);
});

$("body").on('click', '.cancelButton', function(e) {
	player.playVideo();
	$('.dq_input_2').hide();
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
	$('.dq_input_2').hide();
	$('.dq_help').hide();
});