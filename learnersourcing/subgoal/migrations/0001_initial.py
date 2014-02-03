# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Learner'
        db.create_table(u'subgoal_learner', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('username', self.gf('django.db.models.fields.CharField')(max_length=16)),
            ('password', self.gf('django.db.models.fields.CharField')(max_length=32)),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=75)),
            ('is_admin', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('added_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'subgoal', ['Learner'])

        # Adding model 'Video'
        db.create_table(u'subgoal_video', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('domain', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('slug', self.gf('django.db.models.fields.CharField')(max_length=32)),
            ('duration', self.gf('django.db.models.fields.IntegerField')()),
            ('added_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('learner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Learner'])),
        ))
        db.send_create_signal(u'subgoal', ['Video'])

        # Adding model 'Subgoal'
        db.create_table(u'subgoal_subgoal', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('video', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Video'])),
            ('time', self.gf('django.db.models.fields.FloatField')()),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('added_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('learner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Learner'])),
            ('is_final', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=16)),
            ('votes', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal(u'subgoal', ['Subgoal'])

        # Adding model 'Step'
        db.create_table(u'subgoal_step', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('video', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Video'])),
            ('time', self.gf('django.db.models.fields.FloatField')()),
            ('label', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('added_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('learner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Learner'])),
            ('is_final', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'subgoal', ['Step'])

        # Adding M2M table for field subgoal on 'Step'
        m2m_table_name = db.shorten_name(u'subgoal_step_subgoal')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('step', models.ForeignKey(orm[u'subgoal.step'], null=False)),
            ('subgoal', models.ForeignKey(orm[u'subgoal.subgoal'], null=False))
        ))
        db.create_unique(m2m_table_name, ['step_id', 'subgoal_id'])

        # Adding model 'Action'
        db.create_table(u'subgoal_action', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('video', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Video'])),
            ('learner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Learner'])),
            ('subgoal', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Subgoal'])),
            ('step', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['subgoal.Step'])),
            ('action_type', self.gf('django.db.models.fields.CharField')(max_length=32)),
            ('added_at', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal(u'subgoal', ['Action'])


    def backwards(self, orm):
        # Deleting model 'Learner'
        db.delete_table(u'subgoal_learner')

        # Deleting model 'Video'
        db.delete_table(u'subgoal_video')

        # Deleting model 'Subgoal'
        db.delete_table(u'subgoal_subgoal')

        # Deleting model 'Step'
        db.delete_table(u'subgoal_step')

        # Removing M2M table for field subgoal on 'Step'
        db.delete_table(db.shorten_name(u'subgoal_step_subgoal'))

        # Deleting model 'Action'
        db.delete_table(u'subgoal_action')


    models = {
        u'subgoal.action': {
            'Meta': {'object_name': 'Action'},
            'action_type': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'step': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Step']"}),
            'subgoal': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Subgoal']"}),
            'video': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Video']"})
        },
        u'subgoal.learner': {
            'Meta': {'object_name': 'Learner'},
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_admin': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'username': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        },
        u'subgoal.step': {
            'Meta': {'object_name': 'Step'},
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_final': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'subgoal': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['subgoal.Subgoal']", 'symmetrical': 'False'}),
            'time': ('django.db.models.fields.FloatField', [], {}),
            'video': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Video']"})
        },
        u'subgoal.subgoal': {
            'Meta': {'object_name': 'Subgoal'},
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_final': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '16'}),
            'time': ('django.db.models.fields.FloatField', [], {}),
            'video': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Video']"}),
            'votes': ('django.db.models.fields.IntegerField', [], {})
        },
        u'subgoal.video': {
            'Meta': {'object_name': 'Video'},
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'domain': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'duration': ('django.db.models.fields.IntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'slug': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['subgoal']