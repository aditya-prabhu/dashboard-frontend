import React, { useEffect, useState } from "react";
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useLocation, useParams } from "react-router-dom";
import { API_BASE } from "../api/endpoints";
import ReleaseWorkItemsCard from "../components/ReleaseWorkItemsCard";
import Navbar from "../components/Navbar";

const ENV_COLORS = [
  "#4caf50", "#f44336", "#2196f3", "#ff9800", "#9c27b0",
  "#00bcd4", "#607d8b", "#ffc107", "#8bc34a", "#e91e63"
];

function PipelineDetails() {
  const { definitionId } = useParams();
  const location = useLocation();
  const { startDate, finishDate, projectName } = location.state || {};
  const [rows, setRows] = useState([]);
  const [workItemsCard, setWorkItemsCard] = useState({ open: false, releaseId: null });
  const [loading, setLoading] = useState(false);
  const [envFilter, setEnvFilter] = useState("All");

  useEffect(() => {
    if (!definitionId || !startDate || !finishDate || !projectName) return;
    setLoading(true);
    const url = `${API_BASE}/api/pipelines-runs?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(finishDate)}&project=${encodeURIComponent(projectName)}&definitionId=${encodeURIComponent(definitionId)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [data];
        setRows(arr);
      })
      .finally(() => setLoading(false));
  }, [definitionId, startDate, finishDate, projectName]);

  const pipelineName = rows.length > 0 ? rows[0].pipelineName : "";
  const pipelineUrl = rows.length > 0 ? rows[0].pipelineUrl : "";

  // Combine environments for same releaseId
  const combinedRows = rows.reduce((acc, row) => {
    const existingRow = acc.find(r => r.releaseId === row.releaseId);
    if (existingRow) {
      if (!existingRow.environments.some(env => env.name === row.environment)) {
        existingRow.environments.push({ name: row.environment, status: row.status });
      }
    } else {
      acc.push({
        releaseId: row.releaseId,
        releaseName: row.releaseName,
        queuedOn: row.queuedOn,
        releaseUrl: row.releaseUrl,
        commitUrl: row.commitUrl,
        environments: [{ name: row.environment, status: row.status }]
      });
    }
    return acc;
  }, []);

  // Helper for environment color
  const getEnvColor = (status) => {
    if (status === "succeeded") return "#4caf50";
    if (status === "failed") return "#f44336";
    return "#ffff00";
  };

  // Get all unique environment names for filter options
  const allEnvNames = Array.from(
    new Set(combinedRows.flatMap(row => row.environments.map(env => env.name)))
  );

  // Calculate environment counts for the bar chart
  const envCounts = allEnvNames.map(envName => ({
    name: envName,
    count: combinedRows.reduce(
      (sum, row) => sum + row.environments.filter(env => env.name === envName).length,
      0
    ),
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Determine the current sprint/iteration name for the navbar
  const selectedSprintOrIteration =
    location.state?.sprintName ||
    location.state?.iterationName ||
    location.state?.name ||
    `${startDate} - ${finishDate}`;

  return (
    <div style={{ position: "relative" }}>
      <Navbar
        selectedProject={projectName}
        setSelectedProject={() => {}}
        selectedRelease={{
          startDate,
          finishDate,
          name: selectedSprintOrIteration // Show current sprint/iteration in navbar
        }}
        setSelectedRelease={() => {}}
        showReleaseDropdown={true}
      />
      {pipelineName && (
        <h2 style={{ marginTop: 0, marginBottom: "1rem", wordBreak: "break-word" }}>
          <a href={pipelineUrl} target="_blank" rel="noopener noreferrer">{pipelineName}</a>
        </h2>
      )}
      <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
        Total Releases: {combinedRows.length}
      </h3>
      {/* Environment Filter */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          color={envFilter === "All" ? "primary" : "neutral"}
          variant={envFilter === "All" ? "solid" : "outlined"}
          onClick={() => setEnvFilter("All")}
          sx={{ cursor: "pointer" }}
        >
          All
        </Chip>
        {allEnvNames.map(envName => (
          <Chip
            key={envName}
            color={envFilter === envName ? "primary" : "neutral"}
            variant={envFilter === envName ? "solid" : "outlined"}
            onClick={() => setEnvFilter(envName)}
            sx={{ cursor: "pointer" }}
          >
            {envName}
          </Chip>
        ))}
      </Box>
      {/* Horizontal Bar Chart */}
      <Box sx={{ width: '100%', maxWidth: 600, height: 350, mb: 2 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={envCounts}
            margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
          >
            <XAxis type="number" allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={100} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#2196f3">
              {envCounts.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={ENV_COLORS[idx % ENV_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <>
        {workItemsCard.open && (
          <ReleaseWorkItemsCard
            releaseId={workItemsCard.releaseId}
            projectName={projectName}
            onClose={() => setWorkItemsCard({ open: false, releaseId: null })}
          />
        )}
        <Table
          aria-label="Pipeline Details Table"
          sx={{ minWidth: 650, background: "#fff" }}
          stickyHeader
        >
          <thead>
            <tr>
              <th>Release Name</th>
              <th>Started On</th>
              <th>Environments</th>
              <th>Release Link</th>
              <th>Associated Work Items</th>
              <th>Github Commit Link</th>
            </tr>
          </thead>
          <tbody>
            {combinedRows.map((row, idx) => {
              // If "All" is selected, show all environments.
              // If a filter is selected, show all environments for releases that have the selected environment.
              const hasSelectedEnv = envFilter === "All"
                ? true
                : row.environments.some(env => env.name === envFilter);

              if (!hasSelectedEnv) return null;

              return (
                <tr key={row.releaseId || idx}>
                  <td>{row.releaseName}</td>
                  <td>{row.queuedOn ? new Date(row.queuedOn).toLocaleString() : ""}</td>
                  <td>
                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, flexWrap: 'wrap', maxWidth: 400 }}>
                      {row.environments.map(env => (
                        <Box
                          key={env.name}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: getEnvColor(env.status),
                            color: "#fff",
                            borderRadius: 1,
                            px: 1,
                            py: 0.25,
                            mr: 0.5,
                            mb: 0.5,
                            minWidth: 60,
                            maxWidth: 120,
                            whiteSpace: 'nowrap',
                            fontWeight: 500,
                            fontSize: 12,
                            justifyContent: 'center'
                          }}
                        >
                          {env.name}
                        </Box>
                      ))}
                    </Box>
                  </td>
                  <td>
                    <a href={row.releaseUrl} target="_blank" rel="noopener noreferrer">Release</a>
                  </td>
                  <td>
                    <Button
                      variant="outlined"
                      onClick={() => setWorkItemsCard({ open: true, releaseId: row.releaseId })}
                    >
                      View Work Items
                    </Button>
                  </td>
                  <td>
                    <a href={row.commitUrl} target="_blank" rel="noopener noreferrer">Link</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    </div>
  );
}

export default PipelineDetails; 