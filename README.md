learnersourcing-subgoal-labels
==============================

learnersourcing: Django directory

learnersourcing/learnersourcing: Django project 

learnersourcing/subgoal: Django app

Django admin credentials: uid / subgoals

migration with south: in case you're not familiar...
1. The developer (you) change the models.py file,
   updating the application's data model.
2. Run manage.py schemamigration subgoal --auto to create
   a migration file for generation N+1.
3. Run manage.py migrate subgoal to update the database
   schema and migrationhistory table to generation N+1.
