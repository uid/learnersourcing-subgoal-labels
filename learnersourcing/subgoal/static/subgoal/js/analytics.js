$("body").on('click', '.video_bar', function(e) {
	//toggle up caret
	$($(this).children()[0]).toggle()

	//toggle down caret
	$($(this).children()[1]).toggle()

	//toggle video content
	$($(this).siblings()[0]).toggle()
});

$("body").on('click', '#expand_all', function(e) {
	$(".up_caret").hide();
	$(".down_caret").show();
	$(".video_content").show();
});

$("body").on('click', '#collapse_all', function(e) {
	$(".up_caret").show();
	$(".down_caret").hide();
	$(".video_content").hide();
});

$("body").on('click', '.show_s1_votes', function(e) {
	console.log($(this).siblings('.sub_wrap_left'))
	$($(this).siblings('.sub_wrap_left').children('.small_details')).toggle()
	$($(this).siblings('.sub_wrap_right').children('.small_details')).toggle()
	$(this).toggleClass('blue');
});

$("body").on('click', '.show_s2_votes', function(e) {
	$(this).toggleClass('blue');
});

for (i in videos_list) {
	var video_html = "<div class='each_video' id='"+videos_list[i]['video'][0].id+"'>" +
				"<div class='video_bar'>" +
				"<span class='up_caret'>^</span>" +
				"<span class='down_caret'>v</span>" +
				"<span class='video_name'>"+videos_list[i]['video'][0].title+"</span>" +
				"</div>" +
				"<div class='video_content'>" +
				"<div class='metric total_activity_label'>Number of actions: "+videos_list[i]['activity']+"</div>"+
				"<div class='metric total_subgoals_label'>Number of subgoals: "+videos_list[i]['subcount']+"</div>"+
				"<div class='metric total_users_label'>Number of users: "+videos_list[i]['users']+"</div>"+
				// "<span class='show_s1_votes'>Toggle vote details</span>" +
				// "<span class='show_s2_votes'>Show stage 2 votes</span>" +
				"</div></div>";
	$("#all_videos").append(video_html);
}

for (i in videos_list) {
	var id = videos_list[i]['video'][0].id
	var steps = videos_list[i]['steps']
	var subgoals = videos_list[i]['subgoals']
	subgoals = subgoals.sort(compare_votes)
	var exp = videos_list[i]['exp']
	var duration = videos_list[i]['video'][0].duration
	time_group = generateTimes(duration)

	for (t in time_group) {
		//TODO fix the time interval (make it global)
		time_string = (parseInt(time_group[t])-30).toString();
		if (time_group[t]%60 == 0) {
			$time_line = $("<div class='time_line'>"+(parseInt(time_group[t])-30).toString()+"</div>")
			$("#"+id+"> .video_content").append($time_line)
		} else {
			$time_line = $("<div class='green_line'>"+(parseInt(time_group[t])-30).toString()+"</div>")
			$("#"+id+"> .video_content").append($time_line)
		}
		

		var subgoalTestGroup = getCurrentAnaGroup(time_group[t], subgoals);
		var stepGroup = getCurrentStepGroup(time_group[t], steps);
		for (sub in subgoalTestGroup) {	
			sub_time = subgoalTestGroup[sub].time
			sub_id = subgoalTestGroup[sub].id
			if (typeof(subgoals_list[sub_id])!= 'undefined') {
				step_stage = subgoals_list[sub_id][0]
				rand_stage = subgoals_list[sub_id][1]
			} else {
				//adding a default value? Not sure what should be here TODO
				step_stage = 'True'
				rand_stage = 'True'
			}
			check_sub_classes(subgoalTestGroup[sub], step_stage, rand_stage)
		}

		//iterates through the steps and places steps together
		for (step in stepGroup) {
			var $step_html = $("<div class='step'>"+escapeHTML(stepGroup[step].label)+"</div>")
			var $rt_step_html = $("<div class='step'>"+escapeHTML(stepGroup[step].label)+"</div>")
			step_time = stepGroup[step].time
			$("#"+id+" > .video_content").append($step_html)
		}

		// $hztl_line = $("<div class='horizontal_line'></div>")
		// $("#"+id+"> .video_content").append($hztl_line)
	}
}

function getCurrentStepGroup(time, steps) {
	// TODO: expand the floor if question was skipped at floor
	var interval = 30
	var floor = time - interval;
	var group = [];
	for (var i in steps){
		if (floor <= steps[i].time && steps[i].time < time){
			group.push(steps[i]);
		}
	}
	// console.log(group)
	return group;
}

