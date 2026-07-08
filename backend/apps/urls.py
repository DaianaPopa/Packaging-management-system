from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, PackagingSpecificationViewSet, ProductViewSet, UploadedFileViewSet

router = DefaultRouter()
router.register("customers", CustomerViewSet, basename="customer")
router.register("products", ProductViewSet, basename="product")
router.register("uploadedfiles", UploadedFileViewSet, basename="uploadedfile")
router.register("packaging_specifications", PackagingSpecificationViewSet, basename="packaging_specification")

urlpatterns = router.urls