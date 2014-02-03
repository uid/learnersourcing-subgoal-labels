from django.db import models
from django.utils import simplejson


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
	title = models.CharField(max_length=200)
	# filename
	url = models.URLField()
	domain = models.CharField(max_length=100)
	slug = models.CharField(max_length=32)
	duration = models.IntegerField()
	added_at = models.DateTimeField(auto_now_add=True)
	learner = models.ForeignKey(Learner)
	youtube_id = models.CharField(max_length=16, null=True, blank=True)
	is_used = models.BooleanField(default=True)

	def __unicode__(self):
		return self.slug
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# higher-level step
class Subgoal(models.Model):
	video = models.ForeignKey(Video)
	time = models.FloatField()
	label = models.CharField(max_length=200)
	# thumbnail_before
	# thumbnail_after
	added_at = models.DateTimeField(auto_now_add=True)
	learner = models.ForeignKey(Learner)
	# is it a valid one?
	is_final = models.BooleanField(default=False)
	# state: "created", "updated", "moved", "deleted"
	# multiple states can exist at the same time.
	state = models.CharField(max_length=16)
	votes = models.IntegerField()

	def __unicode__(self):
		return "(" + unicode(int(round(self.time))) + ") " + self.label
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# individual step
class Step(models.Model):
	video = models.ForeignKey(Video)
	# many-to-many relation. 
	subgoal = models.ManyToManyField(Subgoal)
	time = models.FloatField()
	label = models.CharField(max_length=200)
	# thumbnail_before
	# thumbnail_after
	added_at = models.DateTimeField(auto_now_add=True)
	learner = models.ForeignKey(Learner)
	# is it a valid one?
	is_final = models.BooleanField(default=False)

	def __unicode__(self):
		return "(" + unicode(int(round(self.time))) + ") " + self.label
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


# keeping track of user actions
class Action(models.Model):
	video = models.ForeignKey(Video)
	learner = models.ForeignKey(Learner)
	subgoal = models.ForeignKey(Subgoal, blank=True, null=True)
	step = models.ForeignKey(Step, blank=True, null=True)
	# possible actions: create, update, delete, move
	action_type = models.CharField(max_length=32)
	added_at = models.DateTimeField(auto_now_add=True)

	def __unicode__(self):
		return "(" + self.learner.username + ") " + self.action_type
	def toJSON(self):
		return simplejson.dumps(self, default=dthandler, sort_keys=True)


def dthandler(obj):
    # lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) else obj.__dict__
    if hasattr(obj, 'isoformat'):
        return obj.isoformat()
    else:
        return obj.__dict__
        # raise TypeError, 'Object of type %s with value of %s is not JSON serializable' % (type(obj), repr(obj))

