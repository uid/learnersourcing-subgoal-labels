from django.conf import settings
from django.contrib.sessions.middleware import SessionMiddleware
from django.utils.importlib import import_module

class CustomSessionMiddleware(SessionMiddleware):
	def process_request(self, request):
		engine = import_module(settings.SESSION_ENGINE)
		session_key = request.COOKIES.get(settings.SESSION_COOKIE_NAME, None)
		request.session = engine.SessionStore(session_key)
		# if not request.session.exists(request.session.session_key):
		# 	request.session.create()
		if request.session.session_key is None:
			request.session.save()
