import React, { useState, useEffect, useRef } from "react";
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';

function PendingApprovals({ startDate, endDate, projectName }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [error, setError] = useState("");
  const cardRef = useRef(null);

  // Fetch pending approvals when inputs change
  useEffect(() => {
    if (!startDate || !endDate || !projectName) {
      setPending([]);
      return;
    }
    setLoading(true);
    setError("");
    fetch(
      `http://localhost:8000/api/pending-approvals?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&project=${encodeURIComponent(projectName)}`
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch pending approvals");
        return res.json();
      })
      .then(data => setPending(Array.isArray(data) ? data : []))
      .catch(err => {
        setError(err.message);
        setPending([]);
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate, projectName]);

  // Handle ESC key and click outside to close card
  useEffect(() => {
    if (!showCard) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") setShowCard(false);
    }
    function handleClickOutside(e) {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowCard(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCard]);

  return (
    <Box sx={{ mb: 2, p: 2, background: "#fffbe6", borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Typography level="h5">
          Total Pending Approvals: {loading ? "..." : pending.length}
        </Typography>
        {pending.length > 0 && (
          <Button onClick={() => setShowCard(true)} variant="outlined" size="sm">
            Show Pending Approvals
          </Button>
        )}
      </Box>
      {error && <Typography color="danger" sx={{ mt: 1 }}>{error}</Typography>}
      {showCard && (
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
              maxWidth: 800,
              minHeight: 200,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#fff",
              boxShadow: 12,
              position: "relative",
              p: 4
            }}
          >
            <Typography level="h4" sx={{ mb: 2 }}>
              Pending Approvals
            </Typography>
            <button
              onClick={() => setShowCard(false)}
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
              <Typography>Loading...</Typography>
            ) : pending.length === 0 ? (
              <Typography>No pending approvals found.</Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {pending.map((item, idx) => (
                  <Card
                    key={idx}
                    variant="soft"
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #eee",
                      background: "#f9f9f9"
                    }}
                  >
                    <Typography level="h6" sx={{ mb: 1 }}>
                      {item.pipelineName}
                    </Typography>
                    <Typography>
                      <b>Environment:</b> {item.environmentName}
                    </Typography>
                    <Typography>
                      <b>Approver:</b> {item.approver}
                    </Typography>
                    <Typography>
                      <b>Created On:</b> {item.createdOn ? new Date(item.createdOn).toLocaleString() : "N/A"}
                    </Typography>
                    <Typography>
                      <b>Pipeline URL:</b>{" "}
                      {item.pipelineUrl ? (
                        <a href={item.pipelineUrl} target="_blank" rel="noopener noreferrer">
                          View Pipeline
                        </a>
                      ) : "N/A"}
                    </Typography>
                    <Typography>
                      <b>Approval URL:</b>{" "}
                      {item.releaseUrl ? (
                        <a href={item.releaseUrl} target="_blank" rel="noopener noreferrer">
                          View Approval
                        </a>
                      ) : "N/A"}
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}
          </Card>
        </div>
      )}
    </Box>
  );
}

export default PendingApprovals;