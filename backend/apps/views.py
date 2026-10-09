from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.utils import timezone
# from datetime import datetime
# from django.db.models import Count

from .models import (
    Customer,
    Product,
    UploadedFile,
    PackagingSpecification,
    Component,
    PackingProcessStep,
    UserProfile,
    Workpack,
    UserActivity,
)

from .serializers import (
    CustomerSerializer,
    ProductSerializer,
    UploadedFileSerializer,
    PackagingSpecificationSerializer,
    RegisterSerializer
)

import openpyxl
import json

# =====================================================
# REGISTER
# =====================================================

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()


# =====================================================
# CURRENT USER
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):

    profile, created = UserProfile.objects.get_or_create(
        user=request.user,
        defaults={"role": "user"}
    )

    return Response({
        "username": request.user.username,
        "fullName": (
            f"{request.user.first_name} "
            f"{request.user.last_name}"
        ).strip(),
        "email": request.user.email,
        "role": profile.role,
    })


# =====================================================
# SAVE SETTINGS
# =====================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_user_settings(request):

    full_name = request.data.get(
        "fullName",
        ""
    ).strip()

    names = full_name.split(" ", 1)

    request.user.first_name = (
        names[0] if len(names) > 0 else ""
    )

    request.user.last_name = (
        names[1] if len(names) > 1 else ""
    )

    request.user.email = request.data.get(
        "email",
        ""
    )

    request.user.save()

    return Response({
        "message": "Settings saved successfully"
    })


# =====================================================
# CHANGE PASSWORD
# =====================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):

    current_password = request.data.get(
        "currentPassword"
    )

    new_password = request.data.get(
        "newPassword"
    )

    confirm_password = request.data.get(
        "confirmPassword"
    )

    if not current_password:
        return Response(
            {"error": "Current password is required"},
            status=400
        )

    if not request.user.check_password(
        current_password
    ):
        return Response(
            {"error": "Current password is incorrect"},
            status=400
        )

    if new_password != confirm_password:
        return Response(
            {"error": "Passwords do not match"},
            status=400
        )

    request.user.set_password(new_password)
    request.user.save()

    update_session_auth_hash(
        request,
        request.user
    )

    return Response({
        "message": "Password changed successfully"
    })


# =====================================================
# ADMIN - GET USERS
# =====================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_users(request):

    try:
        profile = UserProfile.objects.get(
            user=request.user
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=403
        )

    if profile.role != "admin":
        return Response(
            {"error": "Admin access required"},
            status=403
        )

    users = User.objects.all().order_by(
        "username"
    )

    data = []

    for user in users:

        user_profile, created = (
            UserProfile.objects.get_or_create(
                user=user,
                defaults={"role": "user"}
            )
        )

        last_activity = (
            UserActivity.objects
            .filter(user=user)
            .order_by("-created_at")
            .first()
        )

        data.append({
            "id": user.id,
            "username": user.username,
            "fullName": (
                f"{user.first_name} "
                f"{user.last_name}"
            ).strip(),
            "email": user.email,
            "role": user_profile.role,
            "is_active": user.is_active,
            "last_activity": (
                last_activity.created_at
                if last_activity
                else None
            ),
        })

    return Response(data)


# =====================================================
# ADMIN - CHANGE ROLE
# =====================================================

@api_view(["PATCH", "POST"])
@permission_classes([IsAuthenticated])
def change_user_role(request, user_id):

    try:
        profile = UserProfile.objects.get(
            user=request.user
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=403
        )

    if profile.role != "admin":
        return Response(
            {"error": "Admin access required"},
            status=403
        )

    try:
        user = User.objects.get(
            id=user_id
        )
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"},
            status=404
        )

    new_role = request.data.get("role")

    if new_role not in [
        "admin",
        "user"
    ]:
        return Response(
            {
                "error":
                "Role must be admin or user"
            },
            status=400
        )

    user_profile, created = (
        UserProfile.objects.get_or_create(
            user=user,
            defaults={
                "role": new_role
            }
        )
    )

    if not created:
        user_profile.role = new_role
        user_profile.save()

    return Response({
        "message":
        "User role updated successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user_profile.role,
        }
    })
