# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from subgoal.models import Video, Step, Subgoal, Learner
from django.db import IntegrityError

def index(request):
    return HttpResponse("splash page.")


def stage1(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	return render(request, 'subgoal/stage1.html', {'video': video})


def stage2(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	return render(request, 'subgoal/stage2.html', {'video': video})


def stage3(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	return render(request, 'subgoal/stage3.html', {'video': video})
