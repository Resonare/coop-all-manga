from django.db import models


class NameAbstract(models.Model):
    """
    Модель с полем имени
    """
    name = models.CharField("Название", max_length=255, default="Нет названия")

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class Genre(NameAbstract):
    """
    Модель данных для жанров
    """
    class Meta:
        verbose_name = "жанр"
        verbose_name_plural = "Жанры"


class Tag(NameAbstract):
    """
    Модель данных для тегов
    """
    class Meta:
        verbose_name = "тег"
        verbose_name_plural = "Теги"


class Title(NameAbstract):
    """
    Модель данных для тайтла
    """
    description = models.TextField("Описание", default="Нет описания")
    author = models.CharField("Автор", max_length=255, default="Неизвестен")
    year = models.CharField("Год выпуска", max_length=4, default="0000")
    status = models.CharField("Статус выхода", max_length=127, default="Неизвестен")
    type = models.CharField("Тип", max_length=127, default="Неизвестен")
    rating = models.FloatField("Рейтинг", default=0.0)
    mangalib_url = models.CharField("Ссылка на MangaLib", max_length=255)
    remanga_url = models.CharField("Ссылка на ReManga", max_length=255, blank=True)
    genres = models.ManyToManyField(Genre, verbose_name="Жанры")
    tags = models.ManyToManyField(Tag, verbose_name="Теги")
    thumbnail = models.URLField("Превью", max_length=200, default="")
    cover = models.URLField("Полная обложка", max_length=200, default="")

    class Meta:
        verbose_name = "тайтл"
        verbose_name_plural = "Тайтлы"


class Chapter(NameAbstract):
    """
    Модель данных для глав тайтлов
    """
    source = models.CharField("Источник", max_length=50, default="Неизвестен")
    release = models.DateField("Дата выпуска")
    translator = models.CharField("Переводчик", max_length=255, default="Неизвестен")
    link = models.URLField("Ссылка", max_length=200)
    manga = models.ForeignKey(Title, on_delete=models.CASCADE, related_name="chapters")

    class Meta:
        verbose_name = "глава"
        verbose_name_plural = "Главы"
