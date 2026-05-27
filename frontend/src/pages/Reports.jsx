import { Table, ClipboardCheck, AlertTriangle, CalendarDays } from "lucide-react";

function Reports() {
  const reports = [
    {
      title: "Worksheet",
      description: "DEKAPAK worksheet for job processing and pallet tracking",
      icon: Table,
    },
    {
      title: "Traceability",
      description: "Track product components and supplier chain",
      icon: ClipboardCheck,
    },
    {
      title: "Reject Report",
      description: "Record packaging and product rejects with reasons",
      icon: AlertTriangle,
    },
    {
      title: "Date Coding & Label Check",
      description: "Verify date codes and labels on packaging",
      icon: CalendarDays,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>Generate Report</h2>
        <p>Select the type of report you want to generate</p>
      </div>

      <div className="report-grid">
        {reports.map((report, index) => {
          const Icon = report.icon;

          return (
            <div className="report-card" key={index}>
              <div className="report-icon">
                <Icon size={28} />
              </div>

              <h3>{report.title}</h3>
              <p>{report.description}</p>
            </div>
          );
        })}
      </div>

      <div className="report-parameters">
        <h3>Report Parameters</h3>

        <div className="parameter-grid">
          <div className="form-group">
            <label>Product</label>
            <select>
              <option>Select product...</option>
            </select>
          </div>

          <div className="form-group">
            <label>Customer</label>
            <select>
              <option>Select customer...</option>
            </select>
          </div>
        </div>

        <button className="generate-btn">
          Generate Report
        </button>
      </div>
    </div>
  );
}

export default Reports;