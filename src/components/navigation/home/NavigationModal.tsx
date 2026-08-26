import React, { Dispatch, SetStateAction, useRef } from 'react';
import { IonContent, IonIcon, IonItem, IonModal } from '@ionic/react';
import {
  ribbonOutline,
  documentTextOutline,
  calendarOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import Header from '@/components/Header/Header';
import './NavigationModal.css';

interface SlideUpProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const NavigationModal: React.FC<SlideUpProps> = ({ isOpen, setIsOpen }) => {
  const history = useHistory();
  const pendingNavigation = useRef<string | null>(null);

  const handleDismiss = () => {
    setIsOpen(false);
    if (pendingNavigation.current) {
      history.push(pendingNavigation.current);
      pendingNavigation.current = null;
    }
  };

  const navigateTo = (path: string) => {
    pendingNavigation.current = path;
    setIsOpen(false);
  };

  const goToTab2 = () => {
    navigateTo('/main/home/grades/add');
  };

  const goToTab3 = () => {
    navigateTo('/main/home/exams/add');
  };

  const goToTab4 = () => {
    navigateTo('/main/home/settings');
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleDismiss}
      breakpoints={[0, 0.5, 1]}
      initialBreakpoint={0.8}
    >
      <Header title={'Eintragen'} backButton={false}></Header>
      <IonContent>
        <div className="nav-modal-list">
          <IonItem
            button
            onClick={goToTab2}
            className="nav-modal-item"
            lines="none"
          >
            <div className="nav-modal-icon-box" slot="start">
              <IonIcon
                icon={ribbonOutline}
                className="nav-modal-icon"
                aria-hidden={true}
              />
            </div>
            <span className="text">Note</span>
          </IonItem>
          <IonItem
            button
            onClick={goToTab3}
            className="nav-modal-item"
            lines="none"
          >
            <div className="nav-modal-icon-box" slot="start">
              <IonIcon
                icon={documentTextOutline}
                className="nav-modal-icon"
                aria-hidden={true}
              />
            </div>
            <span className="text">Anstehende Prüfung</span>
          </IonItem>
          <IonItem
            button
            onClick={goToTab4}
            className="nav-modal-item"
            lines="none"
          >
            <div className="nav-modal-icon-box" slot="start">
              <IonIcon
                icon={calendarOutline}
                className="nav-modal-icon"
                aria-hidden={true}
              />
            </div>
            <span className="text">Semester</span>
          </IonItem>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default NavigationModal;
