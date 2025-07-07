import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CircularProgress from "@mui/joy/CircularProgress";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import { API_BASE } from "../api/endpoints";

const PIE_COLORS = [
  "#8884d8", "#82ca9d", "#ff8042", "#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0"
];

function Graph({ project, release }) {
  const [workItems, setWorkItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project || !release) {
      setWorkItems([]);
      return;
    }
    setLoading(true);
    fetch(
      `${API_BASE}/api/iteration-work-items?project=${encodeURIComponent(project)}&iteration_id=${encodeURIComponent(release.id)}`
    )
      .then((res) => res.json())
      .then((data) => setWorkItems(Array.isArray(data) ? data : [data]))
      .catch(() => setWorkItems([]))
      .finally(() => setLoading(false));
  }, [project, release]);

  // Prepare pie chart data by state
  const stateCounts = workItems.reduce((acc, item) => {
    const state = (item.state || "").toLowerCase();
    if (state) acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(stateCounts).map(([name, value]) => ({ name, value }));

  return (
    <Box sx={{ width: "100%", maxWidth: 400, height: 250, mx: "auto", my: 3, background: "#fff", borderRadius: 2, boxShadow: 1, p: 2 }}>
      <Typography level="h6" sx={{ mb: 2 }}>Work Item State Distribution</Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 180 }}>
          <CircularProgress />
        </Box>
      ) : pieData.length === 0 ? (
        <Box sx={{ textAlign: "center", color: "#888", mt: 6 }}>No work item data</Box>
      ) : (
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {pieData.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}

export default Graph;