// $.getJSON("test.js").success(function(data) {
//     alert(data.video_id);
// });

generate_steps(video_data.video_steps)
load_video_title(video_data.video_title)
add_subgoals(video_data.subgoals)
subgoals = video_data.subgoals
pre_groups = group_subgoals(video_data.subgoals, video_data.video_steps)
subgoal_groups = pre_groups[0]
time_groups = pre_groups[1]
rel_steps = pre_groups[2]


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

	// console.log(actual_groups)
	// console.log(group_times)
	return [actual_groups, group_times, rel_steps]
}

function generate_steps(steps) {
    for (step in steps) {
        new_step = "<li class='frozen' id='"+step+"'><span class='time_marker'>>></span><span class='step_text'>"+steps[step]+"</span></li>"
        $(".video_steps").append(new_step);
    }
}

function add_subgoals(subgoals) {
	for (sub in subgoals) {
		new_subgoal = "<li class='movable'><span contenteditable='true' class='sub "+sub+"'>"+subgoals[sub]['text']+"</span><button type='button' class='editButton'>Edit</button><button type='button' class='saveButton'>Save</button><button type='button' class='delButton'>Delete</button></li>"
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
var subs = [];
time_to_stop = step_times[Object.keys(subgoal_groups)[0]]

function checkVideo() {
	var t = Math.floor(player.getCurrentTime());
	verticalTimeline(t)
	// console.log(time_to_stop)
	// console.log(t)
	if (t==time_to_stop && t != 0 && t-temp>1) {
		player.pauseVideo();
		temp = t;
		step = step_from_time(t)
		// console.log(step)
		// console.log('step index '+Object.keys(group_times).indexOf(step))
		step_index = Object.keys(group_times).indexOf(step)
		// console.log(rel_steps[step_index-1])
		sub = subgoal_groups[step][0];
		steps = subgoals[sub]['steps']
		window.stepTime = step_times[rel_steps[step_index-1]]
		window.cursub = sub
		// console.log(subgoal_groups)
		// console.log(step)
		askThirdQuestion(steps, sub)
		time_to_stop = calculate_new_time(time_to_stop)
	} else if (player.getPlayerState()==0) {
		console.log("here at the end?")
		player.pauseVideo();
		temp = t;
		sub = subgoal_groups['end'][0];
		steps = subgoals[sub]['steps']
		step_index = Object.keys(group_times).length
		console.log(step_index)
		console.log('time? '+step_times[rel_steps[step_index-1]])
		window.stepTime = step_times[rel_steps[step_index-1]]
		window.cursub = sub
		askThirdQuestion(steps, sub)
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
	// console.log(new_tts)
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

function askThirdQuestion(steps, sub) {
	// console.log(steps)
	$("#player").hide()
	$(".mult_choice_options").empty('')
	$(".sub_label").empty('')
	$(".steps_list").empty('')
	
	$(".steps_list").append("<p class='step_label'>Steps:</p>")
	for (step in steps) {
		val = $($('#'+steps[step]).children()[1]).text()
		subval = $('.'+sub).text()
		// console.log(val)
		$(".steps_list").append("<p class='ind_step'>"+val+"</p><br>");
	}
	$(".sub_label").append("Subhead: "+subval)

	$(".mult_choice_options").append("<input type='radio' name='step1' class='q_input_3'><label>This section title applies</label></input><br>")
	
	$(".mult_choice_options").append("<input type='radio' name='step1' class='q_choice q_new'><label>Replace: </label><input type='text' class='q_input_3 q_text_inp'></input><br><input type='radio' name='step1' class='q_input_3'><label>There should be nothing here</label></input><br>")
	$('.dq_input_3').fadeIn(500);
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

	// console.log(text)

	if (text == "Replace: ") {
		$($("."+window.cursub).parent()).remove()
		inp_text = $('.q_text_inp').val()
		console.log(inp_text)
		console.log("submitting")
		var $li = $("<li class='movable'><span contenteditable='true' class='sub'>"+inp_text+"</span><button type='button' class='delButton'>Delete</button><button type='button' class='editButton'>Edit</button><button type='button' class='saveButton'>Save</button></li>");
		placeSubtitle($li, window.stepTime-1)
	} else if (text == "This section title applies") {

	} else if (text == "There should be nothing here") {
		// console.log('no_subheading')
		// console.log(window.cursub)
		$($("."+window.cursub).parent()).remove()
	} else {

	}
	player.playVideo();
	$('.dq_input_3').fadeOut(250);
	$('.dq_help').fadeIn(500);
	$("#player").show()
	setTimeout(checkVideo, 1000);
}

$("body").on('keypress', '.q_input_3', function(e) {
	if (e.which == 13) {
		submitSubgoal();
	}
});

$("body").on('click', '.q_text_inp', function(e) {
	// console.log('q_text_inp')
	$(".q_new").prop('checked', 'true')
});	

// $("body").on('click', '.q_input_3', function(e) {
// 	console.log('q_input_3')
// 	$(".q_new").prop('checked', 'true')
// });	

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
	$('.dq_input_3').hide();
	$('.dq_help').show();
	$("#player").show()
	// $('.dq_instr').hide();
	setTimeout(checkVideo, 1000);
});

$("body").on('click', '.cancelButton', function(e) {
	player.playVideo();
	$('.dq_input_3').hide();
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

	// console.log("subgoal clicked")
});


$(document).ready(function() {
	$('.dq_input_3').hide();
	$('.dq_help').hide();
});