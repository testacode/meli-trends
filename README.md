# MeLi Trends 📊

A modern, responsive web application to visualize trending products on MercadoLibre across Latin America.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-8-339af0)](https://mantine.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 Features

- **📈 Real-time Trends**: View the 50 most popular products across 7 Latin American countries
- **🌎 Multi-country Support**: Argentina, Brasil, Chile, México, Colombia, Uruguay, and Perú
- **📱 Mobile-First Design**: Fully responsive UI that works on all devices
- **🌓 Dark/Light Mode**: Toggle between themes for comfortable viewing
- **🔒 Secure**: Server-side authentication - no credentials exposed to the client
- **⚡ Fast**: Built with Next.js 16 and optimized for performance
- **🎨 Modern UI**: Clean interface using Mantine UI components

## 🚀 Live Demo

Visit [https://meli-trends.carlosmonti.com](https://meli-trends.carlosmonti.com)

## 🏗️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [Mantine UI 8](https://mantine.dev/)
- **Icons**: [Tabler Icons](https://tabler-icons.io/)
- **API**: [MercadoLibre Trends API](https://developers.mercadolibre.com.ar/en_us/trends)
- **Deployment**: [Vercel](https://vercel.com)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ (with npm, yarn, pnpm, or bun)
- A MercadoLibre Developer Account (optional for development)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/testacode/meli-trends.git
cd meli-trends
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your MercadoLibre credentials:

```env
# Public - Can be exposed in browser
NEXT_PUBLIC_MELI_APP_ID=your_app_id_here

# Private - Server-side only (NEVER commit this!)
MELI_CLIENT_SECRET=your_client_secret_here

# OAuth Redirect URI
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

> ⚠️ **Important**: Never commit your `.env.local` file. It's already in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Getting MercadoLibre API Credentials

To run this project, you need to create an application on MercadoLibre Developers:

1. Go to [MercadoLibre Developers](https://developers.mercadolibre.com.ar/)
2. Sign in with your MercadoLibre account
3. Navigate to **My Apps** → **Create Application**
4. Fill in the required information:
   - **Name**: Your app name (e.g., "MeLi Trends")
   - **Short Name**: A short identifier
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (for development)
5. After creating the app, you'll receive:
   - **APP_ID**: Use this for `NEXT_PUBLIC_MELI_APP_ID`
   - **CLIENT_SECRET**: Use this for `MELI_CLIENT_SECRET`

## 📁 Project Structure

```
meli-trends/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes (server-side)
│   │   ├── token/             # Token management
│   │   └── trends/[country]/  # Trends endpoint
│   ├── trends/[country]/      # Dynamic country pages
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                 # React components
│   ├── auth/                  # Authentication components
│   ├── common/                # Shared components
│   ├── layout/                # Layout components
│   └── trends/                # Trends-specific components
├── contexts/                   # React contexts
├── hooks/                      # Custom React hooks
├── lib/                        # Library configurations
├── services/                   # API services
│   └── meli/                  # MercadoLibre API client
├── types/                      # TypeScript type definitions
└── utils/                      # Utility functions
```

## 🌍 Supported Countries

| Country | Site ID | Flag |
|---------|---------|------|
| Argentina | `MLA` | 🇦🇷 |
| Brasil | `MLB` | 🇧🇷 |
| Chile | `MLC` | 🇨🇱 |
| México | `MLM` | 🇲🇽 |
| Colombia | `MCO` | 🇨🇴 |
| Uruguay | `MLU` | 🇺🇾 |
| Perú | `MPE` | 🇵🇪 |

## 🔒 Security

This project implements security best practices:

- ✅ **No credentials in code**: All sensitive data is in environment variables
- ✅ **Server-side authentication**: CLIENT_SECRET is never exposed to the client
- ✅ **Token caching**: Access tokens are cached server-side to minimize API calls
- ✅ **Public repository safe**: No sensitive data is committed to git

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
npm run check        # Run both lint and typecheck
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_MELI_APP_ID`
   - `MELI_CLIENT_SECRET`
   - `NEXT_PUBLIC_REDIRECT_URI` (use your production URL)
4. Deploy!

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Next.js:

- AWS Amplify
- Netlify
- Railway
- Fly.io
- Docker

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MercadoLibre](https://www.mercadolibre.com/) for providing the Trends API
- [Mantine](https://mantine.dev/) for the excellent UI components
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Vercel](https://vercel.com) for hosting

## 📧 Contact

Carlos Monti - [@carlosmonti](https://github.com/carlosmonti)

Project Link: [https://github.com/testacode/meli-trends](https://github.com/testacode/meli-trends)

---

Made with ❤️ by Carlos Monti
