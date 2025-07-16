import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Table from "@mui/joy/Table";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Link from "@mui/joy/Link";
import CircularProgress from "@mui/joy/CircularProgress";
import Button from "@mui/joy/Button";
import { API_BASE } from "../api/endpoints";

function Yamlpage() {
  const location = useLocation();
  const { project, definitionId, startDate, endDate } = location.state || {};
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project || !definitionId || !startDate || !endDate) return;
    setLoading(true);
    const url = `${API_BASE}/api/yaml-pipeline-builds?project=${encodeURIComponent(project)}&pipelineId=${encodeURIComponent(definitionId)}&minTime=${encodeURIComponent(startDate)}&maxTime=${encodeURIComponent(endDate)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRows(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [project, definitionId, startDate, endDate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography level="h5" sx={{ mb: 2 }}>YAML Pipeline Builds</Typography>
      <Table aria-label="YAML Pipeline Builds" sx={{ minWidth: 650, background: "#fff" }} stickyHeader>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Stages</th>
            <th>Pipeline Link</th>
            <th>GitHub Link</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || idx}>
              <td>{row.name}</td>
              <td>{row.status}</td>
              <td>
                {Array.isArray(row.stages) && row.stages.length > 0 ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {row.stages.map((stage, i) => {
                      let color = "neutral";
                      if (stage.result?.toLowerCase() === "succeeded") color = "success";
                      else if (stage.result?.toLowerCase() === "skipped") color = "neutral";
                      return (
                        <Button
                          key={i}
                          size="sm"
                          variant="solid"
                          color={color}
                          sx={{
                            minWidth: 80,
                            backgroundColor:
                              stage.result?.toLowerCase() === "succeeded"
                                ? "#e8f5e9"
                                : stage.result?.toLowerCase() === "skipped"
                                ? "#eceff1"
                                : undefined,
                            color:
                              stage.result?.toLowerCase() === "succeeded"
                                ? "#388e3c"
                                : stage.result?.toLowerCase() === "skipped"
                                ? "#607d8b"
                                : undefined,
                            borderColor:
                              stage.result?.toLowerCase() === "succeeded"
                                ? "#a5d6a7"
                                : stage.result?.toLowerCase() === "skipped"
                                ? "#b0bec5"
                                : undefined,
                            textTransform: "none"
                          }}
                        >
                          {stage.name}
                        </Button>
                      );
                    })}
                  </Box>
                ) : "-"
                }
              </td>
              <td>
                <Link href={row.webUrl} target="_blank" rel="noopener">Link</Link>
              </td>
              <td>
                {row.githubUrl ? (
                  <Link href={row.githubUrl} target="_blank" rel="noopener">GitHub</Link>
                ) : "-"
                }
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

export default Yamlpage;