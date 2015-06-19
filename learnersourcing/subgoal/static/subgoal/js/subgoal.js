// all subgoal operations
var Subgoal = function() {
	// all subgoals to be accessed in the frontend
	var data = [];


	function getNewSubgoalHTML(label){
		return $("<li class='movable subgoal'>" +
			"<span class='sub'>" + escapeHTML(label) + "</span>" +
			"<button type='button' class='delButton permButton'>Delete</button>" +
			"<button type='button' class='undelButton permButton'>Undelete</button>" +
			"<button type='button' class='editButton permButton'>Edit</button>" +
			"<button type='button' class='saveButton permButton'>Save</button></li>");
	}

	function getSubgoalHTML(id, label){
		return $li = $("<li class='movable subgoal' data-subgoal-id='" + id + "'>" +
			"<span class='sub'>" + escapeHTML(label) + "</span>" +
			"<button type='button' class='delButton permButton'>Delete</button>" +
			"<button type='button' class='undelButton permButton'>Undelete</button>" +
			"<button type='button' class='editButton permButton'>Edit</button>" +
			"<button type='button' class='saveButton permButton'>Save</button></li>");
	}


	function opCreate($li, t, label, isVoted){
		isVoted = typeof isVoted !== 'undefined' ? isVoted : false;
		var data = {
			csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
			stage: stage,
			video_id: video["id"],
			time: t,
			label: label,
			// hard-coded for now since there's no login
			// TODO: add the current user's info
			learner_id: 1
		};
		if (isVoted)
			data["is_vote"] = 1;

		$.ajax({
			type: "POST",
			url: "/subgoal/create/",
			data: data
		}).done(function(data){
			console.log("/subgoal/create/ success:", data["success"]);
			$li.attr("data-subgoal-id", data["subgoal_id"]);
			var new_subgoal = JSON.parse(data["subgoal"])[0];
			if (typeof new_subgoal !== "undefined" && "id" in new_subgoal && "time" in new_subgoal && "label" in new_subgoal){
				// console.log(new_subgoal);
				Subgoal.data.push(new_subgoal);
				Subgoal.data.sort(function(a, b) {return a["time"] - b["time"]});
			}
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/create/ failure");
		}).always(function(){
		});
	}

	function opUpdate(subgoal_id, text){
		$.ajax({
			type: "POST",
			url: "/subgoal/update/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"],
				subgoal_id: subgoal_id,
				label: text,
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("/subgoal/update/ success:", data["success"]);
			// this is possible because Javascript is call by reference
			var subgoal = Subgoal.getSubgoalByID(subgoal_id);
			if (typeof subgoal !== "undefined")
				subgoal["label"] = text;
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/update/ failure");
		}).always(function(){
		});
	}

	function opDelete(subgoal_id){
		$.ajax({
			type: "POST",
			url: "/subgoal/delete/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"],
				subgoal_id: subgoal_id,
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("/subgoal/delete/ success:", data["success"]);
			// this is possible because Javascript is call by reference
			var index = Subgoal.getSubgoalIndexByID(subgoal_id);
			if (index > -1){
				Subgoal.data.splice(index, 1);
			}
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/delete/ failure");
		}).always(function(){
		});

	}

	function opUnDelete(subgoal_id){
		$.ajax({
			type: "POST",
			url: "/subgoal/undelete/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"],
				subgoal_id: subgoal_id,
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("/subgoal/undelete/ success:", data["success"]);
			// this is possible because Javascript is call by reference
			var index = Subgoal.getSubgoalIndexByID(subgoal_id);
			if (index > -1){
				Subgoal.data.splice(index, 1);
			}
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/undelete/ failure");
		}).always(function(){
		});

	}

	function opMove(subgoal_id, t){
		$.ajax({
			type: "POST",
			url: "/subgoal/move/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"],
				subgoal_id: subgoal_id,
				time: t,
				// TODO: add the current user's info
				learner_id: 1
			},
		}).done(function(data){
			console.log("/subgoal/move/ success:", data["success"]);
			var subgoal = Subgoal.getSubgoalByID(subgoal_id);
			if (typeof subgoal !== "undefined"){
				subgoal["time"] = t;
				Subgoal.data.sort(function(a, b) {return a["time"] - b["time"]});
			}
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/move/ failure");
		}).always(function(){
		});
	}

	function opVote(votes){
		// backend update
		$.ajax({
			type: "POST",
			url: "/subgoal/vote/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				stage: stage,
				video_id: video["id"],
				votes: JSON.stringify(votes),
				// answer: $('input[name=step1]:radio:checked').val(),
				learner_id: 1
			},
		}).done(function(data){
			console.log("/subgoal/vote/ success:", data["success"]);
			var subgoal_id, vote_type, subgoal;
			for (subgoal_id in votes){
				vote_type = votes[subgoal_id];
				// console.log(subgoal_id, vote_type);
				subgoal = Subgoal.getSubgoalByID(subgoal_id);
				if (typeof subgoal !== "undefined" && vote_type in subgoal){
					subgoal[vote_type] = subgoal[vote_type] + 1;
				}
			}
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/vote/ failure");
		}).always(function(){
		});

	}

	function opSubmitPretest(userResponse){
		// backend update
		$.ajax({
			type: "POST",
			url: "/pretest/submit/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				video_id: video["id"],
				user_response: JSON.stringify(userResponse),
				exp_session_id: Experiment.id
			},
		}).done(function(data){
			console.log("/pretest/submit/ success:", data["success"]);
		}).fail(function(){
			console.log("/pretest/submit/ failure");
		}).always(function(){
		});
	}

	function opSubmitPosttest(userResponse){
		// backend update
		$.ajax({
			type: "POST",
			url: "/posttest/submit/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				video_id: video["id"],
				user_response: JSON.stringify(userResponse),
				exp_session_id: Experiment.id
			},
		}).done(function(data){
			console.log("/posttest/submit/ success:", data["success"]);
		}).fail(function(){
			console.log("/posttest/submit/ failure");
		}).always(function(){
		});
	}

	function opSiteAction(site_action, url) {
		$.ajax({
			type: "POST",
			url: "/subgoal/action/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				action: site_action,
				// answer: $('input[name=step1]:radio:checked').val(),
				learner_id: 1
			},
		}).done(function(data){
			console.log("/subgoal/action/ success:", data["success"]);
			if (url != 'none') {
				window.location = url;
			}
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/action/ failure");
		}).always(function(){
		});
	}

	function opVidAction(action_type, vid, url) {
		$.ajax({
			type: "POST",
			url: "/subgoal/vidaction/",
			data: {
				csrfmiddlewaretoken: document.getElementsByName('csrfmiddlewaretoken')[0].value,
				video_id: vid,
				action: action_type,
				// answer: $('input[name=step1]:radio:checked').val(),
				learner_id: 1
			},
		}).done(function(data){
			console.log("/subgoal/vidaction/ success:", data["success"]);
			if (url != 'none') {
				window.location = url;
			}
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/vidaction/ failure");
		}).always(function(){
		});
	}

	/* newer versions of group_subgoals and add_subgoals that do not rely on formatted_subgoals */
	function group(steps, step_times) {
		var group_times = {}
		var temp_step = 'step0'
		var prev_subgoals = new Array()
		var rel_steps = new Array()
		for (var step in steps) {
			var cur_subgoals = new Array()
			for (var i in Subgoal.data) {
				var time = Subgoal.data[i]["time"];
				var first_step = find_closest_step(time, step_times);

	//			if (Subgoal.data[i]['steps'][0] == step) {
				if (first_step == step){
					cur_subgoals.push("sub" + (parseInt(i) + 1))
					temp_step = step
				}
			}
			if (rel_steps.indexOf(temp_step) < 0) {
				rel_steps.push(temp_step)
				group_times[temp_step] = cur_subgoals
			}
		}
		rel_steps.push('end')

		var actual_groups = {}
		for (var i = 1; i < rel_steps.length; i++) {
			actual_groups[rel_steps[i]] = group_times[Object.keys(group_times)[i-1]]
		}

		console.log(actual_groups)
		console.log(group_times)
		console.log(rel_steps)
		return [actual_groups, group_times, rel_steps]
	}

	function displayAll(step_times) {
		for (var i in Subgoal.data) {
			// $li.attr("data-subgoal-id", data[sub]["id"]);
			var $li = Subgoal.getSubgoalHTML(Subgoal.data[i]["id"], Subgoal.data[i]["label"]);

			// traverse the steps list and find the closest one
			var time = Subgoal.data[i]["time"];
			var first_step = find_closest_step(time, step_times);
			if ($("#"+first_step).length > 0)
				$("#"+first_step).before($li);
			else // if no step info is available, simply append to the list
				$(".video_steps").append($li);
		}
	}

	// for the given time, return all subgoals within the most recent time interval
	function getCurrentGroup(t){
		// TODO: expand the floor if question was skipped at floor
		var floor = t - Experiment.questionInterval;
		var group = [];
		for (var i in Subgoal.data){
			if (floor <= Subgoal.data[i]["time"] && Subgoal.data[i]["time"] < t){
				group.push(Subgoal.data[i]);
			}
		}
		return group;
	}

	// find a subgoal data entry with ID
	function getSubgoalByID(subgoal_id){
		var result;
		for (var i in Subgoal.data){
			if (Subgoal.data[i]["id"] == subgoal_id)
				result = Subgoal.data[i];
		}
		return result;
	}

	// return the array index of a subgoal with ID
	function getSubgoalIndexByID(subgoal_id){
		var result = -1;
		for (var i in Subgoal.data){
			if (Subgoal.data[i]["id"] == subgoal_id)
				result = i;
		}
		return result;
	}

	// find a subgoal visual entry with ID
	function getSubgoalDivByID(subgoal_id){
		var result;
		$(".subgoal").each(function(){
			if ($(this).attr("data-subgoal-id") == subgoal_id)
				result = $(this);
		});
		return result;
	}


	return {
		data: data,
		opCreate: opCreate,
		opUpdate: opUpdate,
		opDelete: opDelete,
		opUnDelete: opUnDelete,
		opMove: opMove,
		opVote: opVote,
		opSiteAction: opSiteAction,
		opVidAction: opVidAction,
		opSubmitPretest: opSubmitPretest,
		opSubmitPosttest: opSubmitPosttest,
		group: group,
		displayAll: displayAll,
		getCurrentGroup: getCurrentGroup,
		getSubgoalByID: getSubgoalByID,
		getSubgoalIndexByID: getSubgoalIndexByID,
		getSubgoalDivByID: getSubgoalDivByID,
		getNewSubgoalHTML: getNewSubgoalHTML,
		getSubgoalHTML: getSubgoalHTML
	}
}();