import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PipelinesTable from './components/PipelinesTable';
import Workitem from './components/Workitem';
import CreateProjectForm from './pages/CreateProjectForm';
import PipelineDetails from './pages/PipelineDetails';
import './App.css';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';

function App() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRelease, setSelectedRelease] = useState(null);
  console.log('selectedRelease:', selectedRelease);
  
  return (
    <Router>
      <Routes>
        <Route path="/create-project" element={<CreateProjectForm />} />
        <Route
          path="/"
          element={
            <Grid container spacing={2} sx={{ minHeight: '100vh', p: 2 }}>
              <Grid xs={12}>
                <Navbar
                  selectedProject={selectedProject}
                  setSelectedProject={setSelectedProject}
                  selectedRelease={selectedRelease}
                  setSelectedRelease={setSelectedRelease}
                />
              </Grid>
              <Grid xs={12} md={6}>
                <Box sx={{ p: 2, background: '#fafafa', borderRadius: 2, height: '70vh', overflow: 'auto' }}>
                  <h2>Pipelines</h2>
                  <PipelinesTable project={selectedProject} release={selectedRelease} />
                </Box>
              </Grid>
              <Grid xs={12} md={6}>
                <Box sx={{ p: 2, background: '#fafafa', borderRadius: 2, height: '70vh', overflow: 'auto' }}>
                  <h2>Work Items</h2>
                  <Workitem project={selectedProject} release={selectedRelease} />
                </Box>
              </Grid>
            </Grid>
          }
        />
        <Route path="/pipeline-details/:definitionId" element={<PipelineDetails />} />
      </Routes>
    </Router>
  );
}

export default App;