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
    	width: '750',
    	height: '473',
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
    // setTimeout(checkVideo, 1000);
}

function stopVideo() {
	console.log("stopped");
	player.stopVideo();
}

function pauseVideo() {
	console.log("paused");
	player.pauseVideo();
}

function resumeVideo(){
	$(".frozen").css("color", "black");
	player.seekTo(player.getCurrentTime()-1);
	player.playVideo();
}

var temp_time = 0;
var subs = [];

// is subgoal_groups ordered? if not, it might result in not stopping at the right time.
//time_to_stop = step_times[Object.keys(subgoal_groups)[0]]

// By default, the first question will be asked after the first interval.
time_to_stop = Experiment.questionInterval;

function checkVideo() {
	var t = Math.floor(player.getCurrentTime());
	// console.log("video checked at", t);
	var isAsked = false;
	verticalTimeline(t);
	// if (t==time_to_stop && t != 0 && t - temp_time > 1) {
	// skip if the question has already been asked in this time
	// this happens when the learner re-watches some parts
	if (t==time_to_stop && t != 0 && !(Experiment.isRecordedAt(t))) {
		// temp_time = t;
		routeStage(t);
		if (Experiment.isQuestionRandom){
			if (Experiment.coinFlip()){
				console.log(t, "coin true, question asked");
				player.pauseVideo();
				askQuestion(t);
				isAsked = true;
			} else {
				console.log(t, "coin false, question skipped");
				isAsked = false;
				// do nothing for this interval
			}
		} else {
			console.log(t, "no coin, question asked");
			player.pauseVideo();
			askQuestion(t);		
			isAsked = true;	
		}
		// update the next stopping point
		time_to_stop = t + Experiment.questionInterval;
		// update the question history
		Experiment.recordQuestion({"time": t, "isAsked": isAsked, "stage": Experiment.questionStage});
	} else if (player.getPlayerState()==0 && !(Experiment.isRecordedAt(t))) {
		// always ask when the video ends.
		// TODO: fix the problem of very short question interval if the (video length % interval) is short.
		console.log(t, "video ended");
		// temp_time = t;
		routeStage(t);
		player.pauseVideo();
		
		// ask the question only when it has been some time after the last asking
		if (t - Experiment.getLastRecordingTime() > Experiment.questionInterval / 2){
			askQuestion(t);
			isAsked = true;
			Experiment.recordQuestion({"time": t, "isAsked": isAsked, "stage": Experiment.questionStage});			
		}
	} else {
		// update every time, because users might be skipping. 
		// retrieve the next possible interval.
		time_to_stop = t + Experiment.questionInterval - (t % Experiment.questionInterval);
	}
	// keep looping
	setTimeout(checkVideo, 1000);
}


// display the current step indicator in the Wiki view
function verticalTimeline(t) {
	var numSteps = Object.keys(step_times).length;
	var matchingStep = "";
	for (i = 1; i < numSteps; i++) {
		var curStep = 'step' + i;
		var nextStep = 'step' + (i+1);
		// if (t==step_times[step]) {
		// instead of equality check, it should be a range check.
		// last step doesn't have nextStep
		if (i == numSteps - 1){
			if (step_times[curStep] <= t){
				matchingStep = curStep;
				break;
			}
		} else {
			if (step_times[curStep] <= t && t < step_times[nextStep]){
				matchingStep = curStep;
				break;
			}
		}
	}

	// always reset to show nothing "before" the first step begins.
	$(".time_marker").css("color", "white");
	if (matchingStep != ""){
		$($("#" + curStep).children()[0]).css("color", "red");
	}
}


// given the current time and data collected, decide which question to display.
function routeStage(t) {
	Experiment.questionStage = 1;
	var subgoalGroup = Subgoal.getCurrentGroup(t);
	console.log(subgoalGroup)
	// simple routing heuristic: see if the current group has 3 or more
	if (subgoalGroup.length >= 3)
		Experiment.questionStage = 2;
}


function displayStage1Question(t){
	var floor = computePreviousTime(t);
	$(".frozen").css("color", "black");
	// $(".frozen").toggleClass("blue");
	for (step in step_times) {
		if (floor <= step_times[step] && step_times[step] < t) {
			$("#"+step).css("color", "#59BDE8");
			// $("#"+step).toggleClass("blue");
		}
	}
}


