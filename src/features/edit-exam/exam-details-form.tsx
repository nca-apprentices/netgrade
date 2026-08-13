import React, { useState, useEffect } from 'react';
import {
  IonAlert,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import {
  alertCircleOutline,
  calendarOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  createOutline,
  documentTextOutline,
  scaleOutline,
  schoolOutline,
  trashOutline,
  trophyOutline,
} from 'ionicons/icons';
import { useForm } from '@tanstack/react-form';
import {
  useAddGradeWithExam,
  useAddExamScans,
  useDeleteExam,
  useDeleteExamScan,
  useExam,
  useExtractNoteFromScan,
  useSubjects,
  useTakeExamPhoto,
  usePhotoSrcs,
} from '@/hooks';
import {
  percentageToDecimal,
  validateGrade,
  validateWeight,
} from '@/utils/validation';
import { Routes } from '@/routes';
import ModalSubmitButton from '@/shared/components/buttons/submitt-button/modal-submit-button';
import ModalCancelButton from '@/shared/components/buttons/cancel-button/modal-cancel-button';
import ModalButtonGroup from '@/shared/components/buttons/modal-button-group';
import styles from './styles/edit-exam-page.module.css';
import { Layout } from '@/components/Layout/Layout';
import { GradeFormData } from './types';
import { formatDate, getGradeBadgeColor, getGradeColor } from './utils';
import { EditExamForm } from './edit-exam-form';
import { GradeForm } from './grade-form';

interface ExamDetailsFormProps {
  examId: string;
  onGradeSuccess?: () => void;
  onDeleteSuccess?: () => void;
  onEditSuccess?: () => void;
  onError?: () => void;
}

const ExamDetailsForm: React.FC<ExamDetailsFormProps> = ({
  examId,
  onGradeSuccess,
  onDeleteSuccess,
  onEditSuccess,
  onError,
}) => {
  const { data: exam, error } = useExam(examId);
  const { data: subjects = [] } = useSubjects();

  const [segmentValue, setSegmentValue] = useState<'details' | 'grade'>(
    'details',
  );
  const [showGradeConfirmModal, setShowGradeConfirmModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('primary');
  const [showToast, setShowToast] = useState(false);

  const scans = exam?.scans ?? [];
  const { data: photoSrcs = [] } = usePhotoSrcs(scans.map((s) => s.photoPath));

  const gradeForm = useForm({
    defaultValues: {
      score: 5.5,
      weight: 100,
      comment: '',
    } as GradeFormData,
    onSubmit: async ({ value }) => {
      const gradeError = validateGrade(value.score);
      if (gradeError) {
        showMessage(gradeError, 'warning');
        return;
      }

      const weightError = validateWeight(value.weight);
      if (weightError) {
        showMessage(weightError, 'warning');
        return;
      }

      setShowGradeConfirmModal(true);
    },
  });

  useEffect(() => {
    if (!exam?.grade) return;

    gradeForm.setFieldValue('score', exam.grade.score);
    gradeForm.setFieldValue('weight', exam.grade.weight * 100);
    gradeForm.setFieldValue('comment', exam.grade.comment ?? '');
  }, [exam, gradeForm]);

  const gradeFormValues = gradeForm.state.values as GradeFormData;

  const addGradeWithExamMutation = useAddGradeWithExam();
  const addExamScansMutation = useAddExamScans();
  const deleteExamScanMutation = useDeleteExamScan();
  const deleteExamMutation = useDeleteExam();
  const takePhotoMutation = useTakeExamPhoto();
  const extractNoteMutation = useExtractNoteFromScan();

  const showMessage = (message: string, color: string = 'primary') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleDeletePhoto = (scanId: string) =>
    deleteExamScanMutation.mutate(scanId);

  const handleTakePhoto = async () => {
    if (!exam) return;
    try {
      const paths = await takePhotoMutation.mutateAsync();
      await addExamScansMutation.mutateAsync({
        examId: exam.id,
        photoPaths: paths,
      });

      const note = await extractNoteMutation.mutateAsync(paths[0]);
      if (note != null) {
        gradeForm.setFieldValue('score', note);
        showMessage(
          `Note ${note} erkannt – bitte prüfen und speichern`,
          'success',
        );
      }
    } catch (err) {
      showMessage(`Fehler: ${(err as Error).message}`, 'danger');
    }
  };

  const handleAddGrade = () => {
    if (!exam) return;

    const gradePayload = {
      subjectId: exam.subjectId,
      examName: exam.name,
      date: exam.date,
      score: gradeFormValues.score,
      weight: percentageToDecimal(gradeFormValues.weight),
      comment: gradeFormValues.comment.trim() || undefined,
    };

    addGradeWithExamMutation.mutate(gradePayload, {
      onSuccess: () => {
        showMessage('Note erfolgreich eingetragen!', 'success');
        setShowGradeConfirmModal(false);
        setTimeout(() => {
          onGradeSuccess?.();
        }, 1500);
      },
      onError: (error: Error) => {
        showMessage(
          `Fehler beim Eintragen der Note: ${error.message}`,
          'danger',
        );
      },
    });
  };

  const handleDelete = () => {
    deleteExamMutation.mutate(examId, {
      onSuccess: () => {
        showMessage('Prüfung wurde gelöscht', 'warning');
        onDeleteSuccess?.();
      },
      onError: (error: Error) => {
        showMessage(`Fehler: ${error.message}`, 'danger');
      },
    });
  };

  if (error) {
    return (
      <>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref={Routes.HOME} text="Back" />
            </IonButtons>
            <IonTitle>Fehler</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <Layout>
            <div className={styles.container}>
              <IonCard className={styles.errorCard}>
                <IonCardHeader>
                  <IonCardTitle className={styles.errorCardTitle}>
                    <IonIcon icon={alertCircleOutline} />
                    Fehler beim Laden
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className={styles.errorCardText}>{error.message}</p>
                  <IonButton
                    expand="block"
                    fill="solid"
                    color="light"
                    className="modern-button"
                    onClick={onError}
                  >
                    Zurück zur Übersicht
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </div>
          </Layout>
        </IonContent>
      </>
    );
  }

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={Routes.HOME} text="Back" />
          </IonButtons>
          <IonTitle>Prüfung bearbeiten</IonTitle>
          <IonButtons slot="end">
            <IonButton color="danger" onClick={() => setShowDeleteAlert(true)}>
              <IonIcon slot="icon-only" icon={trashOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className={styles.container}>
          {exam && (
            <IonCard className={styles.headerCard}>
              <IonCardHeader className={styles.headerCardContent}>
                <IonCardTitle className={styles.headerCardTitle}>
                  {exam.name}
                </IonCardTitle>
                <IonCardSubtitle className={styles.headerCardSubtitle}>
                  <div className={styles.headerCardInfo}>
                    <div className={styles.headerCardInfoRow}>
                      <IonIcon icon={calendarOutline} />
                      {formatDate(exam.date)}
                    </div>
                    <div className={styles.headerCardInfoRow}>
                      <IonIcon icon={schoolOutline} />
                      {subjects.find((s) => s.id === exam.subjectId)?.name ||
                        'Unbekanntes Fach'}
                    </div>
                  </div>
                </IonCardSubtitle>
              </IonCardHeader>
            </IonCard>
          )}

          <IonSegment
            value={segmentValue}
            onIonChange={(e) =>
              setSegmentValue(e.detail.value as 'details' | 'grade')
            }
            className={styles.segment}
          >
            <IonSegmentButton value="details" className={styles.segmentButton}>
              <IonLabel className={styles.segmentLabel}>
                <IonIcon icon={createOutline} />
                Details
              </IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="grade" className={styles.segmentButton}>
              <IonLabel className={styles.segmentLabel}>
                <IonIcon icon={trophyOutline} />
                Note
              </IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {segmentValue === 'details' ? (
            exam ? (
              <EditExamForm exam={exam} onSuccess={onEditSuccess} />
            ) : (
              <div className="ion-padding ion-text-center">
                <IonSpinner />
              </div>
            )
          ) : (
            <GradeForm
              formValues={gradeForm.state.values as GradeFormData}
              onFieldChange={(field, value) =>
                gradeForm.setFieldValue(field as keyof GradeFormData, value)
              }
              getGradeColor={getGradeColor}
              onSubmit={gradeForm.handleSubmit}
              onTakePhoto={handleTakePhoto}
              onDeletePhoto={handleDeletePhoto}
              isTakingPhoto={takePhotoMutation.isPending}
              scans={scans}
              photoSrcs={photoSrcs}
            />
          )}
        </div>

        <IonModal
          isOpen={showGradeConfirmModal}
          onDidDismiss={() => setShowGradeConfirmModal(false)}
          className={styles.modal}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <IonButton
                className={styles.closeButton}
                onClick={() => setShowGradeConfirmModal(false)}
              ></IonButton>
              <h2 className={styles.modalTitle}>Note bestätigen</h2>
              <p className={styles.modalSubtitle}>
                Überprüfe deine Eingaben vor dem Speichern
              </p>
            </div>
            <div className={styles.contentContainer}>
              <div className={`${styles.gradeCard} ${styles.animateIn}`}>
                <div className={styles.gradeDisplay}>
                  <div
                    className={`${styles.gradeCircle} ${styles[getGradeBadgeColor(gradeFormValues.score)]}`}
                  >
                    <span className={styles.gradeValue}>
                      {gradeFormValues.score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <p className={styles.gradeLabel}>Deine Note</p>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardHeader}>
                    <div className={styles.infoIcon}>
                      <IonIcon icon={documentTextOutline} />
                    </div>
                    <span className={styles.infoLabel}>Prüfung</span>
                  </div>
                  <div className={styles.infoValue}>{exam?.name}</div>
                </div>
                <div className={styles.infoCard}>
                  <div className={styles.infoCardHeader}>
                    <div className={styles.infoIcon}>
                      <IonIcon icon={scaleOutline} />
                    </div>
                    <span className={styles.infoLabel}>Gewichtung</span>
                  </div>
                  <div className={styles.infoValue}>
                    {gradeFormValues.weight}%
                  </div>
                </div>
                {gradeFormValues.comment && (
                  <div className={`${styles.infoCard} ${styles.commentCard}`}>
                    <div className={styles.infoCardHeader}>
                      <div className={styles.infoIcon}>
                        <IonIcon icon={chatbubbleOutline} />
                      </div>
                      <span className={styles.infoLabel}>Kommentar</span>
                    </div>
                    <p className={styles.commentText}>
                      &#34;{gradeFormValues.comment}&#34;
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actionContainer}>
              <ModalButtonGroup>
                <ModalCancelButton
                  onClick={() => setShowGradeConfirmModal(false)}
                  text="Abbrechen"
                />
                <ModalSubmitButton
                  onClick={handleAddGrade}
                  disabled={addGradeWithExamMutation.isPending}
                  isLoading={addGradeWithExamMutation.isPending}
                  loadingText="Wird gespeichert..."
                  text="Speichern"
                  icon={checkmarkCircleOutline}
                />
              </ModalButtonGroup>
            </div>
          </div>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Prüfung löschen?"
          message={`Möchtest du die Prüfung "${exam?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
          buttons={[
            {
              text: 'Abbrechen',
              role: 'cancel',
              handler: () => setShowDeleteAlert(false),
            },
            {
              text: 'Löschen',
              role: 'destructive',
              handler: handleDelete,
            },
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color={toastColor}
          animated
        />
      </IonContent>
    </>
  );
};

export default ExamDetailsForm;
