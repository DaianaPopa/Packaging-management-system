import pandas as pd
import joblib

from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================================================
# 1. LOAD DATA
# ==========================================================

DATA_PATH = "ml/data/regression_training_dataset.csv"

df = pd.read_csv(DATA_PATH)

df["month_start"] = pd.to_datetime(
    df["month_start"]
)

print("Dataset loaded successfully.")
print("Number of rows:", len(df))


# ==========================================================
# 2. SORT CHRONOLOGICALLY
# ==========================================================

df = df.sort_values(
    ["month_start", "sku"]
).reset_index(drop=True)


# ==========================================================
# 3. FEATURES
# ==========================================================

features = [
    "previous_month_quantity",
    "previous_month_orders",
    "previous_month_customers",
    "rolling_3_month_avg_quantity",
    "month",
    "quarter",
]

target = "target_next_month_quantity"


# ==========================================================
# 4. REMOVE MISSING VALUES
# ==========================================================

df = df.dropna(
    subset=features + [target]
).copy()


print()
print("Usable observations:", len(df))


# ==========================================================
# 5. TIME-BASED TRAIN / TEST SPLIT
# ==========================================================


split_index = int(
    len(df) * 0.80
)

train_df = df.iloc[
    :split_index
].copy()

test_df = df.iloc[
    split_index:
].copy()


X_train = train_df[features]

y_train = train_df[target]

X_test = test_df[features]

y_test = test_df[target]


print()
print("Training observations:", len(train_df))
print("Testing observations:", len(test_df))

print()
print(
    "Training period:",
    train_df["month_start"].min().date(),
    "to",
    train_df["month_start"].max().date()
)

print(
    "Testing period:",
    test_df["month_start"].min().date(),
    "to",
    test_df["month_start"].max().date()
)


# ==========================================================
# 6. CREATE MODEL
# ==========================================================

model = LinearRegression()


# ==========================================================
# 7. TRAIN
# ==========================================================

model.fit(
    X_train,
    y_train
)

print()
print("Model training completed.")


# ==========================================================
# 8. TEST
# ==========================================================

predictions = model.predict(
    X_test
)


# ==========================================================
# 9. EVALUATION
# ==========================================================

mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


print()
print("=" * 55)
print("TIME-BASED MODEL EVALUATION")
print("=" * 55)

print(
    f"MAE:  {mae:.2f}"
)

print(
    f"RMSE: {rmse:.2f}"
)

print(
    f"R²:   {r2:.3f}"
)


# ==========================================================
# 10. ACTUAL VS PREDICTED
# ==========================================================

results = test_df[
    [
        "month_start",
        "sku",
        "target_next_month_quantity",
    ]
].copy()

results["predicted_quantity"] = predictions

results["error"] = (
    results["target_next_month_quantity"]
    - results["predicted_quantity"]
)


print()
print("=" * 55)
print("ACTUAL VS PREDICTED")
print("=" * 55)

print(
    results.to_string(
        index=False
    )
)


# ==========================================================
# 11. SAVE MODEL
# ==========================================================

MODEL_PATH = (
    "ml/models/order_demand_regression.pkl"
)

joblib.dump(
    model,
    MODEL_PATH
)

print()
print("Model saved successfully:")
print(MODEL_PATH)
