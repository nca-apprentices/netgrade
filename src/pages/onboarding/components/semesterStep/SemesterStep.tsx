import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import {
  calendarOutline,
  addOutline,
  trashOutline,
  arrowForward,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { OnboardingDataTemp, TempSemester } from '../../types';
import { useAppForm } from '@/shared/components/form';
import './SemesterStep.css';
import '../SharedStepStyles.css';

interface SemesterStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  selectedSchoolId: string;
  setSelectedSchoolId: React.Dispatch<React.SetStateAction<string>>;
  selectedSemesterId: string;
  setSelectedSemesterId: React.Dispatch<React.SetStateAction<string>>;
  generateId: () => string;
  onNext: () => void;
}

const SemesterStep: React.FC<SemesterStepProps> = ({
  data,
  setData,
  selectedSchoolId,
  setSelectedSchoolId,
  selectedSemesterId,
  setSelectedSemesterId,
  generateId,
  onNext,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().split('T')[0];
      })(),
    },
    onSubmit: async ({ value }) => {
      const schoolId = selectedSchoolId || data.schools[0]?.id || '';
      const semester: TempSemester = {
        id: generateId(),
        name: value.name.trim(),
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        schoolId,
      };

      setData((prev) => ({
        ...prev,
        semesters: [...prev.semesters, semester],
      }));

      form.reset();
      setShowAddForm(false);
    },
  });

  const handleRemoveSemester = (semesterId: string) => {
    setData((prev) => ({
      ...prev,
      semesters: prev.semesters.filter((s) => s.id !== semesterId),
      subjects: prev.subjects.filter((s) => s.semesterId !== semesterId),
    }));

    if (selectedSemesterId === semesterId) {
      const remainingSemesters = data.semesters.filter(
        (s) => s.id !== semesterId,
      );
      setSelectedSemesterId(remainingSemesters[0]?.id || '');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleNext = () => {
    if (data.semesters.length > 0) {
      if (!selectedSemesterId && data.semesters.length > 0) {
        setSelectedSemesterId(data.semesters[0].id);
      }
      onNext();
    }
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="gradient-orb" />
        <div className="step-content">
          <div className="step-icon-wrapper">
            <IonIcon icon={calendarOutline} className="step-icon" />
          </div>
          <div className="step-text">
            <h1 className="step-title">Deine Semester</h1>
            <p className="step-subtitle">
              Organisiere deine Fächer nach Semestern
            </p>
          </div>
        </div>
      </div>

      <div className="add-section">
        {data.semesters.length < 3 && !showAddForm && (
          <div className="glass-card add-prompt">
            <div className="add-content" onClick={() => setShowAddForm(true)}>
              <div className="add-icon-wrapper">
                <IonIcon icon={addOutline} className="add-icon" />
              </div>
              <div className="add-text">
                <h4>Semester hinzufügen</h4>
                <p>Tippe hier, um ein neues Semester zu erstellen</p>
              </div>
            </div>
          </div>
        )}

        {data.semesters.length < 3 && showAddForm && (
          <div className="glass-card add-form">
            <div className="form-content">
              <h3 className="form-title">Neues Semester erstellen</h3>

              <div className="form-fields">
                {data.schools.length > 1 && (
                  <div className="field-group">
                    <label className="field-label">Schule *</label>
                    <div className="school-selector-grid">
                      {data.schools.map((school, index) => (
                        <div
                          key={school.id}
                          className={`glass-card school-selector-item ${school.id === (selectedSchoolId || data.schools[0]?.id) ? 'selected' : ''}`}
                          onClick={() => setSelectedSchoolId(school.id)}
                        >
                          <div className={`school-avatar school-${index % 4}`}>
                            {school.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="school-selector-name">
                            {school.name}
                          </span>
                          {school.id ===
                            (selectedSchoolId || data.schools[0]?.id) && (
                            <IonIcon
                              icon={checkmarkCircleOutline}
                              className="selected-icon"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form.AppField name="name">
                  {(field) => <field.NameField label="Semester Name" />}
                </form.AppField>

                <form.AppField name="startDate">
                  {(field) => <field.DateField label="Startdatum" />}
                </form.AppField>

                <form.AppField name="endDate">
                  {(field) => <field.DateField label="Enddatum" />}
                </form.AppField>
              </div>

              <div className="form-actions">
                <IonButton
                  fill="clear"
                  onClick={() => {
                    setShowAddForm(false);
                    form.reset();
                  }}
                  className="cancel-button"
                >
                  Abbrechen
                </IonButton>
                <form.Subscribe selector={(state) => [state.values.name]}>
                  {([name]) => (
                    <IonButton
                      onClick={() => form.handleSubmit()}
                      disabled={!name?.trim()}
                      className="save-button"
                    >
                      Hinzufügen
                    </IonButton>
                  )}
                </form.Subscribe>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="step-body">
        {data.semesters.length > 0 && (
          <div className="semesters-section">
            <h3 className="subsection-title">Deine Semester</h3>
            <div className="semesters-list">
              {data.semesters.map((semester, index) => (
                <div key={semester.id} className="glass-card semester-item">
                  <div className="semester-content">
                    <div className={`semester-avatar semester-${index % 4}`}>
                      {semester.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="semester-info">
                      <h4 className="semester-name">{semester.name}</h4>
                      <p className="semester-details">
                        {formatDate(semester.startDate)} –{' '}
                        {formatDate(semester.endDate)}
                        {data.schools.length > 1 && (
                          <>
                            {' '}
                            •{' '}
                            {data.schools.find(
                              (s) => s.id === semester.schoolId,
                            )?.name ?? ''}
                          </>
                        )}
                      </p>
                    </div>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSemester(semester.id);
                      }}
                      className="remove-button"
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="step-footer">
        <div className="button-group">
          <IonButton
            expand="block"
            onClick={handleNext}
            disabled={data.semesters.length === 0}
            className="primary-button"
          >
            Weiter
            <IonIcon slot="end" icon={arrowForward} />
          </IonButton>
        </div>
      </div>
    </div>
  );
};

export default SemesterStep;
