from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import TitleViewSet, GenreViewSet, TagViewSet, ChapterViewSet


from titles import views

app_name = 'titles'
handler404 = 'titles.views.page_not_found'

router = DefaultRouter()
router.register(r'titles', TitleViewSet, basename='title')
router.register(r'genres', GenreViewSet)
router.register(r'tags', TagViewSet)
router.register(r'chapters', ChapterViewSet)
urlpatterns = [
    path('', views.TitleList.as_view(), name='catalog'),
    path('titles/', views.TitleList.as_view(), name='catalog'),
    path('titles/<int:pk>/', views.TitleDetail.as_view(), name='detail'),
    path('api/', include(router.urls)),
]
