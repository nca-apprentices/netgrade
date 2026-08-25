import { IonButton, IonButtons, IonIcon, IonInput } from '@ionic/react';
import {
  checkmarkOutline,
  closeOutline,
  pencilOutline,
  trashOutline,
} from 'ionicons/icons';
import { Semester } from '@/db/entities';

interface SemesterCardProps {
  semester: Semester;
  index: number;
  isExpanded: boolean;
  isEditing: boolean;
  editSemesterName: string;
  isSavePending: boolean;
  isDeleteDisabled: boolean;
  onToggle: () => void;
  onEditSemesterNameChange: (value: string) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancel: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

const SemesterCard = ({
  semester,
  index,
  isExpanded,
  isEditing,
  editSemesterName,
  isSavePending,
  isDeleteDisabled,
  onToggle,
  onEditSemesterNameChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
}: SemesterCardProps) => {
  return (
    <div
      className={`settings-item glass-card ${isExpanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <div className="item-content">
        <div className={`item-icon school-${index % 4}`}>
          {semester.name.charAt(0).toUpperCase()}
        </div>
        <div className="item-text">
          {isEditing ? (
            <div className="edit-school-input">
              <IonInput
                value={editSemesterName}
                placeholder="Semestername..."
                onIonChange={(e) =>
                  onEditSemesterNameChange(e.detail.value || '')
                }
                onClick={(e) => e.stopPropagation()}
                className="school-edit-field"
                clearInput
                autoFocus
              />
            </div>
          ) : (
            <>
              <h3 className="item-title">{semester.name}</h3>
              {semester.school && (
                <p className="item-subtitle">{semester.school.name}</p>
              )}
            </>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="item-extra" onClick={(e) => e.stopPropagation()}>
          <IonButtons slot="end">
            {isEditing ? (
              <div className="edit-buttons">
                <IonButton
                  className="save-button"
                  color="success"
                  onClick={onSave}
                  disabled={
                    isSavePending ||
                    !editSemesterName.trim() ||
                    editSemesterName.trim() === semester.name
                  }
                >
                  <IonIcon slot="start" icon={checkmarkOutline} />
                  <span className="save-text">Speichern</span>
                </IonButton>
                <IonButton
                  className="cancel-button"
                  color="medium"
                  onClick={onCancel}
                  disabled={isSavePending}
                >
                  <IonIcon slot="start" icon={closeOutline} />
                  <span className="cancel-text">Abbrechen</span>
                </IonButton>
              </div>
            ) : (
              <>
                <IonButton
                  className="edit-button"
                  color="primary"
                  onClick={onEdit}
                >
                  <IonIcon slot="start" icon={pencilOutline} />
                  <span className="edit-text">Bearbeiten</span>
                </IonButton>
                <IonButton
                  className="delete-button"
                  color="danger"
                  onClick={onDelete}
                  disabled={isDeleteDisabled}
                >
                  <IonIcon slot="start" icon={trashOutline} />
                  <span className="delete-text">Löschen</span>
                </IonButton>
              </>
            )}
          </IonButtons>
        </div>
      )}
    </div>
  );
};

export default SemesterCard;
