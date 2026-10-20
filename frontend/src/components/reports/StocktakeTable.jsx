const PRODUCT_COLUMNS = [
    ["batchNo", "batch_no", "BATCH NUMBER", false],
    ["bestBefore", "best_before", "BEST BEFORE DATE", false],
    ["qtyPerPallet", "qty_per_pallet", "QTY PER PALLET", true],
    ["qtyInRoom", "qty_in_room", "NUMBER OF PALLETS IN ROOM", true],
    ["boxes", "boxes", "QTY PER BOX", true],
    ["singles", "singles", "QTY OF BOXES IN ROOM", true],
    ["room", "room", "ROOM", true],
    ["warehouse", "warehouse", "WAREHOUSE", true],
    ["total", "total", "TOTAL", true],
];

const PACKAGING_COLUMNS = [
    ["qtyPerPallet", "qty_per_pallet", "QTY PER PALLET", true],
    ["qtyPerBoxBundle", "qty_per_box_bundle", "QTY PER BOX / BUNDLE", true],
    ["qtyBoxesBundlesInRoom", "qty_boxes_bundles_in_room", "QTY BOXES / BUNDLES IN ROOM", true],
    ["qtyPalletsInRoom", "qty_pallets_in_room", "QTY PALLETS IN ROOM", true],
    ["qtyRlsInRoom", "qty_rls_in_room", "QTY OF RLS IN ROOM", true],
    ["qtySinglesInRoom", "qty_singles_in_room", "QTY SINGLES IN ROOM", true],
    ["room", "room", "ROOM", true],
    ["warehouse", "warehouse", "WAREHOUSE", true],
    ["total", "total", "TOTAL", true],
];

function StocktakeTable({
    title,
    product,
    rows,
    onChange,
    readOnly = false,
}) {
    const columns = title === "PACKAGING"
        ? PACKAGING_COLUMNS
        : PRODUCT_COLUMNS;

    return (
        <table className="physical-stock-table">
            <thead>
                <tr>
                    <th colSpan="2">{title}</th>
                    <th colSpan="6">ROOM COUNT</th>
                    <th colSpan="3">OFFICE USE ONLY</th>
                </tr>
                <tr>
                    <th>CODE</th>
                    <th>DESCRIPTION</th>
                    {columns.map(([, , label]) => (
                        <th key={label}>{label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={row.id || `${title}-${rowIndex}`}>
                        <td>
                            {readOnly ? row.component_sku || product?.sku || "" : (
                                <textarea rows="1" value={row.component_sku || product?.sku || ""} onInput={(event) => resizeTableText(event.currentTarget)} onChange={(event) => onChange(rowIndex, "component_sku", event.target.value)} />
                            )}
                        </td>
                        <td>
                            {readOnly ? row.component_name || product?.name || "" : (
                                <textarea rows="1" value={row.component_name || product?.name || ""} onInput={(event) => resizeTableText(event.currentTarget)} onChange={(event) => onChange(rowIndex, "component_name", event.target.value)} />
                            )}
                        </td>
                        {columns.map(([field, savedField, , numeric], columnIndex) => (
                            <td
                                key={field}
                                className={rowIndex === 0 && field === "room" ? "stocktake-total-cell" : ""}
                            >
                                {rowIndex === 0 && field === "room" && (
                                    <span className="stocktake-total-label">Total</span>
                                )}
                                {readOnly ? (
                                    row[field] || row[savedField] || ""
                                ) : (
                                    numeric ? (
                                        <input
                                            type="number"
                                            value={row[field] || ""}
                                            onChange={(event) => onChange(rowIndex, field, event.target.value)}
                                        />
                                    ) : (
                                        <textarea
                                            rows="1"
                                            value={row[field] || ""}
                                            onInput={(event) => resizeTableText(event.currentTarget)}
                                            onChange={(event) => onChange(rowIndex, field, event.target.value)}
                                        />
                                    )
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function resizeTableText(field) {
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
}

export default StocktakeTable;
