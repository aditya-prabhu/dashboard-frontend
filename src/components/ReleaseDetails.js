import React, { useEffect, useState, useRef } from "react";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

function ReleaseDropdown({ apiUrl, onSelect, value }) {
  const [options, setOptions] = useState([]);
  const fetchControllerRef = useRef(null);

  useEffect(() => {
    if (!apiUrl) {
      setOptions([]);
      return;
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    fetch(apiUrl, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [data];
        setOptions(arr);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("release dropdown request aborted");
        } else {
          setOptions([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [apiUrl]);

  const handleChange = (event, newValue) => {
    const selectedObj = options.find(item => item.name === newValue);
    onSelect && onSelect(selectedObj || null);
  };

  return (
    <Select
      placeholder="Release Dropdown"
      value={value?.name || ""}
      onChange={handleChange}
      sx={{ minWidth: 200 }}
    >
      {options.map((item, idx) => {
        // Format start and finish dates as DD/MM/YY
        let dateLabel = "";
        if (item.startDate && item.finishDate) {
          const start = new Date(item.startDate);
          const finish = new Date(item.finishDate);
          const pad = n => n.toString().padStart(2, "0");
          const startStr = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear().toString().slice(-2)}`;
          const finishStr = `${pad(finish.getDate())}/${pad(finish.getMonth() + 1)}/${finish.getFullYear().toString().slice(-2)}`;
          dateLabel = ` (${startStr} - ${finishStr})`;
        }
        return (
          <Option key={item.id || idx} value={item.name}>
            {item.name}{dateLabel}
          </Option>
        );
      })}
    </Select>
  );
}
export default ReleaseDropdown;