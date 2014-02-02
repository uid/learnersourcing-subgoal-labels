from django.conf.urls import patterns, include, url
from subgoal import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', views.index, name='index'),
    # url(r'^learnersourcing/', include('learnersourcing.foo.urls')),

	url(r'^stage1/(?P<video_id>\d+)/$', views.stage1, name='stage1'),
	url(r'^stage2/(?P<video_id>\d+)/$', views.stage2, name='stage2'),
	url(r'^stage3/(?P<video_id>\d+)/$', views.stage3, name='stage3'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
