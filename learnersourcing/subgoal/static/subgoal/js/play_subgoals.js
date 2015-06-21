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
    	playerVars: {rel: 0, controls: 0},
        enablejsapi: '1',
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
	//check whether briefing should be shown, and include source
	if (!Experiment.isStudy) {
		event.target.playVideo();
		checkVideo();
		briefCheck('play');
		// tutCheck();
	}
}

// var stop_time = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
    	var vid = video.id;
		Subgoal.opVidAction('play_video', vid, 'none');
    } else if (event.data == YT.PlayerState.PAUSED) {
    	var vid = video.id;
		Subgoal.opVidAction('pause_video', vid, 'none');
    } else if (event.data == YT.PlayerState.ENDED) {
    	var vid = video.id;
		Subgoal.opVidAction('stop_video', vid, 'none');
    }
}

function playVideo() {
	console.log("playing")
	player.playVideo();
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
	console.log("RESUMING")
	// $(".frozen").css("color", "black");
	$(".frozen").removeClass("bold");
	var vid = video.id;
	Subgoal.opVidAction('resume_video', vid, 'none');
	// player.seekTo(player.getCurrentTime()-1);
	player.seekTo(player.getCurrentTime());
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
				askQuestion(t);
				isAsked = true;
			} else {
				console.log(t, "coin false, question skipped");
				isAsked = false;
				// do nothing for this interval
			}
		} else {
			console.log(t, "no coin, question asked");
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

		// ask the question only when it has been some time after the last asking
		if (t - Experiment.getLastRecordingTime() > Experiment.questionInterval / 2){
			askQuestion(t);
			isAsked = true;
			Experiment.recordQuestion({"time": t, "isAsked": isAsked, "stage": Experiment.questionStage});

			// if group == 1, it doesn't automatically route to posttest.
			if (Experiment.isStudy && Experiment.group == 1) {
				askPosttest();
			}

		} else {
			// display posttest
			if (Experiment.isStudy) {
				askPosttest();
			}
		}
	} else {
		// update every time, because users might be skipping.
		// retrieve the next possible interval.
		time_to_stop = t + Experiment.questionInterval - (t % Experiment.questionInterval);
	}
	// keep looping
	if (!Experiment.isStudy || !PrePostTest.reachedPosttest) {
		setTimeout(checkVideo, 1000);
	}
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
		$("#" + curStep).addClass("gray");
	}
}


// given the current time and data collected, decide which question to display.
function routeStage(t) {
	Experiment.questionStage = 1;
	var subgoalGroup = Subgoal.getCurrentGroup(t);
	// console.log(subgoalGroup);

	//routes it to stage 2 or 3 (enough subgoals generated)
	if (subgoalGroup.length >= 3) {
		var sorted_group = subgoalGroup.sort(compare_votes_s2);
		var diff_threshold = 3;
		var upvote_threshold = 5;
		var vote_diff = sorted_group[0].upvotes_s2 - sorted_group[1].upvotes_s2;

		// var vote_val;
		// if (sorted_group[0].upvotes_s2 == 0) {
		// 	vote_val = -1;
		// } else {
		// 	vote_val = vote_diff/sorted_group[0].upvotes_s2;
		// }

		//checks if the difference between number of votes is high
		if ((vote_diff > diff_threshold) || sorted_group[0].upvotes_s2 > upvote_threshold) {
			Experiment.questionStage = 3;
			// Do graduation routing
			var sorted_group_s3 = subgoalGroup.sort(compare_votes_s3);
			var diff_threshold_s3 = 3;
			var upvote_threshold_s3 = 5;
			var vote_diff_s3 = sorted_group_s3[0].upvotes_s3 - sorted_group_s3[1].upvotes_s3;
			if ((vote_diff_s3 > diff_threshold_s3) || sorted_group_s3[0].upvotes_s3 > upvote_threshold_s3)
				Experiment.questionStage = 4;
		} else {
			Experiment.questionStage = 2;
		}
	}
	stage = Experiment.questionStage;
	// console.log(Experiment.questionStage)
}


function colorStepGroup(t) {
	var floor = computePreviousTime(t);
	// $(".frozen").css("color", "black");
	// $(".frozen").toggleClass("blue");
	for (step in step_times) {
		if (floor <= step_times[step] && step_times[step] < t) {
			// $("#"+step).css("color", "#59BDE8");
			$("#"+step).addClass("bold");
		}
	}
}

