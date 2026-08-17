import React from 'react';
import { useHistory } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { IonIcon } from '@ionic/react';
import { bookOutline, timeOutline } from 'ionicons/icons';
import { Routes } from '@/routes';
import { useUpcomingExams, createExamDetailQuery } from '@/hooks/queries';
import { formatExamDate, formatExamDistance } from '@/utils/examDate';

const ExamsList: React.FC = () => {
  const history = useHistory();
  const queryClient = useQueryClient();
  const { data: upcomingExams } = useUpcomingExams();

  const handleExamClick = async (examId: string) => {
    await queryClient.prefetchQuery(createExamDetailQuery(examId));

    history.push(Routes.EXAM_EDIT.replace(':examId', examId));
  };

  if (upcomingExams!.length === 0) {
    return (
      <div className="exams-scroll-container">
        <div className="exams-list">
          <div className="empty-exams glass-card">
            <h3 className="empty-title">Alles erledigt!</h3>
            <p className="empty-description">Keine anstehenden Prüfungen</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="exams-scroll-container">
      <div className="exams-list">
        {upcomingExams!.map((exam) => (
          <div
            key={exam.id}
            className="exam-card glass-card"
            onClick={() => handleExamClick(exam.id)}
          >
            <div className="exam-card-content">
              <div className="exam-icon-and-info">
                <div className="exam-icon-wrapper">
                  <IonIcon icon={bookOutline} className="exam-icon" />
                </div>

                <div className="exam-info">
                  <h4 className="exam-title">{exam.name}</h4>
                  <div className="exam-meta">
                    <div className="exam-date">
                      <IonIcon icon={timeOutline} className="meta-icon" />
                      <span>{formatExamDate(exam.date)}</span>
                      <span className="exam-date-relative">
                        {formatExamDistance(exam.date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="exam-priority">
                <div className="priority-dot" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamsList;
