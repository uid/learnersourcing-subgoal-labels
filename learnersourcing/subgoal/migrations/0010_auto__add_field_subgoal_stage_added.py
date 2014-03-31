# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Subgoal.stage_added'
        db.add_column(u'subgoal_subgoal', 'stage_added',
                      self.gf('django.db.models.fields.IntegerField')(default=1),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Subgoal.stage_added'
        db.delete_column(u'subgoal_subgoal', 'stage_added')


    models = {
        u'subgoal.action': {
            'Meta': {'object_name': 'Action'},
            'action_type': ('django.db.models.fields.CharField', [], {'max_length': '32'}),
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'session_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'stage': ('django.db.models.fields.IntegerField', [], {}),
            'step': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Step']", 'null': 'True', 'blank': 'True'}),
            'subgoal': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Subgoal']", 'null': 'True', 'blank': 'True'}),
            'video': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Video']"})
        },
        u'subgoal.expsession': {
            'Meta': {'object_name': 'ExpSession'},
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'cond_admin': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'cond_interval': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'cond_random': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'cond_step': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'session_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
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
        u'subgoal.question': {
            'Meta': {'object_name': 'Question'},
            'added_at': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_asked': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'question_stage': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'session_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'video': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Video']"}),
            'video_time': ('django.db.models.fields.IntegerField', [], {'default': '0'})
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
            'downvotes_s2': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'downvotes_s3': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_final': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'label': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'learner': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Learner']"}),
            'stage_added': ('django.db.models.fields.IntegerField', [], {'default': '1'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '16'}),
            'step': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['subgoal.Step']", 'null': 'True', 'blank': 'True'}),
            'time': ('django.db.models.fields.FloatField', [], {}),
            'upvotes_s2': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'upvotes_s3': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'video': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['subgoal.Video']"})
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