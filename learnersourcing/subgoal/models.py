from django.db import models

# learner who's annotating the video
class Learner(models.Model):
	username = models.CharField(max_length=16)
	password = models.CharField(max_length=32)
	# firstname = models.CharField(max_length=200)
	# lastname = models.CharField(max_length=200)
	email = models.EmailField()
	is_admin = models.BooleanField(default=False)
	added_at = models.DateTimeField()

	def __unicode__(self):
		return self.username

# tutorial video
class Video(models.Model):
	title = models.CharField(max_length=200)
	# filename
	url = models.URLField()
	domain = models.CharField(max_length=100)
	slug = models.CharField(max_length=32)
	duration = models.IntegerField()
	added_at = models.DateTimeField()
	added_by = models.ForeignKey(Learner)

	def __unicode__(self):
		return self.slug


# higher-level step
class Subgoal(models.Model):
	video = models.ForeignKey(Video)
	time = models.FloatField()
	label = models.CharField(max_length=200)
	# thumbnail_before
	# thumbnail_after
	added_at = models.DateTimeField()
	added_by = models.ForeignKey(Learner)
	# is it a valid one?
	is_final = models.BooleanField(default=False)

	def __unicode__(self):
		return "(" + self.time + ")" + self.label


# individual step
class Step(models.Model):
	video = models.ForeignKey(Video)
	# 1-to-many relation. 
	subgoal = models.ForeignKey(Subgoal)
	time = models.FloatField()
	label = models.CharField(max_length=200)
	# thumbnail_before
	# thumbnail_after
	added_at = models.DateTimeField()
	added_by = models.ForeignKey(Learner)
	# is it a valid one?
	is_final = models.BooleanField(default=False)

	def __unicode__(self):
		return "(" + self.time + ")" + self.label





