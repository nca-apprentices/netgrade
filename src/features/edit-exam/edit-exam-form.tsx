import React, { useEffect, useState } from 'react';
import {
  IonButton,
  IonCard,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import { saveOutline } from 'ionicons/icons';
import { useAppForm } from '@/shared/components/form';
import { useSubjects, useUpdateExam } from '@/hooks';
import styles from './styles/form-common.module.css';
import {
  editExamSchema,
  type EditExamFormData,
} from './schema/edit-exam-schema';
import { Exam } from '@/db/entities/Exam';
import { toDateOnlyString } from '@/db/utils';

interface EditExamFormProps {
  exam: Exam;
  onSuccess?: () => void;
  /** Lets the parent's back button check for unsaved edits at click time. */
  registerDirtyCheck?: (isDirty: () => boolean) => void;
}

export function EditExamForm({
  exam,
  onSuccess,
  registerDirtyCheck,
}: EditExamFormProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('danger');

  const { data: subjects = [] } = useSubjects();
  const updateExamMutation = useUpdateExam();

  const form = useAppForm({
    // Seeded from the exam so that "dirty" means the user changed something,
    // rather than the form being populated after mount.
    defaultValues: {
      title: exam.name,
      date: toDateOnlyString(exam.date),
      subject: exam.subjectId,
      description: exam.description || '',
    } as EditExamFormData,
    validators: {
      onSubmit: editExamSchema,
    },
    onSubmit: async ({ value }) => {
      const updatedExam = {
        id: exam.id,
        name: value.title.trim(),
        date: new Date(value.date),
        subjectId: value.subject,
        description: value.description.trim(),
      };

      updateExamMutation.mutate(updatedExam, {
        onSuccess: () => {
          setToastMessage('Prüfung erfolgreich aktualisiert!');
          setToastColor('success');
          setShowToast(true);
          setTimeout(() => {
            onSuccess?.();
          }, 1500);
        },
        onError: (error: Error) => {
          setToastMessage(`Fehler: ${error.message}`);
          setToastColor('danger');
          setShowToast(true);
        },
      });
    },
  });

  // The back button lives in the parent, so hand it a getter it can call when
  // clicked. Switching to the grade tab unmounts us and drops the edits, so the
  // check has to report "clean" again on the way out.
  useEffect(() => {
    registerDirtyCheck?.(() => form.state.isDirty);
    return () => registerDirtyCheck?.(() => false);
  }, [form, registerDirtyCheck]);

  const handleSubmit = () => {
    form.handleSubmit();
  };

  return (
    <>
      <IonCard className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <h2 className={styles.formCardTitle}>Prüfungsdetails bearbeiten</h2>
        </div>

        <div className={styles.formCardContent}>
          <form.AppField name="title">
            {(field) => <field.EditExamNameField label="Prüfungsname" />}
          </form.AppField>

          <form.AppField name="date">
            {(field) => <field.DateField label="Prüfungsdatum" />}
          </form.AppField>

          <form.AppField name="subject">
            {(field) => (
              <field.EditExamSubjectSelectField
                label="Fach"
                subjects={subjects}
              />
            )}
          </form.AppField>

          <form.AppField name="description">
            {(field) => (
              <field.DescriptionField label="Beschreibung (optional)" />
            )}
          </form.AppField>
        </div>

        <div className={styles.formCardFooter}>
          <IonButton
            expand="block"
            className={styles.formButton}
            onClick={handleSubmit}
            disabled={updateExamMutation.isPending}
          >
            {updateExamMutation.isPending ? (
              <div className={styles.buttonContent}>
                <IonSpinner name="crescent" className={styles.spinner} />
                Wird gespeichert...
              </div>
            ) : (
              <div className={styles.buttonContentSave}>
                <IonIcon icon={saveOutline} className={styles.saveIcon} />
                Änderungen speichern
              </div>
            )}
          </IonButton>
        </div>
      </IonCard>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={toastColor === 'success' ? 3000 : 2000}
        color={toastColor}
      />
    </>
  );
}
