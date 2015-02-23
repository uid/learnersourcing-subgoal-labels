function playTut() {
	console.log("PLAYING TUT")
	var $state0_img = "<img class='help_img' id='state0_img' src='/static/subgoal/img/Whole_interface.png'></img>"
	var $state1_img = "<img class='help_img_small' id='state1_img' src='/static/subgoal/img/Step1_shot.png'></img>"
	var $state2_img = "<img class='help_img_small' id='state1_img' src='/static/subgoal/img/Step2_shot.png'></img>"
	var statesdemo = {
		state0: {
			title: "Welcome",
			html:"<div class='help_info'>We're <span class='bold'>experimenting</span> with new ways of generating information about videos.</div>"+
			"<div>"+$state0_img+"</div>",
			buttons: { Cancel: false, Next: true },
			focus: 1,
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
			buttons: { Back: -1, Next: 1},
			focus: 1,
			position: { container: '.wiki_wrap', x: 200, y: 0, width: 500, arrow: 'lt' },
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1)
					$.prompt.goToState('state2');
				else if(v==-1)
					$.prompt.goToState('state0');
			}
		},
		state2: {
			title: "Test yourself",
			html:"<div class='help_info'>Periodically, the video will stop and <span class='bold'>ask you a simple question</span> to summarize what you've just watched.</div>"+
			"<div>"+$state1_img+"</div>",
			buttons: { Back: -1, Next: 1},
			focus: 1,
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1)
					$.prompt.goToState('state3');
				else if(v==-1)
					$.prompt.goToState('state1');
			}
		},
		state3: {
			title: "Collaborate with other users",
			html:"<div class='help_info'>You may be asked to evaluate what other users have answered. Don't worry, everything is anonymous.</div>"+
			"<div>"+$state2_img+"</div>",
			buttons: { Back: -1, Next: 1},
			focus: 1,
			submit:function(e,v,m,f){
				e.preventDefault();
				if(v==1)
					$.prompt.goToState('state4');
				else if(v==-1)
					$.prompt.goToState('state2');
			}
		},
		state4: {
			title: "Learn",
			html:"<div class='help_info'>This is also an experiment to see if answering these questions will help you <span class='bold'>learn better</span>. We think that it might.</div>",
			buttons: { Back: -1, Finish: 1},
			focus: 1,
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
}

function tutClicked(){
	console.log("TUT CLICKED")
	$.ajax({
		type: "POST",
		url: "/subgoal/instr_click/",
		data: {
			csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
		},
	}).done(function(data){
		console.log("/subgoal/instr_click/ success:", data["success"]);
		playVideo();
	}).fail(function(){
		console.log("/subgoal/instr_click/ failure");
		playVideo();
	}).always(function(){
	});	
}

$("body").on('click', '.jqiclose', function(e){
	console.log("close button clicked")
	tutClicked();
});
