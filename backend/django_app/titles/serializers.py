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
    genres = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    tags = serializers.ListField(child=serializers.CharField(), write_only=True, required=False)
    chapters = ChapterSerializer(many=True, read_only=True)
    sources = serializers.DictField(child=serializers.ListField(child=serializers.DictField()), write_only=True, required=False)

    class Meta:
        model = Title
        fields = [
            'id', 'name', 'description', 'author', 'year', 'status', 'type', 'rating',
            'mangalib_url', 'remanga_url', 'genres', 'tags', 'thumbnail', 'cover', 'chapters', 'sources'
        ]
        extra_kwargs = {
            'genres': {'required': False},
            'tags': {'required': False},
            'chapters': {'required': False},
        }

    def create(self, validated_data):
        genres_data = validated_data.pop('genres', [])
        tags_data = validated_data.pop('tags', [])
        sources_data = validated_data.pop('sources', {})

        mangalib_url = validated_data.get('mangalib_url')
        title = Title.objects.filter(mangalib_url=mangalib_url).first()
        if title:
            for attr, value in validated_data.items():
                setattr(title, attr, value)
            title.save()
        else:
            title = Title.objects.create(**validated_data)

        if genres_data:
            title.genres.clear()
            for genre_name in genres_data:
                genre, _ = Genre.objects.get_or_create(name=genre_name)
                title.genres.add(genre)

        if tags_data:
            title.tags.clear()
            for tag_name in tags_data:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                title.tags.add(tag)

        for source, chapters in sources_data.items():
            for chapter_data in chapters:
                Chapter.objects.update_or_create(
                    manga=title,
                    source=source,
                    name=chapter_data['name'],
                    defaults={
                        'release': chapter_data['release'],
                        'translator': chapter_data['translator'],
                        'link': chapter_data['link'],
                    }
                )

        return title