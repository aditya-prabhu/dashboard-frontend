// ...existing imports...
import React, { useEffect, useState } from "react";
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import { useLocation, useParams } from "react-router-dom";
import { API_BASE } from "../api/endpoints";
import ReleaseWorkItemsCard from "../components/ReleaseWorkItemsCard";

function PipelineDetails() {
  const { definitionId } = useParams();
  const location = useLocation();
  const { startDate, finishDate, projectName } = location.state || {};
  const [rows, setRows] = useState([]);
  const [workItemsCard, setWorkItemsCard] = useState({ open: false, releaseId: null });

  useEffect(() => {
    if (!definitionId || !startDate || !finishDate || !projectName) return;
    const url = `${API_BASE}/api/pipelines-runs?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(finishDate)}&project=${encodeURIComponent(projectName)}&definitionId=${encodeURIComponent(definitionId)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [data];
        setRows(arr);
      });
  }, [definitionId, startDate, finishDate, projectName]);

  const pipelineName = rows.length > 0 ? rows[0].name : "";
  const pipelineUrl = rows.length > 0 ? rows[0].pipelineUrl : "";

  return (
    <div style={{ position: "relative" }}>
      {/* Show total releases on top */}
      <h2 style={{ marginTop: 0, marginBottom: "1rem", color: "#1976d2" }}>
        Total Releases: {rows.length}
      </h2>
      {pipelineName && (
        <h3 style={{ marginBottom: "1rem", wordBreak: "break-word" }}>
          <a href={pipelineUrl} target="_blank" rel="noopener noreferrer">{pipelineName}</a>
        </h3>
      )}
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
            <th>Release ID</th>
            <th>Created On</th>
            <th>Description</th>
            <th>Release Link</th>
            <th>Associated Work Items</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.releaseId || idx}>
              <td>{row.name}</td>
              <td>{new Date(row.createdOn).toLocaleString()}</td>
              <td style={{
                whiteSpace: "normal",
                wordBreak: "break-word"
              }}>
                {row.description}
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
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default PipelineDetails;