export interface Template {
  id: string;
  name: string;
  isTemplate: boolean;
  dateCreated: Date;
  days: {
    id: string;
    dayName: string;
    dietId: string;
    meals: {
      id: string;
      mealType: string;
      meal: string;
      dietDayId: string;
    }[];
  }[];
}