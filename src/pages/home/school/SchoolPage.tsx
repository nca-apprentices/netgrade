import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  IonButtons,
  IonContent,
  IonIcon,
  IonPage,
  IonSearchbar,
} from '@ionic/react';
import {
  add,
  person,
  createOutline,
  trashOutline,
  chevronBack,
  chevronForward,
  trash,
  searchOutline,
} from 'ionicons/icons';
import SubjectSelectionModal from '@/features/add-subject/subject-selection-modal';
import Button from '@/components/Button/Button';
import Header from '@/components/Header/Header';
import { Semester, Subject } from '@/db/entities';
import {
  useAddSubject,
  useDeleteSubject,
  useSchool,
  useSchoolSubjects,
  useUpdateSubject,
  useSemesters,
  useDeleteSemester,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import EditSubjectModal from '@/features/edit-subject/edit-subject-modal';
import './SchoolPage.css';
import '../main/MainPage.css';

const calculateSubjectAverage = (subject: Subject): number | undefined => {
  const grades = subject.exams
    .map((exam) => exam.grade)
    .filter((grade) => grade !== null);

  if (grades.length === 0) return undefined;

  const totalScore = grades.reduce(
    (acc, grade) => acc + grade!.score * grade!.weight,
    0,
  );
  const totalWeight = grades.reduce((acc, grade) => acc + grade!.weight, 0);

  if (totalWeight === 0) return undefined;

  return Number((totalScore / totalWeight).toFixed(2));
};

const SchoolPage: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [activeSemesterIndex, setActiveSemesterIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { schoolId } = useParams<{ schoolId: string }>();
  const history = useHistory();

  const { data: school } = useSchool(schoolId);
  const { data: subjects } = useSchoolSubjects(schoolId);
  const { data: allSemesters } = useSemesters();

  const addSubjectMutation = useAddSubject();
  const updateSubjectMutation = useUpdateSubject();
  const deleteSubjectMutation = useDeleteSubject();
  const deleteSemesterMutation = useDeleteSemester();

  const semesters = allSemesters?.filter((s) => s.schoolId === schoolId) ?? [];
  const activeSemester = semesters[activeSemesterIndex];
  const filteredSubjects =
    subjects?.filter((s) => s.semesterId === activeSemester?.id) ?? [];

  const search = searchQuery.trim().toLowerCase();
  const visibleSubjects = search
    ? filteredSubjects.filter((s) => s.name.toLowerCase().includes(search))
    : filteredSubjects;

  const changeSemester = (offset: number) => {
    setActiveSemesterIndex((i) => i + offset);
    setSearchQuery('');
  };

  const goToGradesPage = (subject: Subject) => {
    history.push(
      `${Routes.SUBJECT_GRADES.replace(':schoolId', schoolId).replace(':subjectId', subject.id)}`,
    );
  };

  const addSubjectToStore = (subjectData: Subject) => {
    addSubjectMutation.mutate(
      {
        name: subjectData.name,
        semesterId: activeSemester!.id,
        teacher: null,
        weight: 1.0,
      },
      {
        onSuccess: () => setModalOpen(false),
        onError: (error) => console.error('Failed to add subject:', error),
      },
    );
  };

  const handleRemoveSubject = (subject: Subject) => {
    deleteSubjectMutation.mutate(subject.id, {
      onError: (error) => console.error('Failed to remove subject:', error),
    });
  };

  const handleRemoveSemester = (semester: Semester) => {
    const confirmed = window.confirm(
      `Semester "${semester.name}" wirklich löschen? Alle Fächer und Noten gehen verloren.`,
    );

    if (!confirmed) return;
    deleteSemesterMutation.mutate(semester.id, {
      onSuccess: () => {
        setActiveSemesterIndex((i) => Math.max(0, i - 1));
      },
      onError: (error) => console.error('Failed to remove semester:', error),
    });
  };

  return (
    <IonPage className="home-page">
      <Header
        title={school!.name}
        backButton={true}
        defaultHref={Routes.HOME}
        endSlot={
          <IonButtons slot="end">
            <Button
              handleEvent={() => setModalOpen(true)}
              text={<IonIcon icon={add} />}
            />
          </IonButtons>
        }
      />
      <IonContent className="home-content">
        <div className="school-semester-selector">
          <button
            className="school-semester-arrow"
            onClick={() => changeSemester(-1)}
            disabled={activeSemesterIndex === 0}
          >
            <IonIcon icon={chevronBack} />
          </button>
          <span className="school-semester-name">
            {activeSemester?.name ?? '—'}
          </span>
          <button
            className="school-semester-arrow"
            onClick={() => changeSemester(1)}
            disabled={activeSemesterIndex === semesters.length - 1}
          >
            <IonIcon icon={chevronForward} />
          </button>
          <button
            className="school-semester-delete"
            disabled={semesters.length <= 1}
            aria-label="Semester löschen"
            title="Semester löschen"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveSemester(semesters[activeSemesterIndex]);
            }}
          >
            <IonIcon icon={trash} />
          </button>
        </div>

        {filteredSubjects.length > 0 && (
          <IonSearchbar
            className="subjects-searchbar"
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value ?? '')}
            placeholder="Fach suchen"
            debounce={0}
            showClearButton="focus"
          />
        )}

        <div className="subjects-container">
          {visibleSubjects.length > 0 ? (
            visibleSubjects.map((subject: Subject) => {
              const average = calculateSubjectAverage(subject);
              return (
                <div key={subject.id} className="subject-item-container">
                  <div
                    className="subject-item"
                    onClick={() => goToGradesPage(subject)}
                  >
                    <div className="subject-icon-badge">
                      <span className="subject-initial">
                        {subject.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="subject-info">
                      <h3 className="subject-name">{subject.name}</h3>
                      <div className="subject-teacher-text">
                        <IonIcon icon={person} />
                        <span>
                          {subject.teacher !== null
                            ? subject.teacher
                            : 'Kein Name'}
                        </span>
                      </div>
                      <div className="subject-average-text">
                        Durchschnitt:{' '}
                        {average !== undefined ? `${average}` : '—'}
                      </div>
                    </div>
                    <div className="subject-actions">
                      <button
                        className="subject-action-button edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubjectToEdit(subject);
                          setEditModalOpen(true);
                        }}
                      >
                        <IonIcon icon={createOutline} />
                      </button>
                      <button
                        className="subject-action-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSubject(subject);
                        }}
                      >
                        <IonIcon icon={trashOutline} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="subjects-empty-state">
              <div className="subjects-empty-icon">
                <IonIcon icon={search ? searchOutline : add} />
              </div>
              {search ? (
                <>
                  <h3>Keine Treffer</h3>
                  <p>Kein Fach passt zu „{searchQuery.trim()}“.</p>
                </>
              ) : (
                <>
                  <h3>Keine Fächer</h3>
                  <p>Füge dein erstes Fach hinzu um zu starten.</p>
                </>
              )}
            </div>
          )}
        </div>

        <SubjectSelectionModal
          isOpen={isModalOpen}
          setIsOpen={setModalOpen}
          isModule={false}
          subjectsOrModules={filteredSubjects}
          addToSubjectsOrModules={addSubjectToStore}
          removeFromSubjectsOrModules={(id: string) =>
            deleteSubjectMutation.mutate(id, {
              onError: (error) =>
                console.error('Failed to remove subject:', error),
            })
          }
          availableSubjects={[]}
        />
        <EditSubjectModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          subject={subjectToEdit}
          onSave={async (newName: string) => {
            if (subjectToEdit) {
              await updateSubjectMutation.mutateAsync({
                id: subjectToEdit.id,
                name: newName,
              });
              setEditModalOpen(false);
              setSubjectToEdit(null);
            }
          }}
          loading={updateSubjectMutation.isPending}
        />
      </IonContent>
    </IonPage>
  );
};

export default SchoolPage;
