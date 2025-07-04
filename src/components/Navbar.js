import React, { useEffect, useState } from "react";
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
  const [releasePlanData, setReleasePlanData] = useState([]);
  const [releasePlanLoading, setReleasePlanLoading] = useState(false);

  const releaseNotesUrl = selectedRelease && selectedRelease.ReleaseNotesUrl ? selectedRelease.ReleaseNotesUrl : "";
  const releaseApiUrl = selectedProject
    ? `${API_BASE}/api/iterations?project=${selectedProject}`
    : "";

  // Fetch release plan work items as soon as project or release changes
  useEffect(() => {
    const fetchReleasePlan = async () => {
      if (!selectedProject || !selectedRelease) {
        setReleasePlanData([]);
        return;
      }
      setReleasePlanLoading(true);
      try {
        const url = `${API_BASE}/api/release-plan-work-items?project=${encodeURIComponent(selectedProject)}`;
        const res = await fetch(url);
        const data = await res.json();
        setReleasePlanData(Array.isArray(data) ? data : []);
      } catch {
        setReleasePlanData([]);
      }
      setReleasePlanLoading(false);
    };
    fetchReleasePlan();
  }, [selectedProject, selectedRelease]);

  // Handler for Release Plan button
  const handleReleasePlanClick = () => {
    if (!selectedProject || !selectedRelease) return;
    const sprintName = selectedRelease?.name || "";
    const match = releasePlanData.find(
      item =>
        sprintName &&
        item.title &&
        item.title.toLowerCase().includes(sprintName.toLowerCase()) &&
        item.webUrl
    );
    if (match && match.webUrl) {
      window.open(match.webUrl, "_blank");
    } else if (releasePlanLoading) {
      alert("Loading release plan work items, please try again in a moment.");
    } else {
      alert("No matching release plan work item found for this sprint.");
    }
  };

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
        <Box sx={{ display: "flex", gap: 2 }}>
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
          <Button
            variant="outlined"
            color="primary"
            onClick={handleReleasePlanClick}
            disabled={releasePlanLoading}
          >
            {releasePlanLoading ? "Loading..." : "Release Plan"}
          </Button>
        </Box>
      )}
    </Sheet>
  );
}

export default Navbar;