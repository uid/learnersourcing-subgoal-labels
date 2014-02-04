

function isInt(n) {
   return typeof n === 'number' && n % 1 == 0;
}

function generate_steps(steps) {
    for (step in steps) {
        new_step = "<li class='frozen' id='"+step+"'><span class='time_marker'>>></span>"+steps[step]+"</li>"
        $(".video_steps").append(new_step);
    }
}

function load_video_title(title) {
    $("#video_title").append(title)
}

// given a subgoal time, find the closest step
function find_closest_step(time, step_times){
	var result = "";
	for (var i = 0; i < Object.keys(step_times).length - 1; i++) {
		// console.log(time, step_times[Object.keys(step_times)[i]]);
		if (time >= step_times[Object.keys(step_times)[i]] && time <= step_times[Object.keys(step_times)[i+1]]) {
			result = Object.keys(step_times)[i+1];
			break;
		}
	}
	return result;
}


function group_subgoals(subgoals, steps, step_times) {
	group_times = {}
	temp_step = 'step0'
	prev_subgoals = new Array()
	rel_steps = new Array()
	for (step in steps) {
		cur_subgoals = new Array()
		for (sub in subgoals) {
			var time = subgoals[sub]["time"];
			var first_step = find_closest_step(time, step_times);

//			if (subgoals[sub]['steps'][0] == step) {
			if (first_step == step){
				cur_subgoals.push(sub)
				temp_step = step
			}
		}
		if (rel_steps.indexOf(temp_step) < 0) {
			rel_steps.push(temp_step)
			group_times[temp_step] = cur_subgoals
		}
	}
	rel_steps.push('end')

	actual_groups = {}
	for (i = 1; i < rel_steps.length; i++) {
		actual_groups[rel_steps[i]] = group_times[Object.keys(group_times)[i-1]]
	}

	console.log(actual_groups)
	console.log(group_times)
	console.log(rel_steps)
	return [actual_groups, group_times, rel_steps]
}

function add_subgoals(subgoals, step_times) {
	for (var sub in subgoals) {
		// $li.attr("data-subgoal-id", subgoals[sub]["id"]);
		var new_subgoal = "<li class='movable subgoal' data-subgoal-id='" + subgoals[sub]["id"] + "'>" + 
			"<span contenteditable='true' class='sub "+sub+"'>"+
			subgoals[sub]["label"] + "</span>" + 
			"<button type='button' class='delButton permButton'>Delete</button>" +
			"<button type='button' class='editButton permButton'>Edit</button>" +
			"<button type='button' class='saveButton permButton'>Save</button>" +
			"</li>";
		// old
		// var first_step = subgoals[sub]['steps'][0]
		// new: traverse the steps list and find the closest one
		var time = subgoals[sub]["time"];
		var first_step = find_closest_step(time, step_times);
		// console.log(first_step);
		$("#"+first_step).before(new_subgoal)
		// console.log(subgoals[sub]['steps'][0])
	}
}