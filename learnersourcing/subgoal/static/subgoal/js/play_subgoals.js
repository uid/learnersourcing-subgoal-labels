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

var temp_time = 0;
var subs = [];

// is subgoal_groups ordered? if not, it might result in not stopping at the right time.
//time_to_stop = step_times[Object.keys(subgoal_groups)[0]]

// By default, the first question will be asked after the first interval.
time_to_stop = Experiment.questionInterval;

function checkVideo() {
	var t = Math.floor(player.getCurrentTime());
	verticalTimeline(t);
	if (t==time_to_stop && t != 0 && t - temp_time > 1) {
		temp_time = t;
		if (Experiment.isQuestionRandom){
			if (Experiment.coinFlip()){
				console.log(t, "coin true, question asked");
				player.pauseVideo();
				askQuestion(t);
			} else {
				console.log(t, "coin false, question skipped");
				// do nothing for this interval
			}
		} else {
			console.log(t, "no coin, question asked");
			player.pauseVideo();
			askQuestion(t);			
		}
		// update the next stopping point
		time_to_stop = t + Experiment.questionInterval;
	} else if (player.getPlayerState()==0) {
		console.log(t, "video ended");
		temp_time = t;
		player.pauseVideo();
		askQuestion(t);
	} else {
		setTimeout(checkVideo, 1000);
	}
}

// function step_from_time(time) {
// 	for (step in step_times) {
// 		if (step_times[step]==time) {
// 			return step
// 		}
// 	}
// }

// function calculate_new_time(tts) {
// 	for (i=0; i<Object.keys(subgoal_groups).length-1; i++) {
// 		if (tts == step_times[Object.keys(subgoal_groups)[i]]) {
// 			new_tts = step_times[Object.keys(subgoal_groups)[i+1]]
// 		}
// 	}
// 	console.log(new_tts)
// 	return new_tts
// }

// display the current step indicator in the Wiki view
function verticalTimeline(t) {
	var num_steps = Object.keys(step_times).length;
	for (i = 1; i < num_steps; i++) {
		step = 'step'+i;
		if (t==step_times[step]) {
			$(".time_marker").css("color", "white")
			$($("#"+step).children()[0]).css("color", "red");
		}
	}
}


// given the current time and data collected, decide which question to display.
function routeStage(t) {
	stage = 1;
	// TODO: look at the number of subgoals collected so far, and decide dynamically.
	var floor = t - Experiment.questionInterval;
	var count = 0;
	for (var i in subgoals){
		console.log(subgoals[i], subgoals[i][1], t);
		if (floor <= subgoals[i][1] && subgoals[i][1] < t){
			count += 1;
		}
	}	
	if (count >= 3)
		stage = 2;
	return stage;
}


function displayStage1Question(t){
	var floor = t - Experiment.questionInterval;
	$(".frozen").css("color", "black");
	for (step in step_times) {
		if (floor <= step_times[step] && step_times[step] < t) {
			$("#"+step).css("color", "#59BDE8");
		}
	}
}


function displayStage2Question(t){
	var floor = t - Experiment.questionInterval;	
	$(".mult_choice_options").empty('');
	for (var i in subgoals){
		console.log(subgoals[i], subgoals[i][1], t);
		if (floor <= subgoals[i][1] && subgoals[i][1] < t){
			var subgoal_id = subgoals[i][0]["id"];
			var subgoal_text = subgoals[i][0]["label"];
			$(".mult_choice_options").append("<input type='radio' name='step1' class='q_choice' value='" + subgoal_id + "'><label>"+subgoal_text+"</label></input><br>")
		}
	}
	$(".mult_choice_options").append("<input type='radio' name='step1' value='new' class='q_choice q_new'>I have a better answer: <input type='text' class='q_input'></input><br><input type='radio' name='step1' value='none' class='q_none'><label>None apply</label></input><br>")
}


// Create the question
function askQuestion(t) {
	$("#player").hide();	
	routeStage(t);
	if (stage == 1){
		displayStage1Question(t);
		$('.dq_input').fadeIn(500);
	} else {
		displayStage2Question(t);
		$('.dq_input_2').fadeIn(500);
	}
	$('.dq_help').hide();
	$('.dq_instr').hide();
}


// Add the subgoal to the proper location in the Wiki view
function placeSubtitle(subtitle, time) {
	for (var i = 0; i < Object.keys(step_times).length - 1; i++) {
		if (time >= step_times[Object.keys(step_times)[i]] && time < step_times[Object.keys(step_times)[i+1]]) {
			console.log("MATCH", Object.keys(step_times)[i])
			$('#'+Object.keys(step_times)[i+1]).before($(subtitle))
		}
	}
}


