
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './AddReportButton.css';

const AddReportButton = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <button 
      className="add-report-button"
      onClick={() => navigate('/report')}
      aria-label={t('reportIssue')}
    >
      <span className="plus-icon">+</span>
      <span className="button-text">{t('reportIssue')}</span>
    </button>
  );
};

export default AddReportButton;
