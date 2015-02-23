function double_brief() {
	console.log("DOUBLE BRIEFING");
	var $state0_img = "<img class='help_img' id='state0_img' src='/static/subgoal/img/Whole_interface.png'></img>"
	var $state1_img = "<img class='help_img_small' id='state1_img' src='/static/subgoal/img/Step1_shot.png'></img>"
	var $state2_img = "<img class='help_img_small' id='state1_img' src='/static/subgoal/img/Step2_shot.png'></img>"
	var statesdemo = {
		state_a: {
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
			buttons: { Cancel: -1, Agree: 1 },
			focus: -1,
			show: 'fadeIn',
			position: {container: 'body', x: 250, y: 100, width: 500},
			submit:function(e,v,m,f){
				if(v==-1){
					e.preventDefault();
					$.prompt.goToState('state_b', true);
				} else if(v==1) {
					e.preventDefault();
					briefClicked('agree', 'play');
					$.prompt.goToState('state0');
				}
			}
		},
		state_b: {
			html:"<div class='help_info_sm'>Thank you, feel free to use the site without participating.</div>",
			buttons: { Back: -1, Okay: 1},
			focus: 1,
			show: 'fadeIn',
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1) {
					briefClicked('no_agree', 'play');
					$.prompt.goToState('state0');
				} else if(v==-1) {
					$.prompt.goToState('state_a');
				}
			}
		},
		state0: {
			title: "Welcome",
			html:"<div class='help_info'>We're <span class='bold'>experimenting</span> with new ways of generating information about videos.</div>"+
			"<div>"+$state0_img+"</div>",
			buttons: { Cancel: false, Next: true },
			focus: 1,
			show: 'fadeIn',
			submit:function(e,v,m,f){
				if(v){
					e.preventDefault();
					$.prompt.goToState('state1');
					return false;
				} else {
					$.prompt.close();
					tutClicked()
				}
				
			}
		},
		state1: {
			title: "More information",
			html:"<div class='help_info'>This is an interactive panel with the steps that the tutorial video covers. <span class='bold'>Click on a step</span> to move to a specific point in the video.</div>",
			buttons: { Cancel: 0, Back: -1, Next: 1},
			focus: 1,
			show: 'fadeIn',
			position: { container: '.wiki_wrap', x: 200, y: 0, width: 500, arrow: 'lt' },
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1)
					$.prompt.goToState('state2');
				else if(v==-1)
					$.prompt.goToState('state0');
				else if(v==0) {
					$.prompt.close();
					tutClicked();
				}
			}
		},
		state2: {
			title: "Test yourself",
			html:"<div class='help_info'>Periodically, the video will stop and <span class='bold'>ask you a simple question</span> to summarize what you've just watched. The answer to the question will show up in the panel to the left.</div>"+
			"<div>"+$state1_img+"</div>",
			buttons: { Cancel: 0, Back: -1, Next: 1},
			focus: 1,
			show: 'fadeIn',
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1)
					$.prompt.goToState('state3');
				else if(v==-1)
					$.prompt.goToState('state1');
				else if(v==0) {
					$.prompt.close();
					tutClicked();
				}
			}
		},
		state3: {
			title: "Collaborate with other users",
			html:"<div class='help_info'>You may be asked to evaluate what other users have answered. Don't worry, everything is anonymous.</div>"+
			"<div>"+$state2_img+"</div>",
			buttons: { Cancel: 0, Back: -1, Next: 1},
			focus: 1,
			show: 'fadeIn',
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1)
					$.prompt.goToState('state4');
				else if(v==-1)
					$.prompt.goToState('state2');
				else if(v==0) {
					$.prompt.close();
					tutClicked();
				}
			}
		},
		state4: {
			title: "Learn",
			html:"<div class='help_info'>This is also an experiment to see if answering these questions will help you <span class='bold'>learn better</span>. We think that it might.</div>",
			buttons: { Back: -1, Finish: 1},
			focus: 1,
			show: 'fadeIn',
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1) {
					tutClicked();
					$.prompt.close();
				}
				else if(v==-1)
					$.prompt.goToState('state3');
			}
		}
	};
	$.prompt(statesdemo);
	$(".jqiclose").hide();
	$("#jqi_state_a_buttonAgree").attr('disabled', 'disabled');
}

$("body").on('click', '#agree_box', function(e) {
	console.log("box hit")
	if ($('input[name="agree"]:checked').length > 0) {
		console.log("ENABLE BUTTON")
		$("#jqi_state_a_buttonAgree").removeAttr('disabled');
	} else {
		$("#jqi_state_a_buttonAgree").attr('disabled', 'disabled');
	}
});

$("body").on('click', '.jqiclose', function(e){
	console.log("close button clicked")
	tutClicked();
});
