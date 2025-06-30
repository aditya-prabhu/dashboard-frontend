import React, { useEffect, useState, useRef } from "react";
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Table from '@mui/joy/Table';
import Link from '@mui/joy/Link';
import CircularProgress from '@mui/joy/CircularProgress';
import { API_BASE } from "../api/endpoints";

function ReleaseWorkItemsCard({ releaseId, projectName, onClose }) {
  const [workItems, setWorkItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!releaseId || !projectName) return;
    setLoading(true);
    fetch(`${API_BASE}/api/release-work-items?release_id=${encodeURIComponent(releaseId)}&project=${encodeURIComponent(projectName)}`)
      .then(res => res.json())
      .then(data => {
        setWorkItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setWorkItems([]);
        setLoading(false);
      });
  }, [releaseId, projectName]);

  // Handle ESC key and click outside
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    function handleClickOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 1300,
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Card
        ref={cardRef}
        variant="outlined"
        sx={{
          width: "90vw",
          maxWidth: 900,
          minHeight: 400,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          boxShadow: 12,
          position: "relative",
          p: 4
        }}
      >
        <Typography level="h4" sx={{ mb: 2 }}>
          Associated Work Items
        </Typography>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 24,
            background: "none",
            border: "none",
            fontSize: 28,
            cursor: "pointer",
            color: "#888"
          }}
          aria-label="Close"
        >
          &times;
        </button>
        {loading ? (
          <CircularProgress />
        ) : workItems.length === 0 ? (
          <Typography>No associated work items found.</Typography>
        ) : (
          <Table aria-label="Work Items Table" sx={{ background: "#fff" }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned To</th>
                <th>State</th>
                <th>Reason</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {workItems.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.title}</td>
                  <td>{item.assignedTo}</td>
                  <td>{item.state}</td>
                  <td>{item.reason}</td>
                  <td>
                    <Link href={item.htmlUrl} target="_blank" rel="noopener">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}

export default ReleaseWorkItemsCard;