from django.urls import path

from titles import views

app_name = 'titles'

urlpatterns = [
    path('', views.TitleList.as_view(), name='catalog'),
    path('titles/', views.TitleList.as_view(), name='catalog'),
    path('titles/<int:pk>/', views.TitleDetail.as_view(), name='detail'),
]
