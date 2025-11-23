# Plan de Implementación: OAuth 2.0 Flow para MercadoLibre

**Fecha:** 2025-11-22
**Categoría:** Authentication
**Objetivo:** Implementar flujo OAuth completo para que usuarios obtengan access tokens automáticamente

---

## 📋 Resumen Ejecutivo

Actualmente, los usuarios deben pegar manualmente su access token de MercadoLibre. Este plan implementa el flujo OAuth 2.0 Authorization Code Grant completo para automatizar el proceso y mejorar la UX.

### Beneficios:
- ✅ **UX mejorada**: Usuario solo hace clic en "Conectar con MercadoLibre"
- ✅ **Seguridad**: CLIENT_SECRET nunca se expone al cliente
- ✅ **Tokens de larga duración**: Refresh tokens para renovación automática
- ✅ **Profesional**: Flujo estándar OAuth como cualquier app moderna

---

## 🔐 Flujo OAuth 2.0 - MercadoLibre

### Diagrama de Flujo

```
┌─────────┐                                          ┌──────────────┐
│         │  1. Click "Conectar"                     │              │
│  User   │─────────────────────────────────────────>│  Next.js App │
│         │                                          │              │
└─────────┘                                          └──────┬───────┘
     ▲                                                      │
     │                                                      │ 2. Redirect to
     │                                                      │    MercadoLibre Auth
     │                                                      ▼
     │                                          ┌──────────────────────┐
     │ 3. User authorizes                       │   MercadoLibre      │
     │    & redirects back                      │   Authorization     │
     │    with CODE                             │   Server            │
     │                                          └──────────┬───────────┘
     │                                                     │
     │                                                     │
┌────┴──────┐                                             │
│           │ 4. Callback with CODE                       │
│  Callback │<────────────────────────────────────────────┘
│  Route    │
│ (API)     │
└─────┬─────┘
      │
      │ 5. Exchange CODE for TOKEN
      │    POST /oauth/token
      │    (using CLIENT_SECRET server-side)
      ▼
┌──────────────────────┐
│   MercadoLibre       │
│   Token Endpoint     │
└─────┬────────────────┘
      │
      │ 6. Return ACCESS_TOKEN + REFRESH_TOKEN
      ▼
┌─────────────┐
│  API Route  │
│  Returns    │──> 7. Save to localStorage
│  Token      │
└─────────────┘
```

---

## 🏗️ Arquitectura de la Solución

### Componentes a Crear/Modificar

#### **1. Variables de Entorno (`.env.local`)**

```env
# MercadoLibre OAuth Credentials
NEXT_PUBLIC_MELI_APP_ID=8365283660980845
MELI_CLIENT_SECRET=aE3RiCcBoYSCwW9ovyOjrBU4ElnOFC9W

# OAuth Redirect URI (debe coincidir EXACTAMENTE con la config en MercadoLibre)
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Para producción
# NEXT_PUBLIC_REDIRECT_URI=https://tu-dominio.com/api/auth/callback
```

**⚠️ IMPORTANTE:**
- `NEXT_PUBLIC_*` = accesible en el cliente
- Sin prefijo = solo accesible en el servidor
- `CLIENT_SECRET` NUNCA debe tener el prefijo `NEXT_PUBLIC_`

---

#### **2. API Route: Login (`app/api/auth/login/route.ts`)**

**Responsabilidad:** Redirigir al usuario a la página de autorización de MercadoLibre

**Endpoint:** `GET /api/auth/login`

