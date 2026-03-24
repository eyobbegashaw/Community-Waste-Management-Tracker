import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../contexts/LanguageContext';
import ReportMarker from './ReportMarker';
import './MapView.css';

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});
const MapView = ({ reports, onMarkerClick, userLocation }) => {
  const { t } = useLanguage();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [map, setMap] = useState(null);

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const defaultCenter = [9.0222, 38.7468]; // Addis Ababa center
      const zoom = 13;

      const mapInstance = L.map(mapRef.current).setView(defaultCenter, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance);

      mapInstanceRef.current = mapInstance;
      setMap(mapInstance);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center map on user location when available
  useEffect(() => {
    if (map && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 15);
    }
  }, [map, userLocation]);

  // Add user location marker
  useEffect(() => {
    if (map && userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '📍',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindTooltip(t('yourLocation'), { permanent: false });
    }
  }, [map, userLocation, t]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      {reports?.map(report => (
        <ReportMarker 
          key={report.id}
          report={report}
          map={map}
          onClick={() => onMarkerClick(report)}
        />
      ))}
    </div>
  );
};

export default MapView;
