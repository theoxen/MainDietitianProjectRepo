export interface DietToEdit {
    id: string;
    name: string;
    isTemplate: boolean;
    dietDays: DietDayToEdit[];
}

export interface DietDayToEdit {
    id: string;
    dayName: string;
    dietMeals: DietMealToEdit[];
}

export interface DietMealToEdit {
    id: string;
    mealType: string;
    meal: string;
}