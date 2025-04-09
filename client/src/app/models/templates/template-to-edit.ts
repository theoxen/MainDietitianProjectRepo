export interface DietToEdit {
    id: string;
    name: string;
    isTemplate: boolean;
    days: {
      id?: string; // Optional if new days don't have IDs
      dayName: string;
      meals: {
        meal: string;
        type: string;
      }[]
    }[];
// export interface DietDayToEdit {
//     id: string;
//     dayName: string;
//     dietMeals: DietMealToEdit[];
// }

// export interface DietMealToEdit {
//     id: string;
//     mealType: string;
//     meal: string;
}