# ---------------------------------------------------------
# WORKPACK DATA
# ---------------------------------------------------------
@api_view(["GET"])
def workpack_data(request):

    product_id = request.GET.get("product")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    try:

        workpack = (
            Workpack.objects
            .filter(product_id=product_id)
            .order_by("-date")
            .first()
        )

        if not workpack:
            return Response(
                {"error": "No workpack found"},
                status=404
            )

    except Exception as e:

        return Response(
            {"error": str(e)},
            status=500
        )

    return Response({
        "worksheet": workpack.worksheet_data,
        "traceability": workpack.traceability_data,
        "reject_report": workpack.reject_report_data,
        "stocktake": workpack.stocktake_data,
        "checksheet": workpack.date_coding_data,
    })
# ---------------------------------------------------------
# ANALYTICS DATA
# ---------------------------------------------------------
@api_view(["GET"])
def analytics_data(request):

    total_products = Product.objects.count()
    total_workpacks = Workpack.objects.count()

    completed = 0
    partial = 0

    for workpack in Workpack.objects.all():

        sections = [
            workpack.worksheet_data,
            workpack.traceability_data,
            workpack.reject_report_data,
            workpack.stocktake_data,
            workpack.date_coding_data,
        ]

        completed_sections = sum(
            1 for section in sections if section
        )

        if completed_sections == len(sections):
            completed += 1

        elif completed_sections > 0:
            partial += 1

    products_with_workpacks = (
        Workpack.objects
        .values("product_id")
        .distinct()
        .count()
    )

    not_started = max(
        0,
        total_products - products_with_workpacks
    )

    products = []

    for product in Product.objects.all():

        workpack_count = Workpack.objects.filter(
            product=product
        ).count()

        latest_workpack = (
            Workpack.objects
            .filter(product=product)
            .order_by("-date")
            .first()
        )

        if workpack_count == 0:

            status = "Not Started"
            last_created = "-"

        else:

            sections = [
                latest_workpack.worksheet_data,
                latest_workpack.traceability_data,
                latest_workpack.reject_report_data,
                latest_workpack.stocktake_data,
                latest_workpack.date_coding_data,
            ]

            completed_sections = sum(
                1 for section in sections if section
            )

            if completed_sections == len(sections):
                status = "Completed"
            else:
                status = "Partial"

            last_created = latest_workpack.date

        products.append({
            "sku": product.sku,
            "product": product.name,
            "customer": getattr(
                product.customer,
                "company_name",
                ""
            ),
            "workpacks": workpack_count,
            "status": status,
            "last_created": last_created,
        })

    products.sort(
        key=lambda x: x["workpacks"],
        reverse=True
    )

    return Response({
        "total_workpacks": total_workpacks,
        "total_products": total_products,
        "completed": completed,
        "partial": partial,
        "not_started": not_started,
        "products": products,
    })

# ---------------------------------------------------------
# WORKSHEET DATA
# ---------------------------------------------------------
@api_view(["GET"])
def worksheet_data(request):

    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    # Product is required
    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    try:
        # Get the product
        product = Product.objects.select_related(
            "customer"
        ).get(id=product_id)

        # Get customer directly from product
        customer = product.customer

        # Get packaging specification
        specification = PackagingSpecification.objects.get(
            product=product
        )

        # Get packing process steps
        steps = PackingProcessStep.objects.filter(
            packaging_specification=specification
        ).order_by("step_number")

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    except PackagingSpecification.DoesNotExist:
        return Response(
            {
                "error": "Packaging specification not found"
            },
            status=404
        )

    return Response({

        "customer": customer.company_name,

        "product": product.name,

        "sku": product.sku,

        "transaction": product.get_transaction_display(),

        "pallet_configuration": product.pallet_configuration,

        "date": report_date or timezone.now().date(),

        "steps": [
            {
                "step_number": step.step_number,
                "instruction": step.instruction
            }
            for step in steps
        ]

    })
    
