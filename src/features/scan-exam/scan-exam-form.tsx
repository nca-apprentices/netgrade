import React, { useRef, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSpinner,
  IonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { scanOutline } from 'ionicons/icons';
import {
  useAddExamScans,
  useAddGradeWithExam,
  useExtractNoteFromScan,
  useSchools,
  useSchoolSubjects,
  useTakeExamPhoto,
} from '@/hooks';
import { useAppForm } from '@/shared/components/form';
import Header from '@/components/Header/Header';
import SubmitButton from '@/shared/components/buttons/submitt-button/submit-button';
import FormContainer from '@/shared/components/form-layout/form-container';
import SuccessOverlay from '@/shared/components/form-layout/succes-overlay';
import UnsavedChangesAlert from '@/shared/components/form-layout/unsaved-changes-alert';
import { Routes } from '@/routes';
import { percentageToDecimal } from '@/utils/validation';
import {
  scanExamSchema,
  type ScanExamFormData,
} from './schema/scan-exam-schema';
import './scan-exam-form.css';

const ScanExamForm: React.FC = () => {
  const history = useHistory();
  const autoStartedRef = useRef(false);

  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(
    null,
  );

  const { data: schools = [] } = useSchools();
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const { data: subjects = [] } = useSchoolSubjects(selectedSchoolId);

  const takePhotoMutation = useTakeExamPhoto();
  const extractNoteMutation = useExtractNoteFromScan();
  const addGradeWithExamMutation = useAddGradeWithExam();
  const addExamScansMutation = useAddExamScans();

  const goHome = () => history.replace(Routes.HOME);

  const form = useAppForm({
    defaultValues: {
      selectedSchool: null,
      selectedSubject: null,
      examName: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      score: 0,
      weight: '100',
    } as ScanExamFormData,
    validators: {
      onSubmit: scanExamSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const grade = await addGradeWithExamMutation.mutateAsync({
          subjectId: value.selectedSubject!.id,
          examName: value.examName.trim(),
          date: new Date(value.date + 'T12:00:00'),
          score: value.score,
          weight: percentageToDecimal(
            Number.isFinite(Number(value.weight)) ? Number(value.weight) : 100,
          ),
        });

        if (photoPaths.length > 0 && grade.exam?.id) {
          await addExamScansMutation.mutateAsync({
            examId: grade.exam.id,
            photoPaths,
          });
        }

        setShowSuccess(true);
        setTimeout(goHome, 1200);
      } catch (err) {
        setToast({ msg: `Fehler: ${(err as Error).message}`, color: 'danger' });
      }
    },
  });

  // Scanned pages are only persisted on submit, so they count as unsaved work
  // even when the OCR could not fill in any field. The dirty flag is read on
  // click rather than via a subscription: the inputs only commit on blur, so a
  // rendered flag would still be stale when the button fires.
  const handleBack = () =>
    form.state.isDirty || photoPaths.length > 0
      ? setShowUnsavedAlert(true)
      : goHome();

  const handleScan = async (auto = false) => {
    let paths: string[];
    try {
      paths = await takePhotoMutation.mutateAsync();
    } catch {
      if (auto) goHome();
      return;
    }
    if (!paths.length) {
      if (auto) goHome();
      return;
    }
    setPhotoPaths((prev) => [...prev, ...paths]);

    const note = await extractNoteMutation.mutateAsync(paths[0]);
    if (note != null) {
      form.setFieldValue('score', note);
      setToast({
        msg: `Note ${note} erkannt – bitte prüfen und speichern`,
        color: 'success',
      });
    }
  };

  // Open the scanner automatically the first time the page is shown.
  useIonViewWillEnter(() => {
    if (autoStartedRef.current) return;
    autoStartedRef.current = true;
    handleScan(true);
  });

  const scanning = takePhotoMutation.isPending || extractNoteMutation.isPending;

  return (
    <>
      <Header title="Prüfung scannen" backButton onBack={handleBack} />

      <IonContent className="scan-exam-content" scrollY>
        <SuccessOverlay
          show={showSuccess}
          title="Erfolgreich gespeichert!"
          message="Die Prüfung wurde erstellt"
        />

        <FormContainer>
          <IonButton
            expand="block"
            className="scan-exam-button"
            onClick={() => handleScan()}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <IonSpinner name="crescent" slot="start" />
                {extractNoteMutation.isPending
                  ? 'Note wird gelesen...'
                  : 'Scanner wird geöffnet...'}
              </>
            ) : (
              <>
                <IonIcon icon={scanOutline} slot="start" />
                {photoPaths.length ? 'Erneut scannen' : 'Prüfung scannen'}
              </>
            )}
          </IonButton>

          {photoPaths.length > 0 && (
            <p className="scan-exam-hint">
              {photoPaths.length} Seite(n) gescannt
            </p>
          )}

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

          <form.AppField name="score">
            {(field) => <field.GradeScoreField label="Note (1-6)" />}
          </form.AppField>

          <form.AppField name="weight">
            {(field) => <field.WeightField label="Gewichtung (%)" />}
          </form.AppField>
        </FormContainer>

        <SubmitButton
          onClick={() => form.handleSubmit()}
          isLoading={addGradeWithExamMutation.isPending}
          loadingText="Wird gespeichert..."
          text="Prüfung speichern"
        />

        <UnsavedChangesAlert
          isOpen={showUnsavedAlert}
          onDismiss={() => setShowUnsavedAlert(false)}
          onDiscard={goHome}
        />

        <IonToast
          isOpen={!!toast}
          onDidDismiss={() => setToast(null)}
          message={toast?.msg}
          color={toast?.color}
          duration={2500}
          position="top"
        />
      </IonContent>
    </>
  );
};

export default ScanExamForm;
