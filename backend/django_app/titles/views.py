from django.shortcuts import render
from django.core.serializers import serialize
from django.views import generic
from rest_framework import viewsets, status
from rest_framework.response import Response
import logging
import requests

from .models import Title, Chapter, Genre, Tag, Chapter
from .serializers import TitleSerializer, GenreSerializer, TagSerializer, ChapterSerializer
from .requests import get_title, get_titles
logger = logging.getLogger(__name__)


class TitleList(generic.ListView):
    """Список тайтлов."""
    model = Title
    template_name = 'titles/index.html'
    paginate_by = 30

    '''def get_queryset(self):
        """
        Выводим только несколько последних новостей.

        Их количество определяется в настройках проекта.
        """
        return self.model.objects.prefetch_related(
            'comment_set'
        )[:settings.NEWS_COUNT_ON_HOME_PAGE]'''

    def get_context_data(self, **kwargs):
        # try:
        #     get_titles('http://192.168.88.202:3000')
        # except requests.exceptions.ConnectTimeout:
        #     pass
        context = super(TitleList, self).get_context_data(**kwargs)
        data = serialize("json", context['title_list'])
        context['json'] = data
        return context


class TitleDetail(generic.DetailView):
    model = Title
    template_name = 'titles/description.html'

    def get_context_data(self, **kwargs):
        # try:
        #     get_title('http://192.168.88.202:3000', self.kwargs['pk'])
        # except requests.exceptions.ConnectTimeout:
        #     pass
        context = super(TitleDetail, self).get_context_data(**kwargs)
        chapters = list(Chapter.objects.all().filter(manga=self.get_object()))
        context['chapters_json'] = serialize("json", chapters)
        context['title_json'] = serialize("json", [context['title'], ])
        context['tags_json'] = serialize("json", list(self.object.tags.all()))
        context['genres_json'] = serialize("json", list(self.object.genres.all()))
        return context


class TitleViewSet(viewsets.ModelViewSet):
    queryset = Title.objects.all()
    serializer_class = TitleSerializer

    def create(self, request, *args, **kwargs):
        # Если пришёл массив объектов
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_bulk_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # Обычное поведение для одного объекта
        return super().create(request, *args, **kwargs)

    def perform_bulk_create(self, serializer):
        serializer.save()


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer

def page_not_found(request, exception):
    return render(request, 'titles/404.html', status=404)


def server_error(request):
    return render(request, 'titles/500.html', status=500)