**Implementación:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const appId = process.env.NEXT_PUBLIC_MELI_APP_ID;
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Build authorization URL
  const authUrl = new URL('https://auth.mercadolibre.com.ar/authorization');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', appId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);

  // Optional: Store state in cookie for validation
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  return response;
}
```

**Parámetros de la URL de autorización:**
- `response_type=code` - Tipo de flujo (authorization code)
- `client_id` - Tu APP_ID
- `redirect_uri` - URL de callback (DEBE ser exacta a la configurada)
- `state` - Token para prevenir CSRF attacks

---

#### **3. API Route: Callback (`app/api/auth/callback/route.ts`)**

**Responsabilidad:** Recibir el código de autorización y canjearlo por un access token

**Endpoint:** `GET /api/auth/callback?code=XXX&state=YYY`

**Implementación:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Check for errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/?error=${error}`, request.url)
    );
  }

  // Validate state (CSRF protection)
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      new URL('/?error=invalid_state', request.url)
    );
  }

  // Exchange code for token
  try {
    const tokenResponse = await fetch(
      'https://api.mercadolibre.com/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.NEXT_PUBLIC_MELI_APP_ID!,
          client_secret: process.env.MELI_CLIENT_SECRET!,
          code: code!,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI!,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();

    // Redirect to client with token data
    const redirectUrl = new URL('/', request.url);
    redirectUrl.searchParams.set('access_token', tokenData.access_token);
    redirectUrl.searchParams.set('refresh_token', tokenData.refresh_token);
    redirectUrl.searchParams.set('expires_in', tokenData.expires_in);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(
      new URL('/?error=token_exchange_failed', request.url)
    );
  }
}
```

**Parámetros del POST a `/oauth/token`:**
- `grant_type=authorization_code` - Tipo de grant
- `client_id` - Tu APP_ID
- `client_secret` - Tu CLIENT_SECRET (server-side only!)
- `code` - Código recibido de MercadoLibre
- `redirect_uri` - DEBE ser exacta a la usada en el paso anterior

**Respuesta esperada:**
```json
{
  "access_token": "APP_USR-xxxxxxxxxx-xxxxxx-xxxxxxxxxx",
  "token_type": "bearer",
  "expires_in": 21600,
  "scope": "offline_access read write",
  "user_id": 123456789,
  "refresh_token": "TG-xxxxxxxxxx-xxxxxx-xxxxxxxxxx"
}
```

---

#### **4. API Route: Refresh Token (`app/api/auth/refresh/route.ts`)**

**Responsabilidad:** Renovar el access token cuando expire

**Endpoint:** `POST /api/auth/refresh`

**Implementación:**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const refreshToken = body.refresh_token;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'refresh_token required' },
      { status: 400 }
    );
  }

  try {
    const tokenResponse = await fetch(
      'https://api.mercadolibre.com/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.NEXT_PUBLIC_MELI_APP_ID!,
          client_secret: process.env.MELI_CLIENT_SECRET!,
          refresh_token: refreshToken,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Token refresh failed');
    }

    const tokenData = await tokenResponse.json();

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
```

---

#### **5. Actualizar `TokenModal.tsx`**

**Cambios necesarios:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// ... otros imports

export function TokenModal({ opened, onClose }: TokenModalProps) {
  const { setToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  // Handle OAuth callback
  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const expiresIn = searchParams.get('expires_in');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`Error de autenticación: ${errorParam}`);
      return;
    }

    if (accessToken && refreshToken) {
      // Save both tokens
      setToken(accessToken, refreshToken, parseInt(expiresIn || '21600'));

      // Clear URL params
      router.replace('/');

      // Close modal
      if (onClose) onClose();
    }
  }, [searchParams, setToken, router, onClose]);

  const handleOAuthLogin = () => {
    // Redirect to OAuth login endpoint
    window.location.href = '/api/auth/login';
  };

  return (
    <Modal {...}>
      {/* ... existing content ... */}

      {/* Add OAuth button */}
      <Button
        onClick={handleOAuthLogin}
        fullWidth
        size="lg"
        color="meliBlue"
        leftSection={<IconBrandMercadoLibre />}
      >
        Conectar con MercadoLibre
      </Button>

      <Divider label="o" labelPosition="center" my="md" />

      {/* Keep existing manual token input as fallback */}
      <TextInput
        label="Access Token (manual)"
        // ... resto del código existente
      />
    </Modal>
  );
}
```

---

#### **6. Actualizar `AuthContext.tsx`**

**Agregar soporte para refresh tokens:**

```typescript
interface AuthTokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: number;
  createdAt: number;
}

// Agregar método setToken actualizado
const setToken = useCallback((
  newToken: string,
  refreshToken?: string,
  expiresIn?: number
) => {
  const now = Date.now();
  const expiresAt = expiresIn
    ? now + (expiresIn * 1000)
    : now + TOKEN_EXPIRATION_MS;

  const data: AuthTokenData = {
    token: newToken,
    refreshToken,
    createdAt: now,
    expiresAt,
  };

  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(data));
  setTokenState(newToken);
  setTokenExpiry(expiresAt);
}, []);

