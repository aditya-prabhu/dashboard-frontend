import React, { useEffect, useState } from 'react';
import Table from '@mui/joy/Table';
import Link from '@mui/joy/Link';

function Workitem({ project, release }) {
  const [items, setItems] = useState([]);

 useEffect(() => {
  if (!project || !release) {
    setItems([]);
    return;
  }
// console.log("selectedRelease:", release);
// console.log("iterationId:", release.iterationId);
    const url = `http://localhost:8000/api/iteration-work-items?project=${encodeURIComponent(project)}&iteration_id=${encodeURIComponent(release.id)}`;
// console.log("Fetching work items from:", url); // Log the selectedRelease here

  // Use iterationId if that's what your API expectsconst url = `http://localhost:8000/api/workitems?project=${encodeURIComponent(project)}&iterationId=${encodeURIComponent(release.iterationId)}`;
  fetch(url)
    .then(res => res.json())
    .then(data => {
      const WorkitemArray = Array.isArray(data) ? data : [data];
      setItems(WorkitemArray);
    });
}, [project, release]);

  return (
    <Table
      aria-label="Work Items Table"
      sx={{ minWidth: 650, background: '#fff' }}
      stickyHeader
    >
      <thead>
        <tr>
          <th>Title</th>
          <th>Assigned To</th>
          <th>State</th>
          <th>URL</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr key={item.id || idx}>
            <td>{item.title}</td>
            <td>{item.assignedTo}</td>
            <td>{item.state}</td>
            <td>
              <Link href={item.htmlUrl} target="_blank" rel="noopener">
                View Work Item
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default Workitem;