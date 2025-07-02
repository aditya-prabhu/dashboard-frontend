import React from 'react';
import ReleaseDetails from './ReleaseDetails';
import Box from '@mui/joy/Box';

const ReleaseDashboard = ({ startDate, endDate, projectName, definitionId }) => {
  return (
    <Box sx={{ p: 2, background: '#fafafa', borderRadius: 2, height: '70vh', overflow: 'auto' }}>
      <h2>Release Dashboard</h2>
      <ReleaseDetails startDate={startDate} endDate={endDate} projectName={projectName}  definitionId={definitionId}/>
    </Box>
  );
};

export default ReleaseDashboard;