function displayStage1Question(t){
	colorStepGroup(t);
}

function displayStage2Question(t){
	colorStepGroup(t);
	var subgoalTestGroup = Subgoal.getCurrentGroup(t);
	var numSubgoals = subgoalTestGroup.length

	var subgoal_test_list = [];
	var subgoal_list = [];

	for (i in subgoalTestGroup) {
		var sub_text = subgoalTestGroup[i]["label"].toLowerCase();
		if (subgoal_test_list.indexOf(sub_text)<0) {
			if (sub_text != '') {
				var vote_diff = subgoalTestGroup[i].upvotes_s2 - subgoalTestGroup[i].downvotes_s2;
				subgoal_test_list.push(sub_text);
				subgoal_list.push({v:vote_diff, k:sub_text, t:subgoalTestGroup[i]});
			}
		} else {
			//you have a duplicate entry!
		}
	}

	subgoal_list.sort(function(a,b){
		if (a.v > b.v){return -1}
			if (a.v < b.v){return 1}
				return 0;
	});

	console.log(subgoal_list);

	$(".mult_choice_options").empty('');

	//set the number of subgoals to show
	var num_subgoals_threshold = 4;

	for (i in subgoal_list.slice(0,num_subgoals_threshold)) {
		var subgoal_id = subgoal_list[i].t.id;
		var subgoal_text = subgoal_list[i].k;
		if (subgoal_text != '') {
			$(".mult_choice_options").append("<label><input type='radio' name='step1' class='q_choice' value='" + subgoal_id + "'>"+ escapeHTML(subgoal_text)+"</input></label><br>");
		}
	}

	$(".mult_choice_options").append("<br><label class='new_subgoal_option'><input type='radio' name='step1' value='new' class='q_choice q_new_2'>I have a better answer: <input type='text' class='q_input_2' id='new_answer'></input></label><br>");
}

function displayStage3Question(t){
	colorStepGroup(t);
	var subgoalTestGroup = Subgoal.getCurrentGroup(t);

	var subgoalAddedStage3 = [];
	for (var s in subgoalTestGroup) {
		console.log(subgoalTestGroup[s].stage_added);
		if (subgoalTestGroup[s].stage_added == 3) {
			subgoalAddedStage3.push(subgoalTestGroup[s])
		}
	}

	if (subgoalAddedStage3.length > 0) {
		for (var i in subgoalAddedStage3) {
			var sortedSubgoalDate = subgoalAddedStage3.sort(compare_dates_s3);
			var subgoal_text = sortedSubgoalDate[0].label
			var subgoal_id = sortedSubgoalDate[0].id
		}
	} else {
		var sortedSubgoalGroup = subgoalTestGroup.sort(compare_votes_s2);
		var subgoal_text = sortedSubgoalGroup[0].label
		var subgoal_id = sortedSubgoalGroup[0].id
	}

	$(".sub_label").empty('')
	$(".steps_list").empty('')
	$(".mult_choice_options_stage3").empty('')

	$(".steps_list").append("<p class='step_label'>Steps:</p>")
	$(".sub_label").append("<p class='step_label'>Statement:</p>")
	$(".sub_label").append(escapeHTML(subgoal_text));

	var floor = computePreviousTime(t);
	var numSteps = 0;
	for (var i in steps){
		if (floor <= steps[i][0].time && steps[i][0].time < t){
			var step_text = steps[i][0].label;
			$(".steps_list").append("<p class='ind_step'>" + escapeHTML(step_text) + "</p><br>");
			numSteps++
		}
	}

	if (numSteps == 0) {
		$("#stage3_ques").empty('')
		$("#stage3_ques").append('Does the statement below accurately summarize what you just watched?');
		$(".steps_list").empty('')

		$(".mult_choice_options_stage3").append("<label><input type='radio' name='step3' class='q_choice' value='" + subgoal_id + "'>Yes, this statement applies</input></label><br>");
		$(".mult_choice_options_stage3").append("<label><input type='radio' name='step3' class='q_choice' value='none'>No, there should be no summarizing statement here</input></label><br>");
		// $(".mult_choice_options_stage3").append("<label class='new_subgoal_option'><input type='radio' name='step3' value='new' class='q_choice q_new'>No, and I want to revise the statement: <input type='text' class='q_input' id='new_answer_s3'></input></label><br>");
		$(".mult_choice_options_stage3").append("<label class='new_subgoal_option'><input type='radio' name='step3' value='new' class='q_choice q_new'>No, and I want to revise the statement: <input type='text' class='q_input' id='new_answer_s3' value='"+escapeHTML(subgoal_text)+"'></input></label><br>");
	} else {
		$(".mult_choice_options_stage3").append("<label><input type='radio' name='step3' class='q_choice' value='" + subgoal_id + "'>Yes, this statement applies</input></label><br>");
		$(".mult_choice_options_stage3").append("<label><input type='radio' name='step3' class='q_choice' value='none'>No, there should be no summarizing statement here</input></label><br>");
		// $(".mult_choice_options_stage3").append("<label class='new_subgoal_option'><input type='radio' name='step3' value='new' class='q_choice q_new'>No, and I want to revise the statement: <input type='text' class='q_input' id='new_answer_s3'></input></label><br>");
		$(".mult_choice_options_stage3").append("<label class='new_subgoal_option'><input type='radio' name='step3' value='new' class='q_choice q_new'>No, and I want to revise the statement: <input type='text' class='q_input' id='new_answer_s3' value='"+escapeHTML(subgoal_text)+"'></input></label><br>");
	}
}

