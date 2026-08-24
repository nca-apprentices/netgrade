import React, { useMemo, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonRadioGroup,
  IonRadio,
  IonButton,
  IonButtons,
  IonIcon,
  IonToast,
  IonLoading,
  IonModal,
  IonRippleEffect,
  IonPage,
  IonInput,
} from '@ionic/react';
import {
  close,
  shareOutline,
  downloadOutline,
  sparklesSharp,
  documentTextOutline,
  calendarOutline,
  personOutline,
  pencilOutline,
  layersOutline,
  schoolOutline,
} from 'ionicons/icons';
import { useExportData } from '@/hooks/queries/useDataManagementQueries';
import { useUserName } from '@/hooks';
import { useSchools } from '@/hooks/queries/useSchoolQueries';
import { Capacitor } from '@capacitor/core';
import { School } from '@/db/entities';
import {
  generateExportFilename,
  ensureXlsxExtension,
  validateFilename,
  getExportToastColor,
} from '@/utils/export';
import './ExportDialog.css';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School;
}

interface ToastState {
  show: boolean;
  message: string;
  color: 'success' | 'danger' | 'warning';
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  school,
}) => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(
    school?.id || null,
  );
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    color: 'danger',
  });

  const exportMutation = useExportData();
  const { data: userName } = useUserName();
  const { data: schools = [] } = useSchools();

  const isNative = Capacitor.isNativePlatform();

  const customFilename = useMemo(() => {
    if (selectedSchoolId === 'all') {
      return generateExportFilename('alle-schulen', userName || undefined);
    } else {
      const selectedSchool = schools?.find((s) => s.id === selectedSchoolId);
      return generateExportFilename(
        selectedSchool?.name,
        userName || undefined,
      );
    }
  }, [selectedSchoolId, userName, schools]);

  const showToast = (
    message: string,
    color: ToastState['color'] = 'danger',
  ) => {
    setToast({ show: true, message, color });
  };

  const getFinalFilename = (): string => {
    return ensureXlsxExtension(customFilename);
  };

  const handleExport = async () => {
    if (!selectedSchoolId) {
      showToast('Bitte wählen Sie eine Option aus.');
      return;
    }

    const filenameError = validateFilename(customFilename);
    if (filenameError) {
      showToast(filenameError);
      return;
    }

    try {
      const filename = getFinalFilename();

      const result = await exportMutation.mutateAsync({
        options: {
          format: 'xlsx',
          filename,
          schoolId: selectedSchoolId,
        },
      });

      showToast(result.message, getExportToastColor(result.success));

      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Export failed:', error);
      showToast(
        error instanceof Error
          ? `Export fehlgeschlagen: ${error.message}`
          : 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.',
      );
    }
  };

  const getSchoolIconClass = (schoolId: string, index: number) => {
    const baseClass = 'school-icon';
    if (selectedSchoolId === schoolId) {
      return `${baseClass} school-icon-selected`;
    }
    return `${baseClass} school-icon-${index % 4}`;
  };

  const getAllSchoolsIconClass = () => {
    const baseClass = 'school-icon school-icon-all';
    if (selectedSchoolId === 'all') {
      return `${baseClass} school-icon-selected`;
    }
    return baseClass;
  };

  const isExportButtonEnabled = selectedSchoolId && customFilename.trim();

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        breakpoints={[0, 0.25, 0.5, 0.75, 1]}
        initialBreakpoint={0.75}
        backdropBreakpoint={0.5}
        className="export-modal"
      >
        <IonPage className="export-page">
          <IonHeader className="liquid-glass-bg export-header">
            <IonToolbar className="export-toolbar">
              <IonButtons slot="start">
                <IonButton
                  onClick={onClose}
                  fill="clear"
                  className="header-close-button"
                >
                  <IonIcon
                    icon={close}
                    slot="icon-only"
                    className="header-close-icon"
                    aria-hidden={true}
                  />
                </IonButton>
              </IonButtons>

              <IonTitle className="header-title">Daten exportieren</IonTitle>

              <IonButtons slot="end">
                <IonButton fill="clear" className="header-dummy-button">
                  <IonIcon
                    icon={close}
                    slot="icon-only"
                    className="header-close-icon"
                    aria-hidden={true}
                  />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="export-content" scrollY={true}>
            <div className="content-wrapper">
              <div className="header-section">
                <div className="gradient-orb" />
                <div className="header-content">
                  <div className="header-flex">
                    <div className="header-icon-wrapper">
                      <IonIcon
                        icon={sparklesSharp}
                        className="header-icon"
                        aria-hidden={true}
                      />
                    </div>
                    <div className="header-text">
                      <h1>Excel-Export</h1>
                      <p>Erstelle eine Datensicherung</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="school-section">
                <h2 className="section-title">Export-Option wählen</h2>

                <IonRadioGroup
                  value={selectedSchoolId}
                  onIonChange={(e) => setSelectedSchoolId(e.detail.value)}
                >
                  {/* Alle Schulen Option */}
                  <div
                    className={`school-item-wrapper ${selectedSchoolId === 'all' ? 'glass-card' : ''}`}
                  >
                    <IonItem
                      lines="none"
                      className="school-item ion-activatable"
                      onClick={() => setSelectedSchoolId('all')}
                    >
                      <IonRippleEffect />
                      <div slot="start" className={getAllSchoolsIconClass()}>
                        <IonIcon
                          icon={layersOutline}
                          className="all-schools-icon"
                          aria-hidden={true}
                        />
                      </div>
                      <IonLabel className="school-label">
                        <h3>Alle Schulen</h3>
                        <p>
                          Exportiert alle {schools.length} Schulen in einer
                          Datei
                        </p>
                      </IonLabel>
                      <IonRadio
                        slot="end"
                        value="all"
                        className="school-radio"
                      />
                    </IonItem>
                  </div>

                  {/* Einzelne Schulen */}
                  {schools.map((school, index) => (
                    <div
                      key={school.id}
                      className={`school-item-wrapper ${selectedSchoolId === school.id ? 'glass-card' : ''}`}
                    >
                      <IonItem
                        lines="none"
                        className="school-item ion-activatable"
                        onClick={() => setSelectedSchoolId(school.id)}
                      >
                        <IonRippleEffect />
                        <div
                          slot="start"
                          className={getSchoolIconClass(school.id, index)}
                        >
                          <span className="school-icon-letter">
                            {school.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <IonLabel className="school-label">
                          <h3>{school.name}</h3>
                          <p>Nur diese Schule exportieren</p>
                        </IonLabel>
                        <IonRadio
                          slot="end"
                          value={school.id}
                          className="school-radio"
                        />
                      </IonItem>
                    </div>
                  ))}
                </IonRadioGroup>

                {schools.length === 0 && (
                  <div className="empty-state">
                    <p>Keine Schulen vorhanden</p>
                  </div>
                )}
              </div>

              {selectedSchoolId && (
                <div className="filename-section">
                  <h2 className="section-title">Dateiname</h2>

                  <div className="filename-input filename-input-wrapper">
                    <IonItem lines="none" className="filename-item">
                      <div slot="start" className="filename-icon-wrapper">
                        <IonIcon
                          icon={pencilOutline}
                          className="filename-icon"
                          aria-hidden={true}
                        />
                      </div>
                      <IonInput
                        value={customFilename}
                        placeholder="Dateiname eingeben..."
                        className="filename-input-field"
                        disabled
                      />
                      <div slot="end" className="filename-extension">
                        .xlsx
                      </div>
                    </IonItem>
                  </div>
                </div>
              )}

              <div className="export-button-section">
                <IonButton
                  expand="block"
                  onClick={handleExport}
                  disabled={exportMutation.isPending || !isExportButtonEnabled}
                  className={`export-button ${isExportButtonEnabled ? 'glass-button export-button-enabled' : 'export-button-disabled'}`}
                >
                  <IonIcon
                    icon={isNative ? shareOutline : downloadOutline}
                    slot="start"
                    className="export-button-icon"
                    aria-hidden={true}
                  />
                  {isNative ? 'Exportieren und teilen' : 'Jetzt herunterladen'}
                </IonButton>
              </div>

              {selectedSchoolId && customFilename.trim() && (
                <div className="glass-card details-card">
                  <h3 className="details-title">Export-Details</h3>

                  <div className="details-list">
                    <div className="detail-item">
                      <div className="detail-icon-wrapper detail-icon-wrapper-file">
                        <IonIcon
                          icon={documentTextOutline}
                          className="detail-icon detail-icon-file"
                          aria-hidden={true}
                        />
                      </div>
                      <div className="detail-content">
                        <p className="detail-label">Dateiformat</p>
                        <p className="detail-value">Excel (.xlsx)</p>
                      </div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-icon-wrapper detail-icon-wrapper-school">
                        <IonIcon
                          icon={
                            selectedSchoolId === 'all'
                              ? layersOutline
                              : schoolOutline
                          }
                          className="detail-icon detail-icon-school"
                          aria-hidden={true}
                        />
                      </div>
                      <div className="detail-content">
                        <p className="detail-label">Export-Umfang</p>
                        <p className="detail-value">
                          {selectedSchoolId === 'all'
                            ? `Alle ${schools.length} Schulen`
                            : schools.find((s) => s.id === selectedSchoolId)
                                ?.name || 'Einzelne Schule'}
                        </p>
                      </div>
                    </div>

                    {userName && (
                      <div className="detail-item">
                        <div className="detail-icon-wrapper detail-icon-wrapper-user">
                          <IonIcon
                            icon={personOutline}
                            className="detail-icon detail-icon-user"
                            aria-hidden={true}
                          />
                        </div>
                        <div className="detail-content">
                          <p className="detail-label">Benutzer</p>
                          <p className="detail-value">{userName}</p>
                        </div>
                      </div>
                    )}

                    <div className="detail-item">
                      <div className="detail-icon-wrapper detail-icon-wrapper-date">
                        <IonIcon
                          icon={calendarOutline}
                          className="detail-icon detail-icon-date"
                          aria-hidden={true}
                        />
                      </div>
                      <div className="detail-content">
                        <p className="detail-label">Datum</p>
                        <p className="detail-value">
                          {new Date().toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-pill filename-pill">
                    <p className="filename-pill-label">Dateiname</p>
                    <p className="filename-pill-value">{getFinalFilename()}</p>
                  </div>

                  {selectedSchoolId === 'all' && (
                    <div className="export-info-card">
                      <div className="info-card-header">
                        <IonIcon
                          icon={layersOutline}
                          className="info-card-icon"
                          aria-hidden={true}
                        />
                        <span className="info-card-title">
                          Multi-School Export
                        </span>
                      </div>
                      <div className="info-card-content">
                        <p>Diese Excel-Datei enthält:</p>
                        <ul className="info-list">
                          <li>Übersicht aller Schulen</li>
                          <li>Zusammengefasste Daten</li>
                          <li>Separate Sheets pro Schule</li>
                          <li>Gesamtstatistiken</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bottom-spacer" />
            </div>
          </IonContent>

          <IonLoading
            isOpen={exportMutation.isPending}
            message="Exportiere Daten... Einen Moment bitte"
            spinner="crescent"
            cssClass="loading-glass export-loading"
          />
        </IonPage>
      </IonModal>

      <IonToast
        isOpen={toast.show}
        onDidDismiss={() => setToast({ ...toast, show: false })}
        message={toast.message}
        duration={3000}
        position="bottom"
        color={toast.color}
        cssClass={`glass-toast glass-toast-${toast.color}`}
      />
    </>
  );
};
