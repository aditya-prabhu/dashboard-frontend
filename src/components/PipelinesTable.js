import React, { useEffect, useState } from "react";
import Table from '@mui/joy/Table';
import Link from '@mui/joy/Link';
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/endpoints";

function PipelinesTable({ project, release }) {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!project || !release) {
      setRows([]);
      return;
    }
    const startDate = release.startDate;
    const endDate = release.finishDate;
    const url = `${API_BASE}/api/pipelines?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&project=${encodeURIComponent(project)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const pipelinesArray = Array.isArray(data) ? data : [data];
        const uniquePipelines = filterUniquePipelines(pipelinesArray);
        setRows(uniquePipelines);
      });
  }, [project, release]);

  const filterUniquePipelines = (pipelines) => {
    const seen = new Set();
    return pipelines.filter(pipeline => {
      const identifier = pipeline.name;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        return true;
      }
      return false;
    });
  };

  return (
    <Table
      aria-label="Pipelines Table"
      sx={{ minWidth: 650, background: "#fff" }}
      stickyHeader
    >
      <thead>
        <tr>
          <th style={{ display: "none" }}>Definition ID</th>
          <th>Name</th>
          <th>Last Run Date</th>
          <th>Description</th>
          <th>Pipeline Link</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.releaseId || idx}>
            <td style={{ display: "none" }}>{row.definitionId}</td>
            <td style={{
              whiteSpace: "normal",
              wordBreak: "break-word"
            }}>
              <Link
                component="button"
                onClick={() =>
                  navigate(
                    `/pipeline-details/${row.definitionId}`,
                    {
                      state: {
                        startDate: release.startDate,
                        finishDate: release.finishDate,
                        projectName: project,
                        definitionId: row.definitionId
                      }
                    }
                  )
                }
                underline="none"
                sx={{ cursor: "pointer" }}
              >
                {row.name}
              </Link>
            </td>
            <td>{new Date(row.createdOn).toLocaleString()}</td>
            <td style={{
              whiteSpace: "normal",
              wordBreak: "break-word"
            }}>
              {row.description}
            </td>
            <td>
              <Link href={row.pipelineUrl} target="_blank" rel="noopener">
                Link
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default PipelinesTable;