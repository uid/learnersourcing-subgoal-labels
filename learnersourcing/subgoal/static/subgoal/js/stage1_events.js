$(function() {
	enableEvents();

	$("body").on('blur', '.movable', function(e) {
		$("#sortable").sortable({cancel:".frozen"})
	})

	$(document).keypress(function(e) {
	    if(e.which == 13) {
	        $("#sortable").sortable({cancel:".frozen"})
	    }
	});

	$("body").on('click', '.delButton', function(e) {
		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/delete/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"], 
				subgoal_id: $(this).parent().attr("data-subgoal-id"), 
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("success:", data["success"]);
			// TODO: do something for failure
		}).fail(function(){
			console.log("ajax failed");
		}).always(function(){
		});	

		// frontend update
		$($(this).parent()).remove();
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
		$($(this).siblings()[2]).toggle();
	});

	$("body").on('click', '.saveButton', function(e) {
		//replace text with uneditable text box
		text = $($(this).siblings()[0]).val()
		console.log($($(this).siblings()[0]))

		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/update/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"], 
				subgoal_id: $(this).parent().attr("data-subgoal-id"), 
				label: text,
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("success:", data["success"]);
			// TODO: do something for failure
		}).fail(function(){
			console.log("ajax failed");
		}).always(function(){
		});	

		// frontend update		
		var uneditable = $("<span class='sub'></span>")
		uneditable.text(text)
		$($(this).siblings()[0]).replaceWith(uneditable);

		// enableSubgoalClick()

		//switch buttons
		$(this).toggle();
		$($(this).siblings()[2]).toggle();
	});

	$("body").on('click', '.addButton', function(e) {
		e.preventDefault();
		var $li = $("<li class='movable subgoal'><span class='sub'>New label</span>" + 
			"<button type='button' class='delButton permButton'>Delete</button>" + 
			"<button type='button' class='editButton permButton'>Edit</button>" + 
			"<button type='button' class='saveButton permButton'>Save</button></li>");
		$("#sortable").prepend($li);
		enableEvents();
		// enableSubgoalClick()

		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/create/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"], 
				time: 0,
				label: "New label",
				// hard-coded for now since there's no login
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("success:", data["success"]);
			$li.attr("data-subgoal-id", data["subgoal_id"]);
			// TODO: do something for failure
		}).fail(function(){
			console.log("ajax failed");
		}).always(function(){
		});			
	});	

});

	// event handler for dragging around a subgoal
	// updates the time information
	$("#sortable").on("sortstop", function(event, ui) {
		// get the nearest next step, and use its time
		var $next_step = ui.item.next(".frozen");
		var time = step_times[$next_step.attr("id")];
		console.log("sort stopped", ui.item.attr("data-subgoal-id"), time);
		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/move/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"], 
				subgoal_id: ui.item.attr("data-subgoal-id"), 
				time: time,
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("success:", data["success"]);
			// TODO: do something for failure
		}).fail(function(){
			console.log("ajax failed");
		}).always(function(){
		});			
	});

function enableEvents() {
	$("#sortable").sortable({
		cancel:".frozen"
	});

}
