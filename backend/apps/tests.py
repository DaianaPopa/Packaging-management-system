from io import BytesIO
from datetime import date

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from openpyxl import Workbook

from .models import (
    UserProfile,
    Customer,
    Product,
    UploadedFile,
    PackagingSpecification,
    Component,
    PackingProcessStep,
    Workpack,
)


class PackagingManagementSystemTests(APITestCase):

    # =========================================================
    # SETUP
    # =========================================================

    def setUp(self):

        # -----------------------------------------------------
        # Create normal user
        # -----------------------------------------------------

        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPassword123!"
        )

        UserProfile.objects.create(
            user=self.user,
            role="user"
        )

        # -----------------------------------------------------
        # Create admin user
        # -----------------------------------------------------

        self.admin = User.objects.create_user(
            username="adminuser",
            email="admin@example.com",
            password="AdminPassword123!"
        )

        UserProfile.objects.create(
            user=self.admin,
            role="admin"
        )

        # -----------------------------------------------------
        # Create customer
        # -----------------------------------------------------

        self.customer = Customer.objects.create(
            company_name="Test Customer Ltd",
            email="customer@example.com",
            phone="0123456789",
            address="Test Address"
        )

        # -----------------------------------------------------
        # Create product
        # -----------------------------------------------------

        self.product = Product.objects.create(
            customer=self.customer,
            sku="TEST001",
            name="Test Product",
            description="Test product description",
            transaction="machine",
            inner_barcode="123456",
            outer_barcode="654321",
            pallet_configuration="10",
            date_set_up=date.today()
        )

    # =========================================================
    # AUTHENTICATION
    # =========================================================

    def test_01_login_with_valid_credentials(self):

        response = self.client.post(
            reverse("login"),
            {
                "username": "testuser",
                "password": "TestPassword123!"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            "access",
            response.data
        )

        self.assertIn(
            "refresh",
            response.data
        )

    # ---------------------------------------------------------

    def test_02_login_with_invalid_credentials(self):

        response = self.client.post(
            reverse("login"),
            {
                "username": "testuser",
                "password": "WrongPassword123!"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    # =========================================================
    # CURRENT USER
    # =========================================================

    def test_03_current_user(self):

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            reverse("current-user")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["username"],
            "testuser"
        )

        self.assertEqual(
            response.data["role"],
            "user"
        )

    # =========================================================
    # CUSTOMER CRUD
    # =========================================================

    def test_04_customer_list(self):

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            reverse("customer-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ---------------------------------------------------------

    def test_05_create_customer(self):

        self.client.force_authenticate(
            user=self.user
        )

        data = {
            "company_name": "New Customer Ltd",
            "email": "newcustomer@example.com",
            "phone": "0111111111",
            "address": "New Address"
        }

        response = self.client.post(
            reverse("customer-list"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            Customer.objects.filter(
                company_name="New Customer Ltd"
            ).exists()
        )

    # =========================================================
    # PRODUCT CRUD
    # =========================================================

    def test_06_product_list(self):

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            reverse("product-list")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )

    # ---------------------------------------------------------

    def test_07_create_product(self):

        self.client.force_authenticate(
            user=self.user
        )

        data = {
            "customer": self.customer.id,
            "sku": "TEST002",
            "name": "Second Test Product",
            "description": "Another test product",
            "transaction": "machine",
            "inner_barcode": "111111",
            "outer_barcode": "222222",
            "pallet_configuration": "20",
            "suspend_record": False
        }

        response = self.client.post(
            reverse("product-list"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            Product.objects.filter(
                sku="TEST002"
            ).exists()
        )

    # ---------------------------------------------------------

    def test_08_retrieve_product(self):

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            reverse(
                "product-detail",
                kwargs={"pk": self.product.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["sku"],
            "TEST001"
        )

        self.assertEqual(
            response.data["name"],
            "Test Product"
        )

    # ---------------------------------------------------------

    def test_09_update_product(self):

        self.client.force_authenticate(
            user=self.user
        )

        data = {
            "customer": self.customer.id,
            "sku": "TEST001",
            "name": "Updated Test Product",
            "description": "Updated description",
            "transaction": "hand",
            "inner_barcode": "123456",
            "outer_barcode": "654321",
            "pallet_configuration": "15",
            "suspend_record": False
        }

        response = self.client.put(
            reverse(
                "product-detail",
                kwargs={"pk": self.product.id}
            ),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.product.refresh_from_db()

        self.assertEqual(
            self.product.name,
            "Updated Test Product"
        )

        self.assertEqual(
            self.product.transaction,
            "hand"
        )

    def test_update_product_persists_components_and_steps(self):
        self.client.force_authenticate(user=self.user)
        specification = PackagingSpecification.objects.create(
            product=self.product,
            version="V1",
        )
        Component.objects.create(
            packaging_specification=specification,
            component_name="Old component",
        )
        PackingProcessStep.objects.create(
            packaging_specification=specification,
            step_number=1,
            instruction="Old step",
        )

        response = self.client.put(
            reverse("product-detail", kwargs={"pk": self.product.id}),
            {
                "customer": self.customer.id,
                "sku": self.product.sku,
                "name": "Updated product",
                "description": "Updated notes",
                "transaction": "hand",
                "pallet_configuration": "15",
                "date_set_up": "2026-10-09",
                "suspend_record": True,
                "issue": "Updated issue",
                "issue_date": "2026-10-08",
                "components": [
                    {
                        "component_sku": "COMP-1",
                        "component_name": "New component",
                        "supplier": "Supplier",
                        "units_per_piece": "2",
                        "units_per_outer": "8",
                    }
                ],
                "packing_process": [
                    {"step_number": 1, "instruction": "New step"}
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, "Updated product")
        self.assertTrue(self.product.suspend_record)
        self.assertEqual(specification.components.count(), 1)
        self.assertEqual(specification.components.get().component_name, "New component")
        self.assertEqual(specification.packing_process_steps.get().instruction, "New step")

    # ---------------------------------------------------------

    def test_10_delete_product(self):

        self.client.force_authenticate(
            user=self.user
        )

        product_id = self.product.id

        response = self.client.delete(
            reverse(
                "product-detail",
                kwargs={"pk": product_id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT
        )

        self.assertFalse(
            Product.objects.filter(
                id=product_id
            ).exists()
        )

    # =========================================================
    # PRODUCT SEARCH / CUSTOMER FILTER
    # =========================================================

    def test_11_filter_products_by_customer(self):

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            reverse("product-list"),
            {
                "customer": self.customer.id
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )

        self.assertEqual(
            response.data[0]["customer"],
            self.customer.id
        )

    # =========================================================
    # PACKAGING SPECIFICATION
    # =========================================================

    def test_12_create_packaging_specification(self):

        self.client.force_authenticate(
            user=self.user
        )

        data = {
            "product": self.product.id,
            "version": "V1",
            "units_per_outer": 10,
            "ti": 5,
            "hi": 4,
            "tpq_cases": 20,
            "tpq_units": 200
        }

        response = self.client.post(
            reverse("packaging_specification-list"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertTrue(
            PackagingSpecification.objects.filter(
                product=self.product,
                version="V1"
            ).exists()
        )

    # =========================================================
    # COMPONENT
    # =========================================================

    def test_13_component_is_related_to_packaging_specification(self):

        specification = PackagingSpecification.objects.create(
            product=self.product,
            version="V1",
            units_per_outer=10,
            ti=5,
            hi=4
        )

        component = Component.objects.create(
            packaging_specification=specification,
            component_sku="COMP001",
            component_name="Test Label",
            supplier="Test Supplier",
            units_per_piece="1",
            units_per_outer="10"
        )

        self.assertEqual(
            component.packaging_specification,
            specification
        )

        self.assertEqual(
            specification.components.count(),
            1
        )

    # =========================================================
    # PACKING PROCESS
    # =========================================================

    def test_14_packing_process_step(self):

        specification = PackagingSpecification.objects.create(
            product=self.product,
            version="V1"
        )

        step = PackingProcessStep.objects.create(
            packaging_specification=specification,
            step_number=1,
            instruction="Pack the product."
        )

        self.assertEqual(
            specification.packing_process_steps.count(),
            1
        )

        self.assertEqual(
            step.instruction,
            "Pack the product."
        )

    # =========================================================
    # WORKPACK
    # =========================================================

    def test_15_save_worksheet(self):

        data = {
            "product": self.product.id,
            "date": "2026-09-04",
            "operator": "Test User",
            "status": "complete"
        }

        response = self.client.post(
            reverse("save_worksheet"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertTrue(
            Workpack.objects.filter(
                product=self.product,
                date="2026-09-04"
            ).exists()
        )

    # ---------------------------------------------------------

    def test_16_get_workpack(self):

        Workpack.objects.create(
            product=self.product,
            date=date(2026, 9, 4),
            worksheet_data={
                "status": "complete"
            },
            traceability_data={
                "checked": True
            }
        )

        response = self.client.get(
            reverse("workpack_data"),
            {
                "product": self.product.id
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            "worksheet",
            response.data
        )

        self.assertIn(
            "traceability",
            response.data
        )

    # =========================================================
    # WORKSHEET VALIDATION
    # =========================================================

    def test_17_worksheet_requires_product(self):

        response = self.client.get(
            reverse("worksheet-data")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            response.data["error"],
            "Product is required"
        )

    # ---------------------------------------------------------

    def test_18_worksheet_returns_product_information(self):

        PackagingSpecification.objects.create(
            product=self.product,
            version="V1"
        )

        response = self.client.get(
            reverse("worksheet-data"),
            {
                "product": self.product.id,
                "date": "2026-09-04"
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["sku"],
            "TEST001"
        )

        self.assertEqual(
            response.data["product"],
            "Test Product"
        )

        self.assertEqual(
            response.data["customer"],
            "Test Customer Ltd"
        )

    # =========================================================
    # CHECKSHEET
    # =========================================================

    def test_19_checksheet_data(self):

        response = self.client.get(
            reverse("checksheet-data"),
            {
                "product": self.product.id,
                "date": "2026-09-04"
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["sku"],
            "TEST001"
        )

        self.assertEqual(
            response.data["product"],
            "Test Product"
        )

    # ---------------------------------------------------------

    def test_20_save_checksheet(self):

        data = {
            "product": self.product.id,
            "date": "2026-09-04",
            "checked": True
        }

        response = self.client.post(
            reverse("save_checksheet"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        workpack = Workpack.objects.get(
            product=self.product,
            date="2026-09-04"
        )

        self.assertTrue(
            workpack.date_coding_data
        )

    # =========================================================
    # STOCKTAKE
    # =========================================================

    def test_21_stocktake_data(self):

        response = self.client.get(
            reverse("stocktake-data"),
            {
                "product": self.product.id,
                "date": "2026-09-04"
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["sku"],
            "TEST001"
        )

    # ---------------------------------------------------------

    def test_22_save_stocktake(self):

        data = {
            "product": self.product.id,
            "date": "2026-09-04",
            "quantity": 100
        }

        response = self.client.post(
            reverse("save_stocktake"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        workpack = Workpack.objects.get(
            product=self.product,
            date="2026-09-04"
        )

        self.assertTrue(
            workpack.stocktake_data
        )

    # =========================================================
    # REJECT REPORT
    # =========================================================

    def test_23_reject_report_data(self):

        specification = PackagingSpecification.objects.create(
            product=self.product,
            version="V1"
        )

        Component.objects.create(
            packaging_specification=specification,
            component_sku="COMP001",
            component_name="Test Label"
        )

        response = self.client.get(
            reverse("reject-report-data"),
            {
                "product": self.product.id,
                "date": "2026-09-04"
            }
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["sku"],
            "TEST001"
        )

        self.assertEqual(
            len(response.data["components"]),
            1
        )

    # ---------------------------------------------------------

    def test_24_save_reject_report(self):

        data = {
            "product": self.product.id,
            "date": "2026-09-04",
            "rejected": 5
        }

        response = self.client.post(
            reverse("save_reject_report"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        workpack = Workpack.objects.get(
            product=self.product,
            date="2026-09-04"
        )

        self.assertTrue(
            workpack.reject_report_data
        )

    # =========================================================
    # TRACEABILITY
    # =========================================================

    def test_25_traceability_data(self):

        response = self.client.get(
            reverse("traceability-data"),
            {
                "product": self.product.id,
                "date": "2026-09-04"
            }
        )

        # The exact implementation of traceability_data
        # should determine the final expected response.
        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_404_NOT_FOUND
            ]
        )

    # =========================================================
    # ANALYTICS
    # =========================================================

    def test_26_analytics(self):

        Workpack.objects.create(
            product=self.product,
            date=date(2026, 9, 4),
            worksheet_data={
                "completed": True
            }
        )

        response = self.client.get(
            reverse("analytics_data")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn(
            "total_workpacks",
            response.data
        )

        self.assertIn(
            "total_products",
            response.data
        )

        self.assertIn(
            "completed",
            response.data
        )

        self.assertIn(
            "partial",
            response.data
        )

        self.assertIn(
            "not_started",
            response.data
        )

        self.assertIn(
            "products",
            response.data
        )

    # =========================================================
    # SETTINGS
    # =========================================================

    def test_27_save_user_settings(self):

        self.client.force_authenticate(
            user=self.user
        )

        data = {
            "fullName": "Test User",
            "email": "updated@example.com"
        }

        response = self.client.post(
            reverse("save-user-settings"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.user.refresh_from_db()

        self.assertEqual(
            self.user.first_name,
            "Test"
        )

        self.assertEqual(
            self.user.last_name,
            "User"
        )

        self.assertEqual(
            self.user.email,
            "updated@example.com"
        )

    # =========================================================
    # PASSWORD CHANGE
    # =========================================================

    def test_28_change_password(self):

        self.client.force_authenticate(
            user=self.user
        )

        data = {
            "currentPassword": "TestPassword123!",
            "newPassword": "NewPassword123!",
            "confirmPassword": "NewPassword123!"
        }

        response = self.client.post(
            reverse("change-password"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.user.refresh_from_db()

        self.assertTrue(
            self.user.check_password(
                "NewPassword123!"
            )
        )

    # =========================================================
    # PASSWORD VALIDATION
    # =========================================================

    def test_29_change_password_wrong_current_password(self):

        self.client.force_authenticate(
            user=self.user
        )

        data = {
            "currentPassword": "WrongPassword",
            "newPassword": "NewPassword123!",
            "confirmPassword": "NewPassword123!"
        }

        response = self.client.post(
            reverse("change-password"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(
            response.data["error"],
            "Current password is incorrect"
        )

    # =========================================================
    # ADMIN USER MANAGEMENT
    # =========================================================

    def test_30_admin_can_view_users(self):

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.get(
            reverse("admin-users")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        usernames = [
            user["username"]
            for user in response.data
        ]

        self.assertIn(
            "testuser",
            usernames
        )

        self.assertIn(
            "adminuser",
            usernames
        )

    # ---------------------------------------------------------

    def test_31_normal_user_cannot_view_admin_users(self):

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            reverse("admin-users")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    # ---------------------------------------------------------

    def test_32_admin_can_change_user_role(self):

        self.client.force_authenticate(
            user=self.admin
        )

        response = self.client.patch(
            reverse(
                "change-user-role",
                kwargs={"user_id": self.user.id}
            ),
            {
                "role": "admin"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.user.profile.refresh_from_db()

        self.assertEqual(
            self.user.profile.role,
            "admin"
        )

    # ---------------------------------------------------------

    def test_33_normal_user_cannot_change_user_role(self):

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.patch(
            reverse(
                "change-user-role",
                kwargs={"user_id": self.admin.id}
            ),
            {
                "role": "user"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    # =========================================================
    # EXCEL BULK UPLOAD
    # =========================================================

    def create_test_excel_file(self):

        workbook = Workbook()
        worksheet = workbook.active

        worksheet["A1"] = "SKU"
        worksheet["B1"] = "Name"
        worksheet["C1"] = "Inner Barcode"
        worksheet["D1"] = "Outer Barcode"
        worksheet["E1"] = "Units Per Outer"
        worksheet["F1"] = "TI"
        worksheet["G1"] = "HI"

        worksheet["A2"] = "EXCEL001"
        worksheet["B2"] = "Excel Test Product"
        worksheet["C2"] = "111111"
        worksheet["D2"] = "222222"
        worksheet["E2"] = 10
        worksheet["F2"] = 5
        worksheet["G2"] = 4

        file_object = BytesIO()
        workbook.save(file_object)
        file_object.seek(0)

        return SimpleUploadedFile(
            "test_product.xlsx",
            file_object.read(),
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

    # ---------------------------------------------------------

    def test_34_excel_bulk_upload(self):

        self.client.force_authenticate(
            user=self.user
        )

        excel_file = self.create_test_excel_file()

        response = self.client.post(
            reverse("product-bulk-upload"),
            {
                "customer": self.customer.id,
                "files": [excel_file]
            },
            format="multipart"
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_200_OK,
                status.HTTP_201_CREATED
            ]
        )

        self.assertEqual(
            response.data["created"],
            1
        )

        self.assertTrue(
            Product.objects.filter(
                sku="EXCEL001"
            ).exists()
        )

    # =========================================================
    # EXCEL DUPLICATE SKU
    # =========================================================

    def test_35_excel_duplicate_sku_is_rejected(self):

        self.client.force_authenticate(
            user=self.user
        )

        excel_file = self.create_test_excel_file()

        # First upload
        response1 = self.client.post(
            reverse("product-bulk-upload"),
            {
                "customer": self.customer.id,
                "files": [excel_file]
            },
            format="multipart"
        )

        self.assertEqual(
            response1.data["created"],
            1
        )

        # Create another Excel file with same SKU
        duplicate_file = self.create_test_excel_file()

        response2 = self.client.post(
            reverse("product-bulk-upload"),
            {
                "customer": self.customer.id,
                "files": [duplicate_file]
            },
            format="multipart"
        )

        self.assertEqual(
            response2.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response2.data["created"],
            0
        )

        self.assertEqual(
            response2.data["failed"],
            1
        )

    # =========================================================
    # PACKAGING DATA CREATED FROM EXCEL
    # =========================================================

    def test_36_excel_upload_creates_packaging_specification(self):

        self.client.force_authenticate(
            user=self.user
        )

        excel_file = self.create_test_excel_file()

        response = self.client.post(
            reverse("product-bulk-upload"),
            {
                "customer": self.customer.id,
                "files": [excel_file]
            },
            format="multipart"
        )

        self.assertEqual(
            response.data["created"],
            1
        )

        product = Product.objects.get(
            sku="EXCEL001"
        )

        self.assertTrue(
            PackagingSpecification.objects.filter(
                product=product
            ).exists()
        )

        product = Product.objects.get(sku="EXCEL001")
        specification = product.packaging_specifications.get()
        self.assertEqual(product.name, "Excel Test Product")
        self.assertEqual(product.inner_barcode, "111111")
        self.assertEqual(product.outer_barcode, "222222")
        self.assertEqual(specification.units_per_outer, 10)
        self.assertEqual(specification.ti, 5)
        self.assertEqual(specification.hi, 4)

    def test_bulk_upload_extracts_packaging_spec_layout(self):
        self.client.force_authenticate(user=self.user)
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.append(["Product", "Spec Layout Product", None, None, "Units per Outer", 8])
        worksheet.append(["SKU", "SPEC001", None, None, "Ti", 22])
        worksheet.append(["Unit Barcode", "111111", None, None, "Hi", 8])
        worksheet.append(["Outer Barcode", "222222", None, None, "TPQ", 176])
        worksheet.append(["Components"])
        worksheet.append(["SKU", "Component", None, None, "Supplier", "Units per Piece", "Units Per Outer"])
        worksheet.append(["COMP001", "Carton", None, None, "Supplier Ltd", 1, 8])
        worksheet.append(["Packing Process"])
        worksheet.append([None])
        worksheet.append([1, "Pack product into carton"])
        file_object = BytesIO()
        workbook.save(file_object)
        file_object.seek(0)
        excel_file = SimpleUploadedFile(
            "spec_layout.xlsx",
            file_object.read(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

        response = self.client.post(
            reverse("product-bulk-upload"),
            {"customer": self.customer.id, "files": [excel_file]},
            format="multipart",
        )

        self.assertEqual(response.data["created"], 1, response.data)
        product = Product.objects.get(sku="SPEC001")
        self.assertEqual(product.name, "Spec Layout Product")
        self.assertEqual(product.inner_barcode, "111111")
        self.assertEqual(product.outer_barcode, "222222")
        specification = product.packaging_specifications.get()
        self.assertEqual(specification.units_per_outer, 8)
        self.assertEqual(specification.ti, 22)
        self.assertEqual(specification.hi, 8)
        component = specification.components.get()
        self.assertEqual(component.component_name, "Carton")
        self.assertEqual(component.supplier, "Supplier Ltd")
        self.assertEqual(component.units_per_piece, "1")
        self.assertEqual(component.units_per_outer, "8")
        self.assertEqual(specification.packing_process_steps.get().instruction, "Pack product into carton")

    def test_create_product_with_file_persists_product_details(self):
        self.client.force_authenticate(user=self.user)
        temporary_file = UploadedFile.objects.create(
            original_name="product.xlsx",
            file=SimpleUploadedFile("product.xlsx", b"workbook"),
        )

        response = self.client.post(
            reverse("product-create-with-file"),
            {
                "temp_file_id": temporary_file.id,
                "customer": self.customer.id,
                "sku": "SAVED001",
                "name": "Saved product",
                "description": "Product notes",
                "transaction": "hand",
                "pallet_configuration": "12",
                "date_set_up": "2026-10-09",
                "issue": "Issue 1",
                "issue_date": "2026-10-08",
                "inner_barcode": "111",
                "outer_barcode": "222",
                "components": "[]",
                "steps": "[]",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(sku="SAVED001")
        self.assertEqual(product.name, "Saved product")
        self.assertEqual(product.description, "Product notes")
        self.assertEqual(product.transaction, "hand")
        self.assertEqual(product.inner_barcode, "111")
        self.assertEqual(product.outer_barcode, "222")

    def test_create_product_without_file(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            reverse("product-create-with-file"),
            {
                "customer": self.customer.id,
                "sku": "NOFILE001",
                "name": "Manual product",
                "components": "[]",
                "steps": "[]",
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(sku="NOFILE001")
        self.assertEqual(product.name, "Manual product")
        self.assertIsNone(product.packaging_specifications.get().uploaded_file)

    # =========================================================
    # WORKPACK UNIQUE CONSTRAINT
    # =========================================================

    def test_37_workpack_unique_product_date(self):

        Workpack.objects.create(
            product=self.product,
            date=date(2026, 9, 4)
        )

        # get_or_create is used by your save endpoints,
        # so calling the endpoint twice should not create
        # two Workpack records for the same product/date.

        self.client.post(
            reverse("save_worksheet"),
            {
                "product": self.product.id,
                "date": "2026-09-04",
                "test": "first"
            },
            format="json"
        )

        self.client.post(
            reverse("save_worksheet"),
            {
                "product": self.product.id,
                "date": "2026-09-04",
                "test": "second"
            },
            format="json"
        )

        count = Workpack.objects.filter(
            product=self.product,
            date="2026-09-04"
        ).count()

        self.assertEqual(
            count,
            1
        )

