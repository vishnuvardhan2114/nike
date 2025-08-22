# Nike Store - Next.js E-commerce App

A modern e-commerce application built with Next.js 15, TypeScript, TailwindCSS, Better Auth, Neon PostgreSQL, Drizzle ORM, and Zustand.

## 🚀 Features

- **Modern Stack**: Next.js 15 with App Router, TypeScript, TailwindCSS
- **Authentication**: Better Auth with email/password and social providers
- **Database**: Neon PostgreSQL with Drizzle ORM
- **State Management**: Zustand for client-side state
- **Responsive Design**: Mobile-first responsive design with TailwindCSS
- **Product Management**: Full CRUD operations for products
- **Shopping Cart**: Persistent cart with Zustand
- **Sample Data**: Pre-seeded with Nike products

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS v4
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM with Drizzle Kit
- **Authentication**: Better Auth
- **State Management**: Zustand
- **Icons**: Lucide React
- **Development**: ESLint, TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="your_neon_database_url_here"
   
   # Better Auth
   BETTER_AUTH_SECRET="your_secret_key_here"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional: GitHub OAuth (for social login)
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"
   ```

4. **Set up the database**
   ```bash
   # Generate database schema
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database with sample Nike products
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🗃️ Database Schema

The app includes the following main tables:

- **users**: User accounts and profiles
- **sessions**: User sessions for Better Auth
- **accounts**: OAuth account connections
- **verifications**: Email verification tokens
- **products**: Product catalog with Nike shoes

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Drizzle schema
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with sample data

## 🎨 Features Overview

### Homepage
- Hero section with Nike branding
- Featured products section
- All products grid
- Responsive design with loading states

### Product Cards
- Product images, names, descriptions, and prices
- Available sizes and colors
- Stock information
- Add to cart functionality
- Featured product badges

### Shopping Cart
- Persistent cart using Zustand
- Add/remove items
- Quantity management
- Cart total calculation
- Cart item counter in header

### Authentication (Ready to use)
- Email/password authentication
- Social login (GitHub configured)
- User sessions and profiles
- Protected routes capability

## 🚀 Deployment

### Neon Database Setup
1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env.local`

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🔧 Customization

### Adding New Products
Use the seed script as a template or add products directly through the database:

```typescript
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';

await db.insert(products).values({
  name: 'Product Name',
  description: 'Product description',
  price: '99.99',
  imageUrl: 'https://example.com/image.jpg',
  // ... other fields
});
```

### Styling
- Modify `src/app/globals.css` for global styles
- Update TailwindCSS classes in components
- Customize the color scheme and branding

### Adding New Features
- Create new components in `src/components/`
- Add new pages in `src/app/`
- Extend the database schema in `src/lib/db/schema.ts`
- Add new stores in `src/lib/store/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

If you have any questions or need help setting up the project, please open an issue or contact the maintainers.

---

**Happy coding! 🚀**