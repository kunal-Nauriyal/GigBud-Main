import React, { useEffect, useState } from 'react';
import axios from 'axios';

function LocationDropdown({ value = '', onChange, onSelect }) {
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (value.trim()) {
        axios
          .get(`http://localhost:3000/api/location/search?q=${encodeURIComponent(value.trim())}`)
          .then((res) => {
            console.log('✅ Location results:', res.data?.data);
            setResults(res.data?.data || []);
            setShowDropdown(true);
          })
          .catch((err) => {
            console.error('❌ Error fetching locations:', err.response?.data || err.message);
            setResults([]);
          });
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [value]);

  const handleSelect = (item) => {
    if (onChange) onChange(item.name);
    if (onSelect) onSelect(item);
    setResults([]);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search city or college..."
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="form-control"
        autoComplete="off"
      />
      {showDropdown && results.length > 0 && (
        <ul
          className="dropdown-menu show"
          style={{
            position: 'absolute',
            width: '100%',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: 0,
            margin: 0,
            listStyle: 'none'
          }}
        >
          {results.map((item) => (
            <li
              key={item._id}
              className="dropdown-item"
              onMouseDown={() => handleSelect(item)}
              style={{ cursor: 'pointer' }}
            >
              {item.name} ({item.type})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationDropdown;
