from django.urls import path

from titles import views

app_name = 'titles'

urlpatterns = [
    path('', views.TitlesList.as_view(), name='catalog'),
    path('titles/', views.TitlesList.as_view(), name='catalog'),
    path('titles/<int:pk>/', views.TitlesDetail.as_view(), name='detail'),
]
