import pandas as pd
import joblib


# ==========================================================
# FILE PATHS
# ==========================================================

MODEL_PATH = "ml/models/order_demand_regression.pkl"

DATA_PATH = "ml/data/regression_training_dataset.csv"

BOM_PATH = "ml/data/product_component_bom.csv"


# ==========================================================
# LOAD MODEL
# ==========================================================

model = joblib.load(MODEL_PATH)

print("Regression model loaded successfully.")


# ==========================================================
# LOAD HISTORICAL DATA
# ==========================================================

df = pd.read_csv(DATA_PATH)

df["month_start"] = pd.to_datetime(
    df["month_start"]
)


# ==========================================================
# LOAD COMPONENT BOM
# ==========================================================

bom = pd.read_csv(BOM_PATH)

print("Component information loaded successfully.")


# ==========================================================
# FEATURES USED BY THE REGRESSION MODEL
# ==========================================================

features = [
    "previous_month_quantity",
    "previous_month_orders",
    "previous_month_customers",
    "rolling_3_month_avg_quantity",
    "month",
    "quarter",
]


# ==========================================================
# GET MOST RECENT DATA FOR EACH SKU
# ==========================================================

latest_data = (
    df
    .sort_values("month_start")
    .groupby("sku")
    .tail(1)
    .copy()
)


# ==========================================================
# REMOVE MISSING VALUES
# ==========================================================

latest_data = latest_data.dropna(
    subset=features
)


# ==========================================================
# MAKE SKU DEMAND PREDICTIONS
# ==========================================================

X = latest_data[features]

predictions = model.predict(X)


latest_data[
    "predicted_demand"
] = predictions


# ==========================================================
# ROUND PREDICTIONS
# ==========================================================

latest_data[
    "predicted_demand"
] = (
    latest_data[
        "predicted_demand"
    ]
    .round()
    .astype(int)
)


# ==========================================================
# DISPLAY SKU FORECAST
# ==========================================================

print()
print("=" * 60)

print("NEXT MONTH PRODUCT FORECAST")

print("=" * 60)

for _, row in latest_data.iterrows():

    print(
        f"{row['sku']}: "
        f"{row['predicted_demand']:,} units"
    )


# ==========================================================
# CONNECT PRODUCT FORECAST TO COMPONENTS
# ==========================================================

component_forecast = bom.merge(
    latest_data[
        [
            "sku",
            "predicted_demand"
        ]
    ],
    on="sku",
    how="inner"
)


# ==========================================================
# CALCULATE COMPONENT REQUIREMENT
# ==========================================================

component_forecast[
    "forecasted_component_quantity"
] = (
    component_forecast[
        "predicted_demand"
    ]
    *
    component_forecast[
        "component_units_per_product"
    ]
)


# ==========================================================
# TOTAL COMPONENT REQUIREMENTS
# ==========================================================

total_components = (
    component_forecast
    .groupby(
        "component",
        as_index=False
    )[
        "forecasted_component_quantity"
    ]
    .sum()
)


# ==========================================================
# ROUND FINAL VALUES
# ==========================================================

total_components[
    "forecasted_component_quantity"
] = (
    total_components[
        "forecasted_component_quantity"
    ]
    .round()
    .astype(int)
)


# ==========================================================
# DISPLAY COMPONENT FORECAST
# ==========================================================

print()
print("=" * 60)

print("AI COMPONENT FORECAST")

print("=" * 60)

for _, row in total_components.iterrows():

    print(
        f"{row['component']}: "
        f"{row['forecasted_component_quantity']:,} units"
    )


print()
print("=" * 60)
