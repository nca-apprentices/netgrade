import React, { useEffect, useState, useRef } from 'react';
import {
  IonContent,
  IonIcon,
  IonModal,
  IonPage,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import { useAppForm } from '@/shared/components/form';
import { useHistory } from 'react-router-dom';
import {
  addOutline,
  checkmarkOutline,
  downloadOutline,
  cloudUploadOutline,
  informationCircleOutline,
  trashOutline,
  documentTextOutline,
  logoGithub,
} from 'ionicons/icons';
import popupStyles from '@/components/modals/popup-modal.module.css';
import { Routes } from '@/routes';
import { ExportDialog } from '@/components/export/ExportDialog';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import {
  useAddSchool,
  useDeleteSchool,
  useSaveUserName,
  useSchools,
  useUpdateSchool,
  useUserName,
  useAddSemester,
  useSemesters,
  useUpdateSemester,
  useDeleteSemester,
} from '@/hooks/queries';
import { useExportPDF } from '@/hooks/queries/useDataManagementQueries';
import { useResetAllDataMutation } from '@/hooks/queries/useDataManagementQueries';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import AddSemesterModal from '@/components/modals/AddSemesterModal';
import NotificationSettings from '@/pages/home/settings/components/notification/NotificationSettings';
import { DataManagementService } from '@/services/DataManagementService';
import ModalSubmitButton from '@/shared/components/buttons/submitt-button/modal-submit-button';
import ModalCancelButton from '@/shared/components/buttons/cancel-button/modal-cancel-button';
import ModalButtonGroup from '@/shared/components/buttons/modal-button-group';
import './SettingsPage.css';
import AlertButton from '@/pages/home/settings/components/alertButton/AlertButton';
import SettingsHeader from '@/pages/home/settings/components/settingsHeader/SettingsHeader';
import ProfileCard from '@/pages/home/settings/components/profileCard/ProfileCard';
import SchoolCard from '@/pages/home/settings/components/schoolCard/SchoolCard';
import EmptySchoolCard from '@/pages/home/settings/components/emptySchoolCard/EmptySchoolCard';
import SemesterCard from '@/pages/home/settings/components/semesterCard/SemesterCard';
import EmptySemesterCard from '@/pages/home/settings/components/emptySemesterCard/EmptySemesterCard';
import AlertSemesterButton from '@/pages/home/settings/components/alertSemesterButton/AlertSemesterButton';
import { Browser } from '@capacitor/browser';

const SettingsPage: React.FC = () => {
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [showNameEditModal, setShowNameEditModal] = useState(false);
  const [appVersion] = useState('');
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [present] = useIonToast();
  const [presentAlert] = useIonAlert();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [schoolIdToDelete, setSchoolIdToDelete] = useState<string | null>(null);
  const history = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: schools } = useSchools();
  const { data: semesters } = useSemesters();
  const { data: userName } = useUserName();
  const addSchoolMutation = useAddSchool();
  const addSemesterMutation = useAddSemester();
  const saveUserNameMutation = useSaveUserName();
  const resetAllDataMutation = useResetAllDataMutation();
  const exportPDFMutation = useExportPDF();
  const deleteSchoolMutation = useDeleteSchool();
  const updateSchoolMutation = useUpdateSchool();
  const updateSemesterMutation = useUpdateSemester();
  const deleteSemesterMutation = useDeleteSemester();

  const [expandedSchoolId, setExpandedSchoolId] = useState<string | null>(null);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [editSchoolName, setEditSchoolName] = useState('');

  const [expandedSemesterId, setExpandedSemesterId] = useState<string | null>(
    null,
  );
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(
    null,
  );
  const [editSemesterName, setEditSemesterName] = useState('');
  const [showDeleteSemesterAlert, setShowDeleteSemesterAlert] = useState(false);
  const [semesterIdToDelete, setSemesterIdToDelete] = useState<string | null>(
    null,
  );

  const toggleSchool = (id: string) => {
    setExpandedSchoolId((prev) => (prev === id ? null : id));
  };

  const toggleSemester = (id: string) => {
    setExpandedSemesterId((prev) => (prev === id ? null : id));
  };

  const handleEditSemester = (
    semesterId: string,
    currentName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingSemesterId(semesterId);
    setEditSemesterName(currentName);
  };

  const handleSaveSemesterEdit = (semesterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editSemesterName.trim()) {
      updateSemesterMutation.mutate(
        { id: semesterId, name: editSemesterName.trim() },
        {
          onSuccess: () => {
            setEditingSemesterId(null);
            setEditSemesterName('');
            showToast('Semestername erfolgreich geändert');
          },
          onError: (error) => {
            showToast(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
              false,
            );
          },
        },
      );
    }
  };

  const handleCancelSemesterEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSemesterId(null);
    setEditSemesterName('');
  };

  const handleDeleteSemester = () => {
    if (!semesterIdToDelete) return;
    deleteSemesterMutation.mutate(semesterIdToDelete, {
      onSuccess: () => {
        showToast('Semester wurde gelöscht', true);
        setShowDeleteSemesterAlert(false);
        setSemesterIdToDelete(null);
      },
      onError: (error) => {
        showToast(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          false,
        );
        setShowDeleteSemesterAlert(false);
        setSemesterIdToDelete(null);
      },
    });
  };

  const handleEditSchool = (
    schoolId: string,
    currentName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setEditingSchoolId(schoolId);
    setEditSchoolName(currentName);
  };

  const handleSaveSchoolEdit = (schoolId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editSchoolName.trim()) {
      updateSchoolMutation.mutate(
        { id: schoolId, name: editSchoolName.trim() },
        {
          onSuccess: () => {
            setEditingSchoolId(null);
            setEditSchoolName('');
            showToast('Schulname erfolgreich geändert');
          },
          onError: (error) => {
            showToast(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
              false,
            );
          },
        },
      );
    }
  };

  const handleCancelSchoolEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSchoolId(null);
    setEditSchoolName('');
  };

  const nameForm = useAppForm({
    defaultValues: {
      nameInput: userName || '',
    },
    onSubmit: async ({ value }) => {
      saveUserNameMutation.mutate(value.nameInput.trim(), {
        onSuccess: () => {
          setShowNameEditModal(false);
          showToast('Name erfolgreich gespeichert');
        },
        onError: (error) => {
          showToast(
            `Fehler: ${error instanceof Error ? error.message : String(error)}`,
            false,
          );
        },
      });
    },
  });

  useEffect(() => {
    if (userName) {
      nameForm.setFieldValue('nameInput', userName);
    }
  }, [userName, nameForm]);

  const showToast = (message: string, isSuccess: boolean = true) => {
    present({
      message,
      duration: 2000,
      position: 'bottom',
      color: isSuccess ? 'success' : 'danger',
    });
  };

  const handleSaveName = () => {
    nameForm.handleSubmit();
  };

  const handleCancelNameEdit = () => {
    nameForm.setFieldValue('nameInput', userName || '');
    setShowNameEditModal(false);
  };

  const handleAddSchool = (schoolName: string) => {
    if (schoolName.trim()) {
      addSchoolMutation.mutate(
        { name: schoolName.trim() },
        {
          onSuccess: () => {
            setShowAddSchoolModal(false);
            showToast('Schule erfolgreich hinzugefügt');
          },
          onError: (error) => {
            showToast(
              `Fehler: ${error instanceof Error ? error.message : String(error)}`,
              false,
            );
          },
        },
      );
    }
  };

  const handleAddSemester = (payload: {
    name: string;
    startDate: Date;
    endDate: Date;
    schoolId: string;
  }) => {
    addSemesterMutation.mutate(payload, {
      onSuccess: () => {
        setShowAddSemesterModal(false);
        showToast('Semester erfolgreich hinzugefügt');
      },
      onError: (error) => {
        showToast(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          false,
        );
      },
    });
  };

  const handleResetData = () => {
    presentAlert({
      header: 'Daten zurücksetzen',
      message:
        'Möchten Sie wirklich alle Daten zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Zurücksetzen',
          role: 'destructive',
          handler: async () => {
            try {
              await resetAllDataMutation.mutateAsync();
              showToast('Alle Daten wurden erfolgreich zurückgesetzt');
              setTimeout(() => {
                history.replace(Routes.ONBOARDING);
              }, 1500);
            } catch {
              showToast(
                'Beim Zurücksetzen der Daten ist ein Fehler aufgetreten',
                false,
              );
            }
          },
        },
      ],
    });
  };

  const handleDeleteSchool = () => {
    if (!schoolIdToDelete) return;
    deleteSchoolMutation.mutate(schoolIdToDelete, {
      onSuccess: () => {
        showToast('Schule wurde gelöscht', true);
        setShowDeleteAlert(false);
        setSchoolIdToDelete(null);
      },
      onError: (error) => {
        showToast(
          `Fehler: ${error instanceof Error ? error.message : String(error)}`,
          false,
        );
        setShowDeleteAlert(false);
        setSchoolIdToDelete(null);
      },
    });
  };

  const handleExportJSON = async () => {
    try {
      await DataManagementService.exportAsZIP();
      showToast('Backup Export erfolgreich!', true);
    } catch {
      showToast('Export fehlgeschlagen', false);
    }
  };

  const handleExportPDF = () => {
    exportPDFMutation.mutate(
      { schoolId: 'all', filename: 'netgrade-export' },
      {
        onSuccess: (result) => showToast(result.message, result.success),
        onError: () => showToast('Export fehlgeschlagen', false),
      },
    );
  };

  const handleOpenGitHub = async () => {
    await Browser.open({ url: 'https://github.com/kevin-nca/netgrade' });
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    presentAlert({
      header: 'JSON Import',
      message:
        'Möchten Sie die Daten aus dieser JSON-Datei importieren? Dies überschreibt alle bestehenden Daten!',
      buttons: [
        { text: 'Abbrechen', role: 'cancel' },
        {
          text: 'Importieren',
          role: 'destructive',
          handler: async () => {
            try {
              await DataManagementService.importFromZIP(file);
              showToast('Import erfolgreich!', true);
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } catch {
              showToast('Import fehlgeschlagen', false);
            }
          },
        },
      ],
    });

    event.target.value = '';
  };

  return (
    <IonPage className="settings-page">
      <SettingsHeader />

      <IonContent className="settings-content" scrollY={true}>
        <div className="content-wrapper">
          <ProfileCard
            userName={userName}
            onEditClick={() => setShowNameEditModal(true)}
          />

          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Deine Schulen</h2>
              <div
                className="section-add-button"
                onClick={() => setShowAddSchoolModal(true)}
              >
                <IonIcon icon={addOutline} className="section-add-icon" />
              </div>
            </div>

            <div className="settings-list">
              {schools!.length > 0 ? (
                schools!.map((school, index) => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    index={index}
                    isExpanded={expandedSchoolId === school.id}
                    isEditing={editingSchoolId === school.id}
                    editSchoolName={editSchoolName}
                    isSavePending={updateSchoolMutation.isPending}
                    onToggle={() => toggleSchool(school.id)}
                    onEditSchoolNameChange={(value) => setEditSchoolName(value)}
                    onSave={(e) => handleSaveSchoolEdit(school.id, e)}
                    onCancel={handleCancelSchoolEdit}
                    onEdit={(e) => handleEditSchool(school.id, school.name, e)}
                    onDelete={() => {
                      setSchoolIdToDelete(school.id);
                      setShowDeleteAlert(true);
                    }}
                  />
                ))
              ) : (
                <EmptySchoolCard />
              )}
            </div>
          </div>
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Deine Semester</h2>
              <div
                className="section-add-button"
                onClick={() => setShowAddSemesterModal(true)}
              >
                <IonIcon icon={addOutline} className="section-add-icon" />
              </div>
            </div>

            <div className="settings-list">
              {semesters && semesters.length > 0 ? (
                semesters.map((semester, index) => (
                  <SemesterCard
                    key={semester.id}
                    semester={semester}
                    index={index}
                    isExpanded={expandedSemesterId === semester.id}
                    isEditing={editingSemesterId === semester.id}
                    editSemesterName={editSemesterName}
                    isSavePending={updateSemesterMutation.isPending}
                    isDeleteDisabled={
                      semesters.filter(
                        (s) => s.school?.id === semester.school?.id,
                      ).length <= 1
                    }
                    onToggle={() => toggleSemester(semester.id)}
                    onEditSemesterNameChange={(value) =>
                      setEditSemesterName(value)
                    }
                    onSave={(e) => handleSaveSemesterEdit(semester.id, e)}
                    onCancel={handleCancelSemesterEdit}
                    onEdit={(e) =>
                      handleEditSemester(semester.id, semester.name, e)
                    }
                    onDelete={() => {
                      setSemesterIdToDelete(semester.id);
                      setShowDeleteSemesterAlert(true);
                    }}
                  />
                ))
              ) : (
                <EmptySemesterCard />
              )}
            </div>
          </div>
          <NotificationSettings />
          <div className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Aktionen</h2>
            </div>

            <div className="settings-list">
              <div
                className="settings-item glass-card"
                onClick={handleExportJSON}
              >
                <div className="item-content">
                  <div className="item-icon json">
                    <IonIcon icon={downloadOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">JSON Export</h3>
                    <p className="item-subtitle">
                      App-Daten als JSON exportieren
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="settings-item glass-card"
                onClick={handleExportPDF}
              >
                <div className="item-content">
                  <div className="item-icon pdf">
                    <IonIcon icon={documentTextOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">PDF Export</h3>
                    <p className="item-subtitle">
                      App-Daten als PDF exportieren
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="settings-item glass-card"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="item-content">
                  <div className="item-icon json">
                    <IonIcon icon={cloudUploadOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">JSON Import</h3>
                    <p className="item-subtitle">
                      App-Daten aus JSON wiederherstellen
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="settings-item glass-card"
                onClick={() => setIsExportDialogOpen(true)}
              >
                <div className="item-content">
                  <div className="item-icon export">
                    <IonIcon icon={downloadOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">Excel Export</h3>
                    <p className="item-subtitle">
                      Als Excel-Datei herunterladen
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="settings-item glass-card"
                onClick={handleResetData}
              >
                <div className="item-content">
                  <div className="item-icon danger">
                    <IonIcon icon={trashOutline} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">Alle Daten löschen</h3>
                    <p className="item-subtitle">App komplett zurücksetzen</p>
                  </div>
                </div>
              </div>

              <div
                className="settings-item glass-card"
                onClick={handleOpenGitHub}
              >
                <div className="item-content">
                  <div className="item-icon github">
                    <IonIcon icon={logoGithub} />
                  </div>
                  <div className="item-text">
                    <h3 className="item-title">GitHub Repository</h3>
                    <p className="item-subtitle">
                      Quellcode und das Projekt auf GitHub
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="info-card glass-card">
            <IonIcon icon={informationCircleOutline} className="info-icon" />
            <div className="info-text">
              <h4 className="info-title">Wichtiger Hinweis</h4>
              <p className="info-description">
                Exportiere deine Daten regelmässig als Backup. Das Zurücksetzen
                kann nicht rückgängig gemacht werden.
              </p>
            </div>
          </div>

          {appVersion && (
            <div className="app-version">
              <p className="version-text">{appVersion}</p>
            </div>
          )}
          <div style={{ height: '80px' }} />
        </div>

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />
      </IonContent>

      <input
        ref={fileInputRef}
        type="file"
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onClose={() => setShowAddSchoolModal(false)}
        onAdd={handleAddSchool}
        isLoading={addSchoolMutation.isPending}
      />

      <AddSemesterModal
        isOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        onAdd={handleAddSemester}
        isLoading={addSemesterMutation.isPending}
        schools={schools ?? []}
      />

      <IonModal
        isOpen={showNameEditModal}
        onDidDismiss={handleCancelNameEdit}
        className={popupStyles.modal}
      >
        <div className={popupStyles.modalContent}>
          <h1>Namen bearbeiten</h1>
        </div>
        <IonContent scrollY={false}>
          <div className={popupStyles.formFields}>
            <nameForm.AppField name="nameInput">
              {(field) => <field.NameField label="Dein Name" />}
            </nameForm.AppField>
          </div>
          <ModalButtonGroup>
            <ModalCancelButton
              onClick={handleCancelNameEdit}
              disabled={saveUserNameMutation.isPending}
              text="Abbrechen"
            />
            <nameForm.Subscribe selector={(state) => [state.values.nameInput]}>
              {([nameInput]) => (
                <ModalSubmitButton
                  onClick={handleSaveName}
                  disabled={
                    saveUserNameMutation.isPending ||
                    !nameInput.trim() ||
                    nameInput.trim() === (userName || '')
                  }
                  isLoading={saveUserNameMutation.isPending}
                  loadingText="Speichert..."
                  text="Speichern"
                  icon={checkmarkOutline}
                />
              )}
            </nameForm.Subscribe>
          </ModalButtonGroup>
        </IonContent>
      </IonModal>
      <AlertButton
        isOpen={showDeleteAlert}
        onDismiss={() => {
          setShowDeleteAlert(false);
          setSchoolIdToDelete(null);
        }}
        onDelete={handleDeleteSchool}
      />

      <AlertSemesterButton
        isOpen={showDeleteSemesterAlert}
        onDismiss={() => {
          setShowDeleteSemesterAlert(false);
          setSemesterIdToDelete(null);
        }}
        onDelete={handleDeleteSemester}
      />

      <ExportDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </IonPage>
  );
};

export default SettingsPage;
