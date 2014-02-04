# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Removing M2M table for field subgoal on 'Step'
        db.delete_table(db.shorten_name(u'subgoal_step_subgoal'))

        # Adding M2M table for field step on 'Subgoal'
        m2m_table_name = db.shorten_name(u'subgoal_subgoal_step')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('subgoal', models.ForeignKey(orm[u'subgoal.subgoal'], null=False)),
            ('step', models.ForeignKey(orm[u'subgoal.step'], null=False))
        ))
        db.create_unique(m2m_table_name, ['subgoal_id', 'step_id'])


    def backwards(self, orm):
        # Adding M2M table for field subgoal on 'Step'
        m2m_table_name = db.shorten_name(u'subgoal_step_subgoal')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('step', models.ForeignKey(orm[u'subgoal.step'], null=False)),
            ('subgoal', models.ForeignKey(orm[u'subgoal.subgoal'], null=False))
        ))
        db.create_unique(m2m_table_name, ['step_id', 'subgoal_id'])

        # Removing M2M table for field step on 'Subgoal'
        db.delete_table(db.shorten_name(u'subgoal_subgoal_step'))


    models = {
        u'subgoal.action': {
            'Meta': {'object_name': 'Action'},
            'action_type': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'stage': ('django.db.models.fields.IntegerField', [], {}),
            'step': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Step']", 'null': 'True', 'blank': 'True'}),
            'subgoal': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Subgoal']", 'null': 'True', 'blank': 'True'}),
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
            'step': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['subgoal.Step']", 'null': 'True', 'blank': 'True'}),
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
            'is_used': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'slug': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'youtube_id': ('django.db.models.fields.CharField', [], {'max_length': '16', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['subgoal']