
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
		// TODO: Ajax call to the server
		// session key, video ID, record (time, isAsked, questionStage)
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

	return {
		questionStage: questionStage,
		isAdmin: isAdmin,
		questionInterval: questionInterval,
		isQuestionRandom: isQuestionRandom,
		isStepShown: isStepShown,
		questionTracker: questionTracker,
		recordQuestion: recordQuestion,
		isRecordedAt: isRecordedAt,
		coinFlip: coinFlip
	}
}();