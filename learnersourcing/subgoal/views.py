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
	videos = Video.objects.all()
	return render(
    	request, 
    	"subgoal/splash_page.html",
    	{
    		'videos': model_to_json(videos)
    	}
    )


def play(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	subgoals = Subgoal.objects.filter(video=video_id).exclude(state="deleted")
	steps = Step.objects.filter(video=video_id)
	print unicode(len(subgoals)) + " subgoals: "
	print subgoals
	print unicode(len(steps)) + " steps: "
	print steps
	return render(
		request, 
		'subgoal/play.html', 
		{
			'video': model_to_json([video]),
			'subgoals': model_to_json(subgoals),
			'steps': model_to_json(steps)
		}
	)


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
	subgoals = Subgoal.objects.filter(video=video_id).exclude(state="deleted")
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
	subgoals = Subgoal.objects.filter(video=video_id).exclude(state="deleted")
	steps = Step.objects.filter(video=video_id)
	print unicode(len(subgoals)) + " subgoals: "
	print subgoals
	print unicode(len(steps)) + " steps: "
	print steps
	return render(
		request, 
		'subgoal/stage3.html', 
		{
			'video': model_to_json([video]),
			'subgoals': model_to_json(subgoals),
			'steps': model_to_json(steps)
		}
	)


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
					upvotes_s2=0,
					downvotes_s2=0,
					upvotes_s3=0,
					downvotes_s3=0)
		# only add an upvote when replacing ones from a diected question. Ignore manual addition from the Wiki panel.
		if 'is_vote' in request.POST:
			if request.POST['stage'] == 2:
				subgoal.upvotes_s2 = 1
			elif request.POST['stage'] == 3:
				subgoal.upvotes_s3 = 1
		subgoal.save()

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_create", stage=request.POST['stage'])
		try:
			action.session_id = request.session.session_key
		except (NameError, AttributeError):
			pass
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

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_update", stage=request.POST['stage'])
		try:
			action.session_id = request.session.session_key
		except (NameError, AttributeError):
			pass
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

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_move", stage=request.POST['stage'])
		try:
			action.session_id = request.session.session_key
		except (NameError, AttributeError):
			pass
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

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_delete", stage=request.POST['stage'])
		try:
			action.session_id = request.session.session_key
		except (NameError, AttributeError):
			pass
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')	


def subgoal_vote(request):
	video_id = request.POST['video_id']
	
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	
	learner = get_object_or_404(Learner, pk=learner_id)
	if request.is_ajax():
		# print request.POST['votes']
		votes = simplejson.loads(request.POST['votes'])
		print votes
		# request.POST['votes'].getlist
		# for (subgoal_id, vote_type) in enumerate(votes):
		for subgoal_id in votes:
			vote_type = votes[subgoal_id]
			print subgoal_id, vote_type	
			subgoal = get_object_or_404(Subgoal, pk=subgoal_id)
			new_vote_val = getattr(subgoal, vote_type) + 1
			setattr(subgoal, vote_type, new_vote_val)
			# subgoal[vote_type] = subgoal[vote_type] + 1
			# subgoal.votes = subgoal.votes + 1
			subgoal.state = "voted"
			subgoal.save()
			
			action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_vote", stage=request.POST['stage'])
			try:
				action.session_id = request.session.session_key
			except (NameError, AttributeError):
				pass
			action.save()
			results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')



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

def video_router(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	subgoals = Subgoal.objects.filter(video=video_id).exclude(state="deleted")
	steps = Step.objects.filter(video=video_id)

	# return HttpResponseRedirect('/stage1/'+video_id)
	if len(subgoals) < 10:
		return stage1(request, video_id)




