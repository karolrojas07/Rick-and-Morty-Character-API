# Rick-and-Morty-Character-API

Rick and Morty Character API with search and caching.

## Pre-requirements

Make sure you have the following installed before proceeding:

- **Node.js** (version 18.x or later recommended)
- **pnpm** (version 7.x or later recommended)
- **PostgreSQL** (for persistent storage)
- **Redis** (for caching)

## Installation

1. **Clone the repository**

   ```sh
   git clone <repo-url>
   cd Rick-and-Morty-Character-API
   ```

2. **Install dependencies using pnpm**

   ```sh
   pnpm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root of your project:

   ```sh
   cp .env.example .env
   ```

4. **Create database**

<img width="360" height="353" alt="{6270D27E-89B6-4F31-A01E-3A7CE01E4A59}" src="https://github.com/user-attachments/assets/e9f0cf15-6b80-4d1a-9766-05d0eace0f81" />

```sh
pnpm run db:create
```

5. **Run migration files**

   ```sh
   pnpm run db:migrate
   ```

6. **Run seeds**

   ```sh
   pnpm run db:seed
   ```

7. **Build the project**

   ```sh
   pnpm run build
   ```

8. **Start the server**

   ```sh
   pnpm start
   ```

9. **For development (with hot-reloading)**

```sh
pnpm dev
```

The API should now be running on [http://localhost:4000](http://localhost:4000) (or your configured port).

## Using the GraphQL API to Search Characters

Once the server is running, you can access the GraphQL at POST [http://localhost:4000/graphql](http://localhost:4000/graphql).

**Example Query to Search Characters**

You can search characters using filters such as `name`, `status`, `species`, `gender`, `origin_id`, as well as pagination options `limit` and `offset`.

```graphql
query SearchCharacters {
  characters(
    name: "Rick"
    status: "Alive"
    species: "Human"
    gender: "Male"
    limit: 10
    offset: 0
  ) {
    id
    api_id
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
```

**Available fields and filters:**

- `name` (String): Filter by character name (partial match)
- `status` (String): Filter by status (`Alive`, `Dead`, etc.)
- `species` (String): Filter by species (e.g., `Human`, `Alien`)
- `gender` (String): Filter by gender
- `origin_id` (Int): Filter by origin's ID
- `limit` (Int): Number of results to return (default: 20)
- `offset` (Int): Number of results to skip (for pagination)

**Other Queries**

- Get a character by database ID:

  ```graphql
  query {
    character(id: 1) {
      id
      name
    }
  }
  ```

- Get a character by API ID:

  ```graphql
  query {
    characterByApiId(api_id: 1) {
      id
      name
    }
  }
  ```

You can interact with the API using tools like [Apollo Studio Explorer](https://studio.apollographql.com/sandbox/explorer) or any GraphQL client.
