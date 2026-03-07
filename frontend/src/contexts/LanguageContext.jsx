import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    reports: 'Reports',
    schedule: 'Collection Schedule',
    admin: 'Admin',
    
    // Map
    reportIssue: 'Report Issue',
    newReport: 'New Report',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    
    // Report Form
    takePhoto: 'Take Photo',
    describeIssue: 'Describe the issue',
    describeIssueHint: 'What waste issue do you see?',
    submitReport: 'Submit Report',
    locationDetected: 'Location detected automatically',
    
    // Schedule
    collectionDays: 'Collection Days',
    collectionTime: 'Collection Time',
    notes: 'Notes',
    lastUpdated: 'Last Updated',
    
    // Status
    status: 'Status',
    reportedOn: 'Reported on',
    resolvedOn: 'Resolved on',
    
    // Admin
    adminDashboard: 'Admin Dashboard',
    manageReports: 'Manage Reports',
    manageSchedules: 'Manage Schedules',
    markInProgress: 'Mark In Progress',
    markResolved: 'Mark Resolved',
    delete: 'Delete',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    back: 'Back'
  },
  am: {
    // Navigation
    home: 'መነሻ',
    reports: 'ሪፖርቶች',
    schedule: 'የቆሻሻ መርሐ ግብር',
    admin: 'አስተዳዳሪ',
    
    // Map
    reportIssue: 'ችግር ሪፖርት አድርግ',
    newReport: 'አዲስ ሪፖርት',
    inProgress: 'በሂደት ላይ',
    resolved: 'ተፈቷል',
    
    // Report Form
    takePhoto: 'ፎቶ አንሳ',
    describeIssue: 'ችግሩን ግለጽ',
    describeIssueHint: 'ምን አይነት የቆሻሻ ችግር አይተሃል?',
    submitReport: 'ሪፖርት አስገባ',
    locationDetected: 'ቦታ በራስ-ሰር ተለይቷል',
    
    // Schedule
    collectionDays: 'የሚሰበሰብባቸው ቀናት',
    collectionTime: 'የሚሰበሰብበት ሰዓት',
    notes: 'ማስታወሻ',
    lastUpdated: 'መጨረሻ የዘመነ',
    
    // Status
    status: 'ሁኔታ',
    reportedOn: 'ሪፖርት የተደረገበት',
    resolvedOn: 'የተፈታበት',
    
    // Admin
    adminDashboard: 'የአስተዳዳሪ ዳሽቦርድ',
    manageReports: 'ሪፖርቶችን አስተዳድር',
    manageSchedules: 'መርሐ ግብሮችን አስተዳድር',
    markInProgress: 'በሂደት ላይ ምልክት አድርግ',
    markResolved: 'ተፈቷል ምልክት አድርግ',
    delete: 'ሰርዝ',
    
    // Common
    loading: 'በመጫን ላይ...',
    error: 'ስህተት',
    success: 'ስኬት',
    cancel: 'ሰርዝ',
    save: 'አስቀምጥ',
    edit: 'አርትዕ',
    back: 'ተመለስ'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('am'); // Default to Amharic

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'en' || savedLang === 'am')) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'am' : 'en';
    setLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};