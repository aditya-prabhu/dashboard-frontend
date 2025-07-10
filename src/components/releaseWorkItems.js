import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "../api/endpoints";

function ReleaseWorkItems({ releaseId, projectName }) {
  const [workItems, setWorkItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchWorkItems = async () => {
      setIsLoading(true);
      setErrorMessage("");

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const workItemsUrl = `${API_BASE}/api/release-work-items?releaseId=${encodeURIComponent(
          releaseId
        )}&projectName=${encodeURIComponent(projectName)}`;
        const workItemsRes = await fetch(workItemsUrl, { signal: controller.signal });
        if (!workItemsRes.ok) throw new Error("Failed to fetch release work items");

        const workItemsData = await workItemsRes.json();
        setWorkItems(workItemsData);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("release work items request aborted");
        } else {
          console.error("Error fetching release work items:", error);
          setErrorMessage(error.message);
          setWorkItems([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (releaseId && projectName) {
      fetchWorkItems();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [releaseId, projectName]);

  return (
    <div>
      <h2>Release Work Items</h2>
      {isLoading && <div>Loading...</div>}
      {errorMessage && <div>Error: {errorMessage}</div>}
      {!isLoading && !errorMessage && !workItems.length && (
        <div>No work items available for this release.</div>
      )}
      {!isLoading && !errorMessage && workItems.length > 0 && (
        <ul>
          {workItems.map((item, index) => (
            <li key={index}>
              <p>Title: {item.title}</p>
              <p>State: {item.state}</p>
              <p>Reason: {item.reason}</p>
              <p>Assigned To: {item.assignedTo}</p>
              <p>
                <a href={item.htmlURL} target="_blank" rel="noopener noreferrer">
                  View Item
                </a>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReleaseWorkItems;