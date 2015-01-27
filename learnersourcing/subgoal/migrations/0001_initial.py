# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Action',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('session_id', models.CharField(max_length=200)),
                ('action_type', models.CharField(max_length=32)),
                ('stage', models.IntegerField()),
                ('added_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='ExpSession',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('session_id', models.CharField(max_length=200)),
                ('cond_interval', models.IntegerField(default=0)),
                ('cond_random', models.BooleanField(default=False)),
                ('cond_step', models.BooleanField(default=False)),
                ('cond_admin', models.BooleanField(default=False)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Learner',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('username', models.CharField(max_length=16)),
                ('password', models.CharField(max_length=32)),
                ('email', models.EmailField(max_length=75)),
                ('is_admin', models.BooleanField(default=False)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('session_id', models.CharField(max_length=200)),
                ('video_time', models.IntegerField(default=0)),
                ('is_asked', models.BooleanField(default=False)),
                ('question_stage', models.IntegerField(default=0)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('learner', models.ForeignKey(to='subgoal.Learner')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Step',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('time', models.FloatField()),
                ('label', models.CharField(max_length=200)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('is_final', models.BooleanField(default=False)),
                ('learner', models.ForeignKey(to='subgoal.Learner')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Subgoal',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('time', models.FloatField()),
                ('label', models.CharField(max_length=200)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('is_final', models.BooleanField(default=False)),
                ('stage_added', models.IntegerField(default=1)),
                ('state', models.CharField(max_length=16)),
                ('upvotes_s2', models.IntegerField(default=0)),
                ('downvotes_s2', models.IntegerField(default=0)),
                ('upvotes_s3', models.IntegerField(default=0)),
                ('downvotes_s3', models.IntegerField(default=0)),
                ('learner', models.ForeignKey(to='subgoal.Learner')),
                ('step', models.ManyToManyField(to='subgoal.Step', null=True, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Video',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('url', models.URLField()),
                ('domain', models.CharField(max_length=100)),
                ('slug', models.CharField(max_length=32)),
                ('duration', models.IntegerField()),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('youtube_id', models.CharField(max_length=16, null=True, blank=True)),
                ('is_used', models.BooleanField(default=True)),
                ('learner', models.ForeignKey(to='subgoal.Learner')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='subgoal',
            name='video',
            field=models.ForeignKey(to='subgoal.Video'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='step',
            name='video',
            field=models.ForeignKey(to='subgoal.Video'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='question',
            name='video',
            field=models.ForeignKey(to='subgoal.Video'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='expsession',
            name='learner',
            field=models.ForeignKey(to='subgoal.Learner'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='expsession',
            name='video',
            field=models.ForeignKey(to='subgoal.Video'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='action',
            name='learner',
            field=models.ForeignKey(to='subgoal.Learner'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='action',
            name='step',
            field=models.ForeignKey(blank=True, to='subgoal.Step', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='action',
            name='subgoal',
            field=models.ForeignKey(blank=True, to='subgoal.Subgoal', null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='action',
            name='video',
            field=models.ForeignKey(to='subgoal.Video'),
            preserve_default=True,
        ),
    ]
