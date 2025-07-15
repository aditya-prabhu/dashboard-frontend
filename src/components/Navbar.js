import React, { useEffect, useState, useRef } from "react";
import ProjectDropdown from "./ProjectDropdown";
import ReleaseDropdown from "./ReleaseDropdown";
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { API_BASE } from "../api/endpoints";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import NotificationBell from "./NotificationBell";

function Navbar({
  selectedProject,
  setSelectedProject,
  selectedRelease,
  setSelectedRelease
}) {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [releasePlanData, setReleasePlanData] = useState([]);
  const [releasePlanLoading, setReleasePlanLoading] = useState(false);
  const fetchControllerRef = useRef(null);

  const releaseNotesUrl = selectedRelease && selectedRelease.ReleaseNotesUrl ? selectedRelease.ReleaseNotesUrl : "";
  const releaseApiUrl = selectedProject
    ? `${API_BASE}/api/iterations?project=${selectedProject}`
    : "";

  useEffect(() => {
    const fetchReleasePlan = async () => {
      if (!selectedProject || !selectedRelease) {
        setReleasePlanData([]);
        return;
      }
      setReleasePlanLoading(true);

      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      const controller = new AbortController();
      fetchControllerRef.current = controller;

      try {
        const url = `${API_BASE}/api/release-plan-work-items?project=${encodeURIComponent(selectedProject)}`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setReleasePlanData(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("release plan request aborted");
        } else {
          setReleasePlanData([]);
        }
      }
      setReleasePlanLoading(false);
    };
    fetchReleasePlan();

    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, [selectedProject, selectedRelease]);

  let releasePlanMatch = null;
  if (selectedProject && selectedRelease && releasePlanData.length > 0) {
    const sprintName = selectedRelease?.name || "";
    releasePlanMatch = releasePlanData.find(
      item =>
        sprintName &&
        item.title &&
        item.title.toLowerCase().includes(sprintName.toLowerCase()) &&
        item.webUrl
    );
  }

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
          {releasePlanLoading ? (
            <Button variant="outlined" color="primary" disabled>
              Loading...
            </Button>
          ) : releasePlanMatch && releasePlanMatch.webUrl ? (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.open(releasePlanMatch.webUrl, "_blank")}
            >
              Release Plan
            </Button>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", color: "#b71c1c", fontWeight: 500, px: 2 }}>
              No Release Plan Found
            </Box>
          )}
        </Box>
      )}
      {/* Notification Bell */}
      {isAuthenticated && selectedProject && (
        <NotificationBell projectName={selectedProject} />
      )}
      <nav>
        {isAuthenticated ? (
          <Button onClick={() => instance.logoutRedirect()} variant="outlined" color="secondary">
            Sign Out
          </Button>
        ) : (
          <Button onClick={() => instance.loginRedirect()} variant="outlined" color="primary">
            Sign In
          </Button>
        )}
      </nav>
    </Sheet>
  );
}

export default Navbar;