function place_an_subgoal(sub, classes, dir) {
	var $sub_html = $("<div class='sub_wrap_"+dir+"'><div class='sub "+classes+"'><span class='upvotes'>"+
			sub.upvotes_s2+"</span><span class='downvotes'>"+
			sub.downvotes_s2+"</span><span class='sublabel'>"+
			escapeHTML(sub.label)+"</span></div>"+
			"<div class='small_details'><span class='steps_votes'>Steps votes: </span><span class='upvotes'>"+
			sub.upvotes_s2+"</span><span class='downvotes'>"+
			sub.downvotes_s2+"</span><span class='sublabel'>"+
			"<span class='no_steps_votes'>No steps votes: </span><span class='upvotes'>"+
			sub.upvotes_s2+"</span><span class='downvotes'>"+
			sub.downvotes_s2+"</span><span class='sublabel'></div></div>");
		$("#"+id+"> .video_content").append($sub_html)
}

function generateTimes(t) {
	//replace 30 if interval changes
	var interval = 30;
	var num_groups = Math.floor(t/interval);
	var time_group = [];
	for (i=0; i < num_groups; i++) {
		time_group.push(interval*(i+1));
	}
	// console.log(time_group)
	return time_group

}

function check_sub_classes(sub, step_stage, rand_stage) {
	if (step_stage == 'True') {
		if (rand_stage == 'True') {
			dir = 'left'
			classes = 'an_sub dot_sub'
			place_an_subgoal(sub, classes, dir)
		} else {
			dir = 'left'
			classes = 'an_sub sol_sub'
			place_an_subgoal(sub, classes, dir)
		}
	} else {
		if (rand_stage == 'True') {
			dir = 'right'
			classes = 'an_sub_right dot_sub'
			place_an_subgoal(sub, classes, dir)
		} else {
			dir = 'right'
			classes = 'an_sub_right sol_sub'
			place_an_subgoal(sub, classes, dir)
		}
	}
}

function compare_votes(a,b) {
  if (a.upvotes_s2 < b.upvotes_s2)
     return 1;
  if (a.upvotes_s2 > b.upvotes_s2)
    return -1;
  return 0;
}

function getCurrentAnaGroup(t, subs){
	var interval = 30
	var floor = t - interval;
	var group = [];
	for (var i in subgoals){
		if (floor <= subgoals[i].time && subgoals[i].time < t){
			group.push(subgoals[i]);
		}
	}	
	// console.log(group)
	return group;
}

//generates horizontal bar graph with bar labels
function generate_graph(dict, graph) {
	// var dict = actions_per_vid_list;
	var keys = []
	var max = 0

	for (d in dict) {
		keys.push(d)
		if (dict[d]>max) {
			max = dict[d]
		}
	}

	var bar_height = 20
	var height = bar_height*keys.length;

	var x = d3.scale.linear()
	    .domain([0, max])
	    .range([0, 800]);

	y = d3.scale.ordinal()
		.domain(keys)
		.rangeBands[0, height];

	var graph = d3.select("#"+graph)
		.append('svg')
		.attr('width', 1000)
		.attr('height', height);

	graph.selectAll("rect")
	    .data(keys)
	  	.enter().append("rect")
	  	.attr("x", 100)
	  	.attr("y", function(d,i) {
			return i*bar_height;
		})
	    .attr("width", function(d) { return x(dict[d]) + "px"; })
	    .attr("height", bar_height);

	graph.selectAll(".numtext")
		.data(keys)
		.enter().append("text")
		.attr("x", function(d){return x(dict[d])+120+"px";})
		.attr("y", function(d,i){return (i+1)*bar_height-(bar_height/3.5)})
		.attr("text-anchor", 'end')
		.text(function(d){return dict[d]})

	graph.selectAll('.bartext')
		.data(keys)
		.enter().append("text")
		.attr("x", 50)
		.attr("y", function(d,i) {
			return (i+1)*bar_height-(bar_height/2);
		})
		.attr("class","bartext")
		.attr("text-anchor", "middle")
		// .attr("fill", "black")
		.text(String);
}

generate_graph(actions_per_vid_list, 'an_graph')
generate_graph(subs_per_vid_list, 'sub_graph')
generate_graph(users_per_vid_list, 'users_graph')
