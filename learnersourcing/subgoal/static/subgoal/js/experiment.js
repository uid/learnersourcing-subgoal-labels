
// all experimental flags and parameters
var Experiment = function() {

	// fixed interval for triggering questions
	var questionInterval = 30;

	// flag for random triggering
	var isQuestionRandom = false;

	// flag for showing individual steps
	var isStepShown = true;

	// coin flip function that returns true or false randomly
	function coinFlip() {
	    return (Math.floor(Math.random() * 2) == 0);
	}

	return {
		questionInterval: questionInterval,
		isQuestionRandom: isQuestionRandom,
		isStepShown: isStepShown,
		coinFlip: coinFlip
	}
}();