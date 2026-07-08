from rest_framework import serializers
from .models import (
    Customer,
    Product,
    UploadedFile,
    PackagingSpecification,
    Component,
    PackingProcessStep,
)


# ---------------------------------------------------------
# CUSTOMER
# ---------------------------------------------------------
class CustomerSerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "company_name",
            "email",
            "phone",
            "address",
            "product_count",
            "created_at",
            "updated_at",
        ]

    def get_product_count(self, obj):
        return obj.products.count()


# ---------------------------------------------------------
# UPLOADED FILE
# ---------------------------------------------------------
class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "product",
            "original_name",
            "file",
            "uploaded_at",
        ]


# ---------------------------------------------------------
# COMPONENT
# ---------------------------------------------------------
class ComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Component
        fields = [
            "id",
            "component_sku",
            "component_name",
            "supplier",
            "units_per_piece",
            "units_per_outer",
        ]


# ---------------------------------------------------------
# PACKING PROCESS STEP
# ---------------------------------------------------------
class PackingProcessStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingProcessStep
        fields = [
            "id",
            "step_number",
            "instruction",
        ]


# ---------------------------------------------------------
# PACKAGING SPECIFICATION
# ---------------------------------------------------------
class PackagingSpecificationSerializer(serializers.ModelSerializer):
    components = ComponentSerializer(many=True, read_only=True)
    packing_process_steps = PackingProcessStepSerializer(many=True, read_only=True)

    class Meta:
        model = PackagingSpecification
        fields = [
            "id",
            "product",
            "uploaded_file",
            "version",
            "units_per_outer",
            "ti",
            "hi",
            "tpq_cases",
            "tpq_units",
            "components",
            "packing_process_steps",
            "created_at",
            "updated_at",
        ]


# ---------------------------------------------------------
# PRODUCT
# ---------------------------------------------------------
class ProductSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.company_name", read_only=True)
    files = UploadedFileSerializer(many=True, read_only=True)
    packaging_specifications = PackagingSpecificationSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "customer",
            "customer_name",

            "sku",
            "name",
            "description",

            "transaction",

            "inner_barcode",
            "outer_barcode",

            "pallet_configuration",

            "date_set_up",
            "suspend_record",

            "issue",
            "issue_date",

            "files",
            "packaging_specifications",

            "created_at",
            "updated_at",
        ]
