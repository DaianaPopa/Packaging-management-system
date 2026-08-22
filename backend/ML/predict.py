import pandas as pd
import joblib


# ==========================================================
# FILE PATHS
# ==========================================================

MODEL_PATH = "ml/models/order_demand_regression.pkl"

DATA_PATH = "ml/data/regression_training_dataset.csv"


# ==========================================================
# LOAD MODEL PACKAGE
# ==========================================================

model_package = joblib.load(
    MODEL_PATH
)

model = model_package["model"]

features = model_package["features"]

model_name = model_package["model_name"]


print(
    f"Model loaded successfully: {model_name}"
)


# ==========================================================
# LOAD HISTORICAL DATA
# ==========================================================

df = pd.read_csv(
    DATA_PATH
)

df["month_start"] = pd.to_datetime(
    df["month_start"]
)


# ==========================================================
# GET LATEST DATA FOR EACH SKU
# ==========================================================

latest_data = (
    df
    .sort_values("month_start")
    .groupby("sku")
    .tail(1)
    .copy()
)


# ==========================================================
# CHECK FOR MISSING FEATURES
# ==========================================================

latest_data = latest_data.dropna(
    subset=features
)


# ==========================================================
# CREATE MODEL INPUT
# ==========================================================

X = latest_data[
    features
]


# ==========================================================
# PREDICT NEXT MONTH
# ==========================================================

predictions = model.predict(
    X
)


# ==========================================================
# ADD PREDICTIONS
# ==========================================================

latest_data[
    "predicted_next_month_quantity"
] = (
    predictions
    .round()
    .astype(int)
)


# ==========================================================
# DISPLAY FORECAST
# ==========================================================

print()
print("=" * 60)

print(
    "NEXT MONTH DEMAND FORECAST"
)

print("=" * 60)


for _, row in latest_data.iterrows():

    print()

    print(
        "SKU:",
        row["sku"]
    )

    print(
        "Product:",
        row["product"]
    )

    print(
        "Last recorded month:",
        row["month_start"].strftime(
            "%B %Y"
        )
    )

    print(
        "Predicted demand:",
        f"{row['predicted_next_month_quantity']:,}",
        "units"
    )


print()
print("=" * 60)