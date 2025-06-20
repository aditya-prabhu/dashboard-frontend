import React, { useEffect, useState } from "react";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

// ...existing imports...
function ReleaseDropdown({ apiUrl, onSelect, value }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!apiUrl) {
      setOptions([]);
      return;
    }
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [data];
        setOptions(arr);
      });
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
      {options.map((item, idx) => (
        <Option key={item.id || idx} value={item.name}>
          {item.name}
        </Option>
      ))}
    </Select>
  );
}
export default ReleaseDropdown;