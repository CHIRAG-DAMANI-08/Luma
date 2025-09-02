# Luma - Your Mental Health Copilot

Luma is an AI-powered mental health companion that provides compassionate support and guidance. Built with Next.js, TypeScript, and modern web technologies, Luma offers a safe space for users to discuss their mental well-being.

## Features

- **Secure Authentication**: Powered by Clerk for secure user authentication
- **Personalized Chat Interface**: AI-powered chat with context awareness
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Built-in dark/light theme support
- **Privacy-Focused**: User data protection and privacy controls

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Clerk
- **Database**: (To be implemented) PostgreSQL with Prisma
- **AI**: (To be implemented) OpenAI API integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Clerk account for authentication
- (Optional) PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/luma.git
   cd luma
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/app` - Main application routes
  - `/api` - API routes
  - `/chat` - Chat interface
  - `/dashboard` - User dashboard
  - `layout.tsx` - Root layout
  - `page.tsx` - Home page
- `/components` - Reusable UI components
- `/lib` - Utility functions and configurations
- `/public` - Static assets

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

Luma is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
