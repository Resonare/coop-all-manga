import requests

from .serializers import TitleSerializer, ChapterSerializer
import logging
logger = logging.getLogger(__name__)

def get_title(url, index):
    response = requests.api.get(url+'/titles/'+str(index)+'/')
    if response.status_code == 200:
        title = response.json()
        title_serializer = TitleSerializer(data=title)
        logger.error(title_serializer.is_valid())
        logger.error(title_serializer.errors)
        # title_serializer.save()


def get_titles(url):
    response = requests.api.get(url+'/titles/')
    if response.status_code == 200:
        titles = response.json()
        title_serializer = TitleSerializer(data=titles, many=True)
        logger.error(title_serializer.is_valid())
        title_serializer.save()


def launch_parse(url):
    response = requests.api.get(url+'/parse/')
    return response.status_code