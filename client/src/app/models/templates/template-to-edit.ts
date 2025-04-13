export interface TemplateToEdit {
  id: string;
  name: string;
  days: {
    id: string;
    dayName: string;
    meals: {
      id: string;
      mealType: string;
      meal: string;
    }[]
  }[];
}