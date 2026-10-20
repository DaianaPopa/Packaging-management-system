import "../../styles/reportIssueMeta.css";

function ReportIssueMeta({ issue, onIssueChange }) {
    return (
        <div className="report-issue-meta">
            <span>
                Issue No:{" "}
                {onIssueChange ? (
                    <input
                        type="text"
                        value={issue || ""}
                        onChange={(event) => onIssueChange(event.target.value)}
                    />
                ) : (
                    issue || ""
                )}
            </span>
            <span>Print Date: {new Date().toLocaleDateString()}</span>
        </div>
    );
}

export default ReportIssueMeta;
