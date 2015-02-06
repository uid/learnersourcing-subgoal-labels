# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subgoal', '0002_auto_20150203_0500'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExpResult',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('test_type', models.CharField(max_length=16)),
                ('result', models.CharField(max_length=1024)),
                ('added_at', models.DateTimeField(auto_now_add=True)),
                ('exp_session_id', models.ForeignKey(to='subgoal.ExpSession')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='expsession',
            name='participant_id',
            field=models.CharField(max_length=16, null=True, blank=True),
            preserve_default=True,
        ),
    ]
