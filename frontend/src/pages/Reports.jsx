import { Factory,Package,TrendingUp,Brain,AlertCircle,} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function Reports() {
    return (
        <div className="ai-dashboard">

            <div className="page-header">
                <h2>Operations Intelligence</h2>

                <p>
                    AI-powered production planning and
                    packaging forecasting.
                </p>
            </div>

            {/* FILTERS */}

            <div className="dashboard-filters">

                <div className="form-group">
                    <label>Customer</label>

                    <select>
                        <option>
                            Select customer...
                        </option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Product</label>

                    <select>
                        <option>
                            Select product...
                        </option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Forecast Period</label>

                    <select>
                        <option>7 Days</option>
                        <option>30 Days</option>
                        <option>90 Days</option>
                    </select>
                </div>

            </div>

            {/* KPI CARDS */}

            <div className="kpi-grid">

                <div className="kpi-card">
                    <Factory size={28} />
                    <h3>Production Efficiency</h3>
                    <span>87%</span>
                </div>

                <div className="kpi-card">
                    <Package size={28} />
                    <h3>Packaging Required</h3>
                    <span>12,450</span>
                </div>

                <div className="kpi-card">
                    <TrendingUp size={28} />
                    <h3>Forecast Accuracy</h3>
                    <span>94%</span>
                </div>

                <div className="kpi-card warning">
                    <AlertCircle size={28} />
                    <h3>Component Risks</h3>
                    <span>2</span>
                </div>

            </div>

            {/* AI MODULES */}

            <div className="analytics-grid">

                {/* PRODUCTION */}

                <div className="analytics-card">

                    <div className="card-header">
                        <Brain size={24} />

                        <h3>
                            Production Optimisation
                        </h3>
                    </div>

                    <div className="chart-placeholder">

                        Production Schedule Forecast

                    </div>

                    <div className="recommendations">

                        <h4>
                            AI Recommendations
                        </h4>

                        <ul>
                            <li>
                                Run MC043 before MB896
                                to reduce setup time.
                            </li>

                            <li>
                                Estimated saving:
                                42 minutes.
                            </li>

                            <li>
                                Combine similar
                                packaging runs.
                            </li>
                        </ul>

                    </div>

                </div>

                {/* PACKAGING */}

                <div className="analytics-card">

                    <div className="card-header">
                        <Package size={24} />

                        <h3>
                            Packaging Usage Forecast
                        </h3>
                    </div>

                    <div className="chart-placeholder">

                        Component Consumption Forecast

                    </div>

                    <div className="forecast-list">

                        <div>
                            Cartons:
                            <strong>
                                2,400
                            </strong>
                        </div>

                        <div>
                            Labels:
                            <strong>
                                4,800
                            </strong>
                        </div>

                        <div>
                            Ribbon:
                            <strong>
                                2,400
                            </strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Reports;