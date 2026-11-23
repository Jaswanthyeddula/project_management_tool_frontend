export function exportToCSV(projects, columns) {
  const rows = [
    ["Type", "ID", "Title / Name", "Status / Workspace", "Priority / Progress", "Due Date", "Assignee / Team"]
  ];
  (projects || []).forEach(p => {
    rows.push([
      "Project",
      p.id,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.workspace || "General"}"`,
      `${p.progress || 0}%`,
      `"${p.due || "N/A"}"`,
      `"${(p.members || []).join(", ")}"`
    ]);
  });
  if (columns) {
    Object.entries(columns).forEach(([colKey, col]) => {
      (col.tasks || []).forEach(t => {
        rows.push([
          "Task",
          t.id,
          `"${(t.title || "").replace(/"/g, '""')}"`,
          `"${col.title}"`,
          t.priority || "Medium",
          `"${t.due || t.due_date || "N/A"}"`,
          `"${t.assignee || "User"}"`
        ]);
      });
    });
  }
  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `flowspace_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
