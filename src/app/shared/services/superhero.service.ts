import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, filter, retry } from 'rxjs/operators';

import { SUPERHERO } from '../../../environments/environment';
import { SuperHeroModel } from '../models/superhero.model';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

export const NUMBER_SUPERHEROES_FOR_LIST: number = 20
const SUPERHEROE_KEY = makeStateKey('superHeroe');
const SUPERHEROES_KEY = makeStateKey('superHeroes');
const SUPERHEROES_RANDOM_IDS_KEY = makeStateKey('superHeroesIds');

@Injectable({ providedIn: 'root' })
export class SuperHeroService {
    private _superHeroesIds: number[] = []
    private _superHero: SuperHeroModel = null
    private _superHeroes: SuperHeroModel[] = []

    constructor(
        private _httpClient: HttpClient,
        private _transferState: TransferState,
        @Inject(PLATFORM_ID) private _platform: Object
    ) {
        this.readTransferState()
    }

    private readTransferState(): void {
        if (isPlatformBrowser(this._platform)) {
            let superHero: SuperHeroModel = new SuperHeroModel()
            superHero.setData(this._transferState.get<SuperHeroModel>(SUPERHEROE_KEY, null))
            this._superHero = superHero;
            this._superHeroes = this._map(this._transferState.get<SuperHeroModel[]>(SUPERHEROES_KEY, []));
            this._superHeroesIds = this._transferState.get<number[]>(SUPERHEROES_RANDOM_IDS_KEY, [])
        }
    }

    private existsSuperHeroe(): boolean {
        return this._superHero && this._superHero.id ? true : false
    }

    private existsSuperHeroes(): boolean {
        return !!this._superHeroes.length
    }

    private _map(superHeroes: SuperHeroModel[]): SuperHeroModel[] {
        return superHeroes.map((_superHero: SuperHeroModel) => {
            let superHero: SuperHeroModel = new SuperHeroModel()
            superHero.setData(_superHero)
            return superHero
        })
    }

    /** 
     * Recomendación de hacer uso de una función recursiva para
     * optimizar la busqueda y refactorizar el código.
     */
    private _filter(filter: string): SuperHeroModel[] {
        return this._superHeroes.filter((superHero: SuperHeroModel) =>
            superHero.name.includes(filter)
            || superHero.slug.includes(filter)
            || superHero.appearance.gender.includes(filter)
            || superHero.appearance.race.includes(filter)
            || superHero.appearance.eyeColor.includes(filter)
            || superHero.biography.fullName.includes(filter)
            || superHero.biography.alterEgos.includes(filter)
            || superHero.biography.placeOfBirth.includes(filter)
            || superHero.biography.firstAppearance.includes(filter)
            || superHero.biography.publisher.includes(filter)
            || superHero.biography.alignment.includes(filter)
            || superHero.work.occupation.includes(filter)
            || superHero.work.base.includes(filter)
            || superHero.connections.relatives.includes(filter)
        )
    }

    private _random(length: number): SuperHeroModel[] {
        let superHeroes: SuperHeroModel[] = []
        length = this._superHeroes.length < length ? this._superHeroes.length : length

        if (!this._superHeroesIds.length) {
            while (superHeroes.length < length) {
                let randomNumber: number = Math.floor(Math.random() * this._superHeroes.length)

                if (!this._superHeroesIds.includes(randomNumber)) {
                    this._superHeroesIds.push(randomNumber)
                    superHeroes.push(this._superHeroes[randomNumber])
                }
            }

            if (isPlatformServer(this._platform))
                this._transferState.set<number[]>(SUPERHEROES_RANDOM_IDS_KEY, this._superHeroesIds)
        } else
            this._superHeroesIds.forEach((id: number) => superHeroes.push(this._superHeroes[id]))

        return superHeroes
    }

    list(random: boolean = true, filter: string = null, length: number = NUMBER_SUPERHEROES_FOR_LIST): Observable<SuperHeroModel[]> {
        if (this.existsSuperHeroes())
            return of(this._superHeroes).pipe(
                map((superHeroes: SuperHeroModel[]) => filter ? this._filter(filter) : superHeroes),
                map((superHeroes: SuperHeroModel[]) => random ? this._random(length) : superHeroes)
            )

        return this._httpClient.get<SuperHeroModel[]>(SUPERHERO.RESOURCE.LIST)
            .pipe(
                retry(3),
                map((superHeroes: SuperHeroModel[]) => this._map(superHeroes)),
                tap((superHeroes: SuperHeroModel[]) => this._superHeroes = superHeroes),
                tap((superHeroes: SuperHeroModel[]) => {
                    if (isPlatformServer(this._platform))
                        this._transferState.set<SuperHeroModel[]>(SUPERHEROES_KEY, superHeroes)
                }),
                map((superHeroes: SuperHeroModel[]) => filter ? this._filter(filter) : superHeroes),
                map((superHeroes: SuperHeroModel[]) => random ? this._random(length) : superHeroes)
            )
    }

    detail(id: number): Observable<SuperHeroModel> {
        if (this.existsSuperHeroes())
            return of(this._superHeroes.find((superHero: SuperHeroModel) => superHero.id == id))
        else if (this.existsSuperHeroe())
            return of(this._superHero).pipe(
                filter((superHero: SuperHeroModel) => this._superHero.id == id)
            )

        const RESOURCE: string = SUPERHERO.RESOURCE.ID.replace('#{ID}', id.toString())
        return this._httpClient.get<SuperHeroModel>(RESOURCE)
            .pipe(
                retry(3),
                map((_superHero: SuperHeroModel) => {
                    let superHero = new SuperHeroModel()
                    superHero.setData(_superHero)
                    return superHero
                }),
                tap((superHero: SuperHeroModel) => this._superHero = superHero),
                tap((superHero: SuperHeroModel) => {
                    if (isPlatformServer(this._platform))
                        this._transferState.set<SuperHeroModel>(SUPERHEROE_KEY, superHero)
                })
            )
    }
}