learnersourcing-subgoal-labels
==============================

# Project and files
- learnersourcing: Django directory
- learnersourcing/learnersourcing: Django project 
- learnersourcing/subgoal: Django app

Django admin credentials: uid / subgoals

# Migration
migration with south: in case you're not familiar...
1. The developer (you) change the models.py file,
   updating the application's data model.
2. Run manage.py schemamigration subgoal --auto to create
   a migration file for generation N+1.
3. Run manage.py migrate subgoal to update the database
   schema and migrationhistory table to generation N+1.

# Session management
In order to differentiate activities between each anonymous user, we store request.session.session_key for page session, action, and record. But Django by default does not have a valid session_key until the first view is fully rendered, which means that the view handling the initial request does not have the right session_key. To address this issue, we added custom middleware that manually saves a session before the view handles the request to secure a session_key.

- The idea of using save() to manually get a valid session ID: http://stackoverflow.com/questions/10641142/django-how-to-access-session-key-in-middleware
- The idea of using custom middleware we borrow from, but create() doesn't work so we use save(): http://stackoverflow.com/questions/5130639/django-setting-a-session-and-getting-session-key-in-same-view
- The idea of modifying the session structure doesn't apply to first-time view because it has not been saved yet: http://stackoverflow.com/questions/16370339/django-1-5-session-key-is-none
- The idea of setting SESSION_SAVE_EVERY_REQUEST to True, but this results in inconsistent sessions even for a single user: https://docs.djangoproject.com/en/1.5/topics/http/sessions/#using-sessions-out-of-views

Caveat: Even with this fix, the first time session has a different session ID from the rest of the user's session IDs. Should be careful when analyzing sessions to map with each user activity.

