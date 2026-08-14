import { useState } from "react";

function DataAnalytics() {

    // ==================================================
    // TEMPORARY FRONTEND DATA
    // Replace with Django data later
    // ==================================================

    const [analytics] = useState({

        total_workpacks: 42,

        total_products: 18,

        completed: 27,

        partial: 10,

        not_started: 5,

        products: [

            {
                sku: "MB896",
                product: "Chicken Breast 500g",
                customer: "Example Customer",
                workpacks: 12,
                status: "Completed",
                last_created: "13/08/2026",
            },

            {
                sku: "MB421",
                product: "Chicken Breast 1kg",
                customer: "Example Customer",
                workpacks: 9,
                status: "Completed",
                last_created: "12/08/2026",
            },

            {
                sku: "MB215",
                product: "Chicken Fillet 250g",
                customer: "Example Customer",
                workpacks: 7,
                status: "Partial",
                last_created: "11/08/2026",
            },

            {
                sku: "MB310",
                product: "Chicken Thigh 500g",
                customer: "Example Customer",
                workpacks: 5,
                status: "Partial",
                last_created: "10/08/2026",
            },

            {
                sku: "MB550",
                product: "Chicken Wings 1kg",
                customer: "Example Customer",
                workpacks: 4,
                status: "Not Started",
                last_created: "-",
            },

            {
                sku: "MB180",
                product: "Chicken Breast 2kg",
                customer: "Example Customer",
                workpacks: 3,
                status: "Completed",
                last_created: "07/08/2026",
            },

            {
                sku: "MB125",
                product: "Chicken Strips 500g",
                customer: "Example Customer",
                workpacks: 2,
                status: "Partial",
                last_created: "06/08/2026",
            },

        ],

    });


    // ==================================================
    // STATUS CLASS
    // ==================================================

    function getStatusClass(status) {

        if (status === "Completed") {
            return "status-completed";
        }

        if (status === "Partial") {
            return "status-partial";
        }

        return "status-not-started";
    }


    return (

        <div className="analytics-page">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="analytics-header">

                <div>

                    <h1>
                        Data Analytics
                    </h1>

                    <p>
                        Workpack and product activity
                    </p>

                </div>

            </div>


            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="analytics-cards">

                <div className="analytics-card">

                    <div className="analytics-card-title">
                        Total Workpacks
                    </div>

                    <div className="analytics-card-value">
                        {analytics.total_workpacks}
                    </div>

                    <div className="analytics-card-description">
                        Workpacks created
                    </div>

                </div>


                <div className="analytics-card">

                    <div className="analytics-card-title">
                        Products
                    </div>

                    <div className="analytics-card-value">
                        {analytics.total_products}
                    </div>

                    <div className="analytics-card-description">
                        Products in system
                    </div>

                </div>


                <div className="analytics-card">

                    <div className="analytics-card-title">
                        Completed
                    </div>

                    <div className="analytics-card-value">
                        {analytics.completed}
                    </div>

                    <div className="analytics-card-description">
                        Completed workpacks
                    </div>

                </div>


                <div className="analytics-card">

                    <div className="analytics-card-title">
                        Partial
                    </div>

                    <div className="analytics-card-value">
                        {analytics.partial}
                    </div>

                    <div className="analytics-card-description">
                        Partially completed
                    </div>

                </div>


                <div className="analytics-card">

                    <div className="analytics-card-title">
                        Not Started
                    </div>

                    <div className="analytics-card-value">
                        {analytics.not_started}
                    </div>

                    <div className="analytics-card-description">
                        No reports completed
                    </div>

                </div>

            </div>


            {/* ==================================================
                MOST GENERATED PRODUCTS
            ================================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">

                    <div>

                        <h2>
                            Most Generated Products
                        </h2>

                        <p>
                            Products with the most workpacks created
                        </p>

                    </div>

                </div>


                <div className="analytics-table-container">

                    <table className="analytics-table">

                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    SKU
                                </th>

                                <th>
                                    Product
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Workpacks
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Last Created
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {analytics.products.map(
                                (item, index) => (

                                    <tr key={item.sku}>

                                        <td>
                                            {index + 1}
                                        </td>


                                        <td className="sku-cell">
                                            {item.sku}
                                        </td>


                                        <td>
                                            {item.product}
                                        </td>


                                        <td>
                                            {item.customer}
                                        </td>


                                        <td className="number-cell">

                                            <strong>
                                                {item.workpacks}
                                            </strong>

                                        </td>


                                        <td>

                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status}
                                            </span>

                                        </td>


                                        <td>
                                            {item.last_created}
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>


            {/* ==================================================
                PRODUCT ACTIVITY
            ================================================== */}

            <div className="analytics-section">

                <div className="analytics-section-header">

                    <div>

                        <h2>
                            Product Activity
                        </h2>

                        <p>
                            Number of workpacks generated per product
                        </p>

                    </div>

                </div>


                <div className="product-ranking">

                    {analytics.products
                        .slice(0, 5)
                        .map((item, index) => {

                            const maximum =
                                analytics.products[0]?.workpacks || 1;

                            const percentage =
                                (item.workpacks / maximum) * 100;


                            return (

                                <div
                                    className="ranking-row"
                                    key={item.sku}
                                >

                                    <div className="ranking-position">
                                        {index + 1}
                                    </div>


                                    <div className="ranking-product">

                                        <div className="ranking-name">
                                            {item.sku}
                                        </div>

                                        <div className="ranking-description">
                                            {item.product}
                                        </div>

                                    </div>


                                    <div className="ranking-bar-container">

                                        <div
                                            className="ranking-bar"
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />

                                    </div>


                                    <div className="ranking-number">
                                        {item.workpacks}
                                    </div>

                                </div>

                            );

                        })}

                </div>

            </div>

        </div>

    );
}

export default DataAnalytics;