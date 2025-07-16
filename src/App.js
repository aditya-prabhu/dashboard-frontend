import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PipelinesTable from './components/PipelinesTable';
import Workitem from './components/Workitem';
import CreateProjectForm from './pages/CreateProjectForm';
import PipelineDetails from './pages/PipelineDetails';
import PendingApprovals from './components/PendingApprovals';
import Graph from './components/graph';
import './App.css';
import Grid from '@mui/joy/Grid';
import Box from '@mui/joy/Box';
import Yamlpage from "./pages/Yamlpage";

function App() {
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedRelease, setSelectedRelease] = useState(null);
  const showContent = selectedProject && selectedRelease;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #90caf9 0%, #1976d2 100%)",
        p: 0,
        m: 0
      }}
    >
      <Routes>
        <Route path="/create-project" element={<CreateProjectForm />} />
        <Route
          path="/"
          element={
            <>
              <Navbar
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedRelease={selectedRelease}
                setSelectedRelease={setSelectedRelease}
                readOnly={false}
              />
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
                    <Grid xs={12}>
                      <Graph project={selectedProject} release={selectedRelease} />
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
            </>
          }
        />
        <Route
          path="/pipeline-details/:definitionId"
          element={
            <>
              <Navbar
                selectedProject={selectedProject}
                selectedRelease={selectedRelease}
                readOnly={true}
              />
              <PipelineDetails
                selectedProject={selectedProject}
                setSelectedProject={setSelectedProject}
                selectedRelease={selectedRelease}
                setSelectedRelease={setSelectedRelease}
              />
            </>
          }
        />
        <Route path="/yaml-details/:definitionId" element={<Yamlpage />} />
      </Routes>
    </Box>
  );
}

export default App;