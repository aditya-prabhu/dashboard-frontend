import React, { useEffect, useState, useRef, useMemo } from 'react';
import Table from '@mui/joy/Table';
import Link from '@mui/joy/Link';
import CircularProgress from '@mui/joy/CircularProgress';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { API_BASE } from "../api/endpoints";

function Workitem({ project, release }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  const fetchControllerRef = useRef(null);

  useEffect(() => {
    if (!project || !release) {
      setItems([]);
      return;
    }
    setLoading(true);
    const url = `${API_BASE}/api/iteration-work-items?project=${encodeURIComponent(project)}&iteration_id=${encodeURIComponent(release.id)}`;

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        let workItems = [];
        workItems = data.value;
        setItems(workItems);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("work items request aborted");
        } else {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [project, release]);

  // Memoize dropdown options and filtered items for performance
  const assignedToOptions = useMemo(
    () => Array.from(new Set(items.map(item => item.assignedTo).filter(Boolean))),
    [items]
  );
  const stateOptions = useMemo(
    () => Array.from(new Set(items.map(item => item.state).filter(Boolean))),
    [items]
  );
  const filteredItems = useMemo(
    () =>
      items.filter(item =>
        (assignedToFilter === 'All' || item.assignedTo === assignedToFilter) &&
        (stateFilter === 'All' || item.state === stateFilter)
      ),
    [items, assignedToFilter, stateFilter]
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
              <th>Assigned To</th>
              <th>State</th>
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
    </Box>
  );
}

export default Workitem;