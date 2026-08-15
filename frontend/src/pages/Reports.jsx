import {
    Factory,
    Package,
    TrendingUp,
    Brain,
    AlertCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

function Reports() {

    const [loading, setLoading] =
        useState(true);

    const [analytics, setAnalytics] =
        useState({
            total_workpacks: 0,
            total_products: 0,
            completed: 0,
            partial: 0,
            not_started: 0,
            products: [],
        });

    useEffect(() => {
        loadAnalytics();
    }, []);

    async function loadAnalytics() {

        try {

            const response =
                await fetch(
                    "/api/analytics/"
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to load analytics"
                );
            }

            const data =
                await response.json();

            setAnalytics(data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);

        }
    }

    if (loading) {
        return (
            <div className="ai-dashboard">
                <h2>
                    Loading AI report...
                </h2>
            </div>
        );
    }

    const completionRate =
        analytics.total_products > 0
            ? Math.round(
                  (
                      analytics.completed /
                      analytics.total_products
                  ) * 100
              )
            : 0;

    const workloadForecast =
        analytics.not_started +
        analytics.partial;

    const healthScore =
        analytics.total_products > 0
            ? Math.round(
                  (
                      (
                          analytics.completed +
                          analytics.partial * 0.5
                      ) /
                      analytics.total_products
                  ) * 100
              )
            : 0;

    const riskLevel =
        analytics.not_started >= 5
            ? "High"
            : analytics.not_started >= 2
            ? "Medium"
            : "Low";

    const recommendations = [];

    if (analytics.not_started > 0) {
        recommendations.push(
            `${analytics.not_started} products have not been started and should be prioritised.`
        );
    }

    if (analytics.partial > 0) {
        recommendations.push(
            `${analytics.partial} products are currently in progress and require completion.`
        );
    }

    if (
        analytics.not_started >
        analytics.completed
    ) {
        recommendations.push(
            "Current backlog exceeds completed production output."
        );
    }

    if (completionRate < 50) {
        recommendations.push(
            "Production performance is below target and may require additional resources."
        );
    }

    if (completionRate >= 75) {
        recommendations.push(
            "Production performance is stable and operating efficiently."
        );
    }

    return (

        <div className="ai-dashboard">

            <div className="page-header">

                <h2>
                    Operations Intelligence
                </h2>

                <p>
                    AI-powered production analysis,
                    workload prediction and
                    operational risk assessment.
                </p>

            </div>

            {/* KPI CARDS */}

            <div className="kpi-grid">

                <div className="kpi-card">

                    <Factory size={28} />

                    <h3>
                        Production Health
                    </h3>

                    <span>
                        {healthScore}%
                    </span>

                </div>

                <div className="kpi-card">

                    <Package size={28} />

                    <h3>
                        Predicted Workload
                    </h3>

                    <span>
                        {workloadForecast}
                    </span>

                </div>

                <div className="kpi-card">

                    <TrendingUp size={28} />

                    <h3>
                        Completion Rate
                    </h3>

                    <span>
                        {completionRate}%
                    </span>

                </div>

                <div className="kpi-card warning">

                    <AlertCircle size={28} />

                    <h3>
                        Risk Level
                    </h3>

                    <span>
                        {riskLevel}
                    </span>

                </div>

            </div>

            {/* AI MODULES */}

            <div className="analytics-grid">

                {/* FORECAST */}

                <div className="analytics-card">

                    <div className="card-header">

                        <Brain size={24} />

                        <h3>
                            AI Production Forecast
                        </h3>

                    </div>

                    <div className="chart-placeholder">

                        Forecast indicates

                        {" "}

                        <strong>
                            {workloadForecast}
                        </strong>

                        {" "}

                        products requiring
                        production effort.

                    </div>

                    <div className="recommendations">

                        <h4>
                            AI Recommendations
                        </h4>

                        <ul>

                            {recommendations.map(
                                (
                                    recommendation,
                                    index
                                ) => (

                                    <li
                                        key={index}
                                    >
                                        {
                                            recommendation
                                        }
                                    </li>

                                )
                            )}

                        </ul>

                    </div>

                </div>

                {/* RISK ANALYSIS */}

                <div className="analytics-card">

                    <div className="card-header">

                        <AlertCircle
                            size={24}
                        />

                        <h3>
                            Risk Analysis
                        </h3>

                    </div>

                    <div className="forecast-list">

                        <div>

                            Total Products:

                            <strong>
                                {" "}
                                {
                                    analytics.total_products
                                }
                            </strong>

                        </div>

                        <div>

                            Completed:

                            <strong>
                                {" "}
                                {
                                    analytics.completed
                                }
                            </strong>

                        </div>

                        <div>

                            Partial:

                            <strong>
                                {" "}
                                {
                                    analytics.partial
                                }
                            </strong>

                        </div>

                        <div>

                            Not Started:

                            <strong>
                                {" "}
                                {
                                    analytics.not_started
                                }
                            </strong>

                        </div>

                        <div>

                            Total Workpacks:

                            <strong>
                                {" "}
                                {
                                    analytics.total_workpacks
                                }
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Reports;