import re

from django.utils import timezone
from rest_framework import serializers
from .models import (
    Customer,
    Product,
    UploadedFile,
    PackagingSpecification,
    Component,
    PackingProcessStep,
    UserProfile,
)
from django.contrib.auth.models import User


# user
class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            **validated_data
        )

        UserProfile.objects.create(
            user=user,
            role="user"
        )

        return user
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

    components = ComponentSerializer(many=True, required=False, write_only=True)
    packing_process = PackingProcessStepSerializer(many=True, required=False, write_only=True)

    def get_components(self, obj):
        spec = obj.packaging_specifications.first()
        if not spec:
            return []
        return ComponentSerializer(spec.components.all(), many=True).data

    def get_packing_process(self, obj):
        spec = obj.packaging_specifications.first()
        if not spec:
            return []
        return PackingProcessStepSerializer(spec.packing_process_steps.all(), many=True).data

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["issue"] = instance.display_issue
        representation["issue_date"] = instance.display_issue_date
        representation["components"] = self.get_components(instance)
        representation["packing_process"] = self.get_packing_process(instance)
        return representation

    def update(self, instance, validated_data):
        components = validated_data.pop("components", None)
        packing_process = validated_data.pop("packing_process", None)
        issue_was_submitted = "issue" in validated_data
        issue_date_was_submitted = "issue_date" in validated_data
        issue = validated_data.pop("issue", None)
        issue_date = validated_data.pop("issue_date", None)

        issue_changed = issue_was_submitted and issue != instance.issue
        issue_date_changed = (
            issue_date_was_submitted and issue_date != instance.issue_date
        )

        if issue_changed or issue_date_changed:
            if issue_was_submitted:
                instance.issue = issue
            if issue_date_was_submitted:
                instance.issue_date = issue_date
        else:
            match = re.search(r"(\d+)$", instance.issue or "")
            next_issue = int(match.group(1)) + 1 if match else 1
            prefix = (instance.issue[:match.start()] if match else "Issue ").strip()
            instance.issue = f"{prefix} {next_issue}".strip()
            instance.issue_date = timezone.localdate()

        product = super().update(instance, validated_data)

        if components is not None or packing_process is not None:
            specification, _ = PackagingSpecification.objects.get_or_create(
                product=product,
                version="V1",
            )

            if components is not None:
                specification.components.all().delete()
                Component.objects.bulk_create([
                    Component(packaging_specification=specification, **component)
                    for component in components
                ])

            if packing_process is not None:
                specification.packing_process_steps.all().delete()
                PackingProcessStep.objects.bulk_create([
                    PackingProcessStep(packaging_specification=specification, **step)
                    for step in packing_process
                ])

        return product

    def create(self, validated_data):
        if not validated_data.get("issue"):
            validated_data["issue"] = "Issue 1"
        if not validated_data.get("issue_date"):
            validated_data["issue_date"] = timezone.localdate()
        return super().create(validated_data)

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

            "components",
            "packing_process",

            "created_at",
            "updated_at",
        ]

       