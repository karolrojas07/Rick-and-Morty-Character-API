import { Character, Origin } from '../models';

const endpoint = 'https://rickandmortyapi.com/graphql';

interface CharacterData {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin?: {
    id: number;
    name: string;
  };
}

async function fetchAllCharacters(): Promise<CharacterData[]> {
  const { request, gql } = await import('graphql-request');
  const allCharacters: CharacterData[] = [];
  let page = 1;

  while (true) {
    const query = gql`
      query GetCharacters($page: Int) {
        characters(page: $page) {
          info {
            next
          }
          results {
            id
            name
            status
            species
            gender
            origin {
              id
              name
            }
          }
        }
      }
    `;

    const data = await request(endpoint, query, { page });
    allCharacters.push(...data.characters.results);

    if (!data.characters.info.next) break;
    page++;
  }

  return allCharacters;
}

export async function syncCharacters(): Promise<void> {
  try {
    const characters = await fetchAllCharacters();

    for (const char of characters) {
      // Handle origin
      let originId: number | null = null;
      if (char.origin) {
        const [origin] = await Origin.upsert({
          api_id: char.origin.id,
          name: char.origin.name,
        }, { returning: true });
        originId = origin.id;
      }

      // Upsert character
      await Character.upsert({
        api_id: char.id,
        name: char.name,
        status: char.status,
        species: char.species,
        gender: char.gender,
        origin_id: originId,
      });
    }

    console.log(`Synced ${characters.length} characters from Rick and Morty API`);
  } catch (error) {
    console.error('Error syncing characters:', error);
    throw error;
  }
}