// all subgoal operations
var Subgoal = function() {
	// all subgoals to be accessed in the frontend
	var data = [];

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
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/delete/ failure");
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
			// $li.attr("data-subgoal-id", data["subgoal_id"]);
			// TODO: do something for failure
		}).fail(function(){
			console.log("/subgoal/vote/ failure");
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
			var new_subgoal = "<li class='movable subgoal' data-subgoal-id='" + Subgoal.data[i]["id"] + "'>" + 
				"<span class='sub sub" + (parseInt(i)+1) + "'>" +
				Subgoal.data[i]["label"] + "</span>" + 
				"<button type='button' class='delButton permButton'>Delete</button>" +
				"<button type='button' class='editButton permButton'>Edit</button>" +
				"<button type='button' class='saveButton permButton'>Save</button>" +
				"</li>";
			// old
			// var first_step = data[sub]['steps'][0]
			// new: traverse the steps list and find the closest one
			var time = Subgoal.data[i]["time"];
			var first_step = find_closest_step(time, step_times);
			// console.log(first_step);
			$("#"+first_step).before(new_subgoal);
			// console.log(data[sub]['steps'][0])
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
		opMove: opMove,
		opVote: opVote,
		group: group,
		displayAll: displayAll,
		getCurrentGroup: getCurrentGroup,
		getSubgoalByID: getSubgoalByID,
		getSubgoalDivByID: getSubgoalDivByID
	}
}();