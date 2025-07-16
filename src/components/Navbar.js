import React, { useEffect, useState, useRef } from "react";
import ProjectDropdown from "./ProjectDropdown";
import ReleaseDropdown from "./ReleaseDropdown";
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { API_BASE } from "../api/endpoints";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import NotificationBell from "./NotificationBell";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";
import Link from "@mui/joy/Link";

function Navbar({
  selectedProject,
  setSelectedProject,
  selectedRelease,
  setSelectedRelease
}) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [releasePlanData, setReleasePlanData] = useState([]);
  const [releasePlanLoading, setReleasePlanLoading] = useState(false);
  const fetchControllerRef = useRef(null);

  // --- YAML Pipeline Approvals Modal State ---
  const [openYamlApprovals, setOpenYamlApprovals] = useState(false);
  const [yamlApprovals, setYamlApprovals] = useState([]);
  const [yamlApprovalsLoading, setYamlApprovalsLoading] = useState(false);

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

  // --- Handler for YAML Pipeline Approvals ---
  const handleShowYamlApprovals = async () => {
    if (!selectedProject || !accounts[0]?.username) return;
    setYamlApprovalsLoading(true);
    setOpenYamlApprovals(true);
    try {
      const url = `${API_BASE}/api/yaml-pipeline-approvals-matching?project=${encodeURIComponent(selectedProject)}&user_email=${encodeURIComponent(accounts[0].username)}`;
      const res = await fetch(url);
      const data = await res.json();
      setYamlApprovals(Array.isArray(data) ? data : []);
    } catch {
      setYamlApprovals([]);
    }
    setYamlApprovalsLoading(false);
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
      {/* YAML Pipeline Approvals Button */}
      {isAuthenticated && selectedProject && (
        <Button
          variant="outlined"
          color="warning"
          onClick={handleShowYamlApprovals}
        >
          YAML Pipeline Approvals
        </Button>
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
      {/* YAML Pipeline Approvals Modal */}
      <Modal open={openYamlApprovals} onClose={() => setOpenYamlApprovals(false)}>
        <ModalDialog>
          <Typography level="h5" sx={{ mb: 2 }}>YAML Pipeline Approvals</Typography>
          {yamlApprovalsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 80 }}>
              <CircularProgress />
            </Box>
          ) : yamlApprovals.length === 0 ? (
            <Typography>No pending YAML pipeline approvals found.</Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: "auto", minWidth: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 4 }}>Pipeline Name</th>
                    <th style={{ textAlign: "left", padding: 4 }}>Approval URL</th>
                    <th style={{ textAlign: "left", padding: 4 }}>Pipeline URL</th>
                    <th style={{ textAlign: "left", padding: 4 }}>Pending Environment</th>
                  </tr>
                </thead>
                <tbody>
                  {yamlApprovals.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: 4 }}>{item.pipelineName}</td>
                      <td style={{ padding: 4 }}>
                        {item.approvalUrl ? (
                          <Link href={item.approvalUrl} target="_blank" rel="noopener">View</Link>
                        ) : "-"}
                      </td>
                      <td style={{ padding: 4 }}>
                        {item.pipelineUrl ? (
                          <Link href={item.pipelineUrl} target="_blank" rel="noopener">View</Link>
                        ) : "-"}
                      </td>
                      <td style={{ padding: 4 }}>{item.pendingEnvironment || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </Sheet>
  );
}

export default Navbar;