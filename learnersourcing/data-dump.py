import csv
import json
from django.db.models.loading import get_model

def dump(qs, outfile_path, test_type, num_result_fields):
    """
    Takes in a Django queryset and spits out a CSV file.

    Usage::

        >> from utils import dump2csv
        >> from dummy_app.models import *
        >> qs = DummyModel.objects.all()
        >> dump2csv.dump(qs, './data/ExpResult.csv')

    Based on a snippet by zbyte64::

        http://www.djangosnippets.org/snippets/790/

    """
    model = qs.model
    writer = csv.writer(open(outfile_path, 'w'))

    headers = []
    for field in model._meta.fields:
        headers.append(field.name)
    headers.append('session_id')
    headers.append('participant_id')
    headers.append('video')
    headers.append('group')
    for i in range(num_result_fields):
	headers.append(test_type + '_' + str(i+1))
    writer.writerow(headers)

    approved_sessions = [11640, 11602, 11621, 11617, 11627, 11601, 11597, 11614, 11622, 11625, 11737, 11738, 11767, 11744, 11742, 11732, 11740, 11762, 11803, 11735, 11739, 11779, 11789, 11765, 11730, 11774, 11801, 11784, 11798]

    for obj in qs:
        if int(obj.exp_session.id) not in approved_sessions:
            continue
        row = []
	results = json.loads(obj.result)
        for field in headers:
	    try:
                val = getattr(obj, field)
                if callable(val):
                    val = val()
                if type(val) == unicode:
                    val = val.encode("utf-8")
	    except AttributeError:
                if field == 'session_id':
                    val = obj.exp_session.id
                elif field == 'participant_id':
                    val = obj.exp_session.participant_id
                elif field == 'video':
                    val = obj.exp_session.video.id
                elif field == 'group':
                    val = obj.exp_session.cond_group
                elif field in results:
                    val = results[field]
                else:
                    val = ''
            row.append(val)
        writer.writerow(row)

if __name__ == "__main__":
    import os
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "learnersourcing.settings")
    import django
    django.setup()

    from subgoal.models import *
    qs = ExpResult.objects.all().filter(test_type='pretest',exp_session__participant_id__startswith='M',exp_session__cond_study=True)
    dump(qs, './data/ExpResult-pretest.csv', 'pretest', 21)
    qs = ExpResult.objects.all().filter(test_type='posttest',exp_session__participant_id__startswith='M',exp_session__cond_study=True)
    dump(qs, './data/ExpResult-posttest.csv', 'posttest', 27)
