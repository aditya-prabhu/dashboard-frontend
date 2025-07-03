import React, { useState } from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import Textarea from "@mui/joy/Textarea";
import Typography from "@mui/joy/Typography";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import ProjectDropdown from "../components/ProjectDropdown";

export default function CreateProjectForm() {
  const [mode, setMode] = useState("create");
  const [projectName, setProjectName] = useState("");
  const [releases, setReleases] = useState("");
  const [teamName, setTeamName] = useState("");
  const [path, setPath] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState("");

  const handleProjectSelect = async (selectedProject) => {
    if (!selectedProject) {
      setProjectName("");
      setReleases("");
      setTeamName("");
      setPath("");
      setTags("");
      return;
    }
    setProjectName(selectedProject);
    try {
      const res = await fetch(`http://localhost:8000/api/project-info?project_name=${selectedProject}`);
      if (!res.ok) throw new Error("Failed to fetch project info");
      const data = await res.json();
      setTeamName(data.project.teamName || "");
      setPath(data.project.path || "");
      setReleases(
        Array.isArray(data.urls.releases) ? data.urls.releases.join("\n") : ""
      );
      setTags(
        Array.isArray(data.urls.tags) ? data.urls.tags.join(", ") : ""
      );
    } catch (err) {
      setMessage("Error fetching project info.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const payload = {
      project_name: projectName,
      releases: releases.split("\n").map((l) => l.trim()).filter(Boolean),
      teamName: teamName,
      path: path,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    try {
      const res = await fetch("http://localhost:8000/api/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMessage(data.message || (data.success ? "Success!" : "Error"));
    } catch (err) {
      setMessage("Error submitting form.");
    }
  };

  const handleModeChange = (event, newValue) => {
    setMode(newValue);
    setMessage("");
    setProjectName("");
    setReleases("");
    setTeamName("");
    setPath("");
    setTags("");
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography level="h4" mb={2}>
        {mode === "update" ? "Update Project" : "Create New Project"}
      </Typography>
      <Select
        value={mode}
        onChange={handleModeChange}
        sx={{ mb: 2, width: "100%" }}
      >
        <Option value="create">Create New Project</Option>
        <Option value="update">Update Existing Project</Option>
      </Select>
      {mode === "update" ? (
        <ProjectDropdown
          apiUrl="http://localhost:8000/api/projects"
          onSelect={handleProjectSelect}
          value={projectName}
        />
      ) : (
        <>
          <Typography level="body2" sx={{ mb: 0.5 }}>Project Name</Typography>
          <Input
            required
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            sx={{ mb: 2, width: "100%" }}
          />
        </>
      )}
      <form onSubmit={handleSubmit}>
        {mode === "update" && (
          <>
            <Typography level="body2" sx={{ mb: 0.5 }}>Project Name</Typography>
            <Input
              required
              value={projectName}
              disabled
              sx={{ mb: 2, width: "100%" }}
            />
          </>
        )}
        <Typography level="body2" sx={{ mb: 0.5 }}>Team Name</Typography>
        <Input
          required
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
          sx={{ mb: 2, width: "100%" }}
        />
        <Typography level="body2" sx={{ mb: 0.5 }}>Path</Typography>
        <Input
          required
          value={path}
          onChange={e => setPath(e.target.value)}
          sx={{ mb: 2, width: "100%" }}
        />
        <Typography level="body2" sx={{ mb: 0.5 }}>Release URLs (one per line)</Typography>
        <Textarea
          minRows={3}
          value={releases}
          onChange={e => setReleases(e.target.value)}
          sx={{ mb: 2, width: "100%" }}
        />
        <Typography level="body2" sx={{ mb: 0.5 }}>Tags (comma separated)</Typography>
        <Input
          value={tags}
          onChange={e => setTags(e.target.value)}
          sx={{ mb: 2, width: "100%" }}
        />
        <Button type="submit" variant="solid">
          {mode === "update" ? "Update Project" : "Create Project"}
        </Button>
      </form>
      {message && <Typography mt={2}>{message}</Typography>}
    </Box>
  );
}