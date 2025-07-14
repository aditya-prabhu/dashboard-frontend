import React, { useEffect, useState } from "react";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { useMsal } from "@azure/msal-react";

function NotificationBell({ projectName }) {
  const { accounts } = useMsal();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (!projectName || !accounts[0]?.username) return;
      try {
        const response = await fetch(
          `/api/pending-approvals-user?project=${encodeURIComponent(projectName)}&email=${encodeURIComponent(accounts[0].username)}`
        );
        const data = await response.json();
        setPendingCount(data.count || 0); // Adjust if your API returns a different structure
      } catch (error) {
        setPendingCount(0);
      }
    };
    fetchPendingApprovals();
  }, [projectName, accounts]);

  return (
    <Tooltip title={pendingCount > 0 ? `${pendingCount} pending approvals` : "No pending approvals"}>
      <IconButton color={pendingCount > 0 ? "error" : "default"}>
        <Badge badgeContent={pendingCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
}

export default NotificationBell;