// $.getJSON("test.js").success(function(data) {
//     alert(data.video_id);
// });

generate_steps(video_data.video_steps)
load_video_title(video["title"])
add_subgoals(video_data.subgoals)
pre_groups = group_subgoals(video_data.subgoals, video_data.video_steps)
subgoal_groups = pre_groups[0]
time_groups = pre_groups[1]


function group_subgoals(subgoals, steps) {
	group_times = {}
	temp_step = 'step0'
	prev_subgoals = new Array()
	rel_steps = new Array()
	for (step in steps) {
		cur_subgoals = new Array()
		for (sub in subgoals) {
			if (subgoals[sub]['steps'][0] == step) {
				cur_subgoals.push(sub)
				temp_step = step
			}
		}
		if (rel_steps.indexOf(temp_step) < 0) {
			rel_steps.push(temp_step)
			group_times[temp_step] = cur_subgoals
		}
	}
	rel_steps.push('end')

	actual_groups = {}
	for (i = 1; i < rel_steps.length; i++) {
		actual_groups[rel_steps[i]] = group_times[Object.keys(group_times)[i-1]]
	}

	console.log(actual_groups)
	return [actual_groups, group_times]
}

function generate_steps(steps) {
    for (step in steps) {
        new_step = "<li class='frozen' id='"+step+"'><span class='time_marker'>>></span>"+steps[step]+"</li>"
        $(".video_steps").append(new_step);
    }
}

function add_subgoals(subgoals) {
	for (sub in subgoals) {
		new_subgoal = "<li class='movable subgoal'><span contenteditable='true' class='sub "+sub+"'>"+
			subgoals[sub]['text'] + "</span>" + 
			"<button type='button' class='delButton permButton'>Delete</button>" +
			"<button type='button' class='editButton permButton'>Edit</button>" +
			"<button type='button' class='saveButton permButton'>Save</button>" +
			"</li>";
		first_step = subgoals[sub]['steps'][0]
		$("#"+first_step).before(new_subgoal)
		// console.log(subgoals[sub]['steps'][0])
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
var subs = [];
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
	for (sub in subs) {
		val = $('.'+subs[sub]).text()
		$(".mult_choice_options").append("<input type='radio' name='step1' class='q_choice'><label>"+val+"</label></input><br>")
	}
	$(".mult_choice_options").append("<input type='radio' name='step1' class='q_choice q_new'><input type='text' class='q_input'></input><br><input type='radio' name='step1' class='q_none'><label>None apply</label></input><br><input type='radio' name='step1' class='q_repeat'><label>This is a repeat</label></input><br>")
	$('.dq_input_2').fadeIn(500);
	$('.dq_help').hide();
	$('.dq_instr').hide();
}

function placeSubtitle(subtitle, time) {
	for (var i = 0; i < Object.keys(step_times).length - 1; i++) {
		if (time >= step_times[Object.keys(step_times)[i]] && time < step_times[Object.keys(step_times)[i+1]]) {
			$('#'+Object.keys(step_times)[i+1]).before($(subtitle))
		}
	}
}

function submitSubgoal() {
	$(".frozen").css("color", "black")
	text = $('input[name=step1]:radio:checked + label').text()
	sublist = $(".sub");
	for (sub in subs) {
		if ($('.'+subs[sub]).text() != text) {
			$('.'+subs[sub]).parents()[0].remove()
		} else {
		}
	}
	if (typeof $('input[name=step1]:radio:checked + input').val() !== "undefined") {
		console.log('here')
		inp_text = $('input[name=step1]:radio:checked + input').val()
		var $li = $("<li class='movable'><span contenteditable='true' class='sub'>"+inp_text+"</span><button type='button' class='delButton'>Delete</button><button type='button' class='editButton'>Edit</button><button type='button' class='saveButton'>Save</button></li>");
		$li.fadeIn(1000)
		placeSubtitle($li, window.stepTime-1)
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
	time = video_data.step_times[step]

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
	time = video_data.step_times[step]
	player.seekTo(time)

	console.log("subgoal clicked")
});


$(document).ready(function() {
	$('.dq_input_2').hide();
	$('.dq_help').hide();
});