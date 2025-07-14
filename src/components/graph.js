import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CircularProgress from "@mui/joy/CircularProgress";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Link from "@mui/joy/Link";
import { API_BASE } from "../api/endpoints";

// Deeper color palette for work item pie chart
const PIE_COLORS = [
  "#3949ab", // deep blue
  "#00897b", // deep teal
  "#f57c00", // deep orange
  "#388e3c", // deep green
  "#d32f2f", // deep red
  "#1976d2", // deep blue
  "#fbc02d", // deep yellow
  "#7b1fa2"  // deep purple
];

// Specific colors for test plan pie chart: Passed, Incomplete (red), Not Applicable (yellow), Blocked/Failed (blue)
const TEST_PLAN_COLORS = [
  "#388e3c", // Passed - deep green
  "#d32f2f", // Incomplete - red
  "#fbc02d", // Not Applicable - yellow
  "#1976d2"  // Blocked/Failed - blue
];

// ...existing imports...

function Graph({ project, release }) {
  // Work Item State Pie Chart
  const [workItems, setWorkItems] = useState([]);
  const [loadingWorkItems, setLoadingWorkItems] = useState(false);

  // Test Plan Result Pie Chart
  const [testResults, setTestResults] = useState(null);
  const [loadingTestResults, setLoadingTestResults] = useState(false);

  // Fetch work items
  useEffect(() => {
    if (!project || !release) {
      setWorkItems([]);
      return;
    }
    setLoadingWorkItems(true);
    fetch(
      `${API_BASE}/api/iteration-work-items?project=${encodeURIComponent(project)}&iteration_id=${encodeURIComponent(release.id)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setWorkItems(data.value);
      })
      .catch(() => setWorkItems([]))
      .finally(() => setLoadingWorkItems(false));
  }, [project, release]);

// ...rest of the file remains unchanged...

  // Fetch test plan results
  useEffect(() => {
    if (!project || !release?.name) {
      setTestResults(null);
      return;
    }
    setLoadingTestResults(true);
    fetch(
      `${API_BASE}/api/test-plan-result?project=${encodeURIComponent(project)}&sprint=${encodeURIComponent(release.name)}`
    )
      .then((res) => res.json())
      .then((data) => setTestResults(data))
      .catch(() => setTestResults(null))
      .finally(() => setLoadingTestResults(false));
  }, [project, release]);

  // Prepare work item state pie chart data
  const stateCounts = workItems.reduce((acc, item) => {
    const state = (item.state || "").toLowerCase();
    if (state) acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});
  const workItemPieData = Object.entries(stateCounts).map(([name, value]) => ({ name, value }));

  // Prepare test plan result pie chart data (custom colors and labels)
  const testPlanPieData = testResults
    ? [
        { name: "Passed", value: testResults.passedTests || 0 },
        { name: "Incomplete", value: testResults.incompleteTests || 0 },
        { name: "Not Applicable", value: testResults.notApplicableTests || 0 },
        { name: "Blocked/Failed", value: testResults.unanalyzedTests || 0 }
      ]
    : [];

  return (
    <Box sx={{ display: "flex", gap: 4, justifyContent: "center", my: 3 }}>
      {/* Work Item State Pie Chart */}
      <Box sx={{ width: 400, height: 300, background: "#fff", borderRadius: 2, boxShadow: 1, p: 2 }}>
        <Typography level="h6" sx={{ mb: 2 }}>Work Item State Distribution</Typography>
        {loadingWorkItems ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 180 }}>
            <CircularProgress />
          </Box>
        ) : workItemPieData.length === 0 ? (
          <Box sx={{ textAlign: "center", color: "#888", mt: 6 }}>No work item data</Box>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={workItemPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {workItemPieData.map((entry, idx) => (
                  <Cell key={`cell-workitem-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
      {/* Test Plan Result Pie Chart */}
      <Box sx={{ width: 400, height: 300, background: "#fff", borderRadius: 2, boxShadow: 1, p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography level="h6">Test Plan Results</Typography>
          {testResults?.url && (
            <Link href={testResults.url} target="_blank" rel="noopener" sx={{ ml: 2 }}>
              View Full Test Plan Results
            </Link>
          )}
        </Box>
        {loadingTestResults ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 180 }}>
            <CircularProgress />
          </Box>
        ) : !testResults ? (
          <Box sx={{ textAlign: "center", color: "#888", mt: 6 }}>No test plan data</Box>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={testPlanPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {testPlanPieData.map((entry, idx) => (
                  <Cell key={`cell-testplan-${idx}`} fill={TEST_PLAN_COLORS[idx % TEST_PLAN_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}

export default Graph;