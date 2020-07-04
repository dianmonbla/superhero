export const environment = {
  production: true
};

const SUPERHERO_URL_API: string = 'https://raw.githubusercontent.com/akabab/superhero-api/0.2.0/api/'

export const SUPERHERO: { [key: string]: { [key: string]: string } } = {
  RESOURCE: {
    LIST: `${SUPERHERO_URL_API}all.json`,
    ID: `${SUPERHERO_URL_API}#{ID}.json`
  }
};