# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from subgoal.models import Video, Step, Subgoal, Learner
from django.db import IntegrityError

def index(request):
    return render(request, "subgoal/splash_page.html")


def stage1(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	return render(request, 'subgoal/stage1.html', {'video': video})


def stage2(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	return render(request, 'subgoal/stage2.html', {'video': video})


def stage3(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	return render(request, 'subgoal/stage3.html', {'video': video})

# Protocol for routing to correct stage

# Route to stage 1:
#	If low number of subgoals (< 10) total for one video
# Route to stage 2:
#	If high number of subgoals (> 10) total for one video and the case for 
#	case 3 does not exist
# Route to stage 3:
#	If one subgoal has been deleted >= 3 times
#		In that case, for each subgoal group-- take majority rule or pick one randomly
#		if no majority rule. For lone subgoals, take majority rule (keep if tie)

# If < 10 subgoals for one video
#	Route to stage 1 for the video (and show steps sans subgoals)
# If > 10 subgoals for one video
#	For every subgoal in video... if one has been deleted >= 3 times:
#		Route to stage 3
#		Take majority for each subgoal group or random
# 	Else
#		Route to stage 2 (and show original ones)