// Create the question
function askQuestion(t) {
	if (Experiment.group == 1 || Experiment.group == 2)
		return;
	console.log("Question at: " + t);

	player.pauseVideo();
	$("#player").hide();
	if (Experiment.questionStage == 1){
		displayStage1Question(t);
		$('.dq_input').show();
	} else if (Experiment.questionStage == 2){
		displayStage2Question(t);
		$('.dq_input_2').show();
	} else if (Experiment.questionStage == 3) {
		displayStage3Question(t);
		$('.dq_input_3').show();
	} else if (Experiment.questionStage == 4) {
		// TODO: add a customized interaction for stage4.
		displayStage3Question(t);
		$('.dq_input_3').show();
	}

	var vid = video.id;
	var question_act = 'ask_q_'+Experiment.questionStage;
	Subgoal.opVidAction(question_act, vid, 'none');

	$(".submitbutton").attr('disabled','disabled');
	$(".submitbutton").addClass('disabledButton');
	$('.dq_help').hide();
	$('.dq_instr').hide();
}


function askPretest() {
	if (!Experiment.isStudy)
		return;
	$(".wiki_wrap").hide();
	$("#player").hide();
	displayPretest();
	$('.dq_pretest').show();

	if (!PrePostTest.reachedPretest) {
		console.log("displaying pretest");
		var vid = video.id;
		Subgoal.opVidAction("pretest", vid, 'none');
		PrePostTest.reachedPretest = true;
	}

	// $(".submitPretestButton").attr('disabled','disabled');
	// $(".submitPretestButton").addClass('disabledButton');
	$('.dq_help').hide();
	$('.dq_instr').hide();
}

function askPosttest() {
	if (!Experiment.isStudy)
		return;
	// TODO: hide outline?
	$(".wiki_wrap").hide();
	$("#player").hide();
	displayPosttest();
	$('.dq_posttest').show();

	if (!PrePostTest.reachedPosttest) {
		console.log("displaying posttest");
		var vid = video.id;
		Subgoal.opVidAction("posttest", vid, 'none');
		PrePostTest.reachedPosttest = true;
	}

	// $(".submitPosttestButton").attr('disabled','disabled');
	// $(".submitPosttestButton").addClass('disabledButton');
	$('.dq_help').hide();
	$('.dq_instr').hide();
}


function createMultipleChoiceQuestion() {

}

function createFreeformQuestion() {

}


// TODO: read from problem bank and dynamically create & insert problem HTML
// For each video, accept a JSON file with problem description
	// type: "mc", "ff"
	// question: question text
	// options: ["A", "B", "C", "D"]
	// answer: "A"
function displayPretest() {

}

// TODO: read from problem bank and dynamically create & insert problem HTML
function displayPosttest() {

}

