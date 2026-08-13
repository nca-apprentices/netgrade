import React, { ReactNode } from 'react';
import './Header.css';
import {
  IonBackButton,
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/react';
import { chevronBack } from 'ionicons/icons';

interface HeaderProps {
  title: string;
  backButton?: boolean;
  endSlot?: ReactNode;
  defaultHref?: string;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  backButton,
  endSlot,
  defaultHref,
  onBack,
}) => {
  return (
    <IonHeader>
      <IonToolbar>
        {backButton && (
          <IonButtons slot="start">
            {onBack ? (
              <IonButton onClick={onBack} fill="clear">
                <IonIcon icon={chevronBack} slot="start" />
                Zurück
              </IonButton>
            ) : (
              <IonBackButton defaultHref={defaultHref} text="Zurück" />
            )}
          </IonButtons>
        )}

        <IonTitle>{title}</IonTitle>

        {endSlot && endSlot}
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
