# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subgoal', '0003_auto_20150203_0543'),
    ]

    operations = [
        migrations.RenameField(
            model_name='expresult',
            old_name='exp_session_id',
            new_name='exp_session',
        ),
    ]
