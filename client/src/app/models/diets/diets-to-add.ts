export interface DietToAdd {
    name: string;
    isTemplate: boolean;
    userDiets: { userId: string }[];
    days: {               // lowercase 'days' instead of 'Days'
      dayName: string;    // lowercase 'dayName' instead of 'DayName'
      meals: {            // lowercase 'meals' instead of 'Meals'
        meal: string;     // lowercase 'meal' instead of 'Meal'
        type: string;     // lowercase 'type' instead of 'Type'
      }[]
    }[];
}
// export interface DietDayToAdd {
//     dayName: string;
//     Meals: DietMealToAdd[];
// }

// export interface DietMealToAdd {
//     Type: string;
//     meal: string;
// }

// export interface UserDietToAdd {
//     userId: string;
// }