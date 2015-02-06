# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subgoal', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='expsession',
            name='cond_group',
            field=models.IntegerField(default=0, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='expsession',
            name='cond_study',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
