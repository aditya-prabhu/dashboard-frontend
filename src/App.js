import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PipelinesTable from './components/PipelinesTable';
import Workitem from './components/Workitem';
import CreateProjectForm from './pages/CreateProjectForm';
import PipelineDetails from './pages/PipelineDetails';
import PendingApprovals from './components/PendingApprovals';
import './App.css';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';

function App() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRelease, setSelectedRelease] = useState(null);

  const showContent = selectedProject && selectedRelease;

  return (
    <Router>
      {/* Navbar is always visible and receives the selected values */}
      <Navbar
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        selectedRelease={selectedRelease}
        setSelectedRelease={setSelectedRelease}
      />
      <Routes>
        <Route path="/create-project" element={<CreateProjectForm />} />
        <Route
          path="/"
          element={
            <Grid container spacing={2} sx={{ minHeight: '100vh', p: 2 }}>
              {showContent ? (
                <>
                  <Grid xs={12}>
                    <PendingApprovals
                      startDate={selectedRelease?.startDate}
                      endDate={selectedRelease?.finishDate}
                      projectName={selectedProject}
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
                </>
              ) : (
                <Grid xs={12}>
                  <Box
                    sx={{
                      minHeight: '60vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fafafa'
                    }}
                  >
                    <span>
                      {selectedProject
                        ? "Please select a release to view dashboard details."
                        : "Please select a project and release to begin."}
                    </span>
                  </Box>
                </Grid>
              )}
            </Grid>
          }
        />
        <Route
          path="/pipeline-details/:definitionId"
          element={
            <PipelineDetails
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              selectedRelease={selectedRelease}
              setSelectedRelease={setSelectedRelease}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;