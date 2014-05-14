# -*- coding: utf-8 -*-
from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, HttpResponse, Http404
from django.core.urlresolvers import reverse
from subgoal.models import Video, Step, Subgoal, Learner, Action, ExpSession, Question
from django.db import IntegrityError
from django.utils import simplejson
from random import randint, random
import datetime
from django.utils.timezone import utc


# request.session.session_key is not available for first-time users.
# manually creating one doesn't really work, so simply 
def get_session_key(key):
	return "" if key is None else key


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

	# set for deployment!
	date_thresh = datetime.datetime(2014,5,5,0,0,0,0,tzinfo=utc)

	subgoals = Subgoal.objects.filter(added_at__gt=date_thresh, video=video_id).exclude(state="deleted")
	subs_to_filter = []

	for sub in subgoals:
		actions = Action.objects.filter(action_type='subgoal_create', added_at__gt=date_thresh, subgoal=sub)
		for a in actions:
			sesh = a.session_id
			agree = Action.objects.filter(session_id=sesh, action_type='agree').count()
			no_agree = Action.objects.filter(session_id=sesh, action_type='no_agree').count()
			if (no_agree > 0):
				subs_to_filter.append(sub.id)

	subgoals = Subgoal.objects.filter(added_at__gt=date_thresh, video=video_id).exclude(id__in=subs_to_filter)

	print subgoals
	steps = Step.objects.filter(video=video_id)
	# print unicode(len(subgoals)) + " subgoals: "
	# print subgoals
	# print unicode(len(steps)) + " steps: "
	# print steps

	# if not request.session.exists(request.session.session_key):
	# 	print "creating new session"
    	# request.session.create() 
	# if not request.session.get('has_session'):
	# 	print "no session"
	# 	request.session['has_session'] = True
	# if not request.session.get('session_key'):
	# 	# request.session.session_key = "hello"
	# 	print "no session key"
	# 	request.session.modified = True
	# print request.session['has_session']
	# if request.session.session_key == None:
	# 	session_key = ""
	# else:
	# 	session_key = request.session.session_key
	print request.session.session_key
	
	learner = get_object_or_404(Learner, pk=1)
	cond_interval = 60
	cond_random = False
	#cond_random = False if randint(0,1) == 0 else True
	#cond_random = False if random() < 0.7 else True
	# cond_step = False if randint(0,1) == 0 else True
	cond_step = True
	cond_admin = False

	exp_session = ExpSession(
					session_id = get_session_key(request.session.session_key),
					video = video,
					learner = learner,
					cond_interval = cond_interval,
					cond_random = cond_random,
					cond_step = cond_step,
					cond_admin = cond_admin
				)
	exp_session.save()
	return render(
		request, 
		'subgoal/play.html', 
		{
			'video': model_to_json([video]),
			'subgoals': model_to_json(subgoals),
			'steps': model_to_json(steps),
			'exp_session': model_to_json([exp_session])
		}
	)

