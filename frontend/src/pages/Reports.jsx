import {
    Brain,
    TrendingUp,
    Target,
    BarChart3,
    Package,
    Boxes,
    AlertCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

function Reports() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [report, setReport] = useState({
        training_observations: 0,
        testing_observations: 0,

        linear_regression: {
            mae: 0,
            rmse: 0,
            r2: 0,
        },

        random_forest: {
            mae: 0,
            rmse: 0,
            r2: 0,
        },

        best_model: "Not available",

        best_mae: 0,
        best_rmse: 0,
        best_r2: 0,

        predictions: [],
        components: [],

        total_skus_forecasted: 0,
    });


    // =====================================================
    // LOAD ML REPORT
    // =====================================================

    useEffect(() => {
        loadReport();
    }, []);


    async function loadReport() {

        try {

            setLoading(true);
            setError("");

            const response = await fetch("/api/report/");

            if (!response.ok) {
                throw new Error("Failed to load ML report");
            }

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            setReport({

                training_observations:
                    data.training_observations ?? 0,

                testing_observations:
                    data.testing_observations ?? 0,

                linear_regression: {

                    mae:
                        data.linear_regression?.mae ?? 0,

                    rmse:
                        data.linear_regression?.rmse ?? 0,

                    r2:
                        data.linear_regression?.r2 ?? 0,

                },

                random_forest: {

                    mae:
                        data.random_forest?.mae ?? 0,

                    rmse:
                        data.random_forest?.rmse ?? 0,

                    r2:
                        data.random_forest?.r2 ?? 0,

                },

                best_model:
                    data.best_model ?? "Not available",

                best_mae:
                    data.best_mae ?? 0,

                best_rmse:
                    data.best_rmse ?? 0,

                best_r2:
                    data.best_r2 ?? 0,

                predictions:
                    data.predictions ?? [],

                components:
                    data.components ?? [],

                total_skus_forecasted:
                    data.total_skus_forecasted ?? 0,

            });

        } catch (error) {

            console.error(
                "ML report error:",
                error
            );

            setError(
                "Unable to load the machine learning report."
            );

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="ai-dashboard">

                <div className="page-header">

                    <h2>
                        Machine Learning Report
                    </h2>

                    <p>
                        Analysing historical order data
                        and generating demand forecasts...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="ai-dashboard">

                <div className="page-header">

                    <h2>
                        Machine Learning Report
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // VALUES
    // =====================================================

    const bestR2 =
        Number(report.best_r2);

    const bestMAE =
        Number(report.best_mae);

    const bestRMSE =
        Number(report.best_rmse);


    return (

        <div className="ai-dashboard">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="page-header">

                <h2>
                    Machine Learning Report
                </h2>

                <p>
                    Demand forecasting using historical
                    production and order data.
                </p>

            </div>


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="kpi-grid">


                {/* BEST MODEL */}

                <div className="kpi-card">

                    <Brain size={28} />

                    <h3>
                        Best Model
                    </h3>

                    <span>
                        {report.best_model}
                    </span>

                </div>


                {/* MODEL ACCURACY */}

                <div className="kpi-card">

                    <Target size={28} />

                    <h3>
                        Model Accuracy
                    </h3>

                    <span>
                        R² {bestR2.toFixed(3)}
                    </span>

                </div>


                {/* TRAINING DATA */}

                <div className="kpi-card">

                    <BarChart3 size={28} />

                    <h3>
                        Training Data
                    </h3>

                    <span>
                        {report.training_observations}
                    </span>

                </div>


                {/* FORECASTED PRODUCTS */}

                <div className="kpi-card">

                    <Package size={28} />

                    <h3>
                        Products Forecasted
                    </h3>

                    <span>
                        {report.total_skus_forecasted}
                    </span>

                </div>

            </div>


            {/* =================================================
                MODEL COMPARISON
            ================================================= */}

            <div className="analytics-grid">


                {/* LINEAR REGRESSION */}

                <div className="analytics-card">

                    <div className="card-header">

                        <Brain size={24} />

                        <h3>
                            Linear Regression
                        </h3>

                    </div>


                    <div className="forecast-list">

                        <div>

                            Mean Absolute Error:

                            <strong>
                                {" "}
                                {Number(
                                    report
                                        .linear_regression
                                        .mae
                                ).toFixed(2)}
                            </strong>

                        </div>


                        <div>

                            Root Mean Squared Error:

                            <strong>
                                {" "}
                                {Number(
                                    report
                                        .linear_regression
                                        .rmse
                                ).toFixed(2)}
                            </strong>

                        </div>


                        <div>

                            R² Score:

                            <strong>
                                {" "}
                                {Number(
                                    report
                                        .linear_regression
                                        .r2
                                ).toFixed(3)}
                            </strong>

                        </div>

                    </div>


                    <div className="recommendations">

                        <h4>
                            What do these measurements mean?
                        </h4>

                        <p>
                            <strong>
                                Mean Absolute Error
                            </strong>{" "}
                            shows the average difference
                            between the predicted and actual
                            demand.
                        </p>

                        <p>
                            <strong>
                                Root Mean Squared Error
                            </strong>{" "}
                            measures prediction error while
                            giving greater importance to
                            larger errors.
                        </p>

                        <p>
                            <strong>
                                R² Score
                            </strong>{" "}
                            shows how well the model explains
                            changes in demand. A value closer
                            to 1 indicates stronger predictive
                            performance.
                        </p>

                    </div>

                </div>


                {/* RANDOM FOREST */}

                <div className="analytics-card">

                    <div className="card-header">

                        <Boxes size={24} />

                        <h3>
                            Random Forest Regression
                        </h3>

                    </div>


                    <div className="forecast-list">

                        <div>

                            Mean Absolute Error:

                            <strong>
                                {" "}
                                {Number(
                                    report
                                        .random_forest
                                        .mae
                                ).toFixed(2)}
                            </strong>

                        </div>


                        <div>

                            Root Mean Squared Error:

                            <strong>
                                {" "}
                                {Number(
                                    report
                                        .random_forest
                                        .rmse
                                ).toFixed(2)}
                            </strong>

                        </div>


                        <div>

                            R² Score:

                            <strong>
                                {" "}
                                {Number(
                                    report
                                        .random_forest
                                        .r2
                                ).toFixed(3)}
                            </strong>

                        </div>

                    </div>


                    <div className="recommendations">

                        <h4>
                            Model Selection
                        </h4>

                        <p>

                            The system compares both
                            regression models and selects
                            the model with the lower prediction
                            error.

                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                MODEL EVALUATION
            ================================================= */}

            <div className="analytics-card">

                <div className="card-header">

                    <AlertCircle size={24} />

                    <h3>
                        Selected Model Performance
                    </h3>

                </div>


                <div className="forecast-list">

                    <div>

                        Selected Model:

                        <strong>
                            {" "}
                            {report.best_model}
                        </strong>

                    </div>


                    <div>

                        Mean Absolute Error:

                        <strong>
                            {" "}
                            {bestMAE.toFixed(2)}
                        </strong>

                    </div>


                    <div>

                        Root Mean Squared Error:

                        <strong>
                            {" "}
                            {bestRMSE.toFixed(2)}
                        </strong>

                    </div>


                    <div>

                        R² Score:

                        <strong>
                            {" "}
                            {bestR2.toFixed(3)}
                        </strong>

                    </div>


                    <div>

                        Training Observations:

                        <strong>
                            {" "}
                            {report.training_observations}
                        </strong>

                    </div>


                    <div>

                        Testing Observations:

                        <strong>
                            {" "}
                            {report.testing_observations}
                        </strong>

                    </div>

                </div>


                <div className="recommendations">

                    <h4>
                        Machine Learning Result
                    </h4>

                    <p>

                        The system selected{" "}

                        <strong>
                            {report.best_model}
                        </strong>{" "}

                        as the best performing model
                        based on its prediction error.

                    </p>

                </div>

            </div>


            {/* =================================================
                DEMAND FORECAST
            ================================================= */}

                        <div className="analytics-card">

                            <div className="card-header">

                                <TrendingUp size={24} />

                                <h3>
                                    Next Month Demand Forecast
                                </h3>

                            </div>


                            {report.predictions.length === 0 ? (

                                <div className="chart-placeholder">

                                    No product forecasts are
                                    currently available.

                                </div>

                            ) : (

                                <div className="forecast-list">

                                    {report.predictions.map(
                                        (item, index) => (

                                            <div
                                                key={index}
                                            >

                                                <strong>
                                                    {item.sku}
                                                </strong>

                                                {" — "}

                                                {item.product}

                                                <strong>
                                                    {" "}
                                                    {Number(
                                                        item.predicted_demand
                                                    ).toLocaleString()}
                                                    {" units"}
                                                </strong>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            COMPONENT REQUIREMENTS
                        ================================================= */}

                        <div className="analytics-card">

                <div className="card-header">

                    <Boxes size={24} />

                    <h3>
                        Forecasted Component Requirements — Next Month
                    </h3>

                </div>

                {report.components.length === 0 ? (

                    <div className="chart-placeholder">
                        No component requirements are currently available.
                    </div>

                ) : (

                    <div className="forecast-list">

                        {report.components.map((item, index) => (

                            <div
                                key={index}
                                className="component-forecast-row"
                            >

                                <strong>
                                    {item.component}
                                </strong>

                                <strong>
                                    {Number(
                                        item.forecasted_quantity
                                    ).toLocaleString()} units
                                </strong>

                            </div>

                        ))}

                    </div>

                )}

            </div>


        </div>

    );

}


export default Reports;