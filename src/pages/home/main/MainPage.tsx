import React, { useState } from 'react';
import {
  IonContent,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
  type RefresherEventDetail,
} from '@ionic/react';
import { useQueryClient } from '@tanstack/react-query';
import { add, chevronForward, personCircleOutline } from 'ionicons/icons';
import {
  examKeys,
  gradeKeys,
  schoolKeys,
  useAddSchool,
  useUserName,
} from '@/hooks/queries';
import { Routes } from '@/routes';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import AddSchoolModal from '@/components/modals/AddSchoolModal';
import ExamsList from '@/pages/home/main/components/ExamsList';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import SchoolsList from '@/pages/home/main/components/SchoolsList';

import './MainPage.css';

function MainPage() {
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const router = useIonRouter();
  const queryClient = useQueryClient();

  const { data: userName } = useUserName();

  const addSchoolMutation = useAddSchool();

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: schoolKeys.all }),
        queryClient.invalidateQueries({ queryKey: examKeys.all }),
        queryClient.invalidateQueries({ queryKey: gradeKeys.all }),
      ]);
    } finally {
      event.detail.complete();
    }
  };

  const handleAddSchool = (schoolName: string) => {
    if (schoolName.trim()) {
      addSchoolMutation.mutate(
        { name: schoolName.trim() },
        {
          onSuccess: () => {
            setShowAddSchoolModal(false);
          },
          onError: (error) => {
            console.error('Error when adding:', error);
          },
        },
      );
    }
  };

  return (
    <IonPage className="home-page">
      <IonContent className="home-content" scrollY forceOverscroll>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        <div className="content-wrapper">
          <div className="header-section">
            <div className="gradient-orb" />
            <div className="profile-card glass-card">
              <div className="profile-content">
                <div className="profile-avatar">
                  {userName ? userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="profile-info">
                  <h1 className="profile-greeting">
                    {getGreeting()}
                    {userName ? `, ${userName}` : ''}
                  </h1>
                </div>
                <div
                  className="profile-settings-button"
                  onClick={() =>
                    router.push(Routes.SETTINGS, 'forward', 'replace')
                  }
                >
                  <IonIcon
                    icon={personCircleOutline}
                    className="profile-icon"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="main-section">
            <div className="section-header">
              <h2 className="section-title">Schulen</h2>
              <div
                className="header-action-button"
                onClick={() => setShowAddSchoolModal(true)}
              >
                <IonIcon icon={add} className="action-icon" />
              </div>
            </div>

            <SchoolsList />
          </div>

          <div className="main-section">
            <div className="section-header">
              <div
                className="section-title-link"
                onClick={() => router.push(Routes.EXAMS_ALL, 'forward')}
              >
                <h2 className="section-title">Prüfungen</h2>
                <IonIcon
                  icon={chevronForward}
                  className="section-title-arrow"
                />
              </div>
              <div
                className="header-action-button"
                onClick={() => router.push(Routes.EXAMS_ADD, 'forward')}
              >
                <IonIcon icon={add} className="action-icon" />
              </div>
            </div>

            <ExamsList />
          </div>

          <div className="bottom-spacer" />
        </div>

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />
      </IonContent>

      <AddSchoolModal
        isOpen={showAddSchoolModal}
        onClose={() => setShowAddSchoolModal(false)}
        onAdd={handleAddSchool}
        isLoading={addSchoolMutation.isPending}
      />

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </IonPage>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default MainPage;
