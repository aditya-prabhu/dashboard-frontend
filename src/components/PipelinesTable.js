import React, { useEffect, useState } from "react";
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

function PipelinesTable({ project, release }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [envMap, setEnvMap] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalEnvs, setModalEnvs] = useState([]);
  const [envLoading, setEnvLoading] = useState(false);
  const [currentDefId, setCurrentDefId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!project || !release) {
      setRows([]);
      setEnvMap({});
      return;
    }
    setLoading(true);
    const startDate = release.startDate;
    const endDate = release.finishDate;
    const url = `${API_BASE}/api/pipelines?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&project=${encodeURIComponent(project)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const pipelinesArray = Array.isArray(data) ? data : [data];
        const uniquePipelines = filterUniquePipelines(pipelinesArray);
        setRows(uniquePipelines);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [project, release]);

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

  const handleShowEnvs = (definitionId) => {
    setCurrentDefId(definitionId);
    setEnvLoading(true);
    setOpenModal(true);
    const url = `${API_BASE}/api/deployed-environments?project=${encodeURIComponent(project)}&definitionId=${encodeURIComponent(definitionId)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const envs = Array.isArray(data.environments) ? data.environments : [];
        setEnvMap(prev => ({
          ...prev,
          [definitionId]: envs
        }));
        setModalEnvs(envs);
        setEnvLoading(false);
      })
      .catch(() => {
        setModalEnvs([]);
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
      <Typography level="h5" sx={{ mb: 1 }}>
        Total Pipelines: {rows.length}
      </Typography>
      <Table
        aria-label="Pipelines Table"
        sx={{ minWidth: 650, background: "#fff" }}
        stickyHeader
      >
        <thead>
          <tr>
            <th style={{ display: "none" }}>Definition ID</th>
            <th>Name</th>
            <th>Last Run Date</th>
            <th>Deployed Environments</th>
            <th>Pipeline Link</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.releaseId || idx}>
              <td style={{ display: "none" }}>{row.definitionId}</td>
              <td style={{
                whiteSpace: "normal",
                wordBreak: "break-word"
              }}>
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
            </tr>
          ))}
        </tbody>
      </Table>
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
              modalEnvs.map((env, i) => {
                // List of main environments
                const mainEnvs = ['dev', 'int', 'uat', 'prod'];
                // Check if environment is not one of the main ones (case-insensitive)
                const isOtherEnv = !mainEnvs.includes(env.environmentName?.toLowerCase());
                return (
                  <Button
                    key={env.environmentName + i}
                    size="sm"
                    variant="outlined"
                    color="primary"
                    onClick={() => window.open(env.releaseUrl, "_blank")}
                    sx={{
                      textTransform: "none",
                      minWidth: 80,
                      backgroundColor: isOtherEnv ? "#ffe6f0" : undefined, // light pink for others
                      color: isOtherEnv ? "#b71c5a" : undefined,
                      borderColor: isOtherEnv ? "#f8bbd0" : undefined,
                      '&:hover': isOtherEnv ? { backgroundColor: "#ffd6ea" } : {}
                    }}
                  >
                    {env.environmentName}
                  </Button>
                );
              })
            )}
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

export default PipelinesTable;