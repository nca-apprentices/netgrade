import React from 'react';
import { IonIcon } from '@ionic/react';
import { time, book } from 'ionicons/icons';
import { Exam } from '@/db/entities/Exam';
import { formatExamDate, formatExamDistance } from '@/utils/examDate';
import './ExamListView.css';

interface ExamListViewProps {
  groupedExams: {
    monthKey: string;
    monthName: string;
    exams: Exam[];
  }[];
  onSelectExam: (exam: Exam) => void;
}

const ExamListView: React.FC<ExamListViewProps> = ({
  groupedExams,
  onSelectExam,
}) => {
  const allExams = groupedExams.flatMap((group) => group.exams);

  return (
    <div className="exams-container">
      {allExams.length > 0 ? (
        allExams.map((exam) => (
          <div
            key={exam.id}
            className="exam-item"
            onClick={() => onSelectExam(exam)}
          >
            <div className="exam-icon-badge">
              <IonIcon icon={book} />
            </div>

            <div className="exam-info">
              <h3 className="exam-name">{exam.name}</h3>
              <div className="exam-date-text">
                <IonIcon icon={time} />
                <span>{formatExamDate(exam.date)}</span>
                <span className="exam-date-relative">
                  {formatExamDistance(exam.date)}
                </span>
              </div>
            </div>

            <div className="exam-status-dot"></div>
          </div>
        ))
      ) : (
        <div className="exams-empty-state">
          <div className="exams-empty-icon">
            <IonIcon icon={book} />
          </div>
          <h3>Keine anstehenden Prüfungen</h3>
          <p>Du hast aktuell keine anstehenden Prüfungen.</p>
        </div>
      )}
    </div>
  );
};

export default ExamListView;
