from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from django.utils import timezone

from .models import (
    Customer,
    Product,
    UploadedFile,
    PackagingSpecification,
    Component,
    PackingProcessStep,
    UserProfile
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
from rest_framework.decorators import api_view


# register/login
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    queryset = User.objects.all()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):

    profile = UserProfile.objects.get(
        user=request.user
    )

    return Response({
        "id": request.user.id,
        "username": request.user.username,
        "role": profile.role,
    })
# ---------------------------------------------------------
# WORKSHEET DATA
# ---------------------------------------------------------
@api_view(["GET"])
def worksheet_data(request):

    customer_id = request.GET.get("customer")
    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    try:
        customer = Customer.objects.get(id=customer_id)
        product = Product.objects.get(id=product_id)

        specification = PackagingSpecification.objects.get(product=product)

        steps = PackingProcessStep.objects.filter(
            packaging_specification=specification
        ).order_by("step_number")

    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    except PackagingSpecification.DoesNotExist:
        return Response({"error": "Packaging specification not found"}, status=404)

    return Response({

        "customer": customer.company_name,

        "product": product.name,

        "sku": product.sku,

        "transaction": product.get_transaction_display(),

        "pallet_configuration": product.pallet_configuration,

        "date": report_date,

        "steps": [

            {
                "step_number": s.step_number,
                "instruction": s.instruction
            }

            for s in steps

        ]

    })


# ---------------------------------------------------------
# REJECT REPORT DATA
# ---------------------------------------------------------
@api_view(["GET"])
def reject_report_data(request):

    customer_id = request.GET.get("customer")
    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    try:
        customer = Customer.objects.get(id=customer_id)
        product = Product.objects.get(id=product_id)

    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    return Response({

        "customer": customer.company_name,

        "product": product.name,

        "sku": product.sku,

        "date": report_date,

    })


# ---------------------------------------------------------
# CHECKSHEET DATA
# ---------------------------------------------------------
@api_view(["GET"])
def checksheet_data(request):

    customer_id = request.GET.get("customer")
    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    try:
        customer = Customer.objects.get(id=customer_id)
        product = Product.objects.get(id=product_id)

    except Customer.DoesNotExist:
        return Response({"error": "Customer not found"}, status=404)

    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    return Response({

        "customer": customer.company_name,

        "product": product.name,

        "sku": product.sku,

        "date": report_date,

    })

# ---------------------------------------------------------
# STOCKTAKE DATA
# ---------------------------------------------------------
@api_view(["GET"])
def stocktake_data(request):

    customer_id = request.GET.get("customer")
    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    try:
        customer = Customer.objects.get(id=customer_id)
        product = Product.objects.get(id=product_id)

    except Customer.DoesNotExist:
        return Response(
            {"error": "Customer not found"},
            status=404
        )

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
        "customer": customer.company_name,
        "product": product.name,
        "sku": product.sku,
        "date": report_date,
        "components": component_data,
    })

# ---------------------------------------------------------
# CUSTOMER VIEWSET
# ---------------------------------------------------------
class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("company_name")
    serializer_class = CustomerSerializer


# ---------------------------------------------------------
# PRODUCT VIEWSET
# ---------------------------------------------------------
class ProductViewSet(viewsets.ModelViewSet):
    #queryset = Product.objects.all().order_by("sku")
    serializer_class = ProductSerializer
    parser_classes = (JSONParser, MultiPartParser, FormParser)

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

                sku = extracted.get("sku", "")

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
                    name=extracted.get("name", ""),
                    description="",
                    date_set_up=timezone.now().date(),
                    transaction="other",
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
                    units_per_outer=extracted.get(
                        "units_per_outer",
                        0
                    ) or 0,
                    ti=extracted.get("ti", 0) or 0,
                    hi=extracted.get("hi", 0) or 0,
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
                        ),
                        units_per_outer=comp.get(
                            "units_per_outer",
                            ""
                        ),
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
        if not temp_file_id:
            return Response({"error": "temp_file_id is required"}, status=400)

        # Validate temp file
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
        }

        # Create product
        product_serializer = ProductSerializer(data=product_data)
        product_serializer.is_valid(raise_exception=True)
        product = product_serializer.save()

        # Attach file to product
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
            "components": [],
            "steps": []
        }

        # -------------------------------------------------------
        # PRODUCT INFORMATION
        # -------------------------------------------------------
         # --------------------------------------------------

        for row in rows:

            if not row:
                continue

            first = str(row[0]).strip() if row[0] else ""

            if first.upper() == "COMPONENTS":
                break

            value = None
            for cell in row[1:]:
                if cell not in ("", None):
                    value = cell
                    break

            key = first.upper()

            if key == "PRODUCT":
                data["name"] = str(value)

            elif key == "SKU":
                data["sku"] = str(value)

            elif key == "INNER BARCODE":
                data["inner_barcode"] = str(value)

            elif key == "OUTER BARCODE":
                data["outer_barcode"] = str(value)

            elif key == "UNITS PER OUTER":
                data["units_per_outer"] = value

            elif key == "TI":
                data["ti"] = value

            elif key == "HI":
                data["hi"] = value

        # -------------------------------------------------------
        # COMPONENTS
        # -------------------------------------------------------
        components_started = False

        for row in rows:

            if not row:
                continue

            first = str(row[0]).strip().upper() if row[0] else ""

            # Find header
            if first == "SKU" and len(row) > 1 and row[1] and "COMPONENT" in str(row[1]).upper():
                components_started = True
                continue

            if not components_started:
                continue

            # Stop at packing process
            if first == "PACKING PROCESS":
                break

            if row[0] in ("", None):
                continue

            # Remove empty cells while preserving order
            values = [str(c).strip() for c in row if c not in ("", None)]

            component = {
                "component_sku": values[0] if len(values) > 0 else "",
                "component_name": values[1] if len(values) > 1 else "",
                "supplier": values[2] if len(values) > 2 else "",
                "units_per_piece": values[-2] if len(values) >= 4 else "",
                "units_per_outer": values[-1] if len(values) >= 5 else "",
            }

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

    customer_id = request.GET.get("customer")
    product_id = request.GET.get("product")
    report_date = request.GET.get("date")

    try:
        customer = Customer.objects.get(id=customer_id)
        product = Product.objects.get(id=product_id)

    except Customer.DoesNotExist:
        return Response(
            {"error": "Customer not found"},
            status=404
        )

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
            for component in packaging_spec.components.all()
        ]

    return Response({
        "customer": customer.company_name,
        "product": product.name,
        "sku": product.sku,
        "date": report_date,
        "components": component_data,
    })

# ---------------------------------------------------------
# PACKAGING SPECIFICATION VIEWSET
# ---------------------------------------------------------
class PackagingSpecificationViewSet(viewsets.ModelViewSet):
    queryset = PackagingSpecification.objects.all()
    serializer_class = PackagingSpecificationSerializer