function displayStage2Question(t){
	var subgoalTestGroup = Subgoal.getCurrentGroup(t);
	console.log(subgoalTestGroup)
	var numSubgoals = subgoalTestGroup.length
	console.log(numSubgoals)

	var floor = computePreviousTime(t);	
	$(".mult_choice_options").empty('');

	if (numSubgoals <= 5) {
		for (var i in Subgoal.data){
			
			//Threshold for displaying subgoal in stage 2-- set to 3 but could change
			// (If subgoal has < 4 downvotes, then display it)
			// if (floor <= Subgoal.data[i]["time"] && Subgoal.data[i]["time"] < t && Subgoal.data[i].downvotes_s2 < 4){
			if (floor <= Subgoal.data[i]["time"] && Subgoal.data[i]["time"] < t){
				var subgoal_id = Subgoal.data[i]["id"];
				var subgoal_text = Subgoal.data[i]["label"];
				$(".mult_choice_options").append("<label><input type='radio' name='step1' class='q_choice' value='" + subgoal_id + "'>"+ escapeHTML(subgoal_text)+"</input></label><br>")
			}
		}
	} else {
		for (var i in Subgoal.data){
			
			//Threshold for displaying subgoal in stage 2-- set to 3 but could change
			// (If subgoal has < 4 downvotes, then display it)
			// if (floor <= Subgoal.data[i]["time"] && Subgoal.data[i]["time"] < t && Subgoal.data[i].downvotes_s2 < 4){
			if (floor <= Subgoal.data[i]["time"] && Subgoal.data[i]["time"] < t){
				var subgoal_id = Subgoal.data[i]["id"];
				var subgoal_text = Subgoal.data[i]["label"];
				$(".mult_choice_options").append("<label><input type='radio' name='step1' class='q_choice' value='" + subgoal_id + "'>"+ escapeHTML(subgoal_text)+"</input></label><br>")
			}
		}
	}
	$(".mult_choice_options").append("<br><label class='new_subgoal_option'><input type='radio' name='step1' value='new' class='q_choice q_new'>I have a better answer: <input type='text' class='q_input' id='new_answer'></input></label><br>")
	// $(".mult_choice_options").append("<br><label class='new_subgoal_option'><input type='radio' name='step1' value='new' class='q_choice q_new'>I have a better answer: <input type='text' class='q_input' id='new_answer'></input></label><br><label class='none_apply_option'><input type='radio' name='step1' value='none' class='q_none'>None apply</input></label><br>")
}


// Create the question
function askQuestion(t) {
	$("#player").hide();	
	if (Experiment.questionStage == 1){
		displayStage1Question(t);
		// $('.dq_input').fadeIn(500);
		$('.dq_input').show();
	} else {
		displayStage2Question(t);
		// $('.dq_input_2').fadeIn(500);
		$('.dq_input_2').show();
	}
	$(".submitbutton").attr('disabled','disabled')
	$('.dq_help').hide();
	$('.dq_instr').hide();
}


// Add the subgoal to the proper location in the Wiki view
function placeSubtitle(subtitle, time) {
	for (var i = 0; i < Object.keys(step_times).length; i++) {
		if (i == Object.keys(step_times).length - 1){
			if (time >= step_times[Object.keys(step_times)[i]])
				$('#'+Object.keys(step_times)[i]).after($(subtitle));
		} else if (time >= step_times[Object.keys(step_times)[i]] && time < step_times[Object.keys(step_times)[i+1]]) {
			// console.log("MATCH", Object.keys(step_times)[i])
			$('#'+Object.keys(step_times)[i+1]).before($(subtitle));
		}
	}
}


// decide where the current subgoal should be placed in. should refer to the previous time that the question was asked.
function computePreviousTime(t){
	var result = t - Experiment.questionInterval;
	if (Experiment.isQuestionRandom){
		// TODO: when random is on, skip the skipped ones.
		// filter out the skipped timings.
	}
	return result;
}


