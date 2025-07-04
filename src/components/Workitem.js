import React, { useEffect, useState } from 'react';
import Table from '@mui/joy/Table';
import Link from '@mui/joy/Link';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { API_BASE } from "../api/endpoints";

const COLORS = ['#8884d8', '#82ca9d', '#ff8042'];

function Workitem({ project, release }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

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

  // Get unique assignedTo and state values for dropdowns
  const assignedToOptions = Array.from(new Set(items.map(item => item.assignedTo).filter(Boolean)));
  const stateOptions = Array.from(new Set(items.map(item => item.state).filter(Boolean)));

  // Filter items based on dropdowns
  const filteredItems = items.filter(item =>
    (assignedToFilter === 'All' || item.assignedTo === assignedToFilter) &&
    (stateFilter === 'All' || item.state === stateFilter)
  );

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
        Total Work Items: {filteredItems.length}
      </Typography>
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>Assigned To:</span>
          <Select
            size="sm"
            value={assignedToFilter}
            onChange={(_, value) => setAssignedToFilter(value)}
            sx={{ minWidth: 120 }}
          >
            <Option value="All">All</Option>
            {assignedToOptions.map(name => (
              <Option key={name} value={name}>{name}</Option>
            ))}
          </Select>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>State:</span>
          <Select
            size="sm"
            value={stateFilter}
            onChange={(_, value) => setStateFilter(value)}
            sx={{ minWidth: 100 }}
          >
            <Option value="All">All</Option>
            {stateOptions.map(state => (
              <Option key={state} value={state}>{state}</Option>
            ))}
          </Select>
        </Box>
      </Box>
      {/* Table is scrollable */}
      <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
        <Table
          aria-label="Work Items Table"
          sx={{ minWidth: 650, background: '#fff' }}
          stickyHeader
        >
          <thead>
            <tr>
              <th>Title</th>
              <th>
                Assigned To
              </th>
              <th>
                State
              </th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
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
      {/* Pie Chart for work item states - BELOW the table */}
      <Box sx={{ width: '100%', maxWidth: 400, height: 250 }}>
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
    </Box>
  );
}

export default Workitem;