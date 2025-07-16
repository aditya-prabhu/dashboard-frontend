import React, { useEffect, useState, useRef } from "react";
import ProjectDropdown from "./ProjectDropdown";
import ReleaseDropdown from "./ReleaseDropdown";
import Box from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Button from '@mui/joy/Button';
import { API_BASE } from "../api/endpoints";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import Typography from "@mui/joy/Typography";
import CircularProgress from "@mui/joy/CircularProgress";
import Link from "@mui/joy/Link";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";

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
  const [pendingCount, setPendingCount] = useState(0);

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
    if (!accounts[0]?.username) return;
    setYamlApprovalsLoading(true);
    setOpenYamlApprovals(true);
    try {
      const url = `${API_BASE}/api/yaml-pipeline-approvals-matching?user_email=${encodeURIComponent(accounts[0].username)}`;
      const res = await fetch(url);
      const data = await res.json();
      setYamlApprovals(Array.isArray(data) ? data : []);
    } catch {
      setYamlApprovals([]);
    }
    setYamlApprovalsLoading(false);
  };

  // Fetch pending count for bell badge
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!accounts[0]?.username) {
        setPendingCount(0);
        return;
      }
      try {
        const url = `${API_BASE}/api/yaml-pipeline-approvals-matching?username=${encodeURIComponent(accounts[0].username)}`;
        const res = await fetch(url);
        const data = await res.json();
        setPendingCount(Array.isArray(data) ? data.length : 0);
      } catch {
        setPendingCount(0);
      }
    };
    if (isAuthenticated) {
      fetchPendingCount();
    }
  }, [isAuthenticated, accounts]);

  return (
    <Sheet
      variant="outlined"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        p: 2,
        background: "linear-gradient(90deg, #90caf9 0%, #1976d2 100%)", // deeper blue gradient
        borderRadius: "sm",
        width: "100%",
        boxSizing: "border-box",
        boxShadow: "0 2px 8px 0 rgba(33,150,243,0.08)"
      }}
    >
      {/* Logo in the left corner */}
      <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
        <img
          src="/logo.png"
          alt="Logo"
          style={{ height: 50, marginRight: 25, borderRadius: 1, background: "#fff" }}
        />
      </Box>
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
            sx={{
              background: "#bbdefb",
              color: "#1565c0",
              "&:hover": { background: "#90caf9" }
            }}
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
              sx={{
                background: "#e3f2fd",
                color: "#1976d2",
                "&:hover": { background: "#bbdefb" }
              }}
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
      {/* YAML Pipeline Approvals Bell Icon */}
      {isAuthenticated && (
        <Tooltip title={pendingCount > 0 ? `${pendingCount} pending YAML approvals` : "No pending YAML approvals"}>
          <IconButton color={pendingCount > 0 ? "error" : "default"} onClick={handleShowYamlApprovals}
            sx={{
              background: "#e3f2fd",
              "&:hover": { background: "#bbdefb" }
            }}
          >
            <Badge
              badgeContent={pendingCount > 0 ? pendingCount : null}
              color="error"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      )}
      <nav>
        {isAuthenticated ? (
          <Button
            onClick={() => instance.logoutRedirect()}
            variant="outlined"
            color="secondary"
            sx={{
              background: "#e3f2fd",
              color: "#1976d2",
              "&:hover": { background: "#bbdefb" }
            }}
          >
            Sign Out
          </Button>
        ) : (
          <Button
            onClick={() => instance.loginRedirect()}
            variant="outlined"
            color="primary"
            sx={{
              background: "#e3f2fd",
              color: "#1976d2",
              "&:hover": { background: "#bbdefb" }
            }}
          >
            Sign In
          </Button>
        )}
      </nav>
      {/* YAML Pipeline Approvals Modal */}
      <Modal open={openYamlApprovals} onClose={() => setOpenYamlApprovals(false)}>
        <ModalDialog
          sx={{
            background: "#e3f2fd",
            borderRadius: 2,
            boxShadow: "0 2px 16px 0 rgba(33,150,243,0.12)"
          }}
        >
          <Typography level="h5" sx={{ mb: 2, color: "#1976d2" }}>YAML Pipeline Approvals</Typography>
          {yamlApprovalsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 80 }}>
              <CircularProgress />
            </Box>
          ) : yamlApprovals.length === 0 ? (
            <Typography>No pending YAML pipeline approvals found.</Typography>
          ) : (
            <Box sx={{ maxHeight: 400, overflowY: "auto", minWidth: 400 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#e3f2fd" }}>
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
                    <tr key={idx} style={{ background: idx % 2 === 0 ? "#e3f2fd" : "#f8fafc" }}>
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