from django.contrib import admin

# Register your models here.

from .models import Workpack

@admin.register(Workpack)
class WorkpackAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "date",
        "updated_at",
    )

    search_fields = (
        "product__sku",
        "product__name",
    )

    list_filter = ("date",)