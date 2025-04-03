import { User } from "../user";

export interface Diet {
  id: string;
  name: string;
  dateCreated: Date;
  isTemplate: boolean;
  userDiets: UserDiet[]; // Placeholder for UserDiet references
  dietDays: {
      dayName: string;
      DietMeals: { MealType: string; meal: string; }[];
  }[];
}
export interface UserDiet {
  userId: string;
  user?: User;       // Placeholder for User model (if available)
  dietId: string;
  diet?: Diet;       // References the Diet interface from diet.ts
}

// export interface DietDay {
//   id: string;
//   dayName: string;
//   dietId: string;
//   diet?: Diet;
//   dietMeals: DietMeal[];  // Placeholder array for DietMeal references
// }

// export interface DietMeal {
//   id: string;         // Corresponds to Guid
//   mealType: string;
//   meal: string;
//   dietDayId: string;  // Corresponds to Guid
//   dietDay?: DietDay;  // Optional reference to a DietDay
// }