@api_view(["POST"])
def save_worksheet(request):

    product_id = request.data.get("product")
    report_date = request.data.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    if not report_date:
        return Response(
            {"error": "Date is required"},
            status=400
        )

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    workpack, created = Workpack.objects.get_or_create(
        product=product,
        date=report_date
    )

    workpack.worksheet_data = request.data

    workpack.save()

    return Response({
        "message": "Worksheet saved successfully"
    })

# ---------------------------------------------------------
# REJECT REPORT DATA
# ---------------------------------------------------------
@api_view(["GET"])
def reject_report_data(request):

    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    try:
        product = Product.objects.select_related(
            "customer"
        ).get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    packaging_spec = (
        PackagingSpecification.objects
        .filter(product=product)
        .order_by("-id")
        .first()
    )

    component_data = []

    if packaging_spec:

        component_data = [
            {
                "id": component.id,
                "component_sku": component.component_sku,
                "component_name": component.component_name,
                "supplier": component.supplier,
                "units_per_piece": component.units_per_piece,
                "units_per_outer": component.units_per_outer,
            }
            for component in packaging_spec.components.all()
        ]

    return Response({

        "customer": product.customer.company_name,

        "product": product.name,

        "sku": product.sku,

        "date": report_date,

        "components": component_data,

    })
    
@api_view(["POST"])
def save_reject_report(request):

    product_id = request.data.get("product")
    report_date = request.data.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    if not report_date:
        return Response(
            {"error": "Date is required"},
            status=400
        )

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    workpack, _ = Workpack.objects.get_or_create(
        product=product,
        date=report_date
    )

    workpack.reject_report_data = request.data

    workpack.save()

    return Response({
        "message": "Reject report saved successfully"
    })
    
# ---------------------------------------------------------
# CHECKSHEET DATA
# ---------------------------------------------------------
@api_view(["GET"])
def checksheet_data(request):

    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    try:
        product = Product.objects.select_related(
            "customer"
        ).get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    return Response({

        "customer": product.customer.company_name,

        "product": product.name,

        "sku": product.sku,

        "date": report_date,

        # These can be connected to your actual
        # image fields/files later.
        "outerCodingImage": "",

        "productCodingImage": "",

        "evidenceImage": "",

        "outerCodingImage2": "",

        "productCodingImage2": "",

        "evidenceImage2": "",

    })

@api_view(["POST"])
def save_checksheet(request):

    product_id = request.data.get("product")
    report_date = request.data.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    if not report_date:
        return Response(
            {"error": "Date is required"},
            status=400
        )

    try:
        product = Product.objects.get(
            id=product_id
        )

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    workpack, _ = Workpack.objects.get_or_create(
        product=product,
        date=report_date
    )

    workpack.date_coding_data = request.data

    workpack.save()

    return Response({
        "message": "Checksheet saved successfully"
    })
# ---------------------------------------------------------
# STOCKTAKE DATA
# ---------------------------------------------------------
@api_view(["GET"])
def stocktake_data(request):

    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    try:
        product = Product.objects.get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    packaging_spec = (
        PackagingSpecification.objects
        .filter(product=product)
        .order_by("-id")
        .first()
    )

    component_data = []

    if packaging_spec:

        component_data = [
            {
                "id": component.id,
                "component_sku": component.component_sku,
                "component_name": component.component_name,
                "supplier": component.supplier,
                "units_per_piece": component.units_per_piece,
                "units_per_outer": component.units_per_outer,
            }
            for component in packaging_spec.components.all()
        ]

    return Response({
        "customer": product.customer.company_name,
        "product": product.name,
        "sku": product.sku,
        "date": report_date,
        "components": component_data,
    })
    
