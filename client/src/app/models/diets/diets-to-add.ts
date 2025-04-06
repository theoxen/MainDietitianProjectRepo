export interface DietToAdd {
    name: string;
    isTemplate: boolean;
    userId: string;
    userDiets: UserDietToAdd[];
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

export interface UserDietToAdd {
    userId: string;
}