def analytics(request):
	date_thresh = datetime.datetime(2014,5,5,0,0,0,0,tzinfo=utc)
	videos = Video.objects.filter(is_used=True)
	actions = Action.objects.filter(added_at__gt=date_thresh)
	exp = ExpSession.objects.all()

	

	num_agree = Action.objects.filter(action_type='agree', added_at__gt=date_thresh).count()
	num_disagree = Action.objects.filter(action_type='no_agree', added_at__gt=date_thresh).count()

	# print "number of agree: "+str(num_agree)
	# print "number of disagree: "+str(num_disagree)

	videos_dict = {}
	subgoals_dict = {}
	activity_dict = {}
	actions_per_video_dict = {}
	subs_per_video_dict = {}
	users_per_video_dict = {}

	

	# for calculating activity over time... right now it looks like all of the times are the same?
	for a in actions:
		if a.video in videos:
			video = str(a.video.slug)
			date = actions[0].added_at.date()
			hour = actions[0].added_at.time().hour
			if ((date,hour) in activity_dict):
				activity_dict[(date,hour)] += 1
			else:
				activity_dict[(date,hour)] = 1

			if (video in actions_per_video_dict):
				actions_per_video_dict[video] += 1
			else:
				actions_per_video_dict[video] = 1

	# print actions_per_video_dict

	for v in videos:
		video = {}

		video['video'] = model_to_json([v])
		video['steps'] = model_to_json(Step.objects.filter(video=v))
		video['exp'] = model_to_json(ExpSession.objects.filter(video=v))
		video['subgoals'] = model_to_json(Subgoal.objects.filter(added_at__gt=date_thresh, video=v))

		vid_subs = Subgoal.objects.filter(added_at__gt=date_thresh, video=v)
		subs_to_filter = []
		for sub in vid_subs:
			actions = Action.objects.filter(action_type='subgoal_create', added_at__gt=date_thresh, subgoal=sub)
			for a in actions:
				sesh = a.session_id
				agree = Action.objects.filter(session_id=sesh, action_type='agree').count()
				no_agree = Action.objects.filter(session_id=sesh, action_type='no_agree').count()
				if (no_agree > 0):
					subs_to_filter.append(sub.id)

		vid_subs = Subgoal.objects.filter(added_at__gt=date_thresh, video=v).exclude(id__in=subs_to_filter)


		subs_per_video_dict[str(v.slug)] = vid_subs.count()

		for s in vid_subs:
			vid_acts = Action.objects.filter(subgoal=s)
			for a in vid_acts:
				if (a.action_type == 'subgoal_create'):
					sesh = a.session_id
					# print len(ExpSession.objects.filter(video=v).filter(session_id=sesh))
					if len(ExpSession.objects.filter(video=v).filter(session_id=sesh)) > 0:
						stage_step = ExpSession.objects.filter(video=v).filter(session_id=sesh)[0].cond_step
						stage_ask = ExpSession.objects.filter(video=v).filter(session_id=sesh)[0].cond_random
						subgoals_dict[s.id] = [str(stage_step), str(stage_ask)]
		videos_dict[v.id] = video

		vid_exp = ExpSession.objects.filter(video=v, added_at__gt=date_thresh)

		temp_exp = []
		for e in vid_exp:
			if not e.session_id in temp_exp:
				temp_exp.append(e.session_id)

		users_per_video_dict[str(v.slug)] = len(temp_exp)

	# print users_per_video_dict

	return render(request, 'subgoal/analytics.html', 
		{
			'content':videos_dict,
			'subgoals':subgoals_dict,
			'actions_per_vid':actions_per_video_dict,
			'subs_per_vid':subs_per_video_dict,
			'users_per_vid':users_per_video_dict
		}
	)

def help(request):
	return render(
		request, 
		'subgoal/help.html'
	)

def about(request):
	return render(
		request, 
		'subgoal/about.html'
	)

def stage1(request, video_id):
	video = get_object_or_404(Video, pk=video_id)
	steps = Step.objects.filter(video=video_id)
	# print unicode(len(steps)) + " steps: "
	# print steps
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
	# print unicode(len(subgoals)) + " subgoals: "
	# print subgoals
	# print unicode(len(steps)) + " steps: "
	# print steps
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
	# print unicode(len(subgoals)) + " subgoals: "
	# print subgoals
	# print unicode(len(steps)) + " steps: "
	# print steps
	return render(
		request, 
		'subgoal/stage3.html', 
		{
			'video': model_to_json([video]),
			'subgoals': model_to_json(subgoals),
			'steps': model_to_json(steps)
		}
	)



