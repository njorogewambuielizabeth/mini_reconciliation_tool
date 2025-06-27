import React from 'react';
import Papa from 'papaparse';

const FileUpload = ({ label, onFileParsed }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        onFileParsed(results.data);
      }
    });
  };

  return (
    <div>
      <label>{label}</label><br />
      <input type="file" accept=".csv" onChange={handleFileChange} />
    </div>
  );
};

export default FileUpload;
