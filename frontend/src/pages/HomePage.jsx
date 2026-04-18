import React, { useState, useEffect } from 'react';
import MapView from '../components/Map/MapView';
import AddReportButton from '../components/Map/AddReportButton';
import ReportCard from '../components/Reports/ReportCard';
import ReportDetailModal from '../components/Reports/ReportDetailModal';
import CollectionSchedule from '../components/Schedule/CollectionSchedule';
import { reportService } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './HomePage.css';

const HomePage = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'schedule'
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    loadReports();
    getUserLocation();
  }, []);

  const loadReports = async () => {
    try {
      const data = await reportService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Addis Ababa center
          setUserLocation({ lat: 9.0222, lng: 38.7468 });
        }
      );
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await reportService.updateReportStatus(reportId, newStatus);
      await loadReports(); // Reload to get updated data
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const recentReports = reports.slice(0, 5);

  return (
    <div className="home-page">
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ {t('map')}
        </button>
        <button 
          className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 {t('schedule')}
        </button>
      </div>

      {activeTab === 'map' ? (
        <div className="map-tab">
          <MapView 
            reports={reports}
            onMarkerClick={setSelectedReport}
            userLocation={userLocation}
          />
          
          <AddReportButton />

          {recentReports.length > 0 && (
            <div className="recent-reports">
              <h3>{t('recentReports')}</h3>
              <div className="reports-list">
                {recentReports.map(report => (
                  <ReportCard 
                    key={report.id}
                    report={report}
                    onClick={() => setSelectedReport(report)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <CollectionSchedule />
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusChange}
          isAdmin={userProfile?.role === 'admin'}
        />
      )}
    </div>
  );
};

export default HomePage;
