export const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('de-CH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const getGradeColor = (score: number): string => {
  if (score >= 5.5) return 'success'; //todo sollte der user selbst entscheiden können zB in den Einstellungen, speichern mit Preferences
  if (score >= 4.5) return 'primary';
  if (score >= 4) return 'warning';
  return 'danger';
};

export const getGradeBadgeColor = (score: number): string => {
  if (score >= 5.5) return 'success';
  if (score >= 4.5) return 'neutral';
  if (score >= 4) return 'warning';
  return 'danger';
};