// Agregar método para refresh automático
const refreshAccessToken = useCallback(async () => {
  const stored = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!stored) return false;

  const data: AuthTokenData = JSON.parse(stored);
  if (!data.refreshToken) return false;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: data.refreshToken }),
    });

    if (!response.ok) throw new Error('Refresh failed');

    const tokenData = await response.json();
    setToken(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in
    );

    return true;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearToken();
    return false;
  }
}, [setToken, clearToken]);
```

---

## 🔒 Consideraciones de Seguridad

### 1. **State Parameter (CSRF Protection)**
- Generar un `state` único por cada request
- Guardarlo en una cookie httpOnly
- Validarlo en el callback

### 2. **CLIENT_SECRET Protection**
- ✅ NUNCA exponer en el cliente
- ✅ Solo usar en API routes (server-side)
- ✅ No commitear en git (usar .env.local)

### 3. **Redirect URI Validation**
- Debe ser EXACTA a la configurada en MercadoLibre
- No puede contener parámetros variables
- Usar `state` para pasar información adicional

### 4. **Token Storage**
- Access token: localStorage (expira en 6 horas)
- Refresh token: localStorage (one-time use)
- Considerar usar httpOnly cookies para mayor seguridad (requiere backend)

### 5. **HTTPS en Producción**
- OAuth requiere HTTPS en producción
- Cookies con flag `secure: true`

---

## 📝 Configuración en MercadoLibre Developers

### Pasos para configurar la app:

1. Ir a [developers.mercadolibre.com.ar](https://developers.mercadolibre.com.ar)
2. Acceder a tu aplicación (APP_ID: 8365283660980845)
3. Configurar **Redirect URI**:
   - Desarrollo: `http://localhost:3000/api/auth/callback`
   - Producción: `https://tu-dominio.com/api/auth/callback`
4. Guardar cambios

**⚠️ CRÍTICO:** La URL debe ser EXACTA. Sin trailing slash, sin parámetros.

---

## 📦 Archivos a Crear/Modificar

### Nuevos Archivos:

```
app/api/auth/
├── login/
│   └── route.ts          # Inicia OAuth flow
├── callback/
│   └── route.ts          # Maneja callback y obtiene token
└── refresh/
    └── route.ts          # Renueva access token
```

### Archivos a Modificar:

```
.env.local                       # Agregar credenciales
.env.example                     # Actualizar template
components/auth/TokenModal.tsx   # Agregar botón OAuth
contexts/AuthContext.tsx         # Agregar refresh token support
types/meli.ts                    # Agregar tipos para OAuth response
```

---

## 🧪 Plan de Testing

### Tests Manuales:

1. **Happy Path:**
   - [ ] Click en "Conectar con MercadoLibre"
   - [ ] Redirige a MercadoLibre auth
   - [ ] Usuario autoriza
   - [ ] Redirige de vuelta
   - [ ] Token se guarda automáticamente
   - [ ] Usuario ve trends

2. **Error Handling:**
   - [ ] Usuario rechaza autorización
   - [ ] State inválido (CSRF)
   - [ ] Código expirado
   - [ ] Client secret incorrecto
   - [ ] Network error

3. **Token Refresh:**
   - [ ] Token expira después de 6 horas
   - [ ] Refresh automático funciona
   - [ ] Refresh falla → volver a login

---

## 🚀 Orden de Implementación

### Fase 1: Setup (15 min)
1. Crear `.env.local` con credenciales
2. Actualizar `.env.example`
3. Configurar Redirect URI en MercadoLibre

### Fase 2: API Routes (30 min)
1. Crear `app/api/auth/login/route.ts`
2. Crear `app/api/auth/callback/route.ts`
3. Crear `app/api/auth/refresh/route.ts`

### Fase 3: Frontend (20 min)
1. Actualizar `AuthContext.tsx`
2. Actualizar `TokenModal.tsx`
3. Agregar tipos en `types/meli.ts`

### Fase 4: Testing (15 min)
1. Test manual del flujo completo
2. Verificar error handling
3. Verificar refresh token

**Tiempo total estimado:** ~1.5 horas

---

## 🎯 Resultado Final

### UX Mejorada:

**Antes:**
```
Usuario → Copia token manualmente → Pega en modal → Click conectar
```

**Después:**
```
Usuario → Click "Conectar con MercadoLibre" → Autoriza → ✨ Listo!
```

### Ventajas:

- ✅ Más profesional
- ✅ Más seguro (CLIENT_SECRET protegido)
- ✅ Tokens de larga duración (refresh automático)
- ✅ Menos fricción para el usuario
- ✅ Experiencia similar a "Login with Google/Facebook"

---

## 📚 Referencias

- [MercadoLibre Authentication Docs](https://developers.mercadolibre.com.ar/en_us/authentication-and-authorization)
- [OAuth 2.0 Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [MercadoLibre Token Best Practices](https://global-selling.mercadolibre.com/devsite/authorization-and-token-best-practices)

---

## ❓ Preguntas Pendientes

1. ¿Querés mantener la opción de pegar token manualmente como fallback?
2. ¿Usamos cookies httpOnly para los tokens (más seguro pero requiere más setup)?
3. ¿Implementamos logout completo (revocar token en MercadoLibre)?
4. ¿Agregamos analytics para trackear conversión del OAuth flow?

---

**Status:** 📋 Plan completo - Listo para implementar
**Next Step:** Revisar plan y confirmar para empezar implementación
