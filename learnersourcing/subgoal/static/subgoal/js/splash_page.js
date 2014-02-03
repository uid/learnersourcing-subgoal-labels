//go through each video on the home splash page and generate metadata for each one

function populate_video_divs() {
	$(".video_link").each(function(index, el) {
		video_id = $(el).attr('id');
		getYouTubeInfo(video_id)
	})
}

function getYouTubeInfo(id) {
	$('#'+id+'>img.video_thumb').attr('src', 'http://img.youtube.com/vi/'+id+'/0.jpg')
	$('#'+id+'>.actual_link').attr('href', 'http://www.youtube.com/watch?v='+id)
    $.ajax({
        url: "http://gdata.youtube.com/feeds/api/videos/"+id+"?v=2&alt=json",
        dataType: "jsonp",
        success: function (data) { 
        	console.log(data)
        	var title = data.entry.title.$t;
		    var long_description = data.entry.media$group.media$description.$t;
		    var description = long_description.substring(0,100);
		    var duration = data.entry.media$group.yt$duration.seconds;
		    console.log(duration)
		    $("#"+id+">.video_link_title").text(title)
		    $("#"+id+">.video_link_description").text(description)
		    $("#"+id+">.video_link_length").text("Duration: "+duration+" seconds")
        }
    });
}

$(document).ready(function () {
    populate_video_divs();
});