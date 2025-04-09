export interface TemplateToAdd {
  name: string;
  days: {
    dayName: string;
    meals: {
      mealType: string;
      meal: string;
    }[]
  }[];
}