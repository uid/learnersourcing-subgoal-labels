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
		$($(this).parent()).remove()
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
		var $li = $("<li class='movable'><span class='sub'>New section title</span><button type='button' class='delButton permButton'>Delete</button><button type='button' class='editButton permButton'>Edit</button><button type='button' class='saveButton permButton'>Save</button></li>");
		$("#sortable").prepend($li);
		enableEvents();
		// enableSubgoalClick()
	});	
});

function enableEvents() {
	$("#sortable").sortable({cancel:".frozen"})

}
