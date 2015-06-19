
function escapeHTML(text){
	return $('<div/>').text(text).html();
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function isInt(n) {
   return typeof n === 'number' && n % 1 == 0;
}

function generate_steps(steps) {
    for (step in steps) {
        new_step = "<li class='frozen' id='"+step+"'><span class='time_marker'>>></span>" +
        	escapeHTML(steps[step]) + "</li>"
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

// only for stage 3
// given a subgoal time and the one after, find all steps for this subgoal
// assuming: 1) subgoals sorted by time, 2) all subgoals have unique times
function group_steps(subgoals, steps, step_times){
	var step_groups = {};
	for (var i=0; i<subgoals.length; i++){
		var time_now = subgoals[i][0]["time"];
		if (i == subgoals.length - 1)
			var time_next = 1000000; // arbitrarily large
		else
			var time_next = subgoals[i + 1][0]["time"];

		if (time_now == time_next)
			continue;
		for (var step in step_times){
			var time = step_times[step];
			if (time_now <= time && time < time_next){
				var key = "sub" + (i+1);
				if (!(key in step_groups))
					step_groups[key] = [];
				// ignore dummy step at the beginning
				if (step != "step0")
					step_groups[key].push(step);
			}
		}
	}
	console.log(step_groups);
	return step_groups;
}


function group_subgoals(subgoals, steps, step_times) {
	var group_times = {}
	var temp_step = 'step0'
	var prev_subgoals = new Array()
	var rel_steps = new Array()
	for (var step in steps) {
		var cur_subgoals = new Array()
		for (var sub in subgoals) {
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

	var actual_groups = {}
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
			"<span class='sub "+sub+"'>"+
			subgoals[sub]["label"] + "</span>" +
			"<button type='button' class='delButton permButton'>Delete</button>" +
			"<button type='button' class='undelButton permButton'>Undelete</button>" +
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

function getYouTubeAuthor(id) {
    $.ajax({
        url: "http://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=json",
        dataType: "jsonp",
        success: function (data) {
        	var author = data.entry.author[0].name.$t;
        	console.log(author);
		    $("#video_author").append("By: "+author);
		    $("#video_author").attr("href","https://www.youtube.com/user/"+author);
        }
    });
}


