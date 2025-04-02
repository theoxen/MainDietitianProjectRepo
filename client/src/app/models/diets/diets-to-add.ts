export interface DietToAdd {
    name: string;
    isTemplate: boolean;
    userId: string;
    dietDays: DietDayToAdd[];
}

export interface DietDayToAdd {
    dayName: string;
    dietMeals: DietMealToAdd[];
}

export interface DietMealToAdd {
    mealType: string;
    meal: string;
}