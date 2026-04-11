
import React, { useState, useEffect } from 'react';
import { reportService, scheduleService, userService } from '../../firebase/services';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    newReports: 0,
    inProgress: 0,
    resolved: 0,
    totalSchedules: 0,
    activeUsers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'day', 'week', 'month'
  const { t } = useLanguage();

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Get reports
      const reports = await reportService.getReports();
      
      // Get schedules
      const schedules = await scheduleService.getSchedules();
      
      // Calculate date range
      const now = new Date();
      const rangeStart = new Date();
      switch (timeRange) {
        case 'day':
          rangeStart.setDate(now.getDate() - 1);
          break;
        case 'week':
          rangeStart.setDate(now.getDate() - 7);
          break;
        case 'month':
          rangeStart.setMonth(now.getMonth() - 1);
          break;
        default:
          rangeStart.setDate(now.getDate() - 7);
      }

      // Filter reports by date range
      const reportsInRange = reports.filter(report => 
        new Date(report.createdAt) >= rangeStart
      );

      // Calculate stats
      setStats({
        totalReports: reports.length,
        newReports: reports.filter(r => r.status === 'new').length,
        inProgress: reports.filter(r => r.status === 'in-progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        totalSchedules: schedules.length,
        activeUsers: [...new Set(reports.map(r => r.userId))].length
      });

      // Generate recent activity
      const activity = reportsInRange
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(report => ({
          id: report.id,
          type: 'report',
          action: 'created',
          user: report.userName,
          location: report.location?.address,
          time: report.createdAt,
          status: report.status
        }));

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>{t('adminDashboard')}</h1>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'day' ? 'active' : ''}
            onClick={() => setTimeRange('day')}
          >
            {t('today')}
          </button>
          <button 
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            {t('thisWeek')}
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            {t('thisMonth')}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{t('totalReports')}</h3>
            <p className="stat-number">{stats.totalReports}</p>
          </div>
        </div>

        <div className="stat-card new">
          <div className="stat-icon">🆕</div>
          <div className="stat-content">
            <h3>{t('newReports')}</h3>
            <p className="stat-number">{stats.newReports}</p>
          </div>
        </div>

        <div className="stat-card progress">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{t('inProgress')}</h3>
            <p className="stat-number">{stats.inProgress}</p>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{t('resolved')}</h3>
            <p className="stat-number">{stats.resolved}</p>
          </div>
        </div>

        <div className="stat-card schedules">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{t('schedules')}</h3>
            <p className="stat-number">{stats.totalSchedules}</p>
          </div>
        </div>

        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{t('activeUsers')}</h3>
            <p className="stat-number">{stats.activeUsers}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>{t('reportsByStatus')}</h3>
          <div className="status-chart">
            <div className="chart-bar">
              <div 
                className="bar-segment new"
                style={{ width: `${(stats.newReports / stats.totalReports) * 100}%` }}
              >
                {stats.newReports > 0 && `${Math.round((stats.newReports / stats.totalReports) * 100)}%`}
              </div>
              <div 
                className="bar-segment progress"
                style={{ width: `${(stats.inProgress / stats.totalReports) * 100}%` }}
              >
                {stats.inProgress > 0 && `${Math.round((stats.inProgress / stats.totalReports) * 100)}%`}
              </div>
              <div 
                className="bar-segment resolved"
                style={{ width: `${(stats.resolved / stats.totalReports) * 100}%` }}
              >
                {stats.resolved > 0 && `${Math.round((stats.resolved / stats.totalReports) * 100)}%`}
              </div>
            </div>
            <div className="chart-legend">
              <span className="legend-item new">🆕 {t('new')}</span>
              <span className="legend-item progress">⏳ {t('inProgress')}</span>
              <span className="legend-item resolved">✅ {t('resolved')}</span>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>{t('recentActivity')}</h3>
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.status === 'new' && '🆕'}
                  {activity.status === 'in-progress' && '⏳'}
                  {activity.status === 'resolved' && '✅'}
                </div>
                <div className="activity-details">
                  <p className="activity-description">
                    <strong>{activity.user}</strong> {t('reportedIssue')} {activity.location}
                  </p>
                  <p className="activity-time">
                    {new Date(activity.time).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>{t('quickActions')}</h3>
        <div className="action-buttons">
          <button className="action-btn" onClick={() => window.location.href = '/admin?tab=reports'}>
            📋 {t('manageReports')}
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/admin?tab=schedules'}>
            📅 {t('manageSchedules')}
          </button>
          <button className="action-btn" onClick={() => window.print()}>
            🖨️ {t('printReport')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
