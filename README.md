This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Drizzle ORM with Supabase Setup

This project uses Drizzle ORM with Supabase PostgreSQL. Follow these steps to set up the database connection:

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Copy the `.env.example` file to `.env.local` and fill in your Supabase credentials:

   ```
   # Database connection string (found in Supabase dashboard under Settings > Database)
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

   # Supabase project URL and anon key (found in Supabase dashboard under Settings > API)
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]
   ```

3. Run the following commands to set up and manage your database:

   ```bash
   # Generate migrations based on your schema
   npm run db:generate

   # Push schema changes directly to the database (development only)
   npm run db:push

   # Apply migrations
   npm run db:migrate

   # View and manage your database with Drizzle Studio
   npm run db:studio
   ```

4. Access the users management page at [http://localhost:3000/users](http://localhost:3000/users)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview) - learn about Drizzle ORM.
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
