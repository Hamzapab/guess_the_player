/**
 * Calculates points earned based on performance efficiency (questions taken) and match outcome.
 * - 1 to 3 questions: 50 points
 * - 4 to 7 questions: 30 points
 * - 8+ questions: 25 points
 * - Losers: -5 points 
 */
export const calculatePointsEarned = (questionCount: number, won: boolean): number => {
  if (!won) {
    return -5; 
  }

  if (questionCount >= 1 && questionCount <= 3) {
    return 50;
  } else if (questionCount >= 4 && questionCount <= 7) {
    return 30;
  } else {
    return 25;
  }
};