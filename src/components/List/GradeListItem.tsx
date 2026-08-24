import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  calendar,
  chatbubble,
  scale,
  createOutline,
  trashOutline,
} from 'ionicons/icons';
import { Grade } from '@/db/entities';
import { decimalToPercentage } from '@/utils/validation';
import './GradeListItem.css';

interface GradeListItemProps {
  grade: Grade;
  index?: number;
  onEdit: () => void;
  onDelete: () => void;
}

const GradeListItem: React.FC<GradeListItemProps> = ({
  grade,
  onEdit,
  onDelete,
}) => {
  const weightPercentage = decimalToPercentage(grade.weight);

  return (
    <div className="grade-item-container">
      <div className="grade-item">
        <div className="grade-icon-badge">
          <span className="grade-score">{grade.score}</span>
        </div>

        <div className="grade-info">
          <h3 className="grade-exam-name">{grade.exam.name}</h3>
          <div className="grade-details">
            <div className="grade-detail-item">
              <IonIcon icon={scale} aria-label={scale} />
              <span>{weightPercentage}%</span>
            </div>
            <div className="grade-detail-item">
              <IonIcon icon={calendar} aria-label={calendar} />
              <span>{new Date(grade.date).toLocaleDateString()}</span>
            </div>
            {grade.comment && (
              <div className="grade-detail-item">
                <IonIcon icon={chatbubble} aria-hidden={true}/>
                <span>{grade.comment}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grade-actions">
          <button
            className="grade-action-button edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <IonIcon icon={createOutline} aria-hidden={true} />
          </button>
          <button
            className="grade-action-button delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <IonIcon icon={trashOutline} aria-hidden={true} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeListItem;
