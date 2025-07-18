import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/endpoints";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";
import Link from "@mui/joy/Link";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import ModalClose from "@mui/joy/ModalClose";
import CircularProgress from "@mui/joy/CircularProgress";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";

function PipelinesTable({ project, release }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalEnvs, setModalEnvs] = useState([]);
  const [envLoading, setEnvLoading] = useState(false);
  const [pipelineType, setPipelineType] = useState("classic"); // "classic" or "yaml"
  const navigate = useNavigate();

  const fetchControllerRef = useRef(null);

  useEffect(() => {
    if (!project || (pipelineType === "classic" && !release)) {
      setRows([]);
      return;
    }
    setLoading(true);

    let url;
    if (pipelineType === "classic") {
      const startDate = release.startDate;
      const endDate = release.finishDate;
      url = `${API_BASE}/api/pipelines?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&project=${encodeURIComponent(project)}`;
    } else {
      // YAML pipelines only need project name
      url = `${API_BASE}/api/yaml-pipelines?project=${encodeURIComponent(project)}`;
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        console.log("YAML pipelines API response:", data);
        if (pipelineType === "classic") {
          const pipelinesArray = Array.isArray(data) ? data : [data];
          const uniquePipelines = filterUniquePipelines(pipelinesArray);
          setRows(uniquePipelines);
        } else {
          // YAML pipelines: handle both array and { pipelines: [...] }
          if (Array.isArray(data)) {
            setRows(data);
          } else if (Array.isArray(data.pipelines)) {
            setRows(data.pipelines);
          } else {
            setRows([]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("pipelines request aborted");
        } else {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [project, release, pipelineType]);

  const filterUniquePipelines = (pipelines) => {
    const seen = new Set();
    return pipelines.filter(pipeline => {
      const identifier = pipeline.name;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        return true;
      }
      return false;
    });
  };

  // Ref for aborting env fetch
  const envFetchControllerRef = useRef(null);

  const handleShowEnvs = (definitionId) => {
    setEnvLoading(true);
    setOpenModal(true);

    // Prepare parameters for pipelines-runs API
    const startDate = release.startDate;
    const endDate = release.finishDate;
    const projectName = project;

    // Use pipelines-runs API to fetch only the latest release environments
    const url = `${API_BASE}/api/pipelines-runs?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&project=${encodeURIComponent(projectName)}&definitionId=${encodeURIComponent(definitionId)}`;

    // Abort previous env fetch if any
    if (envFetchControllerRef.current) {
      envFetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    envFetchControllerRef.current = controller;

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        // data is an array of environment objects for all releases in the range
        let envs = [];
        if (Array.isArray(data) && data.length > 0) {
          // Find the latest releaseId
          const latestReleaseId = Math.max(...data.map(env => env.releaseId));
          // Filter environments for the latest release only
          envs = data.filter(env => env.releaseId === latestReleaseId);
        }
        setModalEnvs(envs);
        setEnvLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setModalEnvs([]);
        setEnvLoading(false);
      });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography level="h6" sx={{ mr: 2, display: "inline-block" }}>Pipeline Type:</Typography>
        <Select
          value={pipelineType}
          onChange={(_, val) => setPipelineType(val)}
          sx={{ width: 220, display: "inline-block" }}
        >
          <Option value="classic">Classic Release Pipelines</Option>
          <Option value="yaml">YAML Pipelines</Option>
        </Select>
      </Box>
      <Typography level="h5" sx={{ mb: 1 }}>
        Total Pipelines: {rows.length}
      </Typography>
      <Table
        aria-label="Pipelines Table"
        sx={{
          background: "#fff",
          borderRadius: 2,
          boxShadow: "0 2px 8px 0 rgba(33,150,243,0.08)"
        }}
        stickyHeader
      >
        <thead>
          <tr style={{ background: "#e3f2fd" }}>
            {pipelineType === "classic" ? (
              <>
                <th style={{ display: "none" }}>Definition ID</th>
                <th>Name</th>
                <th>Last Run Date</th>
                <th>Deployed Environments</th>
                <th>Pipeline Link</th>
              </>
            ) : (
              <>
                <th>Name</th>
                <th>Folder</th>
                <th>Pipeline Link</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || idx} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fafc" }}>
              {pipelineType === "classic" ? (
                <>
                  <td style={{ display: "none" }}>{row.definitionId}</td>
                  <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    <Link
                      component="button"
                      onClick={() =>
                        navigate(
                          `/pipeline-details/${row.definitionId}`,
                          {
                            state: {
                              startDate: release.startDate,
                              finishDate: release.finishDate,
                              projectName: project,
                              definitionId: row.definitionId
                            }
                          }
                        )
                      }
                      underline="none"
                      sx={{ cursor: "pointer" }}
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td>{new Date(row.createdOn).toLocaleString()}</td>
                  <td>
                    <Link
                      component="button"
                      underline="always"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleShowEnvs(row.definitionId)}
                    >
                      Show Environments
                    </Link>
                  </td>
                  <td>
                    <Link href={row.pipelineUrl} target="_blank" rel="noopener">
                      Link
                    </Link>
                  </td>
                </>
              ) : (
                <>
                  <td style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    <Link
                      component="button"
                      underline="always"
                      sx={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(
                          `/yaml-details/${row.id}`,
                          {
                            state: {
                              project,
                              definitionId: row.id,
                              startDate: release?.startDate,
                              endDate: release?.finishDate
                            }
                          }
                        )
                      }
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td>{row.folder}</td>
                  <td>
                    <Link
                      href={row.webUrl}
                      target="_blank"
                      rel="noopener"
                      underline="always"
                      sx={{ cursor: "pointer" }}
                    >
                      Link
                    </Link>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
      {/* Classic Release Modal */}
      {pipelineType === "classic" && (
        <Modal open={openModal} onClose={() => setOpenModal(false)}>
          <ModalDialog>
            <ModalClose />
            <Typography level="h6" sx={{ mb: 1 }}>Deployed Environments</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1, minHeight: 40 }}>
              {envLoading ? (
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <CircularProgress />
                </Box>
              ) : modalEnvs.length === 0 ? (
                <span style={{ color: "#888" }}>No Environments</span>
              ) : (
                (() => {
                  const latestReleaseId = Math.max(...modalEnvs.map(env => env.releaseId));
                  const latestReleaseEnvs = modalEnvs.filter(env => env.releaseId === latestReleaseId);
                  return latestReleaseEnvs.map((env, i) => {
                    // Color based on status
                    let colorProps = {};
                    const status = env.status?.toLowerCase();
                    if (status === "succeeded" || status === "success") {
                      colorProps = {
                        backgroundColor: "#e8f5e9",
                        color: "#388e3c",
                        borderColor: "#a5d6a7",
                        '&:hover': { backgroundColor: "#c8e6c9" }
                      };
                    } else if (status === "failed" || status === "failure") {
                      colorProps = {
                        backgroundColor: "#ffebee",
                        color: "#c62828",
                        borderColor: "#ef9a9a",
                        '&:hover': { backgroundColor: "#ffcdd2" }
                      };
                    } else if (status === "pending" || status === "inprogress") {
                      colorProps = {
                        backgroundColor: "#fffde7",
                        color: "#f9a825",
                        borderColor: "#ffe082",
                        '&:hover': { backgroundColor: "#fff9c4" }
                      };
                    } else {
                      colorProps = {
                        backgroundColor: "#eceff1",
                        color: "#607d8b",
                        borderColor: "#b0bec5",
                        '&:hover': { backgroundColor: "#cfd8dc" }
                      };
                    }
                    return (
                      <Button
                        key={env.environment + i}
                        size="sm"
                        variant="outlined"
                        color="primary"
                        onClick={() => window.open(env.releaseUrl, "_blank")}
                        sx={{
                          textTransform: "none",
                          minWidth: 80,
                          ...colorProps
                        }}
                      >
                        {env.environment} {env.status ? `(${env.status})` : ""}
                      </Button>
                    );
                  });
                })()
              )}
            </Box>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
}

export default PipelinesTable;