# Ajax
# recording each time the learnersourcing question is asked.
def record_question(request):
	video_id = request.POST['video_id']
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	learner = get_object_or_404(Learner, pk=learner_id)

	is_asked = True if request.POST['is_asked'] == "true" else False
	if request.is_ajax():
		question = Question(
					session_id = get_session_key(request.session.session_key),
					video = video,
					learner = learner,
					video_time = request.POST['video_time'],
					is_asked = is_asked,
					question_stage = request.POST['question_stage']
				)
		question.save()
		results = {'success': True}
	else:
		raise Http404
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')


# Ajax
def subgoal_create(request):
	video_id = request.POST['video_id']
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	learner = get_object_or_404(Learner, pk=learner_id)
	if request.is_ajax():
		subgoal = Subgoal(
					video=video, 
					time=int(request.POST['time']), 
					label=request.POST['label'],
					learner=learner,
					state="created",
					stage_added=int(request.POST['stage']),
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

		try:
			sesh = get_session_key(request.session.session_key)
		except (NameError, AttributeError):
			pass

		agree = Action.objects.filter(session_id=sesh, action_type='agree').count()
		no_agree = Action.objects.filter(session_id=sesh, action_type='no_agree').count()
		if (agree > 0):
			print 'SAVED!!!!'
			subgoal.save()
			action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_create", stage=request.POST['stage'])
			try:
				action.session_id = get_session_key(request.session.session_key)
			except (NameError, AttributeError):
				pass
			action.save()
			results = {'success': True, 'subgoal_id': subgoal.id, 'subgoal': model_to_json([subgoal])}
		else:
			print 'NOT SAVED!!!!!'
			results = {'success': True, 'subgoal_id': subgoal.id, 'subgoal': model_to_json([subgoal])}
	else:
		raise Http404
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')


# Ajax
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
			action.session_id = get_session_key(request.session.session_key)
		except (NameError, AttributeError):
			pass
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')	


# Ajax
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
			action.session_id = get_session_key(request.session.session_key)
		except (NameError, AttributeError):
			pass
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')		


# Ajax
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
			action.session_id = get_session_key(request.session.session_key)
		except (NameError, AttributeError):
			pass
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')	


# Ajax
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
			
			action_type = "subgoal_" + vote_type
			#action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_vote", stage=request.POST['stage'])
			action = Action(video=video, learner=learner, subgoal=subgoal, action_type=action_type, stage=request.POST['stage'])
			try:
				action.session_id = get_session_key(request.session.session_key)
			except (NameError, AttributeError):
				pass
			action.save()
			results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')

def subgoal_undelete(request):
	video_id = request.POST['video_id']
	subgoal_id = request.POST['subgoal_id']
	learner_id = request.POST['learner_id']
	video = get_object_or_404(Video, pk=video_id)
	subgoal = get_object_or_404(Subgoal, pk=subgoal_id)
	learner = get_object_or_404(Learner, pk=learner_id)
	if request.is_ajax():
		# not actually removing the subgoal, but simply marking it as deleted
		subgoal.state = "undeleted"
		subgoal.save()

		action = Action(video=video, learner=learner, subgoal=subgoal, action_type="subgoal_undelete", stage=request.POST['stage'])
		try:
			action.session_id = get_session_key(request.session.session_key)
		except (NameError, AttributeError):
			pass
		action.save()
		results = {'success': True, 'subgoal_id': subgoal.id}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')	

def site_action(request):
	print 'in site action'
	action_type = request.POST['action']
	learner_id = request.POST['learner_id']
	learner = get_object_or_404(Learner, pk=learner_id)
	#TODO: DUMMY VIDEO
	video = get_object_or_404(Video, pk=1)
	learner = get_object_or_404(Learner, pk=1)
	subgoal = get_object_or_404(Subgoal, pk=1)

	if request.is_ajax():
		action = Action(video=video, learner=learner, subgoal=subgoal, action_type=action_type, stage = 0)
		try:
			action.session_id = get_session_key(request.session.session_key)
		except (NameError, AttributeError):
			pass
		action.save()
		results = {'success': True, 'action': action_type}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	print results
	return HttpResponse(json, mimetype='application/json')

def vid_action(request):
	print 'in vid action'
	action_type = request.POST['action']
	learner_id = request.POST['learner_id']
	learner = get_object_or_404(Learner, pk=learner_id)
	video = get_object_or_404(Video, pk=request.POST['video_id'])
	
	#TODO: DUMMY VIDEO
	learner = get_object_or_404(Learner, pk=1)
	subgoal = get_object_or_404(Subgoal, pk=1)

	if request.is_ajax():
		action = Action(video=video, learner=learner, subgoal=subgoal, action_type=action_type, stage = 0)
		try:
			action.session_id = get_session_key(request.session.session_key)
		except (NameError, AttributeError):
			pass
		action.save()
		results = {'success': True, 'action': action_type}
	else:
		raise Http404	
	json = simplejson.dumps(results)
	print results
	return HttpResponse(json, mimetype='application/json')

def subgoal_instr(request):
	watched = False
	#check if action "instr_clicked" exists
	try:
		user_sesh = get_session_key(request.session.session_key)
		actions = Action.objects.filter(session_id=user_sesh)
		for a in actions:
			# print a
			if a.action_type == 'instr_clicked':
				watched = True
				# print "WATCHED!"
		results = {'success':True, 'watched':watched}
	except (NameError, AttributeError):
		pass
	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')

def subgoal_instr_click(request):
	#create action named "instr_clicked"

	#PLACEHOLDER TODO
	video = get_object_or_404(Video, pk=1)
	learner = get_object_or_404(Learner, pk=1)
	subgoal = get_object_or_404(Subgoal, pk=1)
	action_type = 'instr_clicked'
	stage = 1

	action = Action(video=video, learner=learner, subgoal=subgoal, action_type=action_type, stage=stage)
	try:
		action.session_id = get_session_key(request.session.session_key)
	except (NameError, AttributeError):
		pass
	action.save()
	
	results = {'success': True}
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')

def subgoal_brief_check(request):
	watched_brief = False
	watched_tut = False
	#check if action "instr_clicked" exists

	results = {}

	try:
		user_sesh = get_session_key(request.session.session_key)
		actions = Action.objects.filter(session_id=user_sesh)
		for a in actions:
			if a.action_type == 'brief_clicked':
				watched_brief = True
				# print "WATCHED!"
		results['watched_brief'] = watched_brief
	except (NameError, AttributeError):
		pass

	try:
		user_sesh = get_session_key(request.session.session_key)
		actions = Action.objects.filter(session_id=user_sesh)
		for a in actions:
			# print a
			if a.action_type == 'instr_clicked':
				watched_tut = True
				# print "WATCHED!"
		results['watched_tut'] = watched_tut
		results['success'] = True
	except (NameError, AttributeError):
		pass
	
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')

def subgoal_brief_click(request):
#create action named "brief_clicked"

	accepted = request.POST['agree']

	#PLACEHOLDER TODO
	video = get_object_or_404(Video, pk=1)
	learner = get_object_or_404(Learner, pk=1)
	subgoal = get_object_or_404(Subgoal, pk=1)
	action_type = 'brief_clicked'
	stage = 1
	
	#action for clicking the briefing
	action = Action(video=video, learner=learner, subgoal=subgoal, action_type=action_type, stage=stage)
	try:
		action.session_id = get_session_key(request.session.session_key)
	except (NameError, AttributeError):
		pass
	action.save()

	#action for agreeing or not
	action_agree = Action(video=video, learner=learner, subgoal=subgoal, action_type=accepted, stage=stage)
	try:
		action_agree.session_id = get_session_key(request.session.session_key)
	except (NameError, AttributeError):
		pass
	action_agree.save()
	
	results = {'success': True}
	json = simplejson.dumps(results)
	return HttpResponse(json, mimetype='application/json')

# Protocol for routing to correct stage
# Not used: now dynamically added within the page

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