@api_view(["POST"])
def save_stocktake(request):

    product_id = request.data.get("product")
    report_date = request.data.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    if not report_date:
        return Response(
            {"error": "Date is required"},
            status=400
        )

    try:
        product = Product.objects.get(
            id=product_id
        )

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    workpack, _ = Workpack.objects.get_or_create(
        product=product,
        date=report_date
    )

    workpack.stocktake_data = request.data

    workpack.save()

    return Response({
        "message": "Stocktake saved successfully"
    })
# ---------------------------------------------------------
# CUSTOMER VIEWSET
# ---------------------------------------------------------
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("company_name")
    serializer_class = CustomerSerializer

    @action(detail=False, methods=["post"], url_path="bulk-delete")
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])
        deleted = Customer.objects.filter(id__in=ids).delete()[0]

        return Response({
            "deleted": deleted,
            "message": f"{deleted} customers deleted successfully"
        })


# ---------------------------------------------------------
# PRODUCT VIEWSET
# ---------------------------------------------------------
class ProductViewSet(viewsets.ModelViewSet):
    #queryset = Product.objects.all().order_by("sku")
    serializer_class = ProductSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    @action(detail=False, methods=["post"], url_path="bulk-delete")
    def bulk_delete(self, request):
        ids = request.data.get("ids", [])
        deleted = Product.objects.filter(id__in=ids).delete()[0]

        return Response({
            "deleted": deleted,
            "message": f"{deleted} products deleted successfully"
        })

    @action(detail=False, methods=["post"], url_path="bulk-upload")
    def bulk_upload(self, request):

        customer_id = request.data.get("customer")
        files = request.FILES.getlist("files")

        if not customer_id:
            return Response(
                {"error": "Customer is required"},
                status=400
            )

        if not files:
            return Response(
                {"error": "No files uploaded"},
                status=400
            )

        created = 0
        errors = []

        uploader = UploadedFileViewSet()

        for file_obj in files:

            try:

                temp_file = UploadedFile.objects.create(
                    product=None,
                    original_name=file_obj.name,
                    file=file_obj
                )

                extracted = uploader.extract_from_excel(
                    temp_file.file.path
                )

                sku = str(extracted.get("sku") or "").strip()
                name = str(extracted.get("name") or "").strip()

                if not sku or not name:
                    errors.append({
                        "file": file_obj.name,
                        "error": "Workbook must include a product SKU and name",
                    })
                    temp_file.delete()
                    continue

                if Product.objects.filter(
                    sku=sku
                ).exists():

                    errors.append({
                        "file": file_obj.name,
                        "error": f"SKU {sku} already exists"
                    })

                    continue

                product = Product.objects.create(
                    customer_id=customer_id,
                    sku=sku,
                    name=name,
                    description="",
                    date_set_up=timezone.now().date(),
                    transaction=extracted.get("transaction", ""),
                    inner_barcode=extracted.get(
                        "inner_barcode",
                        ""
                    ),
                    outer_barcode=extracted.get(
                        "outer_barcode",
                        ""
                    ),
                    pallet_configuration=str(
                        extracted.get(
                            "units_per_outer",
                            ""
                        )
                    ),
                )

                temp_file.product = product
                temp_file.save()

                spec = PackagingSpecification.objects.create(
                    product=product,
                    uploaded_file=temp_file,
                    version="V1",
                    units_per_outer=self._integer_or_zero(
                        extracted.get("units_per_outer")
                    ),
                    ti=self._integer_or_zero(extracted.get("ti")),
                    hi=self._integer_or_zero(extracted.get("hi")),
                )

                for comp in extracted.get(
                    "components",
                    []
                ):

                    Component.objects.create(
                        packaging_specification=spec,
                        component_sku=comp.get(
                            "component_sku",
                            ""
                        ),
                        component_name=comp.get(
                            "component_name",
                            ""
                        ),
                        supplier=comp.get(
                            "supplier",
                            ""
                        ),
                        units_per_piece=comp.get(
                            "units_per_piece",
                            ""
                        ) or "",
                        units_per_outer=comp.get(
                            "units_per_outer",
                            ""
                        ) or "",
                    )

                for step in extracted.get(
                    "steps",
                    []
                ):

                    PackingProcessStep.objects.create(
                        packaging_specification=spec,
                        step_number=step.get(
                            "step_number",
                            0
                        ),
                        instruction=step.get(
                            "instruction",
                            ""
                        ),
                    )

                created += 1

            except Exception as e:

                errors.append({
                    "file": file_obj.name,
                    "error": str(e)
                })

        return Response({
            "message": f"{created} products created successfully",
            "created": created,
            "failed": len(errors),
            "errors": errors
        })

    @staticmethod
    def _integer_or_zero(value):
        try:
            return int(float(value)) if value not in (None, "") else 0
        except (TypeError, ValueError):
            return 0

    def get_queryset(self):

            queryset = Product.objects.all().order_by("sku")

            customer_id = self.request.query_params.get(
                "customer"
            )

            if customer_id:
                queryset = queryset.filter(
                    customer_id=customer_id
                )

            return queryset

    @action(detail=False, methods=["post"], url_path="create-with-file")
    def create_with_file(self, request):

        temp_file_id = request.data.get("temp_file_id")
        temp_file = None
        if temp_file_id:
            try:
                temp_file = UploadedFile.objects.get(id=temp_file_id)
            except UploadedFile.DoesNotExist:
                return Response({"error": "Temporary file not found"}, status=404)

        # Build product data explicitly
        product_data = {
            "customer": request.data.get("customer"),
            "sku": request.data.get("sku"),
            "name": request.data.get("name"),
            "description": request.data.get("description", ""),
            "transaction": request.data.get("transaction", ""),
            "pallet_configuration": request.data.get("pallet_configuration", ""),
            "date_set_up": request.data.get("date_set_up"),
            "issue": request.data.get("issue", ""),
            "issue_date": request.data.get("issue_date"),
            "inner_barcode": request.data.get("inner_barcode", ""),
            "outer_barcode": request.data.get("outer_barcode", ""),
            "suspend_record": request.data.get("suspend_record", False),
        }

        # Create product
        product_serializer = ProductSerializer(data=product_data)
        product_serializer.is_valid(raise_exception=True)
        product = product_serializer.save()

        if temp_file:
            temp_file.product = product
            temp_file.save()

        # Create Packaging Specification
        spec = PackagingSpecification.objects.create(
            product=product,
            uploaded_file=temp_file,
            version="V1",
            units_per_outer=request.data.get("units_per_outer", 0),
            ti=request.data.get("ti", 0),
            hi=request.data.get("hi", 0),
        )

        # ---------------------------------------------------------
        # COMPONENTS (JSON DECODE FIX)
        # ---------------------------------------------------------
        components_raw = request.data.get("components")
        try:
            components = json.loads(components_raw) if components_raw else []
        except json.JSONDecodeError:
            components = []

        for comp in components:
            Component.objects.create(
                packaging_specification=spec,
                component_sku=comp.get("component_sku") or "",
                component_name=comp.get("component_name") or "",
                supplier=comp.get("supplier") or "",
                units_per_piece=comp.get("units_per_piece") or "",
                units_per_outer=comp.get("units_per_outer") or "",
            )

        # ---------------------------------------------------------
        # PACKING STEPS (JSON DECODE FIX)
        # ---------------------------------------------------------
        steps_raw = request.data.get("steps")
        try:
            steps = json.loads(steps_raw) if steps_raw else []
        except json.JSONDecodeError:
            steps = []

        for step in steps:
            PackingProcessStep.objects.create(
                packaging_specification=spec,
                step_number=step.get("step_number") or 0,
                instruction=step.get("instruction") or "",
            )

        return Response(ProductSerializer(product).data, status=201)
   
    @action(detail=False, methods=["get"], url_path="by-customer")
    def by_customer(self, request):

        customer_id = request.GET.get("customer")

        products = Product.objects.filter(
            customer_id=customer_id
        ).order_by("sku")

        serializer = self.get_serializer(
            products,
            many=True
        )

        return Response(serializer.data)