// decide where the current subgoal should be placed in. should refer to the previous time that the question was asked.
function computePreviousTime(){
	var result = player.getCurrentTime() - Experiment.questionInterval;
	if (Experiment.isQuestionRandom){
		// TODO: when random is on, skip the skipped ones.
		// filter out the skipped timings.
	}
	return result;
}


function submitStage1Subgoal(){
	var inp_text = $('.q_input').val();
	var time = computePreviousTime();

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

function submitStage2Subgoal(){
	var time = computePreviousTime();
	var text = $('input[name=step1]:radio:checked + label').text();

	// compute upvote/downvote
	var votes = {};
	var answer = $('input[name=step1]:radio:checked').val();
	// add the selected valid subgoal as an upvote
	if (answer != "new" && answer != "none"){
		votes[answer] = "upvotes_s2";
	}
	// everything else should be downvoted
	for (var i in subgoals) {
		var subgoal_id = subgoals[i][0]["id"];
		if (!(subgoal_id in votes))
			votes[subgoal_id] = "downvotes_s2";
	}

	// for (sub in subs) {
	// 	var subgoal_id = $('.'+subs[sub]).parent().attr("data-subgoal-id");
	// 	if (!(subgoal_id in votes))
	// 		votes[subgoal_id] = "downvotes_s2";
	// }
	console.log(votes);

	// within this subgoal group, remove everything that does not match the selected item.
	// for (sub in subs) {
	// 	if ($('.'+subs[sub]).text() != text) {
	// 		// for now, whatever's the latest in the group will get the time assigned.
	// 		if (isInt(formatted_subgoals[subs[sub]]["time"]))
	// 			time = formatted_subgoals[subs[sub]]["time"];
	// 		$('.'+subs[sub]).parents()[0].remove()
	// 	} else {
	// 	}
	// }


	var inp_text ="";
	var $li;
	// when another label was inserted.
	if (typeof $('input[name=step1]:radio:checked + input').val() !== "undefined") {
		console.log('here', time)
		inp_text = $('input[name=step1]:radio:checked + input').val()
		$li = $("<li class='movable subgoal'><span contenteditable='true' class='sub'>" + inp_text + "</span>" + 
			"<button type='button' class='delButton permButton'>Delete</button>" + 
			"<button type='button' class='editButton permButton'>Edit</button>" + 
			"<button type='button' class='saveButton permButton'>Save</button></li>");
		$li.fadeIn(1000)
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
				learner_id: 1,
				is_vote: 1
			},
		}).done(function(data){
			console.log("success:", data["success"]);
			$li.attr("data-subgoal-id", data["subgoal_id"]);
			// TODO: do something for failure
		}).fail(function(){
			console.log("ajax failed");
		}).always(function(){
		});		
	} else if (answer != "new" && answer != "none"){
		for (var i in subgoals){
			if (answer == subgoals[i][0]["id"])
				inp_text = subgoals[i][0]["label"];
		}
		$li = $("<li class='movable subgoal'><span contenteditable='true' class='sub'>" + inp_text + "</span>" + 
			"<button type='button' class='delButton permButton'>Delete</button>" + 
			"<button type='button' class='editButton permButton'>Edit</button>" + 
			"<button type='button' class='saveButton permButton'>Save</button></li>");
		$li.fadeIn(1000)	
		placeSubtitle($li, time)		
	}

	// backend update
	$.ajax({
		type: "POST",
		url: "/subgoal/vote/",
		data: {
			csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
			stage: stage,
			video_id: video["id"], 
			votes: JSON.stringify(votes),
			// answer: $('input[name=step1]:radio:checked').val(),
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

function submitSubgoal() {
	$(".frozen").css("color", "black");

	if (stage == 1){
		submitStage1Subgoal();
	} else {
		submitStage2Subgoal();
	}
			
	player.playVideo();
	$('.dq_input').fadeOut(250);
	$('.dq_input_2').fadeOut(250);
	$('.dq_help').fadeIn(500);
	$("#player").show();
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
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_help').show();
	$("#player").show()
	// $('.dq_instr').hide();
	setTimeout(checkVideo, 1000);
});

$("body").on('click', '.cancelButton', function(e) {
	player.playVideo();
	$('.dq_input').hide();
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
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_help').hide();
});