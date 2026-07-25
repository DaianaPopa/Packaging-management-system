from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, PackagingSpecificationViewSet, ProductViewSet, UploadedFileViewSet
from django.urls import path
from .views import worksheet_data, reject_report_data, checksheet_data, stocktake_data,traceability_data, RegisterView, me

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("products", ProductViewSet, basename="product")
router.register("uploadedfiles", UploadedFileViewSet, basename="uploadedfile")
router.register("packaging_specifications", PackagingSpecificationViewSet, basename="packaging_specification")

urlpatterns = router.urls + [

    path(
        "job-processing/worksheet/",
        worksheet_data,
        name="worksheet-data",
    ),
    path(
        "job-processing/reject-report/",
        reject_report_data,
        name="reject-report-data",
    ),
    path(
        "job-processing/checksheet/",
        checksheet_data,
        name="checksheet-data",
    ),
    path(
        "job-processing/stocktake/",
        stocktake_data,
        name="stocktake-data",
    ),
    path(
    "job-processing/traceability/",
    traceability_data
    ),
   path(
    "register/",
    RegisterView.as_view()
    ),

    path(
        "login/",
        TokenObtainPairView.as_view()
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view()
    ),

    path(
        "me/",
        me
    ),
]