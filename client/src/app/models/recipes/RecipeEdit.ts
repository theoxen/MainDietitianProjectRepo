export interface RecipeEdit {
    id: string;
    name: string;
    dateCreated: Date;
    ingredients: string;
    directions: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  }