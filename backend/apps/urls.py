from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, PackagingSpecificationViewSet, ProductViewSet, UploadedFileViewSet
from django.urls import path
from .views import (worksheet_data, save_worksheet, reject_report_data, save_reject_report, checksheet_data,
                    save_checksheet, stocktake_data, save_stocktake, traceability_data, save_traceability, 
                    analytics_data,RegisterView, workpack_data, save_user_settings, current_user, admin_users,
                    change_user_role, change_password)

from rest_framework_simplejwt.views import (TokenObtainPairView, TokenRefreshView,)

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("products", ProductViewSet, basename="product")
router.register("uploadedfiles", UploadedFileViewSet, basename="uploadedfile")
router.register("packaging_specifications", PackagingSpecificationViewSet, basename="packaging_specification")

urlpatterns = router.urls + [
    path(
        "admin/users/",
        admin_users,
        name="admin-users"
    ),
    path(
        "admin/users/<int:user_id>/role/",
        change_user_role,
        name="change-user-role"
    ),
    path(
        "settings/save/",
        save_user_settings,
        name="save-user-settings"
    ),
    path(
        "job-processing/workpack/",
        workpack_data,
        name="workpack_data"
    ),
    path(
        "job-processing/worksheet/",
        worksheet_data,
        name="worksheet-data",
    ),
    path(
        "analytics/",
        analytics_data,
        name="analytics_data"
    ),
    path(
        "job-processing/worksheet/save/",
        save_worksheet,
        name="save_worksheet"
    ),
    path(
        "job-processing/reject-report/",
        reject_report_data,
        name="reject-report-data",
    ),
    path(
        "job-processing/reject-report/save/",
        save_reject_report,
        name="save_reject_report"
    ),
    path(
        "job-processing/checksheet/",
        checksheet_data,
        name="checksheet-data",
    ),
    path(
        "job-processing/checksheet/save/",
        save_checksheet,
        name="save_checksheet"
    ),
    path(
        "job-processing/stocktake/",
        stocktake_data,
        name="stocktake-data",
    ),
    path(
        "job-processing/stocktake/save/",
        save_stocktake,
        name="save_stocktake"
    ),
    path(
        "job-processing/traceability/",
        traceability_data,
        name="traceability-data"
    ),
    path(
        "job-processing/traceability/save/",
        save_traceability,
        name="save_traceability"
    ),
    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login"
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="refresh"
    ),
    path(
        "me/",
        current_user,
        name="current-user"
    ),
    path(
        "settings/change-password/",
        change_password,
        name="change-password"
    ),
]