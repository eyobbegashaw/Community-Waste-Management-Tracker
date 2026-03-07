import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, scheduleService } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './AdminPage.css';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (userProfile && userProfile.role !== 'admin') {
      navigate('/');
    }
  }, [userProfile, navigate]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'reports') {
        const data = await reportService.getReports();
        setReports(data);
      } else {
        const data = await scheduleService.getSchedules();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await reportService.updateReportStatus(reportId, newStatus);
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteReport = async (reportId, imageUrl) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        await reportService.deleteReport(reportId, imageUrl);
        await loadData();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleScheduleUpdate = async (scheduleId, data) => {
    try {
      await scheduleService.updateSchedule(scheduleId, data);
      setEditingSchedule(null);
      await loadData();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const handleAddSchedule = async (data) => {
    try {
      await scheduleService.addSchedule(data);
      setShowAddSchedule(false);
      await loadData();
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  const getStatusCount = (status) => {
    return reports.filter(r => r.status === status).length;
  };

  if (loading) {
    return <div className="loading">{t('loading')}</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-sidebar">
        <h2>{t('adminDashboard')}</h2>
        
        <nav className="admin-nav">
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            📋 {t('manageReports')}
            <span className="badge">{reports.length}</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'schedules' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedules')}
          >
            📅 {t('manageSchedules')}
            <span className="badge">{schedules.length}</span>
          </button>
        </nav>

        {activeTab === 'reports' && (
          <div className="stats">
            <div className="stat-item">
              <span className="stat-label">🆕 {t('newReport')}:</span>
              <span className="stat-value">{getStatusCount('new')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">⏳ {t('inProgress')}:</span>
              <span className="stat-value">{getStatusCount('in-progress')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">✅ {t('resolved')}:</span>
              <span className="stat-value">{getStatusCount('resolved')}</span>
            </div>
          </div>
        )}
      </div>

      <div className="admin-content">
        {activeTab === 'reports' ? (
          <div className="reports-management">
            <h3>{t('manageReports')}</h3>
            
            <div className="reports-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('image')}</th>
                    <th>{t('description')}</th>
                    <th>{t('location')}</th>
                    <th>{t('reportedBy')}</th>
                    <th>{t('date')}</th>
                    <th>{t('status')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr key={report.id}>
                      <td>
                        <img 
                          src={report.imageUrl} 
                          alt="Report" 
                          className="table-thumbnail"
                        />
                      </td>
                      <td>{report.description.substring(0, 50)}...</td>
                      <td>{report.location?.address?.substring(0, 30)}</td>
                      <td>{report.userName}</td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${report.status}`}>
                          {t(report.status === 'new' ? 'newReport' : 
                             report.status === 'in-progress' ? 'inProgress' : 'resolved')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {report.status !== 'in-progress' && (
                            <button 
                              className="btn-progress"
                              onClick={() => handleStatusChange(report.id, 'in-progress')}
                            >
                              ⏳
                            </button>
                          )}
                          {report.status !== 'resolved' && (
                            <button 
                              className="btn-resolved"
                              onClick={() => handleStatusChange(report.id, 'resolved')}
                            >
                              ✅
                            </button>
                          )}
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteReport(report.id, report.imageUrl)}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="schedules-management">
            <div className="schedules-header">
              <h3>{t('manageSchedules')}</h3>
              <button 
                className="btn-add"
                onClick={() => setShowAddSchedule(true)}
              >
                + {t('addSchedule')}
              </button>
            </div>

            <div className="schedules-grid">
              {schedules.map(schedule => (
                <div key={schedule.id} className="schedule-card">
                  {editingSchedule === schedule.id ? (
                    <ScheduleForm
                      schedule={schedule}
                      onSave={handleScheduleUpdate}
                      onCancel={() => setEditingSchedule(null)}
                    />
                  ) : (
                    <>
                      <div className="schedule-card-header">
                        <h4>{schedule.subCity}</h4>
                        {schedule.zone && <span>{schedule.zone}</span>}
                      </div>
                      
                      <div className="schedule-card-body">
                        <p><strong>{t('collectionDays')}:</strong> {schedule.collectionDays.join(', ')}</p>
                        <p><strong>{t('collectionTime')}:</strong> {schedule.collectionTime}</p>
                        {schedule.notes && (
                          <p><strong>{t('notes')}:</strong> {schedule.notes}</p>
                        )}
                      </div>
                      
                      <div className="schedule-card-footer">
                        <button onClick={() => setEditingSchedule(schedule.id)}>
                          ✏️ {t('edit')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {showAddSchedule && (
              <ScheduleForm
                onSave={handleAddSchedule}
                onCancel={() => setShowAddSchedule(false)}
                isNew
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Schedule Form Component
const ScheduleForm = ({ schedule, onSave, onCancel, isNew }) => {
  const [formData, setFormData] = useState({
    subCity: schedule?.subCity || '',
    zone: schedule?.zone || '',
    collectionDays: schedule?.collectionDays || [],
    collectionTime: schedule?.collectionTime || '',
    notes: schedule?.notes || ''
  });
  const { t } = useLanguage();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      collectionDays: prev.collectionDays.includes(day)
        ? prev.collectionDays.filter(d => d !== day)
        : [...prev.collectionDays, day]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNew) {
      onSave(formData);
    } else {
      onSave(schedule.id, formData);
    }
  };

  return (
    <form className="schedule-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>{t('subCity')} *</label>
        <input
          type="text"
          value={formData.subCity}
          onChange={e => setFormData({...formData, subCity: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>{t('zone')}</label>
        <input
          type="text"
          value={formData.zone}
          onChange={e => setFormData({...formData, zone: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>{t('collectionDays')} *</label>
        <div className="days-grid">
          {days.map(day => (
            <label key={day} className="day-checkbox">
              <input
                type="checkbox"
                checked={formData.collectionDays.includes(day)}
                onChange={() => handleDayToggle(day)}
              />
              {day.substring(0, 3)}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>{t('collectionTime')} *</label>
        <input
          type="text"
          value={formData.collectionTime}
          onChange={e => setFormData({...formData, collectionTime: e.target.value})}
          placeholder="e.g., 8:00 AM - 12:00 PM"
          required
        />
      </div>

      <div className="form-group">
        <label>{t('notes')}</label>
        <textarea
          value={formData.notes}
          onChange={e => setFormData({...formData, notes: e.target.value})}
          rows="3"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          {t('cancel')}
        </button>
        <button type="submit">
          {isNew ? t('add') : t('save')}
        </button>
      </div>
    </form>
  );
};

export default AdminPage;