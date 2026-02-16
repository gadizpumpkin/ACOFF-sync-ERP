// ==========================
// EXPORT TO CSV (EXCEL)
// ==========================
function exportToCSV(filename, rows) {
  const processRow = (row) => {
    return row.map(value => {
      if (value === null || value === undefined) value = "";
      value = value.toString().replace(/"/g, '""');
      return `"${value}"`;
    }).join(",");
  };

  const csvContent = rows.map(processRow).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ==========================
// EXPORT TO PDF (PRINT MODE)
// ==========================
function exportToPDF() {
  window.print();
}
