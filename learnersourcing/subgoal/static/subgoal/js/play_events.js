$(function() {
	enableEvents();

	$("body").on('blur', '.movable', function(e) {
		//SWEIR
		// $("#sortable").sortable({cancel:".frozen"})
	})

	$(document).keypress(function(e) {
	    if(e.which == 13) {
	    	//SWEIR
	        // $("#sortable").sortable({cancel:".frozen"})
	    }
	});

	//printArea code
	$("body").on('click', '.printButton', function(e) {
		// $("body").printArea({mode:'iframe'});
		window.print();
	});

	$("body").on('click', '.delButton', function(e) {
		var subgoal_id = $(this).parent().attr("data-subgoal-id");
		Subgoal.opDelete(subgoal_id);
		// backend update
		// $.ajax({
		// 	type: "POST",
		// 	url: "/subgoal/delete/",
		// 	data: {
		// 		csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
		// 		stage: stage,
		// 		video_id: video["id"], 
		// 		subgoal_id: $(this).parent().attr("data-subgoal-id"), 
		// 		// TODO: add the current user's info
		// 		learner_id: 1
		// 	},
		// }).done(function(data){
		// 	console.log("/subgoal/delete/ success:", data["success"]);
		// 	// TODO: do something for failure
		// }).fail(function(){
		// 	console.log("/subgoal/delete/ failure");
		// }).always(function(){
		// });	

		// frontend update
		$($(this).siblings()[0]).addClass('strikeout');
		$($(this).siblings()[2]).attr("disabled", "disabled");
		$(this).toggle();
		$($(this).siblings()[1]).toggle();
	});

	$("body").on('click', '.undelButton', function(e) {
		var subgoal_id = $(this).parent().attr("data-subgoal-id");

		//TODO: WHAT ACTION FOR IF SUBGOAL RE-ADDED
		Subgoal.opUnDelete(subgoal_id);

		// frontend update
		$($(this).siblings()[0]).removeClass('strikeout');
		$($(this).siblings()[2]).removeAttr("disabled");
		$(this).toggle();
		$($(this).siblings()[1]).toggle();
	});

	$("body").on('click', '.editButton', function(e) {
		//replace div with textarea for editing purposes
		text = $($(this).siblings()[0]).text()
		var editableText = $("<textarea class='editText'></textarea>");
		editableText.val(text)
		$($(this).siblings()[0]).replaceWith(editableText);
		editableText.focus();
		// $("body").off('click', '.movable')

		$("#sortable").sortable({
		    cancel: ".editText"
		});

		//switch buttons
		$(this).toggle();
		$($(this).siblings()[3]).toggle();
	});

	$("body").on('click', '.saveButton', function(e) {
		//replace text with uneditable text box
		var text = $($(this).siblings()[0]).val()
		var subgoal_id = $(this).parent().attr("data-subgoal-id");
		console.log($($(this).siblings()[0]))

		Subgoal.opUpdate(subgoal_id, text);
		// backend update
		// $.ajax({
		// 	type: "POST",
		// 	url: "/subgoal/update/",
		// 	data: {
		// 		csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
		// 		stage: stage,
		// 		video_id: video["id"], 
		// 		subgoal_id: $(this).parent().attr("data-subgoal-id"), 
		// 		label: text,
		// 		// TODO: add the current user's info
		// 		learner_id: 1
		// 	},
		// }).done(function(data){
		// 	console.log("/subgoal/update/ success:", data["success"]);
		// 	// TODO: do something for failure
		// }).fail(function(){
		// 	console.log("/subgoal/update/ failure");
		// }).always(function(){
		// });	

		// frontend update		
		var uneditable = $("<span class='sub'></span>")
		uneditable.text(text)
		$($(this).siblings()[0]).replaceWith(uneditable);

		// enableSubgoalClick()

		//switch buttons
		$(this).toggle();
		$($(this).siblings()[3]).toggle();
	});

	$("body").on('click', '.addButton', function(e) {
		e.preventDefault();
		var label = "New label";
		var $li = Subgoal.getNewSubgoalHTML(label);
		// var $li = $("<li class='movable subgoal'><span class='sub'>" + label + "</span>" + 
		// 	"<button type='button' class='delButton permButton'>Delete</button>" + 
		// 	"<button type='button' class='editButton permButton'>Edit</button>" + 
		// 	"<button type='button' class='saveButton permButton'>Save</button></li>");
		$("#sortable").prepend($li);
		enableEvents();
		// enableSubgoalClick()
		Subgoal.opCreate($li, 0, label);
		// backend update
		// $.ajax({
		// 	type: "POST",
		// 	url: "/subgoal/create/",
		// 	data: {
		// 		csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
		// 		stage: stage,
		// 		video_id: video["id"], 
		// 		time: 0,
		// 		label: "New label",
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
	});	

});

	// event handler for dragging around a subgoal
	// updates the time information
	$("#sortable").on("sortstop", function(event, ui) {
		// get the nearest next step, and use its time
		var $next_step = ui.item.next(".frozen");
		var time = step_times[$next_step.attr("id")];
		var subgoal_id = ui.item.attr("data-subgoal-id");
		console.log("sort stopped", subgoal_id, time);
		Subgoal.opMove(subgoal_id, time);
		// backend update
		// $.ajax({
		// 	type: "POST",
		// 	url: "/subgoal/move/",
		// 	data: {
		// 		csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
		// 		stage: stage,
		// 		video_id: video["id"], 
		// 		subgoal_id: ui.item.attr("data-subgoal-id"), 
		// 		time: time,
		// 		// TODO: add the current user's info
		// 		learner_id: 1
		// 	},
		// }).done(function(data){
		// 	console.log("/subgoal/move/ success:", data["success"]);
		// 	// TODO: do something for failure
		// }).fail(function(){
		// 	console.log("/subgoal/move/ failure");
		// }).always(function(){
		// });			
	});

	$("body").on('click', '.q_choice', function(e) {
		// buttonEnable(this);
		if ($(this).is(':checked')) {
			$(".submitbutton").removeAttr('disabled')
		} else {
			$(".submitbutton").attr('disabled', 'disabled');
		}
		$(".submitbutton").removeClass('disabledButton');
	});

	$("body").on('click', '.q_input', function(e) {
		console.log("INPUT CLICKED")
		$(".q_new").prop('checked', 'true')
		$(".submitbutton").removeAttr('disabled')
		$(".submitbutton").removeClass('disabledButton');
	});

	$("body").on('click', '.q_input_2', function(e) {
		console.log("INPUT CLICKED")
		$(".q_new_2").prop('checked', 'true')
		$(".submitbutton").removeAttr('disabled')
		$(".submitbutton").removeClass('disabledButton');
	});

	//adding event handlers for random events to log
	$("body").on('click', '#page_title', function(e) {
		e.preventDefault();
		Subgoal.opSiteAction('clicked_page_title', '/');
	});

	$("body").on('click', '#about_link', function(e) {
		e.preventDefault();
		Subgoal.opSiteAction('clicked_about_link', '/about');
	});

	$("body").on('click', '#help_link', function(e) {
		e.preventDefault();
		Subgoal.opSiteAction('clicked_help_link', '/help');
		// window.location = '/help';
	});

	$("body").on('click', '.help_page_title', function(e) {
		Subgoal.opSiteAction('clicked_help_page_title', 'none');
	});

	$("body").on('click', '.video_link', function(e) {
		e.preventDefault();
		var vid_url = $(this).children().attr("href");
		var vid_id = vid_url.slice(6,8);
		Subgoal.opVidAction('clicked_video', vid_id, vid_url);
	});

	// $('.frozen').hover(function(){
	// 	$(this).toggleClass('blue');
	// });

function buttonEnable(obj) {
	if ($(obj).is(':checked')) {
		$(".submitbutton").removeAttr('disabled')
	} else {
		$(".submitbutton").attr('disabled', 'disabled');
	}
}

function enableEvents() {
	//SWEIR
	// $("#sortable").sortable({
	// 	cancel:".frozen",
	// 	cancel:".movable",
	// });

	$(".submitbutton").attr('disabled', 'disabled');

}
