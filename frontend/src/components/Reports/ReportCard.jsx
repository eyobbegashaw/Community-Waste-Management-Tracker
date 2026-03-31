import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './ReportCard.css';

const ReportCard = ({ report, onClick }) => {
  const { t, language } = useLanguage();

  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'in-progress': return 'status-progress';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return t('newReport');
      case 'in-progress': return t('inProgress');
      case 'resolved': return t('resolved');
      default: return status;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(language === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`report-card ${getStatusClass(report.status)}`} onClick={onClick}>
      <div className="report-image">
        <img src={report.imageUrl} alt="Waste report" />
      </div>
      
      <div className="report-content">
        <div className="report-header">
          <span className="report-status">
            {getStatusText(report.status)}
          </span>
          <span className="report-date">
            {formatDate(report.createdAt)}
          </span>
        </div>
        
        <p className="report-description">
          {report.description?.substring(0, 80)}
          {report.description?.length > 80 ? '...' : ''}
        </p>
        
        <div className="report-footer">
          <span className="report-location">
            📍 {report.location?.address?.substring(0, 30)}
            {report.location?.address?.length > 30 ? '...' : ''}
          </span>
          <span className="report-author">
            👤 {report.userName}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
