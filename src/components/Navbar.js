import React from "react";
import ProjectDropdown from "./ProjectDropdown";
import ReleaseDropdown from "./ReleaseDropdown";
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { API_BASE } from "../api/endpoints";

function Navbar({
  selectedProject,
  setSelectedProject,
  selectedRelease,
  setSelectedRelease
}) {

  const releaseNotesUrl = selectedRelease && selectedRelease.ReleaseNotesUrl ? selectedRelease.ReleaseNotesUrl : "";
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
      {releaseNotesUrl && (
        <Box>
          <Button
            component="a"
            href={releaseNotesUrl}
            target="_blank"
            rel="noopener"
            variant="solid"
            color="primary"
          >
            Release Notes
          </Button>
        </Box>
      )}
    </Sheet>
  );
}

export default Navbar;