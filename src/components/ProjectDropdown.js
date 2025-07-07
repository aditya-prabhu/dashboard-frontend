import React, { useEffect, useState, useRef } from "react";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

function ProjectDropdown({ apiUrl, onSelect, value }) {
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
      .then((data) => setOptions(data))
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log("project dropdown request aborted");
        } else {
          setOptions([]);
        }
      });

    return () => {
      controller.abort();
    };
  }, [apiUrl]);

  const handleChange = (event, newValue) => {
    onSelect && onSelect(newValue);
  };

  return (
    <Select
      placeholder="Project Dropdown"
      value={value || ""}
      onChange={handleChange}
      sx={{ minWidth: 200 }}
    >
      {options.map((item, idx) => (
        <Option key={idx} value={item}>
          {item}
        </Option>
      ))}
    </Select>
  );
}
export default ProjectDropdown;