import pandas as pd
import joblib

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ==========================================================
# 1. LOAD DATA
# ==========================================================

DATA_PATH = "ml/data/regression_training_dataset.csv"

df = pd.read_csv(DATA_PATH)

df["month_start"] = pd.to_datetime(
    df["month_start"]
)

df = df.sort_values(
    ["month_start", "sku"]
).reset_index(drop=True)


# ==========================================================
# 2. FEATURES
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
# 3. REMOVE MISSING VALUES
# ==========================================================

df = df.dropna(
    subset=features + [target]
).copy()


# ==========================================================
# 4. TIME-BASED TRAIN / TEST SPLIT
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


print("=" * 60)
print("MODEL COMPARISON")
print("=" * 60)

print()
print("Training observations:", len(train_df))
print("Testing observations:", len(test_df))


# ==========================================================
# 5. LINEAR REGRESSION
# ==========================================================

linear_model = LinearRegression()

linear_model.fit(
    X_train,
    y_train
)

linear_predictions = linear_model.predict(
    X_test
)


linear_mae = mean_absolute_error(
    y_test,
    linear_predictions
)

linear_rmse = mean_squared_error(
    y_test,
    linear_predictions
) ** 0.5

linear_r2 = r2_score(
    y_test,
    linear_predictions
)


# ==========================================================
# 6. RANDOM FOREST REGRESSION
# ==========================================================

random_forest_model = RandomForestRegressor(
    n_estimators=200,
    max_depth=5,
    min_samples_leaf=2,
    random_state=42
)

random_forest_model.fit(
    X_train,
    y_train
)

random_forest_predictions = (
    random_forest_model.predict(
        X_test
    )
)


random_forest_mae = mean_absolute_error(
    y_test,
    random_forest_predictions
)

random_forest_rmse = (
    mean_squared_error(
        y_test,
        random_forest_predictions
    ) ** 0.5
)

random_forest_r2 = r2_score(
    y_test,
    random_forest_predictions
)


# ==========================================================
# 7. DISPLAY RESULTS
# ==========================================================

print()
print("-" * 60)

print("LINEAR REGRESSION")

print("-" * 60)

print(
    f"MAE:  {linear_mae:.2f}"
)

print(
    f"RMSE: {linear_rmse:.2f}"
)

print(
    f"R²:   {linear_r2:.3f}"
)


print()
print("-" * 60)

print("RANDOM FOREST REGRESSION")

print("-" * 60)

print(
    f"MAE:  {random_forest_mae:.2f}"
)

print(
    f"RMSE: {random_forest_rmse:.2f}"
)

print(
    f"R²:   {random_forest_r2:.3f}"
)


# ==========================================================
# 8. DETERMINE BEST MODEL
# ==========================================================

print()
print("=" * 60)

print("BEST MODEL")
print("=" * 60)


if random_forest_mae < linear_mae:

    best_model = random_forest_model

    best_name = "Random Forest Regression"

    best_mae = random_forest_mae

    best_rmse = random_forest_rmse

    best_r2 = random_forest_r2

else:

    best_model = linear_model

    best_name = "Linear Regression"

    best_mae = linear_mae

    best_rmse = linear_rmse

    best_r2 = linear_r2


print()
print("Selected model:", best_name)

print(
    f"MAE:  {best_mae:.2f}"
)

print(
    f"RMSE: {best_rmse:.2f}"
)

print(
    f"R²:   {best_r2:.3f}"
)


# ==========================================================
# 9. SAVE BEST MODEL
# ==========================================================

MODEL_PATH = (
    "ml/models/order_demand_regression.pkl"
)

joblib.dump(
    best_model,
    MODEL_PATH
)

print()
print(
    "Best model saved to:"
)

print(MODEL_PATH)
