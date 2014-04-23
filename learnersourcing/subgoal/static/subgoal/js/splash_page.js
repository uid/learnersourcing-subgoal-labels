//go through each video on the home splash page and generate metadata for each one

console.log(videos)

//generates basic video divs from objects in backend
function create_video_divs() {
	var domains = [];
	for (v in videos) {
		if (videos[v].is_used) {
			if (domains.indexOf(videos[v].domain) <= -1) {
				domains.push(videos[v].domain)
			}
		}
	}
	for (d in domains) {
		new_subtitle = "<div class='splash_page_subtitle' id='"+domains[d]+"''>"+domains[d]+" tutorials</div>"
		$(".videos_wrapper").append(new_subtitle)
		for (v in videos) {
      if (!(videos[v].is_used))
        continue
			if (videos[v].domain == domains[d]) {
				new_video = "<div class='video_link video_id_"+videos[v].id+"' id='"+videos[v].youtube_id+"'>\
						<a class='actual_link'><span class='empty_span'></span></a>\
						<div class='video_link_title'></div>\
						<div class='video_link_description'></div>\
						<div class='video_link_length'></div>\
						<img class='video_thumb' ></img></div>"
				$(".videos_wrapper").append(new_video)
			}
		}
	}
}

//blanket function for populating video divs with information from youtube api
function populate_video_divs() {
	$(".video_link").each(function(index, el) {
		video_id = $(el).attr('id');
		getYouTubeInfo(video_id)
	})
}

//calls youtube api for video metadata
function getYouTubeInfo(id) {
	$('#'+id+'>img.video_thumb').attr('src', 'http://img.youtube.com/vi/'+id+'/0.jpg')
	// $('#'+id+'>.actual_link').attr('href', 'http://www.youtube.com/watch?v='+id)

	pre_id = $('#'+id).attr('class')
	int_id = pre_id.replace('video_link video_id_', '')
	$('#'+id+'>.actual_link').attr('href', '/play/'+int_id)
    $.ajax({
        url: "http://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=json",
        dataType: "jsonp",
        success: function (data) { 
        	var title = data.entry.title.$t;
		    var long_description = data.entry.media$group.media$description.$t;
		    var description = long_description.substring(0,100);
		    var duration = data.entry.media$group.yt$duration.seconds;
		    time = convert_sec_to_time(duration);
		    $("#"+id+">.video_link_title").text(title)
		    $("#"+id+">.video_link_description").text(description)
		    $("#"+id+">.video_link_length").text("Duration: "+time)
        }
    });
}

function convert_sec_to_time(sec) {
	//uncomment below lines for adding hours

	// var hours = parseInt( sec / 3600 ) % 24;
	var minutes = parseInt( sec / 60 ) % 60;
	var seconds = parseInt( sec % 60, 10);
	// var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);

	var result = (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
	return result
}

$(document).ready(function () {
	create_video_divs()
    populate_video_divs();
    briefCheck('splash');
});
