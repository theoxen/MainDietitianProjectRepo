export interface CreateTemplate {
  name: string;
  days: {
    dayName: string;
    meals: {
      mealType: string;
      meal: string;
    }[];
  }[];
}