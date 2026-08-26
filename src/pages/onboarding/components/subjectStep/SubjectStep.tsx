import React, { useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import {
  bookOutline,
  addOutline,
  trashOutline,
  checkmarkCircleOutline,
  arrowForward,
  calendarOutline,
} from 'ionicons/icons';
import {
  OnboardingDataTemp,
  TempSchool,
  TempSubject,
  TempSemester,
} from '../../types';
import { useAppForm } from '@/shared/components/form';
import './SubjectStep.css';
import '../SharedStepStyles.css';

interface SubjectStepProps {
  data: OnboardingDataTemp;
  setData: React.Dispatch<React.SetStateAction<OnboardingDataTemp>>;
  selectedSemesterId: string;
  setSelectedSemesterId: React.Dispatch<React.SetStateAction<string>>;
  selectedSchoolId: string;
  setSelectedSchoolId: React.Dispatch<React.SetStateAction<string>>;
  generateId: () => string;
  onNext: () => void;
}

const SubjectStep: React.FC<SubjectStepProps> = ({
  data,
  setData,
  selectedSemesterId,
  setSelectedSemesterId,
  selectedSchoolId,
  setSelectedSchoolId,
  generateId,
  onNext,
}) => {
  const selectedSchool =
    data.schools.find((s) => s.id === selectedSchoolId) ||
    data.schools[0] ||
    null;

  const selectedSemester =
    data.semesters.find(
      (s) => s.id === selectedSemesterId && s.schoolId === selectedSchool?.id,
    ) ||
    data.semesters.find((s) => s.schoolId === selectedSchool?.id) ||
    null;

  const [showAddForm, setShowAddForm] = useState(false);

  const form = useAppForm({
    defaultValues: {
      name: '',
      teacher: '',
    },
    onSubmit: async ({ value }) => {
      if (selectedSchool && selectedSemester) {
        const subject: TempSubject = {
          id: generateId(),
          name: value.name.trim(),
          teacher: value.teacher?.trim() || null,
          weight: 100,
          schoolId: selectedSchool.id,
          semesterId: selectedSemester.id,
        };

        setData((prev) => ({
          ...prev,
          subjects: [...prev.subjects, subject],
        }));

        form.reset();
        setShowAddForm(false);
      }
    },
  });

  const handleSelectSchool = (school: TempSchool) => {
    setSelectedSchoolId(school.id);
    const firstSemester = data.semesters.find((s) => s.schoolId === school.id);
    if (firstSemester) {
      setSelectedSemesterId(firstSemester.id);
    }
  };

  const handleSelectSemester = (semester: TempSemester) => {
    setSelectedSemesterId(semester.id);
  };

  const handleRemoveSubject = (subjectId: string) => {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
    }));
  };

  const currentSchoolSubjects = data.subjects.filter(
    (s) =>
      s.schoolId === selectedSchool?.id &&
      s.semesterId === selectedSemester?.id,
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <div className="gradient-orb" />
        <div className="step-content">
          <div className="step-icon-wrapper">
            <IonIcon icon={bookOutline} className="step-icon" />
          </div>
          <div className="step-text">
            <h1 className="step-title">Fächer hinzufügen</h1>
            <p className="step-subtitle">
              Erstelle Fächer für {selectedSchool!.name} -{' '}
              {selectedSemester!.name}
            </p>
          </div>
        </div>
      </div>

      <div className="step-body">
        {data.semesters.filter((s) => s.schoolId === selectedSchool?.id)
          .length > 1 && (
          <div className="semester-selector">
            <h3 className="subsection-title">Semester auswählen</h3>
            <div className="semesters-grid">
              {data.semesters
                .filter((s) => s.schoolId === selectedSchool?.id)
                .map((semester, index) => (
                  <div
                    key={semester.id}
                    className={`glass-card semester-selector-item ${semester.id === selectedSemester!.id ? 'selected' : ''}`}
                    onClick={() => handleSelectSemester(semester)}
                  >
                    <div className={`semester-avatar semester-${index % 4}`}>
                      <IonIcon icon={calendarOutline} />
                    </div>
                    <div className="semester-selector-info">
                      <span className="semester-selector-name">
                        {semester.name}
                      </span>
                      <span className="semester-selector-dates">
                        {formatDate(semester.startDate)} -{' '}
                        {formatDate(semester.endDate)}
                      </span>
                    </div>
                    {semester.id === selectedSemester!.id && (
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

        {data.schools.length > 1 && (
          <div className="school-selector">
            <h3 className="subsection-title">Schule auswählen</h3>
            <div className="school-selector-grid">
              {data.schools.map((school, index) => (
                <div
                  key={school.id}
                  className={`glass-card school-selector-item ${school.id === selectedSchool!.id ? 'selected' : ''}`}
                  onClick={() => handleSelectSchool(school)}
                >
                  <div className={`school-avatar school-${index % 4}`}>
                    {school.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="school-selector-name">{school.name}</span>
                  {school.id === selectedSchool!.id && (
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

        <div className="add-section">
          {currentSchoolSubjects.length < 2 &&
            (!showAddForm ? (
              <div className="glass-card add-prompt">
                <div
                  className="add-content"
                  onClick={() => setShowAddForm(true)}
                >
                  <div className="add-icon-wrapper">
                    <IonIcon icon={addOutline} className="add-icon" />
                  </div>
                  <div className="add-text">
                    <h4>Fach hinzufügen</h4>
                    <p>Tippe hier, um ein neues Fach zu erstellen</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card add-form">
                <div className="form-content">
                  <h3 className="form-title">Neues Fach erstellen</h3>

                  <div className="form-fields">
                    <form.AppField name="name">
                      {(field) => <field.SubjectNameField label="Fachname" />}
                    </form.AppField>

                    <form.AppField name="teacher">
                      {(field) => <field.TeacherField label="Lehrer/in" />}
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
            ))}
        </div>

        {currentSchoolSubjects.length > 0 && (
          <div className="subjects-section">
            <h3 className="subsection-title">Deine Fächer</h3>
            <div className="subjects-list">
              {currentSchoolSubjects.map((subject) => (
                <div key={subject.id} className="glass-card subject-item">
                  <div className="subject-content">
                    <div className="subject-avatar">
                      {subject.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="subject-info">
                      <h4 className="subject-name">{subject.name}</h4>
                      <p className="subject-details">
                        {subject.teacher && `${subject.teacher}`}
                        {subject.weight !== 100 &&
                          ` • ${subject.weight}% Gewichtung`}
                      </p>
                    </div>
                    <IonButton
                      fill="clear"
                      color="danger"
                      onClick={() => handleRemoveSubject(subject.id)}
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
          <IonButton expand="block" onClick={onNext} className="primary-button">
            Weiter
            <IonIcon slot="end" icon={arrowForward} />
          </IonButton>
        </div>
      </div>
    </div>
  );
};

export default SubjectStep;
