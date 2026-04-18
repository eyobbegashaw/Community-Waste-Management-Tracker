import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './ReportDetailModal.css';

const ReportDetailModal = ({ report, onClose, onStatusChange, isAdmin }) => {
  const { t, language } = useLanguage();

  if (!report) return null;

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#ef4444';
      case 'in-progress': return '#eab308';
      case 'resolved': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>{t('reports')} #{report.id?.substring(0, 8)}</h2>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(report.status) }}
          >
            {t(report.status === 'new' ? 'newReport' : 
               report.status === 'in-progress' ? 'inProgress' : 'resolved')}
          </span>
        </div>

        <div className="modal-body">
          <img 
            src={report.imageUrl} 
            alt="Waste report" 
            className="report-detail-image"
          />
          
          <div className="report-details">
            <div className="detail-item">
              <span className="detail-label">📝 {t('describeIssue')}:</span>
              <p className="detail-value">{report.description}</p>
            </div>

            <div className="detail-item">
              <span className="detail-label">📍 {t('location')}:</span>
              <p className="detail-value">
                {report.location?.address}<br />
                <small>Lat: {report.location?.lat}, Lng: {report.location?.lng}</small>
              </p>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-label">👤 {t('reportedBy')}:</span>
                <p className="detail-value">{report.userName}</p>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">📞 {t('phone')}:</span>
                <p className="detail-value">{report.userPhone}</p>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-item">
                <span className="detail-label">📅 {t('reportedOn')}:</span>
                <p className="detail-value">{formatDate(report.createdAt)}</p>
              </div>
              
              {report.resolvedAt && (
                <div className="detail-item">
                  <span className="detail-label">✅ {t('resolvedOn')}:</span>
                  <p className="detail-value">{formatDate(report.resolvedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="modal-footer">
            <div className="status-actions">
              <button 
                className="btn-progress"
                onClick={() => onStatusChange(report.id, 'in-progress')}
                disabled={report.status === 'in-progress'}
              >
                {t('markInProgress')}
              </button>
              <button 
                className="btn-resolved"
                onClick={() => onStatusChange(report.id, 'resolved')}
                disabled={report.status === 'resolved'}
              >
                {t('markResolved')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailModal;
