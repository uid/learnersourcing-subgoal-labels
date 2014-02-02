from django.contrib import admin
from subgoal.models import Video
from subgoal.models import Step
from subgoal.models import Subgoal
from subgoal.models import Learner

admin.site.register(Video)
admin.site.register(Step)
admin.site.register(Subgoal)
admin.site.register(Learner)