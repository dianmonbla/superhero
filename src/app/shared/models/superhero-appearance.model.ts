import { ModelAbstract } from './model-abstract';

export class SuperHeroAppearanceModel extends ModelAbstract<SuperHeroAppearanceModel> {
    gender: string;
    race: string;
    height: string[];
    weight: string[];
    eyeColor: string;
    hairColor: string;

    setData(data: SuperHeroAppearanceModel): void {
        if (data)
            Object.assign(this, data)
    }
}