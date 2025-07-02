import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ReleaseDetails({ projectName }) {
  const [releaseDetails, setReleaseDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeReleaseCount, setActiveReleaseCount] = useState(0);
  const [iterationDates, setIterationDates] = useState({ startDate: "", endDate: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIterationDates = async () => {
      try {
        const iterationUrl = `http://localhost:8000/api/iterations?project=${encodeURIComponent(projectName)}`;
        const iterationRes = await fetch(iterationUrl);
        if (iterationRes.ok) {
          const iterationData = await iterationRes.json();
          setIterationDates({
            startDate: iterationData.startDate || "",
            endDate: iterationData.endDate || "",
          });
        } else {
          throw new Error("Failed to fetch iteration dates");
        }
      } catch (err) {
        console.warn("Failed to fetch iteration dates for project", projectName);
        setIterationDates({ startDate: "", endDate: "" });
      }
    };

    if (projectName) {
      fetchIterationDates();
    }
  }, [projectName]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!iterationDates.startDate || !iterationDates.endDate) return;

      setIsLoading(true);
      setErrorMessage("");
      try {
        const pipelinesUrl = `http://localhost:8000/api/pipelines?project=${encodeURIComponent(
          projectName
        )}&startDate=${encodeURIComponent(iterationDates.startDate)}&endDate=${encodeURIComponent(iterationDates.endDate)}`;
        const pipelinesRes = await fetch(pipelinesUrl);
        if (!pipelinesRes.ok) throw new Error("Failed to fetch pipelines");

        const pipelinesData = await pipelinesRes.json();
        if (!Array.isArray(pipelinesData) || pipelinesData.length === 0) {
          throw new Error("No pipelines found for the given criteria.");
        }

        const detailFetches = pipelinesData
          .filter((pipeline) => pipeline.definitionId)
          .map(async (pipeline) => {
            const detailsUrl = `http://localhost:8000/api/pipelines-by-definition?startDate=${encodeURIComponent(
              iterationDates.startDate
            )}&endDate=${encodeURIComponent(iterationDates.endDate)}&project=${encodeURIComponent(
              projectName
            )}&definitionId=${encodeURIComponent(pipeline.definitionId)}`;

            try {
              const detailsRes = await fetch(detailsUrl);
              if (!detailsRes.ok) {
                console.warn(`Failed to fetch details for definitionId: ${pipeline.definitionId}`);
                return [];
              }
              const detailsData = await detailsRes.json();
              return Array.isArray(detailsData) ? detailsData : [];
            } catch (err) {
              console.warn(`Error fetching details for definitionId: ${pipeline.definitionId}`, err);
              return [];
            }
          });

        const detailsArrays = await Promise.all(detailFetches);
        const allReleaseData = detailsArrays.flat();

        setReleaseDetails(allReleaseData);

        const activeCount = allReleaseData.filter(
          (release) => release.status && release.status.toLowerCase() === "active"
        ).length;
        setActiveReleaseCount(activeCount);
      } catch (error) {
        console.error("Error fetching release details:", error);
        setErrorMessage(error.message);
        setReleaseDetails([]);
        setActiveReleaseCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [projectName, iterationDates]);

  const handleViewWorkItems = (releaseId, definitionId) => {
    navigate(`/release-work-items/${releaseId}/${definitionId}`);
  };

  return (
    <div>
      <h2>Total Releases: {releaseDetails.length}</h2>
      <h3>Total Active Releases: {activeReleaseCount}</h3>

      {isLoading && <div>Loading...</div>}
      {errorMessage && <div>Error: {errorMessage}</div>}
      {!isLoading && !errorMessage && !releaseDetails.length && (
        <div>No release details available.</div>
      )}

      {!isLoading && !errorMessage && releaseDetails.length > 0 && (
        <div>
          <h2>Release Details</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f1f1" }}>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Created On</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Description</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Pipeline URL</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Release URL</th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>Work Items</th>
              </tr>
            </thead>
            <tbody>
              {releaseDetails.map((release, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{release.status}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {release.createdOn ? new Date(release.createdOn).toLocaleString() : ""}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>{release.description}</td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <a href={release.pipelineUrl} target="_blank" rel="noopener noreferrer">
                      Pipeline Link
                    </a>
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <a href={release.releaseUrl} target="_blank" rel="noopener noreferrer">
                      Release Link
                    </a>
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <button
                      onClick={() => handleViewWorkItems(release.releaseId, release.definitionId)}
                      style={{ padding: "4px 8px", borderRadius: "4px" }}
                    >
                      View Work Items
                    </button>
                  </td>
                </tr>
              ))}
            </tbody> 
          </table>
        </div>
      )}
    </div>
  );
}

export default ReleaseDetails;