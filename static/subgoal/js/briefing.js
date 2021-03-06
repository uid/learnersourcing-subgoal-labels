function briefCheck(source){
	console.log("CHECKING BRIEF")
	console.log("source: "+source)
	if (source=='play') {
		console.log('PAUSING VIDEO FROM BRIEF')
		pauseVideo();
	}
	$.ajax({
		type: "POST",
		url: "/subgoal/brief_check/",
		data: {
			csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
		},
	}).done(function(data){
		console.log("/subgoal/brief_check/ success:", data["success"]);
		var watched_brief = data["watched_brief"];
		var watched_tut = data["watched_tut"];

		console.log("WATCHED_BRIEF: "+watched_brief);
		console.log("WATCHED_TUT: "+watched_tut);

		if (source=='play') {
			if (!watched_brief) {
				if (!watched_tut) {
					double_brief();
				} else {
					briefing(source);
				}
			} else {
				if (!watched_tut) {
					playTut();
				} else {
					playVideo();
				}
			}
		} else {
			if (!watched_brief) {
				briefing(source);
			}
		}
		// TODO: do something for failure
	}).fail(function(){
		console.log("/subgoal/brief_check/ failure");
	}).always(function(){
	});	
}

//TODO make sure to send some information here about whether they clicked it or just cancelled
function briefClicked(accepted, source){
	console.log("BRIEF CLICKED")
	console.log(accepted)
	$.ajax({
		type: "POST",
		url: "/subgoal/brief_click/",
		data: {
			csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
			agree: accepted,
		},
	}).done(function(data){
		console.log("/subgoal/brief_click/ success:", data["success"]);
		// TODO: do something for failure
	}).fail(function(){
		console.log("/subgoal/brief_click/ failure");
	}).always(function(){
	});	
}

function briefing(source) {
	var statesdemo = {
		state0: {
			title: "Terms of Use",
			html:"<div class='help_info_large'>This is an MIT research experiment.</div>"+
			"<div class='help_info_sm'>This website consists of a video player that stops periodically to ask questions about the video being watched.</div>"+
			"<div class='help_info_bold'>Featured features:</div>"+
			"<div class='help_info_sm'><ul><li>Watch videos that have been annotated and have an interactive timeline</li>"+
			"<li>Answer questions and vote on what other users have answered as you watch videos</li></ul></div>"+
			"<div class='help_info_large'>User Study</div>"+
			"<div class='help_info_sm'>The purpose of this study is to test how well our system can encourage users to generate concise summarizations of how-to videos when asked simple questions periodically while watching these videos.</div>"+
			"<div class='help_info_sm'>As you watch videos, we will record actions such as the answers you submit and the edits made to the video’s outline. We also record a random variable assigned to each user’s session, but do not ask for or record any personal information.</div>"+
			"<div class='help_info_sm'>You may revisit or remain on the site for as long as you’d like.</div>"+
			"<div class='help_info_bold'>Requirements:</div>"+
			"<div class='help_info_sm'><ul><li>You must be at least 18 years old.</li>"+
			"<li>You understand that you use this website at your own risk.</li></ul></div>"+
			"<div class='help_info_bold_sm'>Guarantees:</div>"+
			"<div class='help_info_sm'><ul><li>Your participation is voluntary. You may abandon this study at any time.</li>"+
			"<li>Your personal information will never be sent to researchers.</li>"+
			"<li>Please email <a id='crowdy_email' href='mailto:crowdy@csail.mit.edu'>crowdy@csail.mit.edu</a> with any concerns or questions.</li></ul></div>"+
			'<input type="checkbox" id="agree_box" name="agree"/><label for="agree_box">I agree with the terms and conditions.</label>',
			buttons: { Cancel: true, Agree: false },
			focus: 1,
			position: {container: 'body', x: 250, y: 100, width: 500},
			submit:function(e,v,m,f){
				if(v){
					e.preventDefault();
					$.prompt.goToState('state1', true);
				} else {
					$.prompt.close();
					briefClicked('agree', source)
				}
				
			}
		},
		state1: {
			html:"<div class='help_info_sm'>Thank you, feel free to use the site without participating.</div>",
			buttons: { Back: -1, Okay: 1},
			focus: 1,
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1) {
					briefClicked('no_agree', source);
					$.prompt.close();
				} else if(v==-1) {
					$.prompt.goToState('state0');
				}
			}
		}
	};
	$.prompt(statesdemo);
	$(".jqiclose").hide();
	$("#jqi_state0_buttonAgree").attr('disabled', 'disabled');
}

$("body").on('click', '#agree_box', function(e) {
	console.log("box hit")
	if ($('input[name="agree"]:checked').length > 0) {
		console.log("ENABLE BUTTON")
		$("#jqi_state0_buttonAgree").removeAttr('disabled');
	} else {
		$("#jqi_state0_buttonAgree").attr('disabled', 'disabled');
	}
});
