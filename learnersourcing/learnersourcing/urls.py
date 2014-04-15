from django.conf.urls import patterns, include, url
from subgoal import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', views.index, name='index'),
    # url(r'^learnersourcing/', include('learnersourcing.foo.urls')),

	url(r'^play/(?P<video_id>\d+)/$', views.play, name='play'), 
	url(r'^analytics/$', views.analytics, name='analytics'),
	url(r'^help/$', views.help, name='help'), 
	url(r'^about/$', views.about, name='about'),    

	url(r'^stage1/(?P<video_id>\d+)/$', views.stage1, name='stage1'),
	url(r'^stage2/(?P<video_id>\d+)/$', views.stage2, name='stage2'),
	url(r'^stage3/(?P<video_id>\d+)/$', views.stage3, name='stage3'),
	url(r'^router/(?P<video_id>\d+)/$', views.video_router, name='video_router'),

	url(r'^subgoal/create/$', views.subgoal_create, name='subgoal_create'),
	url(r'^subgoal/update/$', views.subgoal_update, name='subgoal_update'),
	url(r'^subgoal/move/$', views.subgoal_move, name='subgoal_move'),
	url(r'^subgoal/delete/$', views.subgoal_delete, name='subgoal_delete'),
	url(r'^subgoal/undelete/$', views.subgoal_undelete, name='subgoal_undelete'),
	url(r'^subgoal/vote/$', views.subgoal_vote, name='subgoal_vote'),
	url(r'^subgoal/action/$', views.site_action, name='site_action'),
	url(r'^subgoal/vidaction/$', views.vid_action, name='vid_action'),
	url(r'^subgoal/instructions/$', views.subgoal_instr, name='subgoal_instr'),
	url(r'^subgoal/instr_click/$', views.subgoal_instr_click, name='subgoal_instr_click'),
	url(r'^subgoal/brief_check/$', views.subgoal_brief_check, name='subgoal_brief_check'),
	url(r'^subgoal/brief_click/$', views.subgoal_brief_click, name='subgoal_brief_click'),
	

	url(r'^subgoal/record_question/$', views.record_question, name='record_question'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
