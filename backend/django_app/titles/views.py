from django.core.serializers.json import DjangoJSONEncoder
from django.core.serializers import serialize
from django.views import generic
import json

#from .models import Titles, Chapter
import logging
logger = logging.getLogger(__name__)


class TitlesList(generic.ListView):
    """Список тайтлов."""
    #model = Titles
    template_name = 'titles/index.html'

    '''def get_queryset(self):
        """
        Выводим только несколько последних новостей.

        Их количество определяется в настройках проекта.
        """
        return self.model.objects.prefetch_related(
            'comment_set'
        )[:settings.NEWS_COUNT_ON_HOME_PAGE]'''
    
    def get_context_data(self, **kwargs):
        context = super(TitlesList, self).get_context_data(**kwargs)
        data = serialize("json", context['titles_list'])
        context['json'] = data
        return context


class TitlesDetail(generic.DetailView):
    #model = Titles
    template_name = 'titles/description.html'
    def get_context_data(self, **kwargs):
        context = super(TitlesList, self).get_context_data(**kwargs)
        #context['chapters'] = Chapter.objects.filter(title=self.get_object())
        data = serialize("json", context['titles_list'])
        context['json'] = data
        return context
