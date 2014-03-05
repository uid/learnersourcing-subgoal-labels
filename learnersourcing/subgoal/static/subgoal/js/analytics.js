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

for (i in videos_list) {
	// console.log(i)
	var video_html = "<div class='each_video' id='"+videos_list[i]['video'][0].id+"'>" +
				"<div class='video_bar'>" +
				"<span class='up_caret'>^</span>" +
				"<span class='down_caret'>v</span>" +
				"<span class='video_name'>"+videos_list[i]['video'][0].title+"</span>" +
				"</div>" +
				"<div class='video_content'>" +
				// "<div class='an_left'><div class='exp_label'>STEPS</div></div>" +
				// "<div class='an_right'><div class='exp_label'>NO STEPS</div></div>" +
				"</div></div>";
	$("#all_videos").append(video_html);
}

for (i in videos_list) {
	// if (videos_list[i]['video'][0].is_used == true) {
		var id = videos_list[i]['video'][0].id
		// console.log(id)
		var steps = videos_list[i]['steps']
		var subgoals = videos_list[i]['subgoals']
		var exp = videos_list[i]['exp']
		// console.log(steps)
		for (step in steps) {
			var $step_html = $("<div class='step'>"+escapeHTML(steps[step].label)+"</div>")
			var $rt_step_html = $("<div class='step'>"+escapeHTML(steps[step].label)+"</div>")
			step_time = steps[step].time
			
			// console.log("step_time "+step_time)
			for (sub in subgoals) {	
				sub_time = subgoals[sub].time
				sub_id = subgoals[sub].id
				sub_stage = subgoals_list[sub_id]
				if (step > 0) {
					// console.log('here')
					prev_step_time = steps[step-1].time
					if (sub_time > prev_step_time && sub_time <= step_time) {
						if (sub_stage == 'True') {
							var $sub_html = $("<div class='sub an_sub'><span class='upvotes'>"+
								subgoals[sub].upvotes_s2+"</span><span class='downvotes'>"+
								subgoals[sub].downvotes_s2+"</span><span class='sublabel'>"+
								escapeHTML(subgoals[sub].label)+"</span></div>");
							$("#"+id+"> .video_content").append($sub_html)
						} else {
							var $sub_html = $("<div class='sub an_sub_right'><span class='upvotes'>"+
								subgoals[sub].upvotes_s2+"</span><span class='downvotes'>"+
								subgoals[sub].downvotes_s2+"</span><span class='sublabel'>"+
								escapeHTML(subgoals[sub].label)+"</span></div>");
							$("#"+id+"> .video_content").append($sub_html)
						}
					}
				} else {
					if (sub_time <= step_time) {
						if (sub_stage == 'True') {
							var $sub_html = $("<div class='sub an_sub'><span class='upvotes'>"+
								subgoals[sub].upvotes_s2+"</span><span class='downvotes'>"+
								subgoals[sub].downvotes_s2+"</span><span class='sublabel'>"+
								escapeHTML(subgoals[sub].label)+"</span></div>");
							$("#"+id+"> .video_content").append($sub_html)
						} else {
							var $sub_html = $("<div class='sub an_sub_right'><span class='upvotes'>"+
								subgoals[sub].upvotes_s2+"</span><span class='downvotes'>"+
								subgoals[sub].downvotes_s2+"</span><span class='sublabel'>"+
								escapeHTML(subgoals[sub].label)+"</span></div>");
							$("#"+id+"> .video_content").append($sub_html)
						}
					}
				}
			}
			// console.log($("#"+id+" > .video_content > .an_left"))
			// console.log($step_html)
			$("#"+id+" > .video_content").append($step_html)
			// $("#"+id+" > .video_content > .an_right").append($rt_step_html)
		}
	// }
	
}
