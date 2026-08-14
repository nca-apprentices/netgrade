import React from 'react';
import { IonAlert } from '@ionic/react';

interface UnsavedChangesAlertProps {
  isOpen: boolean;
  onDismiss: () => void;
  onDiscard: () => void;
}

const UnsavedChangesAlert: React.FC<UnsavedChangesAlertProps> = ({
  isOpen,
  onDismiss,
  onDiscard,
}) => (
  <IonAlert
    isOpen={isOpen}
    onDidDismiss={onDismiss}
    header="Änderungen verwerfen?"
    message="Du hast ungespeicherte Änderungen. Wenn du jetzt abbrichst, gehen sie verloren."
    buttons={[
      { text: 'Abbrechen', role: 'cancel' },
      { text: 'Verwerfen', role: 'destructive', handler: onDiscard },
    ]}
  />
);

export default UnsavedChangesAlert;