// Add the subgoal to the proper location in the Wiki view
function placeSubtitle(subtitle, time) {
	// special case: when there's no steps displayed.
	if (Object.keys(step_times).length == 1) {
		$('#sortable').append($(subtitle));
		return;
	}
	// normal case: when there's steps displayed.
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
		$li.fadeIn(1000);
		placeSubtitle($li, time);
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
	// console.log(player.getCurrentTime());
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

function submitStage3Subgoal(){
	var currentTime = Math.floor(player.getCurrentTime());
	var time = computePreviousTime(currentTime);

	// compute upvote/downvote
	var votes = {};
	var answer = $('input[name=step3]:radio:checked').val();

	// add the selected valid subgoal as an upvote
	if (answer != "new" && answer != "none"){
		votes[answer] = "upvotes_s3";
	}

	var subgoalGroup = Subgoal.getCurrentGroup(currentTime);
	for (var i in subgoalGroup) {
		var subgoal_id = subgoalGroup[i]["id"];
		if (!(subgoal_id in votes)){
			votes[subgoal_id] = "downvotes_s2";
		}
	}

	var inp_text ="";
	var $li;
	// when another label was inserted.
	if (typeof $('input[name=step3]:radio:checked + input').val() !== "undefined") {
		// console.log("FIRST BLOCK")
		inp_text = $('input[name=step3]:radio:checked + input').val();
		if (inp_text == "") {
			noSubgoal()
		} else {

			$li = Subgoal.getNewSubgoalHTML(inp_text);
			$li.fadeIn(1000);
			placeSubtitle($li, time);

			Subgoal.opCreate($li, time, inp_text, true);
		}

	} else if (answer != "new" && answer != "none"){
		// console.log("SECOND BLOCK")
		if (typeof $('input[name=step3]:radio:checked').val() == "undefined") {
			noSubgoal();
		} else {
			for (var i in Subgoal.data){
				if (answer == Subgoal.data[i]["id"])
					inp_text = Subgoal.data[i]["label"];
			}
			$li = Subgoal.getSubgoalHTML(answer, inp_text);
			$li.fadeIn(1000)
			placeSubtitle($li, time)
		}
	} else if (answer == "none") {
		// console.log("THIRD BLOCK")
		//TODO-- DO SOMETHING HERE! This gives us some information...
		noSubgoal();
	}

	Subgoal.opVote(votes);
}

function submitSubgoal() {
	console.log("current time submit: "+player.getCurrentTime());
	$(".frozen").removeClass("bold");
	if (Experiment.questionStage == 1){
		submitStage1Subgoal();
	} else if (Experiment.questionStage == 2){
		submitStage2Subgoal();
	} else if (Experiment.questionStage == 3) {
		submitStage3Subgoal();
	}

	if (player.getPlayerState()!=0){
		resumeVideo();
		// $('.dq_input').fadeOut(250);
		// $('.dq_input_2').fadeOut(250);
		// $('.dq_help').fadeIn(500);

		$('.dq_input').hide();
		$('.dq_input_2').hide();
		$('.dq_input_3').hide();
		$('.dq_input_4').hide();
		$('.dq_help').show();

		$("#player").show();
		// setTimeout(checkVideo, 1000);
	} else {
		// if the video ended and the last prompt has been answered,
		// ask post test.
		if (Experiment.isStudy) {
			askPosttest();
		} else {
			$("#player").show();
		}
	}
}

// Submit pretest results
function submitPretest() {
	// console.log("submit pretest");

	var userResponse = {};
    //Gathering the Data and removing undefined keys (buttons)
    $.each($("#pretest-form")[0].elements, function(i, v){
        var input = $(v);
        var name = input.attr("name");
        if (input.attr("type") == "radio")
			userResponse[name] = $("input[type='radio'][name=" + name + "]:checked").val();
        else
        	userResponse[name] = input.val();
        delete userResponse["undefined"];
    });
    console.log(userResponse);
    Subgoal.opSubmitPretest(userResponse);


    // video initialization here
	// event.target.playVideo();
	checkVideo();
	briefCheck('play');

	// if (player.getPlayerState()!=0){
	// 	resumeVideo();
	// }
	$('.dq_pretest').hide();
	$('.dq_posttest').hide();
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_input_3').hide();
	$('.dq_input_4').hide();
	$('.dq_help').show();
	$("#player").show();

	if (Experiment.group == 3)
		$(".step").hide();

	if (Experiment.group != 1)
		$(".wiki_wrap").show();
}

// Submit posttest results
function submitPosttest() {
	// console.log("submit posttest");

	var userResponse = {};
    //Gathering the Data and removing undefined keys (buttons)
    $.each($("#posttest-form")[0].elements, function(i, v){
        var input = $(v);
        var name = input.attr("name");
        if (input.attr("type") == "radio")
			userResponse[name] = $("input[type='radio'][name=" + name + "]:checked").val();
        else
        	userResponse[name] = input.val();
        delete userResponse["undefined"];
    });
    console.log(userResponse);
    Subgoal.opSubmitPosttest(userResponse);

	// checkVideo();
	// briefCheck('play');

	$('.dq_pretest').hide();
	$('.dq_posttest').hide();
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_input_3').hide();
	$('.dq_input_4').hide();

	if (Experiment.isStudy) {
		$(".dq_posttest_after").show();
	} else {
		$('.dq_help').show();
		$("#player").show();
	}

	// TODO: video recommendation?
    // some final thing to do
}

function noSubgoal() {
	console.log("NO SUBGOAL")
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_input_3').hide();
	$('.dq_input_4').hide();
	$('.dq_help').show();

	if (player.getPlayerState()!=0){
		$("#player").show();
		resumeVideo();
	} else {
		// display posttest
		if (Experiment.isStudy) {
			askPosttest();
			$("#player").hide();
		} else {
			$("#player").show();
		}
	}

	var vid = video.id;
	Subgoal.opVidAction('no_subgoal', vid, 'none');

	// $('.dq_instr').hide();
	// setTimeout(checkVideo, 1000);
}

function compare_votes_s2(a,b) {
  if (a.upvotes_s2 < b.upvotes_s2)
     return 1;
  if (a.upvotes_s2 > b.upvotes_s2)
    return -1;
  return 0;
}

function compare_votes_s3(a,b) {
  if (a.upvotes_s3 < b.upvotes_s3)
     return 1;
  if (a.upvotes_s3 > b.upvotes_s3)
    return -1;
  return 0;
}

function compare_dates_s3(a,b) {
  if (a.added_at < b.added_at)
     return 1;
  if (a.added_at > b.added_at)
    return -1;
  return 0;
}

$("body").on('keypress', '.q_input', function(e) {
	// console.log("enter pressed")
	if (e.which == 13) {
		submitSubgoal();
	}
});

$("body").on('keypress', '#new_answer', function(e) {
	// console.log("enter pressed");
	if (e.which==13) {
		submitSubgoal();
	}
});

$("body").on('keypress', '#new_answer_s3', function(e) {
	// console.log("enter pressed");
	if (e.which==13) {
		submitSubgoal();
	}
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
	$('.q_input').val('');
	if (player.getPlayerState()!=0){
		resumeVideo();
	} else {
		// display posttest
		if (Experiment.isStudy) {
			askPosttest();
		}
	}

	var vid = video.id;
	Subgoal.opVidAction('no_subgoal', vid, 'none');

	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_help').show();
	$("#player").show()
	// $('.dq_instr').hide();
	// setTimeout(checkVideo, 1000);
});

$("body").on('click', '.cancelButton', function(e) {
	// console.log("CANCEL BUTTON");
	noSubgoal();
});

$("body").on('click', '.submitPretestButton', function(e) {
	submitPretest();
});

$("body").on('click', '.submitPosttestButton', function(e) {
	submitPosttest();
});

// individual step clicked
$("body").on('click', '.frozen', function(e) {
	// $(this).siblings().css('font-weight', 'normal')
	// $(this).css('font-weight', 'bold')
	var step = $(this).attr("id");
	var time = step_times[step];

	// $(".frozen").css("color", "black");
	$(".time_marker").css("color", "white");
	$($(this).children()[0]).css("color", "red");

	var t = Math.floor(player.getCurrentTime());
	verticalTimeline(t);

	var vid = video.id;
	var step_action = 'clicked_step_'+step;
	Subgoal.opVidAction(step_action, vid, 'none');

	player.seekTo(time);
	// player.seekTo(time-1);
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

	var vid = video.id;
	var sub_action = 'clicked_sub_'+subgoal_id;
	Subgoal.opVidAction(sub_action, vid, 'none');

	if (typeof subgoal !== "undefined" && "time" in subgoal){
		player.seekTo(subgoal["time"] - 1);
	}

	// console.log("subgoal clicked");
});

$(document).ready(function() {
	$('.dq_input').hide();
	$('.dq_input_2').hide();
	$('.dq_input_3').hide();
	$('.dq_input_4').hide();
	$('.dq_help').hide();
	askPretest();
});