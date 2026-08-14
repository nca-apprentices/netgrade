import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonIcon, IonSkeletonText } from '@ionic/react';
import {
  school,
  chevronForwardOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { Routes } from '@/routes';
import { useSchools } from '@/hooks/queries';
import { SchoolService } from '@/services/SchoolService';

const SKELETON_CARDS = [0, 1, 2];

const SchoolsList: React.FC = () => {
  const history = useHistory();
  const { data: schools, isLoading } = useSchools();

  const getSchoolIcon = (schoolName: string) => {
    return schoolName.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="schools-grid">
        {SKELETON_CARDS.map((index) => (
          <div key={index} className="school-card glass-card school-skeleton">
            <div className="school-card-header">
              <IonSkeletonText animated className="school-skeleton-avatar" />
            </div>
            <div className="school-card-content">
              <IonSkeletonText animated className="school-skeleton-name" />
              <IonSkeletonText animated className="school-skeleton-stats" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const schoolList = schools ?? [];

  if (schoolList.length === 0) {
    return (
      <div className="schools-grid">
        <div className="empty-schools glass-card">
          <div className="empty-icon-wrapper">
            <IonIcon icon={school} className="empty-icon" />
          </div>
          <h3 className="empty-title">Keine Schulen</h3>
          <p className="empty-description">Tippe + um zu starten</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schools-grid">
      {schoolList.map((school, index) => {
        const average = SchoolService.calculateSchoolAverage(school);
        return (
          <div
            key={school.id}
            className="school-card glass-card"
            onClick={() =>
              history.push(Routes.SCHOOL.replace(':schoolId', school.id))
            }
          >
            <div className="school-card-header">
              <div className={`school-avatar school-avatar-${index % 4}`}>
                {getSchoolIcon(school.name)}
              </div>
              <IonIcon
                icon={chevronForwardOutline}
                className="school-chevron"
              />
            </div>

            <div className="school-card-content">
              <h3 className="school-name">{school.name}</h3>
              <div className="school-stats">
                <div className="school-average">
                  <IonIcon icon={statsChartOutline} className="stats-icon" />
                  <span className="school-info">
                    {average ? `${average} Ø` : 'Keine Noten'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SchoolsList;
