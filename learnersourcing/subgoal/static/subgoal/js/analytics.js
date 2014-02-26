$("body").on('click', '.video_bar', function(e) {
	//toggle up caret
	$($(this).children()[0]).toggle()

	//toggle down caret
	$($(this).children()[1]).toggle()

	//toggle video content
	$($(this).siblings()[0]).toggle()
});

$("body").on('click', '#expand_all', function(e) {
	$(".up_caret").toggle();
	$(".down_caret").toggle();
	$(".video_content").toggle();
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
				"</div></div>";
	$("#all_videos").append(video_html);
}

for (i in videos_list) {
	if (videos_list[i]['video'][0].is_used == true) {
		var id = videos_list[i]['video'][0].id
		var steps = videos_list[i]['steps']
		var subgoals = videos_list[i]['subgoals']
		// console.log(steps)

		for (step in steps) {
			var $step_html = $("<div class='step'>"+steps[step].label+"</div>")
			step_time = steps[step].time
			
			for (sub in subgoals) {			
				sub_time = Math.floor(subgoals[sub].time)
				if (step_time == sub_time) {
					var $sub_html = $("<div class='sub an_sub'><span class='upvotes'>"+subgoals[sub].upvotes_s2+"</span><span class='downvotes'>"+subgoals[sub].downvotes_s2+"</span><span class='sublabel'>"+subgoals[sub].label+"</span></div>")
					$("#"+id+"> .video_content").append($sub_html)
				}
			}

			$("#"+id+"> .video_content").append($step_html)
		}
	}
	
}
