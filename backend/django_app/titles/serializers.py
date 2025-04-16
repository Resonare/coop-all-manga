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

    def create(self, validated_data):
        manga_data = validated_data.pop('manga')
        title_instance = Title.objects.get(id=manga_data['id'])  # Находим Title по ID
        return Chapter.objects.create(manga=title_instance, **validated_data)


class TitleSerializer(serializers.ModelSerializer):
    """
    Сериализатор для тайтла
    """
    genres = GenreSerializer(many=True)
    tags = TagSerializer(many=True)
    chapters = ChapterSerializer(many=True)

    class Meta:
        model = Title
        fields = ['id', 'name', 'description', 'author', 'year', 'status', 'type', 'rating', 'genres', 'tags', 'thumbnail', 'cover', 'chapters']

    def create(self, validated_data):
        genres_data = validated_data.pop('genres')
        tags_data = validated_data.pop('tags')
        chapters_data = validated_data.pop('chapters')

        # Создаем объект Title
        title = Title.objects.create(**validated_data)

        # Обрабатываем жанры
        for genre_data in genres_data:
            genre, created = Genre.objects.get_or_create(name=genre_data['name'])
            title.genres.add(genre)

        # Обрабатываем теги
        for tag_data in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_data['name'])
            title.tags.add(tag)

        # Создаем главы и связываем их с тайтлом
        for chapter_data in chapters_data:
            chapter_data['manga'] = title  # Привязываем главу к тайтлу
            Chapter.objects.create(**chapter_data)

        return title