function submitStage1Subgoal(){
	var inp_text = $('.q_input').val();

	if (inp_text == "") {
		noSubgoal()
	} else {

		var currentTime = Math.floor(player.getCurrentTime());
		var time = computePreviousTime(currentTime);	

		// frontend update
		var $li = Subgoal.getNewSubgoalHTML(inp_text);
		// $("<li class='movable subgoal'><span class='sub'>"+inp_text+"</span>" + 
		// 	"<button type='button' class='delButton permButton'>Delete</button>" + 
		// 	"<button type='button' class='editButton permButton'>Edit</button>" + 
		// 	"<button type='button' class='saveButton permButton'>Save</button></li>");
		$li.fadeIn(1000)
		placeSubtitle($li, time)
		$('.q_input').val('');

		Subgoal.opCreate($li, time, inp_text);
	}
	// backend update
	// $.ajax({
	// 	type: "POST",
	// 	url: "/subgoal/create/",
	// 	data: {
	// 		// to avoid 403 forbidden error in Django+Ajax POST calls
	// 		// https://racingtadpole.com/blog/django-ajax-and-jquery/
	// 		csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
	// 		stage: stage,
	// 		// note: this is Django object ID, not Youtube ID.
	// 		video_id: video["id"], 
	// 		time: time,
	// 		label: inp_text,
	// 		// hard-coded for now since there's no login
	// 		// TODO: add the current user's info
	// 		learner_id: 1
	// 	},
	// }).done(function(data){
	// 	console.log("/subgoal/create/ success:", data["success"]);
	// 	$li.attr("data-subgoal-id", data["subgoal_id"]);
	// 	// TODO: do something for failure
	// }).fail(function(){
	// 	console.log("/subgoal/create/ failure");
	// }).always(function(){
	// });	
}

function submitStage2Subgoal(){
	console.log(player.getCurrentTime());
	var currentTime = Math.floor(player.getCurrentTime());
	var time = computePreviousTime(currentTime);
	var text = $('input[name=step1]:radio:checked + label').text();

	// compute upvote/downvote
	var votes = {};
	var answer = $('input[name=step1]:radio:checked').val();
	// add the selected valid subgoal as an upvote
	if (answer != "new" && answer != "none"){
		votes[answer] = "upvotes_s2";
	}
	// everything else within the same time group should be downvoted
	var subgoalGroup = Subgoal.getCurrentGroup(currentTime);
	for (var i in subgoalGroup) {
		var subgoal_id = subgoalGroup[i]["id"];
		if (Experiment.isAdmin){
			var $target = Subgoal.getSubgoalDivByID(subgoal_id);
			// console.log($target);
			if (typeof $target !== "undefined")
				$target.remove();
		}		
		if (!(subgoal_id in votes)){
			votes[subgoal_id] = "downvotes_s2";
		}
	}
	console.log(votes);

	// within this subgoal group, remove everything that does not match the selected item.
	// for (sub in subs) {
	// 	if ($('.'+subs[sub]).text() != text) {
	// 		// for now, whatever's the latest in the group will get the time assigned.
	// 		if (isInt(formatted_Subgoal.data[subs[sub]]["time"]))
	// 			time = formatted_Subgoal.data[subs[sub]]["time"];
	// 		$('.'+subs[sub]).parents()[0].remove()
	// 	} else {
	// 	}
	// }
	var inp_text ="";
	var $li;
	// when another label was inserted.
	if (typeof $('input[name=step1]:radio:checked + input').val() !== "undefined") {
		// console.log('here', time);
		inp_text = $('input[name=step1]:radio:checked + input').val();
		if (inp_text == "") {
			noSubgoal()
		} else {

			$li = Subgoal.getNewSubgoalHTML(inp_text);
			// $li = $("<li class='movable subgoal'><span class='sub'>" + inp_text + "</span>" + 
			// 	"<button type='button' class='delButton permButton'>Delete</button>" + 
			// 	"<button type='button' class='editButton permButton'>Edit</button>" + 
			// 	"<button type='button' class='saveButton permButton'>Save</button></li>");
			$li.fadeIn(1000);
			placeSubtitle($li, time);

			Subgoal.opCreate($li, time, inp_text, true);
		}
		// backend update
		// $.ajax({
		// 	type: "POST",
		// 	url: "/subgoal/create/",
		// 	data: {
		// 		csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
		// 		stage: stage,
		// 		video_id: video["id"], 
		// 		time: time,
		// 		label: inp_text,
		// 		learner_id: 1,
		// 		is_vote: 1
		// 	},
		// }).done(function(data){
		// 	console.log("/subgoal/create/ success:", data["success"]);
		// 	$li.attr("data-subgoal-id", data["subgoal_id"]);
		// 	// TODO: do something for failure
		// }).fail(function(){
		// 	console.log("/subgoal/create/ failure");
		// }).always(function(){
		// });		

	} else if (answer != "new" && answer != "none"){
		if (typeof $('input[name=step1]:radio:checked').val() == "undefined") {
			noSubgoal();
		} else {
			for (var i in Subgoal.data){
				if (answer == Subgoal.data[i]["id"])
					inp_text = Subgoal.data[i]["label"];
			}
			$li = Subgoal.getSubgoalHTML(answer, inp_text);
			// $li = $("<li class='movable subgoal' data-subgoal-id='" + answer + "'><span class='sub'>" + inp_text + "</span>" + 
			// 	"<button type='button' class='delButton permButton'>Delete</button>" + 
			// 	"<button type='button' class='editButton permButton'>Edit</button>" + 
			// 	"<button type='button' class='saveButton permButton'>Save</button></li>");
			$li.fadeIn(1000)	
			placeSubtitle($li, time)
		}		
	}

	Subgoal.opVote(votes);
}

