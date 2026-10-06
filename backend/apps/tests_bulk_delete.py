from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Customer, Product, UserProfile


class BulkDeleteTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPassword123!",
        )
        UserProfile.objects.create(user=self.user, role="user")
        self.client.force_authenticate(user=self.user)
        self.customer = Customer.objects.create(company_name="Customer")
        self.products = [
            Product.objects.create(
                customer=self.customer,
                sku=f"SKU-{index}",
                name=f"Product {index}",
            )
            for index in range(2)
        ]

    def test_bulk_delete_products(self):
        response = self.client.post(
            reverse("product-bulk-delete"),
            {"ids": [product.id for product in self.products]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["deleted"], 2)
        self.assertFalse(Product.objects.filter(id__in=[product.id for product in self.products]).exists())

    def test_bulk_delete_customers(self):
        customers = [
            Customer.objects.create(company_name=f"Customer {index}")
            for index in range(2)
        ]

        response = self.client.post(
            reverse("customer-bulk-delete"),
            {"ids": [customer.id for customer in customers]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["deleted"], 2)
        self.assertFalse(Customer.objects.filter(id__in=[customer.id for customer in customers]).exists())
