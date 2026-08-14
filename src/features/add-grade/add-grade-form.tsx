import React, { useState } from 'react';
import { IonContent, IonToast, useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  useAddGradeWithExam,
  useSchools,
  useSchoolSubjects,
} from '@/hooks/queries';
import { percentageToDecimal } from '@/utils/validation';
import { useAppForm } from '@/shared/components/form';
import Header from '@/components/Header/Header';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import SubmitButton from '@/shared/components/buttons/submitt-button/submit-button';
import FormContainer from '@/shared/components/form-layout/form-container';
import SuccessOverlay from '@/shared/components/form-layout/succes-overlay';
import UnsavedChangesAlert from '@/shared/components/form-layout/unsaved-changes-alert';
import { Routes } from '@/routes';
import {
  gradeFormSchema,
  type GradeFormData,
} from './schema/exam-form-schema-grade';

interface AddGradeFormProps {
  onSuccess?: () => void;
}

const AddGradeForm: React.FC<AddGradeFormProps> = ({ onSuccess }) => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const goHome = () => history.replace(Routes.HOME);

  const { data: schools = [], error: schoolsError } = useSchools();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const { data: subjects = [], error: subjectsError } =
    useSchoolSubjects(selectedSchoolId);

  const addGradeWithExamMutation = useAddGradeWithExam();

  useIonViewWillEnter(() => {
    setShowSuccess(false);
    setShowToast(false);
  });

  const form = useAppForm({
    defaultValues: {
      selectedSchool: null,
      selectedSubject: null,
      examName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: '',
      score: undefined as number | undefined,
      comment: '',
    } as GradeFormData,
    validators: {
      onSubmit: gradeFormSchema,
    },
    onSubmit: async ({ value }) => {
      const scoreNumber = value.score!;
      const weightNumber = +String(value.weight).replace(',', '.');

      const gradePayload = {
        subjectId: value.selectedSubject!.id,
        examName: value.examName.trim(),
        date: parseISO(value.date),
        score: scoreNumber,
        weight: percentageToDecimal(weightNumber),
      };

      addGradeWithExamMutation.mutate(gradePayload, {
        onSuccess: () => {
          setShowSuccess(true);
          form.reset();
          setSelectedSchoolId('');
          setTimeout(() => {
            onSuccess?.();
          }, 1200);
        },
        onError: (error) => {
          setToastMessage(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          );
          setToastColor('danger');
          setShowToast(true);
        },
      });
    },
  });

  // Read on click rather than via a subscription: the input only commits on
  // blur, so a rendered flag would still be stale when the button fires.
  const handleBack = () =>
    form.state.isDirty ? setShowUnsavedAlert(true) : goHome();

  if (schoolsError && !showToast) {
    setToastMessage('Fehler beim Laden der Schulen');
    setToastColor('danger');
    setShowToast(true);
  }

  if (subjectsError && !showToast) {
    setToastMessage('Fehler beim Laden der Fächer');
    setToastColor('danger');
    setShowToast(true);
  }

  const handleAddGrade = () => {
    form.handleSubmit();
  };

  return (
    <>
      <Header title="Note hinzufügen" backButton onBack={handleBack} />

      <IonContent className="add-exam-content" scrollY>
        <SuccessOverlay
          show={showSuccess}
          title="Erfolgreich hinzugefügt!"
          message="Die Note wurde gespeichert"
        />

        <FormContainer>
          <form.AppField name="selectedSchool">
            {(field) => (
              <field.SchoolSelectField
                label="Schule"
                schools={schools ?? []}
                onSchoolChange={(schoolId: string) => {
                  setSelectedSchoolId(schoolId);
                  form.setFieldValue('selectedSubject', null);
                }}
              />
            )}
          </form.AppField>

          <form.AppField name="selectedSubject">
            {(field) => (
              <field.SubjectSelectField
                label="Fach"
                subjects={subjects ?? []}
                disabled={!selectedSchoolId || subjects.length === 0}
                placeholder={
                  selectedSchoolId
                    ? 'Fach auswählen'
                    : 'Bitte zuerst eine Schule auswählen'
                }
              />
            )}
          </form.AppField>

          <form.AppField name="examName">
            {(field) => <field.ExamNameField label="Prüfungsname" />}
          </form.AppField>

          <form.AppField name="date">
            {(field) => <field.DateField label="Datum" />}
          </form.AppField>

          <form.AppField name="weight">
            {(field) => <field.WeightField label="Gewichtung (0-100%)" />}
          </form.AppField>

          <form.AppField name="score">
            {(field) => <field.GradeScoreField label="Note (1-6)" />}
          </form.AppField>
        </FormContainer>

        <SubmitButton
          onClick={handleAddGrade}
          isLoading={addGradeWithExamMutation.isPending}
          loadingText="Wird hinzugefügt..."
          text="Note hinzufügen"
        />

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />

        <UnsavedChangesAlert
          isOpen={showUnsavedAlert}
          onDismiss={() => setShowUnsavedAlert(false)}
          onDiscard={goHome}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={toastColor === 'success' ? 3000 : 2000}
          color={toastColor}
        />
      </IonContent>

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </>
  );
};

export default AddGradeForm;