function submitSubgoal() {
	$(".frozen").css("color", "black");
	// $(".frozen").toggleClass("blue");
	if (Experiment.questionStage == 1){
		submitStage1Subgoal();
	} else if (Experiment.questionStage == 2){
		submitStage2Subgoal();
	}

	if (player.getPlayerState()!=0){
		resumeVideo();
	}

	// $('.dq_input').fadeOut(250);
	// $('.dq_input_2').fadeOut(250);
	// $('.dq_help').fadeIn(500);

	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_help').show();

	$("#player").show();
	// setTimeout(checkVideo, 1000);
}

function noSubgoal() {
	
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_help').show();

	// $(".frozen").css("color", "black");

	$("#player").show()

	if (player.getPlayerState()!=0){
		resumeVideo();
	}	
	// $('.dq_instr').hide();
	// setTimeout(checkVideo, 1000);
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
	if (player.getPlayerState()!=0){
		resumeVideo();
	}	
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_help').show();
	$("#player").show()
	// $('.dq_instr').hide();
	// setTimeout(checkVideo, 1000);
});

$("body").on('click', '.cancelButton', function(e) {
	noSubgoal();
});

// individual step clicked
$("body").on('click', '.frozen', function(e) {
	// $(this).siblings().css('font-weight', 'normal')
	// $(this).css('font-weight', 'bold')
	var step = $(this).attr("id");
	var time = step_times[step];

	// $(".frozen").toggleClass("blue");
	$(".frozen").css("color", "black");
	$(".time_marker").css("color", "white");
	$($(this).children()[0]).css("color", "red");

	var t = Math.floor(player.getCurrentTime());
	verticalTimeline(t);

	player.seekTo(time-1);
});

// subgoal clicked: when we know the attached step, play from the closest step's time
// $("body").on('click', 'span.sub', function(e) {
// 	// console.log(this)
// 	el = $($(this).parent()).next()
// 	// console.log(this)
// 	step = $(el).attr("id")
// 	time = step_times[step]
// 	player.seekTo(time)

// 	console.log("subgoal clicked")
// });

// subgoal clicked: play from the captured time for the subgoal
$("body").on('click', 'span.sub', function(e) {
	// var subgoal_id = $(this).attr("data-subgoal-id");
	var subgoal_id = $($(this).parents()[0]).attr("data-subgoal-id");
	var subgoal = Subgoal.getSubgoalByID(subgoal_id);
	if (typeof subgoal !== "undefined" && "time" in subgoal){
		player.seekTo(subgoal["time"] - 1);
	}
	console.log("subgoal clicked");
});

$(document).ready(function() {
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_help').hide();
});