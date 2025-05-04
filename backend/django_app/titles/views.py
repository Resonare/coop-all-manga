from django.shortcuts import render
from django.core.serializers import serialize
from django.views import generic
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
import logging

from .models import Title, Chapter, Genre, Tag, Chapter
from .serializers import TitleSerializer, GenreSerializer, TagSerializer, ChapterSerializer
from .requests import get_title, get_titles
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
        get_titles('http://192.168.88.201:3000')
        context = super(TitleList, self).get_context_data(**kwargs)
        data = serialize("json", context['title_list'])
        context['json'] = data
        return context


class TitleDetail(generic.DetailView):
    model = Title
    template_name = 'titles/description.html'

    def get_object(self):
        get_title('http://192.168.88.201:3000', Title.objects.get(pk=self.kwargs['pk']).mangalib_url)
        obj = super().get_object()
        return obj

    def get_context_data(self, **kwargs):
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

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params
        q = Q()

        # Диапазон года
        year_from = params.get('year_from')
        year_to = params.get('year_to')
        if year_from:
            q &= Q(year__gte=year_from)
        if year_to:
            q &= Q(year__lte=year_to)

        # Диапазон рейтинга
        rating_min = params.get('rating_min')
        rating_max = params.get('rating_max')
        if rating_min:
            q &= Q(rating__gte=rating_min)
        if rating_max:
            q &= Q(rating__lte=rating_max)

        # Тип (может быть несколько: ?type=Манга&type=Манхва)
        types = params.getlist('type')
        if types:
            q &= Q(type__in=types)

        # Статус (может быть несколько: ?status=Завершён&status=Онгоинг)
        statuses = params.getlist('status')
        if statuses:
            q &= Q(status__in=statuses)

        # Поиск
        search = params.get('search')
        if search:
            q &= (Q(name__icontains=search) | Q(author__icontains=search))
        queryset = queryset.filter(q).distinct()
        
        # Сортировка
        order_by = params.get('order_by')
        if order_by in ['year', '-year', 'rating', '-rating']:
            queryset = queryset.order_by(order_by)
        return queryset


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