# ---------------------------------------------------------
# UPLOADED FILE VIEWSET (AUTO-FILL)
# ---------------------------------------------------------
class UploadedFileViewSet(viewsets.ModelViewSet):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=["post"], url_path="upload-temp")
    def upload_temp(self, request):
        file_obj = request.FILES.get("file")

        if not file_obj:
            return Response({"error": "file is required"}, status=400)

        # Save file temporarily without linking to a product
        temp_file = UploadedFile.objects.create(
            product=None,
            original_name=file_obj.name,
            file=file_obj
        )

        # AUTO-FILL EXTRACTION LOGIC
        extracted_data = self.extract_from_excel(temp_file.file.path)

        return Response({
            "temp_file_id": temp_file.id,
            "extracted": extracted_data
        })

    # ---------------------------------------------------------
    # EXCEL EXTRACTION
    # ---------------------------------------------------------
    def extract_from_excel(self, file_path):
        wb = openpyxl.load_workbook(file_path, data_only=True)
        sheet = wb.active

        rows = list(sheet.iter_rows(values_only=True))

        data = {
            "sku": "",
            "name": "",
            "units_per_outer": "",
            "ti": "",
            "hi": "",
            "inner_barcode": "",
            "outer_barcode": "",
            "transaction": "",
            "components": [],
            "steps": []
        }

        # -------------------------------------------------------
        # PRODUCT INFORMATION
        # -------------------------------------------------------
         # --------------------------------------------------

        product_headers = None
        product_header_row = None
        for row_index, row in enumerate(rows):
            normalized_cells = [
                str(cell).strip().upper().replace("_", " ") if cell is not None else ""
                for cell in row
            ]
            if "SKU" in normalized_cells and any(
                header in normalized_cells
                for header in ("NAME", "PRODUCT NAME", "PRODUCT DESCRIPTION")
            ):
                product_headers = normalized_cells
                product_header_row = row_index
                break

        if product_headers is not None and product_header_row + 1 < len(rows):
            values = rows[product_header_row + 1]
            header_map = {
                "SKU": "sku",
                "NAME": "name",
                "PRODUCT NAME": "name",
                "PRODUCT DESCRIPTION": "name",
                "INNER BARCODE": "inner_barcode",
                "UNIT BARCODE": "inner_barcode",
                "OUTER BARCODE": "outer_barcode",
                "UNITS PER OUTER": "units_per_outer",
                "TI": "ti",
                "HI": "hi",
                "TRANSACTION": "transaction",
            }
            for index, header in enumerate(product_headers):
                target = header_map.get(header)
                if target and index < len(values) and values[index] is not None:
                    data[target] = str(values[index]).strip()

        for row in rows:

            if not row:
                continue

            first = str(row[0]).strip() if row[0] else ""

            if first.upper() == "COMPONENTS":
                break

            if first.upper() == "COMPONENTS":
                break

            if product_headers is not None and first.upper() in product_headers:
                continue

            for index, cell in enumerate(row[:-1]):
                key = str(cell).strip().upper().replace("_", " ") if cell is not None else ""
                value = row[index + 1]
                if value in (None, ""):
                    continue

                if key == "PRODUCT":
                    data["name"] = str(value).strip()
                elif key == "SKU":
                    data["sku"] = str(value).strip()
                elif key in ("INNER BARCODE", "UNIT BARCODE"):
                    data["inner_barcode"] = str(value).strip()
                elif key == "OUTER BARCODE":
                    data["outer_barcode"] = str(value).strip()
                elif key == "UNITS PER OUTER":
                    data["units_per_outer"] = value
                elif key == "TI":
                    data["ti"] = value
                elif key == "HI":
                    data["hi"] = value
                elif key == "TRANSACTION":
                    data["transaction"] = str(value).strip()

        # -------------------------------------------------------
        # COMPONENTS
        # -------------------------------------------------------
        components_started = False
        component_headers = {}

        for row in rows:

            if not row:
                continue

            first = str(row[0]).strip().upper() if row[0] else ""

            # Find header
            if first == "SKU" and len(row) > 1 and row[1] and "COMPONENT" in str(row[1]).upper():
                components_started = True
                component_headers = {
                    str(value).strip().upper(): index
                    for index, value in enumerate(row)
                    if value not in (None, "")
                }
                continue

            if not components_started:
                continue

            # Stop at packing process
            if first == "PACKING PROCESS":
                break

            if row[0] in ("", None):
                continue

            component = {
                "component_sku": str(row[component_headers.get("SKU", 0)] or "").strip(),
                "component_name": str(row[component_headers.get("COMPONENT", 1)] or "").strip(),
                "supplier": str(row[component_headers.get("SUPPLIER", 2)] or "").strip(),
                "units_per_piece": str(row[component_headers.get("UNITS PER PIECE", 3)] or "").strip(),
                "units_per_outer": str(row[component_headers.get("UNITS PER OUTER", 4)] or "").strip(),
            }

            if component["component_sku"] or component["component_name"]:
                data["components"].append(component)

        # -------------------------------------------------------
        # PACKING PROCESS
        # -------------------------------------------------------
        steps_started = False
        current_step = None

        for row in rows:

            if not row:
                continue

            first = str(row[0]).strip() if row[0] else ""

            if first.upper() == "PACKING PROCESS":
                steps_started = True
                continue

            if not steps_started:
                continue

            # New step
            if first.isdigit():

                instruction = ""

                for cell in row[1:]:
                    if cell not in ("", None):
                        instruction = str(cell).strip()
                        break

                current_step = {
                    "step_number": int(first),
                    "instruction": instruction
                }

                data["steps"].append(current_step)

            # Continuation line
            else:

                if current_step:

                    continuation = ""

                    for cell in row:
                        if cell not in ("", None):
                            continuation = str(cell).strip()
                            break

                    if continuation:
                        current_step["instruction"] += "\n" + continuation

        return data

