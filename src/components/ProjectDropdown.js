import React, { useEffect, useState } from "react";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

function ProjectDropdown({ apiUrl, onSelect, value }) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setOptions(data));
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