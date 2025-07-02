import React, { useState, useEffect } from "react";

function ReleaseWorkItems({ releaseId, projectName }) {
  const [workItems, setWorkItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchWorkItems = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const workItemsUrl = `http://localhost:8000/api/release-work-items?releaseId=${encodeURIComponent(
          releaseId
        )}&projectName=${encodeURIComponent(projectName)}`;
        const workItemsRes = await fetch(workItemsUrl);
        if (!workItemsRes.ok) throw new Error("Failed to fetch release work items");

        const workItemsData = await workItemsRes.json();
        setWorkItems(workItemsData);
      } catch (error) {
        console.error("Error fetching release work items:", error);
        setErrorMessage(error.message);
        setWorkItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (releaseId && projectName) {
      fetchWorkItems();
    }
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