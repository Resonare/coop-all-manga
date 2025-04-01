from django.shortcuts import render
from django.core.serializers import serialize
from django.views import generic

from .models import Title, Chapter
import logging
logger = logging.getLogger(__name__)


class TitleList(generic.ListView):
    """Список тайтлов."""
    model = Title
    template_name = 'titles/index.html'
    paginate_by = 20

    '''def get_queryset(self):
        """
        Выводим только несколько последних новостей.

        Их количество определяется в настройках проекта.
        """
        return self.model.objects.prefetch_related(
            'comment_set'
        )[:settings.NEWS_COUNT_ON_HOME_PAGE]'''

    def get_context_data(self, **kwargs):
        context = super(TitleList, self).get_context_data(**kwargs)
        data = serialize("json", context['title_list'])
        context['json'] = data
        return context


class TitleDetail(generic.DetailView):
    model = Title
    template_name = 'titles/description.html'

    def get_context_data(self, **kwargs):
        context = super(TitleDetail, self).get_context_data(**kwargs)
        chapters = list(Chapter.objects.all().filter(manga=self.get_object()))
        context['chapters_json'] = serialize("json", chapters)
        context['title_json'] = serialize("json", [context['title'], ])
        context['tags_json'] = serialize("json", list(self.object.tags.all()))
        context['genres_json'] = serialize("json", list(self.object.genres.all()))
        return context


def page_not_found(request, exception):
    return render(request, 'titles/404.html', status=404)


def server_error(request):
    return render(request, 'titles/500.html', status=500)
