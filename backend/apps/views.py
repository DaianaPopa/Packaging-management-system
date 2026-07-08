from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    Customer,
    Product,
    UploadedFile,
    PackagingSpecification,
    Component,
    PackingProcessStep
)

from .serializers import (
    CustomerSerializer,
    ProductSerializer,
    UploadedFileSerializer,
    PackagingSpecificationSerializer
)

import openpyxl


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
    queryset = Product.objects.all().order_by("sku")
    serializer_class = ProductSerializer
    parser_classes = (MultiPartParser, FormParser)

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

        # Create product
        product_serializer = ProductSerializer(data=request.data)
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
            hi=request.data.get("hi", 0)
        )

        # Save Components
        components = request.data.get("components", [])
        for comp in components:
            Component.objects.create(
                packaging_specification=spec,
                component_sku=comp.get("component_sku", ""),
                component_name=comp.get("component_name", ""),
                supplier=comp.get("supplier", ""),
                units_per_piece=comp.get("units_per_piece", ""),
                units_per_outer=comp.get("units_per_outer", "")
            )

        # Save Packing Steps
        steps = request.data.get("steps", [])
        for step in steps:
            PackingProcessStep.objects.create(
                packaging_specification=spec,
                step_number=step.get("step_number"),
                instruction=step.get("instruction", "")
            )

        return Response(ProductSerializer(product).data, status=201)


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

        rows = list(sheet.iter_rows(values_only=True))

        # PRODUCT HEADER
        header_row = None
        for row in rows:
            if row and "SKU" in [str(c).strip() for c in row if c]:
                header_row = row
                break

        if header_row:
            header_index = rows.index(header_row)
            values_row = rows[header_index + 1]
            headers = [str(h).strip().upper() for h in header_row]

            for i, header in enumerate(headers):
                value = values_row[i] if i < len(values_row) else ""

                if header == "PRODUCT":
                    data["name"] = value
                elif header == "SKU":
                    data["sku"] = value
                elif header == "INNER BARCODE":
                    data["inner_barcode"] = value
                elif header == "OUTER BARCODE":
                    data["outer_barcode"] = value
                elif header == "UNITS PER OUTER":
                    data["units_per_outer"] = value
                elif header == "TI":
                    data["ti"] = value
                elif header == "HI":
                    data["hi"] = value

        # COMPONENTS
        components_started = False
        for row in rows:
            if not row:
                continue

            if ("SKU" in str(row[0]).upper() and "COMPONENT" in str(row[1]).upper()):
                components_started = True
                continue

            if components_started:
                if str(row[0]).strip().isdigit():
                    break

                sku = row[0]
                supplier = row[2]

                if sku:
                    data["components"].append({
                        "component_sku": sku,
                        "supplier": supplier
                    })

        # PACKING STEPS
        steps_started = False
        for row in rows:
            if not row:
                continue

            if str(row[0]).strip().upper() == "PACKING PROCESS":
                steps_started = True
                continue

            if steps_started and str(row[0]).strip().isdigit():
                data["steps"].append({
                    "step_number": int(row[0]),
                    "instruction": row[1]
                })

        return data


# ---------------------------------------------------------
# PACKAGING SPECIFICATION VIEWSET
# ---------------------------------------------------------
class PackagingSpecificationViewSet(viewsets.ModelViewSet):
    queryset = PackagingSpecification.objects.all()
    serializer_class = PackagingSpecificationSerializer
