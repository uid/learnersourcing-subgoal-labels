
// grab, parse, and render pre and post tests
var PrePostTest = function() {

    var reachedPretest = false;
    var reachedPosttest = false;

    function init() {
        grab_tests();
    }

    function grab_tests() {
        var pretest_content = [];
        var posttest_content = [];
        // load pre and post test questions
        $.getJSON( "/static/subgoal/data/pre-post.json", function( data ) {
            $.each( data, function(index, entry) {
                // console.log(entry["video_id"], video["id"]);
                if (entry["video_id"] == 0 || entry["video_id"] == video["id"]) {
                    if(entry["is_pretest"]) {
                        pretest_content.push(entry);
                    }
                    if(entry["is_posttest"]) {
                        posttest_content.push(entry);
                    }
                }
            });
            console.log(pretest_content.length, "pretests loaded.");
            console.log(posttest_content.length, "posttests loaded.");
            render_tests(pretest_content, posttest_content);
        });
    }

    function render_test(content, q_index, testtype){
        var question_type = content["question_type"];

        var $q = $("<div/>").addClass("test-question");
        $q.append("<strong>" + q_index + ". " + content["question"] + "</strong>");

        var choice_class = "";
        if (question_type == "multiple_choice") {
            choice_class = "mult_choice_options_" + testtype;
        } else if (question_type == "short_answer") {
            choice_class = "short_answer_field_" + testtype;
        } else if (question_type == "likert") {
            choice_class = "mult_choice_options_" + testtype;
        } else if (question_type == "long_answer") {
            choice_class = "long_answer_field_" + testtype;
        }

        var $choices = $("<div/>").addClass(choice_class);
        if (question_type == "multiple_choice") {
            var choices = content["choices"];
            for (var index in choices) {
                var $c = $("<label/>");
                var input_html = "<input type='radio' name='" + testtype + "_" + q_index + "' class='q_choice' value='" + choices[index]["value"] + "'>" + choices[index]["label"] + "</input>";
                $c.append(input_html);
                $c.append("<br/>");
                $choices.append($c);
            }
        } else if (question_type == "short_answer") {
            var $c = $("<span/>");
            var input_html = "<input type='text' class='q_input' name='" + testtype + "_" + q_index + "' tabindex=1>";
            $c.append(input_html);
            $choices.append($c);
        } else if (question_type == "likert") {
            var levels = content["levels"];
            var $c = $("<label/>");
            $c.append("<span>" + content["left_label"] + "</span>");
            for (var i=1; i<=levels; i++) {
                var input_html = "<input type='radio' name='" + testtype + "_" + q_index + "' class='q_choice' value='" + i + "'></input>";
                $c.append(input_html);
            }
            $c.append("<span>" + content["right_label"] + "</span>");
            $choices.append($c);
        } else if (question_type == "long_answer") {
            var $c = $("<span/>");
            var input_html = "<textarea rows='6' cols='50' name='" + testtype + "_" + q_index + "'></textarea>";
            $c.append(input_html);
            $choices.append($c);
        }
        $q.append($choices);
        $("#" + testtype + "-form .test-content").append($q);
    }

    function render_tests(pretests, posttests) {
        for (var index in pretests) {
            render_test(pretests[index], parseInt(index) + 1, "pretest");
        }
        for (var index in posttests) {
            render_test(posttests[index], parseInt(index) + 1, "posttest");
        }
    }

    return {
        init: init,
        reachedPretest: reachedPretest,
        reachedPosttest: reachedPosttest
    }
}();