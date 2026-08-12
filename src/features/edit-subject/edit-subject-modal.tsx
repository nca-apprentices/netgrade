import React, { useEffect, useState } from 'react';
import {
  IonModal,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/react';
import { bookOutline, checkmarkOutline } from 'ionicons/icons';
import { useAppForm } from '@/shared/components/form';
import {
  editSubjectFormSchema,
  type EditSubjectFormData,
} from './schema/edit-subject-form-schema';
import ModalSubmitButton from '@/shared/components/buttons/submitt-button/modal-submit-button';
import ModalCancelButton from '@/shared/components/buttons/cancel-button/modal-cancel-button';
import ModalButtonGroup from '@/shared/components/buttons/modal-button-group';
import UnsavedChangesAlert from '@/shared/components/form-layout/unsaved-changes-alert';

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: { id: string; name: string } | null;
  onSave: (newName: string) => void;
  loading?: boolean;
}

const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
  onSave,
  loading,
}) => {
  const form = useAppForm({
    defaultValues: {
      name: subject?.name || '',
    } as EditSubjectFormData,
    validators: {
      onSubmit: editSubjectFormSchema,
    },
    onSubmit: async ({ value }) => {
      onSave(value.name.trim());
    },
  });

  useEffect(() => {
    const newName = subject?.name || '';
    form.setFieldValue('name', newName);
  }, [subject, form]);

  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  // The form is re-seeded from `subject` whenever it changes, so comparing
  // against that is more reliable here than the form's own dirty flag. Read on
  // click rather than via a subscription: the input only commits on blur, so a
  // rendered value would still be stale when the button fires.
  const hasUnsavedChanges = () =>
    form.state.values.name.trim() !== (subject?.name ?? '').trim();

  const requestClose = () =>
    hasUnsavedChanges() ? setShowUnsavedAlert(true) : onClose();

  const discardChanges = () => {
    form.setFieldValue('name', subject?.name ?? '');
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.25, 0.5, 0.75, 1]}
      initialBreakpoint={0.75}
      backdropBreakpoint={0.5}
      className="settings-modal"
    >
      <IonPage className="modal-page">
        <IonHeader className="modal-header">
          <IonToolbar className="modal-toolbar">
            <IonTitle className="modal-title">Fach bearbeiten</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="modal-content" scrollY={true}>
          <div className="modal-content-wrapper">
            <div className="modal-header-section">
              <div className="modal-gradient-orb" />
              <div className="modal-header-content">
                <div className="modal-header-flex">
                  <div className="modal-icon-wrapper">
                    <IonIcon icon={bookOutline} className="modal-icon" />
                  </div>
                  <div className="modal-text">
                    <h1>Fach bearbeiten</h1>
                    <p>Bearbeite den Namen deines Fachs</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-input-section">
              <h2 className="modal-section-title">Fachname eingeben</h2>
              <div className="modal-input-wrapper">
                <form.AppField name="name">
                  {(field) => <field.EditSubjectField label="Fachname" />}
                </form.AppField>
              </div>
            </div>

            <ModalButtonGroup>
              <ModalCancelButton
                onClick={requestClose}
                disabled={loading}
                text="Abbrechen"
              />
              <form.Subscribe selector={(state) => [state.values.name]}>
                {([name]) => (
                  <ModalSubmitButton
                    onClick={() => form.handleSubmit()}
                    disabled={!name.trim()}
                    isLoading={loading}
                    loadingText="Speichert..."
                    text="Speichern"
                    icon={checkmarkOutline}
                  />
                )}
              </form.Subscribe>
            </ModalButtonGroup>

            <div className="modal-bottom-spacer" />
          </div>

          <UnsavedChangesAlert
            isOpen={showUnsavedAlert}
            onDismiss={() => setShowUnsavedAlert(false)}
            onDiscard={discardChanges}
          />
        </IonContent>
      </IonPage>
    </IonModal>
  );
};

export default EditSubjectModal;
