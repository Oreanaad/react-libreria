import React from 'react';


const SectionHeader = ({ icon, title }) => {
  return (
    <div className="section-header-container">
      <div className="section-icon">{icon}</div>
      <h2 className="section-title">{title}</h2>
      <div className="section-line-tienda"></div>
    </div>
  );
};

export default SectionHeader;