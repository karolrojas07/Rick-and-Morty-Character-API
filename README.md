# Rick-and-Morty-Character-API

Rick and Morty Character API with search and caching.

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

The API should now be running on [http://localhost:3000](http://localhost:3000) (or your configured port).
