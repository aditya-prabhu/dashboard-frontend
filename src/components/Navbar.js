import React from "react";
import ProjectDropdown from "./ProjectDropdown";
import ReleaseDropdown from "./ReleaseDropdown";
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import { API_BASE } from "../api/endpoints";

function Navbar({
  selectedProject,
  setSelectedProject,
  selectedRelease,
  setSelectedRelease
}) {
  const releaseApiUrl = selectedProject
    ? `${API_BASE}/api/iterations?project=${selectedProject}`
    : "";

  return (
    <Sheet
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        p: 2,
        background: "#eee",
        borderRadius: "sm",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      <Box>
        <ProjectDropdown
          apiUrl={`${API_BASE}/api/projects`}
          onSelect={setSelectedProject}
          value={selectedProject}
        />
      </Box>
      <Box>
        <ReleaseDropdown
          apiUrl={releaseApiUrl}
          onSelect={setSelectedRelease}
          value={selectedRelease}
        />
      </Box>
    </Sheet>
  );
}

export default Navbar;