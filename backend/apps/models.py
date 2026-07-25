from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("user", "User"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="user"
    )

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Customer(models.Model):
    company_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    address = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name


class Product(models.Model):
   
    TRANSACTION_CHOICES = [
        ("machine", "Machine Packed"),
        ("hand", "Hand Packed"),
        ("mixed", "Machine + Hand Packed"),
        ("other", "Other"),
    ]

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="products"
    )

    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)

    description = models.TextField(
        blank=True,
        help_text="Optional product notes"
    )

    transaction = models.CharField(
        max_length=20,
        choices=TRANSACTION_CHOICES,
        blank=True
    )

    inner_barcode = models.CharField(max_length=100, blank=True)
    outer_barcode = models.CharField(max_length=100, blank=True)

    pallet_configuration = models.CharField(
        max_length=100,
        blank=True
    )

    date_set_up = models.DateField(null=True, blank=True)
    suspend_record = models.BooleanField(default=False)

    issue = models.CharField(max_length=100, blank=True)
    issue_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.sku} - {self.name}"


class UploadedFile(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="files",
        null=True,
        blank=True
    )

    file_type = models.CharField(
        max_length=30,
        default="packing_spec",
    )

    original_name = models.CharField(max_length=255)

    file = models.FileField(upload_to="packaging_specs/")

    uploaded_at = models.DateTimeField(auto_now_add=True)

class PackagingSpecification(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="packaging_specifications"
    )

    uploaded_file = models.ForeignKey(
        UploadedFile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
     

    version = models.CharField(max_length=50, default="V1")

    units_per_outer = models.PositiveIntegerField(default=0)
    ti = models.PositiveIntegerField(default=0)
    hi = models.PositiveIntegerField(default=0)
    tpq_cases = models.PositiveIntegerField(default=0)
    tpq_units = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("product", "version")

    def __str__(self):
        return f"{self.product.sku} - {self.version}"


class Component(models.Model):
    packaging_specification = models.ForeignKey(
        PackagingSpecification,
        on_delete=models.CASCADE,
        related_name="components"
    )

    component_sku = models.CharField(max_length=100, blank=True)
    component_name = models.CharField(max_length=255)
    supplier = models.CharField(max_length=255, blank=True)

    units_per_piece = models.CharField(max_length=100, blank=True)
    units_per_outer = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.component_name


class PackingProcessStep(models.Model):
    packaging_specification = models.ForeignKey(
        PackagingSpecification,
        on_delete=models.CASCADE,
        related_name="packing_process_steps"
    )

    step_number = models.PositiveIntegerField()
    instruction = models.TextField()

    class Meta:
        ordering = ["step_number"]
        unique_together = ("packaging_specification", "step_number")

    def __str__(self):
        return f"Step {self.step_number}"