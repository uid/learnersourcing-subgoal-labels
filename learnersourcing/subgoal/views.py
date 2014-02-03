# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.core.urlresolvers import reverse
from subgoal.models import Video, Step, Subgoal, Learner, Action
from django.db import IntegrityError
from django.utils import simplejson


def model_to_json(instances):
    result = []
    # Hack to serialize a django model. There is no good way to deal with foreign keys.
    for instance in instances:
        result.append(simplejson.loads(instance.toJSON()))
    return simplejson.dumps(result)


def index(request):
    return HttpResponse("splash page.")


def stage1(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	steps = Step.objects.filter(video=video_id)
	print unicode(len(steps)) + " steps: "
	print steps
	return render(
		request, 
		'subgoal/stage1.html', 
		{
			'video': model_to_json([video]),
			'steps': model_to_json(steps)
		}
	)


def stage2(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	subgoals = Subgoal.objects.filter(video=video_id)
	steps = Step.objects.filter(video=video_id)
	print unicode(len(subgoals)) + " subgoals: "
	print subgoals
	print unicode(len(steps)) + " steps: "
	print steps
	return render(
		request, 
		'subgoal/stage2.html', 
		{
			'video': model_to_json([video]),
			'subgoals': model_to_json(subgoals),
			'steps': model_to_json(steps)
		}
	)


def stage3(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	return render(request, 'subgoal/stage3.html', {'video': video})


def subgoal_create(request):
	video_id = request.POST['video_id']
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	learner = get_object_or_404(Learner, pk=learner_id)
	if request.is_ajax():
		subgoal = Subgoal(
					video=video, 
					time=request.POST['time'], 
					label=request.POST['label'],
					learner=learner,
					state="created",
					votes=0)
		subgoal.save()

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_create")
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')


def subgoal_update(request):
	video_id = request.POST['video_id']
	subgoal_id = request.POST['subgoal_id']
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	subgoal = get_object_or_404(Subgoal, pk=subgoal_id)
	learner = get_object_or_404(Learner, pk=learner_id)
	if request.is_ajax():
		subgoal.label = request.POST['label']
		subgoal.state = "updated"
		subgoal.save()

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_update")
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')	


def subgoal_move(request):
	video_id = request.POST['video_id']
	subgoal_id = request.POST['subgoal_id']
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	subgoal = get_object_or_404(Subgoal, pk=subgoal_id)
	learner = get_object_or_404(Learner, pk=learner_id)
	if request.is_ajax():
		subgoal.time = request.POST['time']
		subgoal.state = "moved"
		subgoal.save()

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_move")
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')		


def subgoal_delete(request):
	video_id = request.POST['video_id']
	subgoal_id = request.POST['subgoal_id']
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	subgoal = get_object_or_404(Subgoal, pk=subgoal_id)
	learner = get_object_or_404(Learner, pk=learner_id)
	if request.is_ajax():
		# not actually removing the subgoal, but simply marking it as deleted
		subgoal.state = "deleted"
		subgoal.save()

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_delete")
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')	

