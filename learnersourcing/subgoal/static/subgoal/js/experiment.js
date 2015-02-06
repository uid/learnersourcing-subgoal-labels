
// all experimental flags and parameters
var Experiment = function() {
	// experiment session ID created by the Django model. Unique to each play action.
	var id = 0;

	// indicate which stage the current question is.
	var questionStage = 0;

	// admin gets to see all the subgoals by all learners
	var isAdmin = false;

	// fixed interval for triggering questions
	var questionInterval = 30;

	// flag for random triggering
	var isQuestionRandom = false;

	// flag for showing individual steps
	var isStepShown = true;

	// study mode adds pretest and posttest, as well as survey links
	var isStudy = false;

	// which condition group is the participant in?
	var group = 0;

	// participant ID for user study
	var participantId = "";

	// keep track of when, if, and which question has been asked
	// a valid entry should be an object: {"time": xx, "isAsked": true/false, "stage": xx}
	var questionTracker = [];

	// add a record to questionTracker
	function recordQuestion(record){
		questionTracker.push(record);
		// Ajax call to the server
		// session key, video ID, record (time, isAsked, questionStage)

		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/record_question/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				video_id: video["id"],
				learner_id: 1,
				video_time: record["time"],
				is_asked: record["isAsked"],
				question_stage: record["stage"]
			},
		}).done(function(data){
			console.log("/subgoal/record_question success:", data["success"]);
		}).fail(function(){
			console.log("/subgoal/record_question failure");
		}).always(function(){
		});
	}

	// check if the question has been already asked in this time
	function isRecordedAt(t){
		var isRecorded = false;
		for (var i in questionTracker){
			if (t == questionTracker[i]["time"])
				isRecorded = true;
		}
		return isRecorded;
	}

	// get the last recording time
	function getLastRecordingTime(){
		var t = 0;
		for (var i in questionTracker){
			if (t < questionTracker[i]["time"])
				t = questionTracker[i]["time"];
		}
		return t;
	}

	// coin flip function that returns true or false randomly
	function coinFlip() {
	    // return (Math.floor(Math.random() * 2) == 0);
	    return Math.random() < 0.66;
	}

	// update the experiment session information via Ajax
	function opUpdate(exp_session_id){
		$.ajax({
			type: "POST",
			url: "/exp_session/update/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				exp_session_id: exp_session_id,
				cond_interval: Experiment.questionInterval,
				cond_random: Experiment.isQuestionRandom,
				cond_step: Experiment.isStepShown,
				cond_admin: Experiment.isAdmin,
				cond_study: Experiment.isStudy,
				cond_group: Experiment.group,
				participant_id: Experiment.participantId
			},
		}).done(function(data){
			console.log("/exp_session/update/ success:", data["success"]);
		}).fail(function(){
			console.log("/exp_session/update/ failure");
		}).always(function(){
		});
	}


	// set up the parameters
	function setup(exp_session){
		// console.log(exp_session);
		Experiment.id = exp_session["id"];
		Experiment.questionInterval = exp_session["cond_interval"];
		Experiment.isQuestionRandom = exp_session["cond_random"];
		Experiment.isStepShown = exp_session["cond_step"];
		Experiment.isAdmin = exp_session["cond_admin"];
		Experiment.isStudy = exp_session["cond_study"];
		Experiment.group = exp_session["cond_group"];
		Experiment.participantId = exp_session["participant_id"];

		// process any query string: overwrite the default
		if (getParameterByName("interval") != "" && isInt(getParameterByName("interval")))
			Experiment.questionInterval = getParameterByName("interval");
		if (getParameterByName("random") != "")
			Experiment.isQuestionRandom = getParameterByName("random")==1 ? true : false;
		if (getParameterByName("step") != "")
			Experiment.isStepShown = getParameterByName("step")==1 ? true : false;
		if (getParameterByName("admin") != "")
			Experiment.isAdmin = getParameterByName("admin")==1 ? true : false;
		if (getParameterByName("study") != "")
			Experiment.isStudy = getParameterByName("study")==1 ? true : false;
		if (getParameterByName("group") != "")
			Experiment.group = getParameterByName("group");
		if (getParameterByName("pid") != "")
			Experiment.participantId = getParameterByName("pid");

		// TODO: overwrite the model's experiment setting when url parameters exist.
		opUpdate(exp_session["id"]);

		console.log("Interval:", Experiment.questionInterval, "Random:", Experiment.isQuestionRandom, "Step:", Experiment.isStepShown, "Admin:", Experiment.isAdmin, "Study:", Experiment.isStudy, "Group:", Experiment.group, "PID", Experiment.participantId);
	}


	return {
		id: id,
		questionStage: questionStage,
		isAdmin: isAdmin,
		questionInterval: questionInterval,
		isQuestionRandom: isQuestionRandom,
		isStepShown: isStepShown,
		isStudy: isStudy,
		group: group,
		participantId: participantId,
		questionTracker: questionTracker,
		recordQuestion: recordQuestion,
		isRecordedAt: isRecordedAt,
		getLastRecordingTime: getLastRecordingTime,
		coinFlip: coinFlip,
		setup: setup
	}
}();