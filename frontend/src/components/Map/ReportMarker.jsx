

import { useEffect } from 'react';
import L from 'leaflet';

const ReportMarker = ({ report, map, onClick }) => {
  useEffect(() => {
    if (!map || !report.location) return;

    // Color-coded markers based on status
    const getMarkerColor = (status) => {
      switch (status) {
        case 'new': return '#ef4444'; // red
        case 'in-progress': return '#eab308'; // yellow
        case 'resolved': return '#22c55e'; // green
        default: return '#6b7280'; // gray
      }
    };

    // Create custom marker icon
    const markerIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${getMarkerColor(report.status)};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        ">
          🗑️
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    const marker = L.marker(
      [report.location.lat, report.location.lng], 
      { icon: markerIcon }
    ).addTo(map);

    // Add popup with report info
    marker.bindPopup(`
      <div class="report-popup">
        <img src="${report.imageUrl}" alt="Report" style="width:100%; max-height:150px; object-fit:cover; border-radius:4px;" />
        <p><strong>${report.description?.substring(0, 100)}${report.description?.length > 100 ? '...' : ''}</strong></p>
        <p>📍 ${report.location.address || 'Location pinned'}</p>
        <p>📅 ${new Date(report.createdAt).toLocaleDateString()}</p>
        <button onclick="window.handleMarkerClick('${report.id}')" style="
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        ">View Details</button>
      </div>
    `);

    // Handle marker click
    marker.on('click', () => {
      onClick(report);
    });

    // Cleanup marker on unmount
    return () => {
      map.removeLayer(marker);
    };
  }, [map, report, onClick]);

  return null;
};

export default ReportMarker;
