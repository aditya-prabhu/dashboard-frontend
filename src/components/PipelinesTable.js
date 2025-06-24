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
        // Ensure the data is an array
        const pipelinesArray = Array.isArray(data) ? data : [data];

        // Filter out duplicates based on a unique identifier (e.g., name)
        const uniquePipelines = filterUniquePipelines(pipelinesArray);

        setRows(uniquePipelines);
      });
  }, [project, release]);

  // Function to filter unique pipelines based on 'name' or 'id'
  const filterUniquePipelines = (pipelines) => {
    const seen = new Set();
    return pipelines.filter(pipeline => {
      const identifier = pipeline.name; // Change to 'pipeline.id' if using 'id' as unique identifier
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
          <th>Name</th>
          <th>Run Date</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.releaseId || idx}>
            <td>
              <Link href={row.pipelineUrl} target="_blank" rel="noopener">
                {row.name}
              </Link>
            </td>
            <td>{new Date(row.createdOn).toLocaleString()}</td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default PipelinesTable;

