from django.db import models
#from django.utils import simplejson
import simplejson

# learner who's annotating the video
class Learner(models.Model):
	username = models.CharField(max_length=16)
	password = models.CharField(max_length=32)
	# firstname = models.CharField(max_length=200)
	# lastname = models.CharField(max_length=200)
	email = models.EmailField()
	is_admin = models.BooleanField(default=False)
	added_at = models.DateTimeField(auto_now_add=True)

	def __unicode__(self):
		return self.username
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# tutorial video
class Video(models.Model):
	# person who posted the video: probably won't be necessary.
	learner = models.ForeignKey(Learner)
	title = models.CharField(max_length=200)
	# filename
	url = models.URLField()
	domain = models.CharField(max_length=100)
	slug = models.CharField(max_length=32)
	duration = models.IntegerField()
	added_at = models.DateTimeField(auto_now_add=True)
	youtube_id = models.CharField(max_length=16, null=True, blank=True)
	is_used = models.BooleanField(default=True)

	def __unicode__(self):
		return self.slug
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# individual step
class Step(models.Model):
	video = models.ForeignKey(Video)
	learner = models.ForeignKey(Learner)
	time = models.FloatField()
	label = models.CharField(max_length=200)
	# thumbnail_before
	# thumbnail_after
	added_at = models.DateTimeField(auto_now_add=True)
	# is it a valid one?
	is_final = models.BooleanField(default=False)

	def __unicode__(self):
		return self.video.slug + " (" + unicode(int(round(self.time))) + ") " + self.label
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# higher-level step
class Subgoal(models.Model):
	video = models.ForeignKey(Video)
	learner = models.ForeignKey(Learner)
	time = models.FloatField()
	label = models.CharField(max_length=200)
	# many-to-many relation.
	step = models.ManyToManyField(Step, null=True, blank=True)
	# thumbnail_before
	# thumbnail_after
	added_at = models.DateTimeField(auto_now_add=True)
	# is it a picked one to display in stage 3?
	is_final = models.BooleanField(default=False)
	stage_added = models.IntegerField(default=1)
	# state: "created", "updated", "moved", "deleted"
	# only storing the latest, but multiple states can exist at the same time.
	state = models.CharField(max_length=16)
	upvotes_s2 = models.IntegerField(default=0)
	downvotes_s2 = models.IntegerField(default=0)
	upvotes_s3 = models.IntegerField(default=0)
	downvotes_s3 = models.IntegerField(default=0)

	def __unicode__(self):
		return self.video.slug + " (" + unicode(self.time) + ") " + self.label
		# return self.video.slug + " (" + unicode(int(round(self.time))) + ") " + self.label

	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# keep track of user actions
class Action(models.Model):
	session_id = models.CharField(max_length=200)
	video = models.ForeignKey(Video)
	learner = models.ForeignKey(Learner)
	subgoal = models.ForeignKey(Subgoal, blank=True, null=True)
	step = models.ForeignKey(Step, blank=True, null=True)
	# possible actions: create, update, delete, move
	action_type = models.CharField(max_length=32)
	stage = models.IntegerField()
	added_at = models.DateTimeField(auto_now_add=True)

	def __unicode__(self):
		return self.video.slug + " (" + self.learner.username + ") " + self.action_type
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# keep track of user sessions and their experimental conditions
class ExpSession(models.Model):
	session_id = models.CharField(max_length=200)
	video = models.ForeignKey(Video)
	learner = models.ForeignKey(Learner)
	cond_interval = models.IntegerField(default=0)
	cond_random = models.BooleanField(default=False)
	cond_step = models.BooleanField(default=False)
	cond_admin = models.BooleanField(default=False)
	added_at = models.DateTimeField(auto_now_add=True)

	# is the pedagogical benefits study mode on?
	cond_study = models.BooleanField(default=False)
	# which experimental group is the participant in?
	cond_group = models.IntegerField(default=0, null=True)
	# experimental participant ID? Doesn't exist when cond_study == False
	participant_id = models.CharField(max_length=16, null=True, blank=True)

	def __unicode__(self):
		return str(self.added_at) + \
			" | session_id =" + str(self.id) + \
			" | video=" + self.video.slug + \
			" | interval=" + str(self.cond_interval) + \
			" | random=" + str(self.cond_random) + \
			" | step=" + str(self.cond_step) + \
			" | admin=" + str(self.cond_admin) + \
			" | study=" + str(self.cond_study) + \
			" | group=" + str(self.cond_group) + \
			" | participant_id=" + str(self.participant_id)
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# keep track of user's pretest and posttest answers when ExpSession.cond_study == True
class ExpResult(models.Model):
	exp_session = models.ForeignKey(ExpSession)
	# pre-test? post-test? any other?
	test_type = models.CharField(max_length=16)
	# result dump in JSON
	result = models.CharField(max_length=1024)
	added_at = models.DateTimeField(auto_now_add=True)

	def __unicode__(self):
		return str(self.added_at) + \
			" | exp_session_id=" + str(self.exp_session_id) + \
			" | group=" + str(self.exp_session.cond_group) + \
			" | participant_id=" + str(self.exp_session.participant_id) + \
			" | test_type=" + str(self.test_type) + \
			" | result=" + str(self.result)
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# keep track of questions asked to the learner
class Question(models.Model):
	session_id = models.CharField(max_length=200)
	video = models.ForeignKey(Video)
	learner = models.ForeignKey(Learner)
	video_time = models.IntegerField(default=0)
	is_asked = models.BooleanField(default=False)
	question_stage = models.IntegerField(default=0)
	added_at = models.DateTimeField(auto_now_add=True)

	def __unicode__(self):
		return str(self.added_at) + \
			" | video=" + self.video.slug + \
			" | time=" + str(self.video_time) + \
			" | asked=" + str(self.is_asked) + \
			" | stage=" + str(self.question_stage)
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


def dthandler(obj):
    # lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) else obj.__dict__
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        return obj.__dict__
        # raise TypeError, 'Object of type %s with value of %s is not JSON serializable' % (type(obj), repr(obj))

