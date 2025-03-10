from django.db import models


class Titles(models.Model):
    name = models.CharField(max_length=50)
    year = models.IntegerField()
    status = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    rating = models.FloatField()
    thumbnail = models.CharField(max_length=50)

    class Meta:
        verbose_name_plural = 'Тайтлы'
        verbose_name = 'Тайтл'

    def __str__(self):
        return self.name
