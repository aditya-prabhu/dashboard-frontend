import React, { useEffect, useState } from "react";
import Table from '@mui/joy/Table';
import Link from '@mui/joy/Link';

function PipelinesTable({ project, release }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!project || !release) {
      setRows([]);
      return;
    }
    const startDate = release.startDate;
    const endDate = release.finishDate;
    const url = `http://localhost:8000/api/pipelines?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&project=${encodeURIComponent(project)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : [data];
        setRows(arr);
      });
  }, [project, release]);

  return (
    <Table
      aria-label="Pipelines Table"
      sx={{ minWidth: 650, background: "#fff" }}
      stickyHeader
    >
      <thead>
        <tr>
          <th>Name</th>
          <th>Run Date</th>
          <th>Description</th>
          <th>Pipeline URL</th>
          <th>Release URL</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.releaseId || idx}>
            <td>{row.name}</td>
            <td>{new Date(row.createdOn).toLocaleString()}</td>
            <td>{row.description}</td>
            <td>
              <Link href={row.pipelineUrl} target="_blank" rel="noopener">
                Pipeline
              </Link>
            </td>
            <td>
              <Link href={row.releaseUrl} target="_blank" rel="noopener">
                Release
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default PipelinesTable;