
// all experimental flags and parameters
var Experiment = function() {

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

	// coin flip function that returns true or false randomly
	function coinFlip() {
	    return (Math.floor(Math.random() * 2) == 0);
	}

	// set up the parameters
	function setup(exp_session){
		// console.log(exp_session);
		Experiment.questionInterval = exp_session["cond_interval"];
		Experiment.isQuestionRandom = exp_session["cond_random"];
		Experiment.isStepShown = exp_session["cond_step"];
		Experiment.isAdmin = exp_session["cond_admin"];

		// process any query string: overwrite the default
		if (getParameterByName("interval") != "" && isInt(getParameterByName("interval")))
			Experiment.questionInterval = getParameterByName("interval");
		if (getParameterByName("random") != "")
			Experiment.isQuestionRandom = getParameterByName("random")==1 ? true : false;
		if (getParameterByName("step") != "")
			Experiment.isStepShown = getParameterByName("step")==1 ? true : false;
		if (getParameterByName("admin") != "")
			Experiment.isAdmin = getParameterByName("admin")==1 ? true : false;

		console.log("Interval:", Experiment.questionInterval, "Random:", Experiment.isQuestionRandom, "Step:", Experiment.isStepShown, "Admin:", Experiment.isAdmin);
	}


	return {
		questionStage: questionStage,
		isAdmin: isAdmin,
		questionInterval: questionInterval,
		isQuestionRandom: isQuestionRandom,
		isStepShown: isStepShown,
		questionTracker: questionTracker,
		recordQuestion: recordQuestion,
		isRecordedAt: isRecordedAt,
		coinFlip: coinFlip,
		setup: setup
	}
}();