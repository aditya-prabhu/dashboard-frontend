import React, { useEffect, useState } from 'react';
import Table from '@mui/joy/Table';
import Link from '@mui/joy/Link';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE } from "../api/endpoints";

const COLORS = ['#8884d8', '#82ca9d', '#ff8042'];

function Workitem({ project, release }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project || !release) {
      setItems([]);
      return;
    }
    setLoading(true);
    const url = `${API_BASE}/api/iteration-work-items?project=${encodeURIComponent(project)}&iteration_id=${encodeURIComponent(release.id)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const WorkitemArray = Array.isArray(data) ? data : [data];
        setItems(WorkitemArray);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [project, release]);

  // Count work items by state
  const stateCounts = items.reduce(
    (acc, item) => {
      const state = (item.state || '').toLowerCase();
      if (state === 'new') acc.New += 1;
      else if (state === 'resolved') acc.Resolved += 1;
      else if (state === 'closed') acc.Closed += 1;
      return acc;
    },
    { New: 0, Resolved: 0, Closed: 0 }
  );

  const pieData = [
    { name: 'New', value: stateCounts.New },
    { name: 'Resolved', value: stateCounts.Resolved },
    { name: 'Closed', value: stateCounts.Closed }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography level="h5" sx={{ mb: 1 }}>
        Total Work Items: {items.length}
      </Typography>
      {/* Pie Chart for work item states */}
      <Box sx={{ width: '100%', maxWidth: 400, height: 250, mb: 2 }}>
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
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Box>
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
    </Box>
  );
}

export default Workitem;