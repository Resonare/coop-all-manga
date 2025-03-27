from django.contrib import admin

from .models import Title, Chapter, Genre, Tag

admin.site.register(Title)
admin.site.register(Chapter)
admin.site.register(Genre)
admin.site.register(Tag)