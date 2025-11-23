# MeLi Trends 📊

Una aplicación web moderna y responsiva para visualizar productos en tendencia de MercadoLibre en toda Latinoamérica.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Mantine](https://img.shields.io/badge/Mantine-8-339af0)](https://mantine.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🌟 Características

- **📈 Trends en Tiempo Real**: Ve los 50 productos más populares en 7 países de Latinoamérica
- **🏷️ Clasificación Automática**: Trends clasificados en 3 tipos (Fastest-Growing, Most Wanted, Most Popular) con badges de color
- **📂 Filtrado por Categorías**: Filtra trends por categorías específicas para encontrar nichos de mercado
- **🌎 Soporte Multi-país**: Argentina, Brasil, Chile, México, Colombia, Uruguay y Perú
- **📱 Diseño Mobile-First**: UI completamente responsiva que funciona en todos los dispositivos
- **🌓 Modo Oscuro/Claro**: Alterna entre temas para una visualización cómoda
- **🔒 Seguro**: Autenticación server-side - sin credenciales expuestas al cliente
- **⚡ Rápido**: Construido con Next.js 16 y optimizado para performance
- **🎨 UI Moderna**: Interfaz limpia usando componentes Mantine UI
- **📱 PWA**: Instalable como aplicación nativa en dispositivos móviles
- **🔍 SEO Optimizado**: Open Graph, Twitter Cards, sitemap.xml y robots.txt
- **ℹ️ Página de Ayuda**: Guía completa sobre trends y estrategias de negocio

## 🚀 Demo en Vivo

Visita [https://meli-trends.carlosmonti.com](https://meli-trends.carlosmonti.com)

## 🏗️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Library**: [Mantine UI 8](https://mantine.dev/)
- **Iconos**: [Tabler Icons](https://tabler-icons.io/)
- **API**: [MercadoLibre Trends API](https://developers.mercadolibre.com.ar/en_us/trends)
- **Deployment**: [Vercel](https://vercel.com)

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js 20+ (con npm, yarn, pnpm o bun)
- Una cuenta de MercadoLibre Developer

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/testacode/meli-trends.git
cd meli-trends
```

### 2. Usar la versión correcta de Node.js

Si usas nvm (Node Version Manager):

```bash
nvm use
# Automáticamente usará Node.js 20 desde .nvmrc
```

### 3. Instalar dependencias

```bash
npm install
# o
yarn install
# o
pnpm install
```

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Luego edita `.env.local` con tus credenciales de MercadoLibre:

```env
# Público - Puede exponerse en el navegador
NEXT_PUBLIC_MELI_APP_ID=your_app_id_here

# Privado - Solo server-side (¡NUNCA lo commitees!)
MELI_CLIENT_SECRET=your_client_secret_here

# OAuth Redirect URI
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

> ⚠️ **Importante**: Nunca commitees tu archivo `.env.local`. Ya está en `.gitignore`.

### 5. Ejecutar el servidor de desarrollo

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🔑 Obtener Credenciales de la API de MercadoLibre

Para ejecutar este proyecto, necesitas crear una aplicación en MercadoLibre Developers:

1. Ve a [MercadoLibre Developers](https://developers.mercadolibre.com.ar/)
2. Inicia sesión con tu cuenta de MercadoLibre
3. Navega a **Mis Aplicaciones** → **Crear Aplicación**
4. Completa la información requerida:
   - **Nombre**: Nombre de tu app (ej: "MeLi Trends")
   - **Nombre corto**: Un identificador corto
   - **Redirect URI**: `http://localhost:3000/api/auth/callback` (para desarrollo)
5. Después de crear la app, recibirás:
   - **APP_ID**: Úsalo para `NEXT_PUBLIC_MELI_APP_ID`
   - **CLIENT_SECRET**: Úsalo para `MELI_CLIENT_SECRET`

## 📁 Estructura del Proyecto

```
meli-trends/
├── app/                        # Next.js App Router
│   ├── about/                 # Página de ayuda e información
│   │   ├── layout.tsx         # Layout con metadata
│   │   └── page.tsx           # Página about
│   ├── api/                   # API routes (server-side)
│   │   ├── categories/[country]/ # Endpoint de categorías
│   │   ├── token/            # Gestión de tokens
│   │   ├── trends/[country]/ # Endpoint de trends
│   │   └── trends/[country]/[category]/ # Trends por categoría
│   ├── trends/[country]/     # Páginas dinámicas por país
│   │   ├── metadata.ts       # Metadata dinámica por país
│   │   └── page.tsx          # Página de trends
│   ├── layout.tsx            # Layout root con SEO
│   ├── page.tsx              # Home page
│   ├── manifest.ts           # PWA manifest
│   └── sitemap.ts            # Sitemap dinámico
├── components/                # Componentes React
│   ├── common/               # Componentes compartidos
│   ├── layout/               # Componentes de layout
│   │   └── Header.tsx        # Header con navegación
│   └── trends/               # Componentes de trends
│       ├── TrendCard.tsx     # Card de trend individual
│       └── TrendsList.tsx    # Lista de trends
├── contexts/                  # Contexts de React
│   └── AuthContext.tsx       # Context de autenticación
├── hooks/                     # Custom React hooks
│   └── useTrends.ts          # Hook para fetch trends
├── lib/                       # Configuraciones de librerías
│   └── mantine-theme.ts      # Tema de Mantine
├── public/                    # Archivos estáticos
│   └── robots.txt            # Configuración de crawlers
├── types/                     # Definiciones TypeScript
│   └── meli.ts               # Tipos de MercadoLibre API
├── utils/                     # Funciones utilitarias
│   ├── constants.ts          # Constantes y países
│   └── trends.ts             # Utilidades de trends (clasificación)
└── docs/                      # Documentación
    ├── architecture/         # Documentación de arquitectura
    │   └── api-cloudfront-blocking.md # Guía de CloudFront y API
    ├── authentication/       # Docs de autenticación
    └── SECURITY_AUDIT_REPORT.md # Reporte de auditoría
```

## 🌍 Países Soportados

| País | Site ID | Bandera | Currency |
|------|---------|---------|----------|
| Argentina | `MLA` | 🇦🇷 | ARS |
| Brasil | `MLB` | 🇧🇷 | BRL |
| Chile | `MLC` | 🇨🇱 | CLP |
| México | `MLM` | 🇲🇽 | MXN |
| Colombia | `MCO` | 🇨🇴 | COP |
| Uruguay | `MLU` | 🇺🇾 | UYU |
| Perú | `MPE` | 🇵🇪 | PEN |

## 🔒 Seguridad

Este proyecto implementa las mejores prácticas de seguridad:

- ✅ **Sin credenciales en el código**: Todos los datos sensibles están en variables de entorno
- ✅ **Autenticación server-side**: CLIENT_SECRET nunca se expone al cliente
- ✅ **Token caching**: Los access tokens se cachean server-side para minimizar llamadas a la API
- ✅ **Repositorio público seguro**: No hay datos sensibles commiteados en git
- ✅ **Auditoría completa**: Ver [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)
- ✅ **Variables de entorno validadas**: Verificación en tiempo de ejecución
- ✅ **HTTPS en producción**: Obligatorio para OAuth

### Auditoría de Seguridad

Se realizó una auditoría completa de seguridad (2025-11-23):
- **Puntuación**: 9.3/10 ⭐⭐⭐⭐⭐
- **Vulnerabilidades**: 0 activas
- **Reporte completo**: [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)

## 📱 PWA (Progressive Web App)

La aplicación es instalable en dispositivos móviles:

1. Visita el sitio en tu móvil
2. Tap en "Agregar a pantalla de inicio" (iOS) o "Instalar app" (Android)
3. Úsala como una app nativa

Configuración en `app/manifest.ts`

## 🔍 SEO y Metadata

### Open Graph y Twitter Cards

Todas las páginas incluyen metadata completa para compartir en redes sociales:
- Facebook
- Twitter/X
- WhatsApp
- LinkedIn

### Sitemap.xml

Sitemap dinámico generado automáticamente:
- URL: `https://meli-trends.carlosmonti.com/sitemap.xml`
- Incluye todas las páginas de países
- Actualizado automáticamente

### robots.txt

Control de crawlers:
- Permite indexación de Google/Bing
- Bloquea `/api/*` (no necesario indexar)

### Metadata Dinámica

Cada página de país tiene metadata específica:
- Title: "Tendencias en Argentina 🇦🇷 | MeLi Trends"
- Description personalizada
- Open Graph images (próximamente)

## 🧪 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Build para producción
npm run start        # Iniciar servidor de producción

# Calidad de Código
npm run lint         # Ejecutar ESLint
npm run typecheck    # Verificar tipos TypeScript
npm run check        # Ejecutar typecheck + lint + tests

# Testing
npm run test         # Ejecutar tests con Vitest
npm run test:ui      # Ejecutar tests con UI interactiva
npm run test:coverage # Ejecutar tests con coverage report
```

## 🚀 Deployment

### Vercel (Recomendado)

1. Push tu código a GitHub
2. Importa el proyecto en [Vercel](https://vercel.com)
3. Agrega las variables de entorno:
   - `NEXT_PUBLIC_MELI_APP_ID`
   - `MELI_CLIENT_SECRET`
   - `NEXT_PUBLIC_REDIRECT_URI` (usa tu URL de producción)
4. ¡Deploy!

**Post-deployment:**
- Actualiza el Redirect URI en tu app de MercadoLibre con la URL de producción
- Verifica el sitemap en Google Search Console
- Prueba Open Graph con [Facebook Debugger](https://developers.facebook.com/tools/debug/)

### Otras Plataformas

Esta es una aplicación Next.js estándar y puede deployarse en cualquier plataforma compatible:

- AWS Amplify
- Netlify
- Railway
- Fly.io
- Docker

## 📊 API de MercadoLibre Trends

### Endpoints

```
GET https://api.mercadolibre.com/trends/{SITE_ID}
GET https://api.mercadolibre.com/trends/{SITE_ID}/{CATEGORY_ID}
GET https://api.mercadolibre.com/sites/{SITE_ID}/categories
```

### Tipos de Trends (Clasificación Automática)

Los 50 trends se clasifican automáticamente según su posición en el array:

1. **🔴 Fastest-Growing** (posiciones 1-10): Productos con mayor aumento de revenue en la última semana
2. **🔵 Most Wanted** (posiciones 11-30): Mayor volumen de búsquedas durante la última semana
3. **🟢 Most Popular** (posiciones 31-50): Mayor aumento de búsquedas vs. hace 2 semanas

**Visualización**: Cada trend card muestra un badge de color indicando su tipo, permitiendo identificar rápidamente oportunidades de negocio.

### Response Format

```json
[
  {
    "keyword": "iphone 15 pro max",
    "url": "https://listado.mercadolibre.com.ar/iphone-15-pro-max"
  }
]
```

### Limitaciones

- Actualización: Semanal
- Cantidad: 50 productos por país
- Autenticación: Requerida (OAuth 2.0)

## 🎨 Personalización

### Tema

El tema de Mantine puede personalizarse en `lib/mantine-theme.ts`:

```typescript
export const mantineTheme = createTheme({
  colors: {
    meliBlue: [...],
    meliYellow: [...],
  },
  // ...
});
```

### Países

Para agregar/modificar países, edita `utils/constants.ts`:

```typescript
export const COUNTRIES: Record<SiteId, Country> = {
  MLA: {
    id: 'MLA',
    name: 'Argentina',
    flag: '🇦🇷',
    currency: 'ARS',
  },
  // ...
};
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. Fork el repositorio
2. Crea una rama de feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guías de Contribución

- Usa TypeScript para todo el código nuevo
- Sigue las convenciones de código existentes
- Escribe tests si es posible
- Actualiza la documentación si es necesario
- Ejecuta `npm run check` antes de commitear

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [MercadoLibre](https://www.mercadolibre.com/) por proveer la Trends API
- [Mantine](https://mantine.dev/) por los excelentes componentes UI
- [Next.js](https://nextjs.org/) por el increíble framework React
- [Vercel](https://vercel.com) por el hosting

## 📧 Contacto

Carlos Monti - [@carlosmonti](https://github.com/carlosmonti)

Project Link: [https://github.com/testacode/meli-trends](https://github.com/testacode/meli-trends)

---

**Nota Legal**: Esta aplicación no está afiliada ni respaldada oficialmente por MercadoLibre. Usa la API pública de MercadoLibre según sus [términos de uso](https://developers.mercadolibre.com.ar/en_us/terms-and-conditions).

---

Hecho con ❤️ por Carlos Monti
