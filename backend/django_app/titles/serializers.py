from rest_framework import serializers

from .models import Genre, Tag, Chapter, Title

class GenreSerializer(serializers.ModelSerializer):
    """
    Сериализатор для жанра
    """
    class Meta:
        model = Genre
        fields = ['id', 'name']


class TagSerializer(serializers.ModelSerializer):
    """
    Сериализатор для тега
    """
    class Meta:
        model = Tag
        fields = ['id', 'name']


class ChapterSerializer(serializers.ModelSerializer):
    """
    Сериализатор для главы
    """
    class Meta:
        model = Chapter
        fields = ['id', 'name', 'source', 'release', 'translator', 'link']


class TitleSerializer(serializers.ModelSerializer):
    """
    Сериализатор для тайтла
    """
    genres = GenreSerializer(many=True)
    tags = TagSerializer(many=True)
    chapters = ChapterSerializer(many=True, read_only=True)

    class Meta:
        model = Title
        fields = ['id', 'name', 'description', 'author', 'year', 'status', 'type', 'rating', 'genres', 'tags', 'thumbnail', 'cover', 'chapters']
