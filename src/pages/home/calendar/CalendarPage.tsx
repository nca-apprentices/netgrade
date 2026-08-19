import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonSkeletonText,
  RefresherEventDetail,
  IonCard,
} from '@ionic/react';
import { calendar, list, informationCircle } from 'ionicons/icons';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Header from '@/components/Header/Header';
import NavigationModal from '@/components/navigation/home/NavigationModal';
import './calendar.css';
import { Exam } from '@/db/entities/Exam';
import { useUpcomingExams } from '@/hooks/queries';
import { Routes } from '@/routes';
import MonthSelector from './components/MonthSelector';
import CalendarGrid from './components/CalendarGrid';
import SelectedDateView from './components/SelectedDateView';
import ExamListView from './components/ExamListView';
import BottomNavigation from '@/components/bottom-navigation/bottom-navigation';
import { useCalendar } from '@/pages/home/calendar/hook/useCalendar';

const CalendarPage: React.FC = () => {
  const { data: allExams = [], error, isLoading, refetch } = useUpcomingExams();
  const [showExamDetail, setShowExamDetail] = useState<Exam | null>(null);
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  const {
    currentMonth,
    selectedDate,
    viewMode,
    eventsForSelectedDate,
    groupedExams,
    calendarData,
    setSelectedDate,
    setViewMode,
    changeMonth,
  } = useCalendar(allExams);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

  const handleSelectExam = (exam: Exam) => {
    setShowExamDetail(exam);
  };

  return (
    <IonPage>
      <Header
        title={'Prüfungsplan'}
        backButton={true}
        defaultHref={Routes.HOME}
      />
      <IonContent className="calendar-container" scrollY={true}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonCard className="view-toggle-container">
          <IonSegment
            value={viewMode}
            onIonChange={(e) =>
              setViewMode(e.detail.value as 'calendar' | 'list')
            }
            mode="ios"
          >
            <IonSegmentButton value="calendar">
              <IonIcon icon={calendar} />
              <IonLabel>Kalender</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="list">
              <IonIcon icon={list} />
              <IonLabel>Liste</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonCard>

        {isLoading ? (
          <div className="loading-container">
            <IonSkeletonText
              animated
              style={{ width: '100%', height: '300px', borderRadius: '16px' }}
            />
            <IonSkeletonText
              animated
              style={{
                width: '90%',
                height: '100px',
                margin: '16px auto',
                borderRadius: '12px',
              }}
            />
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-card">
              <div className="error-content">
                <IonIcon icon={informationCircle} color="danger" />
                <p>Fehler beim Laden. Bitte versuche es erneut.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'calendar' ? (
              <IonCard className="modern-calendar-container">
                <MonthSelector
                  currentMonth={currentMonth}
                  onChangeMonth={changeMonth}
                />

                <CalendarGrid
                  calendarData={calendarData}
                  onSelectDate={setSelectedDate}
                />

                <SelectedDateView
                  selectedDate={selectedDate}
                  events={eventsForSelectedDate}
                  onSelectExam={handleSelectExam}
                />
              </IonCard>
            ) : (
              <ExamListView
                groupedExams={groupedExams}
                onSelectExam={handleSelectExam}
              />
            )}
          </>
        )}

        <IonAlert
          isOpen={!!showExamDetail}
          header={showExamDetail?.name}
          subHeader={
            showExamDetail
              ? format(showExamDetail.date, 'EEEE, d. MMMM yyyy', {
                  locale: de,
                })
              : ''
          }
          message={
            showExamDetail?.description || 'Keine Beschreibung verfügbar'
          }
          buttons={['OK']}
          onDidDismiss={() => setShowExamDetail(null)}
        />

        <NavigationModal
          isOpen={showNavigationModal}
          setIsOpen={setShowNavigationModal}
        />

        <div style={{ height: '80px' }} />
      </IonContent>

      <BottomNavigation
        showNavigationModal={showNavigationModal}
        setShowNavigationModal={setShowNavigationModal}
      />
    </IonPage>
  );
};

export default CalendarPage;
