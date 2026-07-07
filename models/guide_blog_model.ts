export interface CookingGuideModel {
    statusCode?: number;
    data?:       CookingGuideData[];
}

export interface CookingGuideData {
    guideid?:      number;
    title?:        string;
    description?:  string;
    guideimage?:   string;
    ingredients?:  Ingredient[];
    instructions?: string[];
    prep_time?:    number;
    cook_time?:    number;
    difficulty?:   string;
    status?:       string;
}

export interface Ingredient {
    name?:     string;
    quantity?: string;
}


export interface BlogModel {
    statusCode?: number;
    data?:       BlogData[];
}

export interface BlogData {
    blogid?:      number;
    title?:       string;
    description?: string;
    blogimage?:   string;
    author?:      string;
    status?:      string;
    createdAt?:   Date;
    updatedAt?:   Date;
}