# ---------------------------------------------------------
# TRACEABILITY DATA
# ---------------------------------------------------------
@api_view(["GET"])
def traceability_data(request):

    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    try:
        product = Product.objects.select_related(
            "customer"
        ).get(id=product_id)

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    packaging_spec = (
        PackagingSpecification.objects
        .filter(product=product)
        .order_by("-id")
        .first()
    )

    component_data = []

    if packaging_spec:

        component_data = [
            {
                "id": component.id,
                "component_sku": component.component_sku,
                "component_name": component.component_name,
            }
            for component
            in packaging_spec.components.all()
        ]

    return Response({

        "customer": product.customer.company_name,

        "product": product.name,

        "sku": product.sku,

        "date": report_date,

        "components": component_data,

    })

@api_view(["POST"])
def save_traceability(request):

    product_id = request.data.get("product")
    report_date = request.data.get("date")

    if not product_id:
        return Response(
            {"error": "Product is required"},
            status=400
        )

    if not report_date:
        return Response(
            {"error": "Date is required"},
            status=400
        )

    try:
        product = Product.objects.get(
            id=product_id
        )

    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=404
        )

    workpack, _ = Workpack.objects.get_or_create(
        product=product,
        date=report_date
    )

    workpack.traceability_data = request.data

    workpack.save()

    return Response({
        "message": "Traceability saved successfully"
    })
# ---------------------------------------------------------
# PACKAGING SPECIFICATION VIEWSET
# ---------------------------------------------------------
class PackagingSpecificationViewSet(viewsets.ModelViewSet):
    queryset = PackagingSpecification.objects.all()
    serializer_class = PackagingSpecificationSerializer
