import React, { useState, useEffect } from 'react';
import { scheduleService } from '../../firebase/services';
import { useLanguage } from '../../contexts/LanguageContext';
import './CollectionSchedule.css';

const CollectionSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubCity, setSelectedSubCity] = useState('all');
  const { t, language } = useLanguage();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayClass = (day) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return day === today ? 'today' : '';
  };

  const filteredSchedules = selectedSubCity === 'all' 
    ? schedules 
    : schedules.filter(s => s.subCity === selectedSubCity);

  const subCities = [...new Set(schedules.map(s => s.subCity))];

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2>{t('schedule')}</h2>
        
        <select 
          className="subcity-filter"
          value={selectedSubCity}
          onChange={(e) => setSelectedSubCity(e.target.value)}
        >
          <option value="all">{t('allSubCities')}</option>
          {subCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      <div className="schedule-grid">
        {filteredSchedules.map(schedule => (
          <div key={schedule.id} className="schedule-card">
            <div className="schedule-card-header">
              <h3>{schedule.subCity}</h3>
              {schedule.zone && <span className="zone">{schedule.zone}</span>}
            </div>

            <div className="schedule-days">
              {schedule.collectionDays.map(day => (
                <span 
                  key={day} 
                  className={`day-badge ${getDayClass(day)}`}
                >
                  {language === 'am' ? 
                    (day === 'Monday' ? 'ሰኞ' :
                     day === 'Tuesday' ? 'ማክሰኞ' :
                     day === 'Wednesday' ? 'ረቡዕ' :
                     day === 'Thursday' ? 'ሐሙስ' :
                     day === 'Friday' ? 'አርብ' :
                     day === 'Saturday' ? 'ቅዳሜ' : 'እሁድ') 
                    : day}
                </span>
              ))}
            </div>

            <div className="schedule-info">
              <div className="info-item">
                <span className="info-label">🕐 {t('collectionTime')}:</span>
                <span className="info-value">{schedule.collectionTime}</span>
              </div>

              {schedule.notes && (
                <div className="info-item">
                  <span className="info-label">📝 {t('notes')}:</span>
                  <span className="info-value">{schedule.notes}</span>
                </div>
              )}

              <div className="info-item last-updated">
                <span className="info-label">{t('lastUpdated')}:</span>
                <span className="info-value">
                  {new Date(schedule.lastUpdated?.toDate()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionSchedule;