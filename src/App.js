import Navbar from './components/Navbar';
import PipelinesTable from './components/PipelinesTable';
import Workitem from './components/Workitem';
import './App.css';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';
import React, { useState } from 'react';

function App() {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedRelease, setSelectedRelease] = useState(null);

  return (
    <Grid container spacing={2} sx={{ minHeight: "100vh", p: 2 }}>
      <Grid xs={12}>
        <Navbar
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          selectedRelease={selectedRelease}
          setSelectedRelease={setSelectedRelease}
        />
      </Grid>
      <Grid xs={12} md={6}>
        <Box sx={{ p: 2, background: "#fafafa", borderRadius: 2, height: '70vh', overflow: 'auto' }}>
          <h2>Pipelines</h2>
          <PipelinesTable project={selectedProject} release={selectedRelease} />
        </Box>
      </Grid>
      <Grid xs={12} md={6}>
        <Box sx={{ p: 2, background: "#fafafa", borderRadius: 2, height: '70vh', overflow: 'auto' }}>
          <h2>Work Items</h2>
          <Workitem project={selectedProject} release={selectedRelease} />
        </Box>
      </Grid>
    </Grid>
  );
}

export default App;