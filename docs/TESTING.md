# Testing Guide

Este documento describe la estrategia y configuración de testing para MeLi Trends.

## Stack de Testing

- **Framework**: [Vitest](https://vitest.dev/) v4.0
- **Testing Library**: [@testing-library/react](https://testing-library.com/react) v16.3
- **Entorno**: jsdom (simula DOM del navegador)
- **Cobertura**: v8 (built-in coverage provider)

## Configuración

### Archivos de Configuración

- `vitest.config.ts` - Configuración principal de Vitest
- `vitest.setup.ts` - Setup global (mocks, cleanup, env vars)

### Scripts Disponibles

```bash
# Ejecutar tests en modo watch (rerun on changes)
npm run test

# Ejecutar tests una vez (CI mode)
npm run test run

# Ver UI interactiva de tests
npm run test:ui

# Generar reporte de cobertura
npm run test:coverage

# Ejecutar todos los checks (typecheck + lint + tests)
npm run check
```

## Estructura de Tests

Los tests se ubican junto a los archivos que testean:

```
utils/
├── constants.ts
└── constants.test.ts

components/
├── TrendCard.tsx
└── TrendCard.test.tsx

hooks/
├── useTrends.ts
└── useTrends.test.ts
```

## Convenciones

### Nomenclatura

- Archivos de test: `*.test.ts` o `*.test.tsx`
- Describe blocks: Nombre del módulo/componente
- It blocks: Descripción en español de lo que debe hacer

### Ejemplo

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myModule';

describe('myFunction', () => {
  it('should return correct value', () => {
    expect(myFunction(5)).toBe(10);
  });

  it('should handle edge cases', () => {
    expect(myFunction(0)).toBe(0);
    expect(myFunction(-1)).toBe(-2);
  });
});
```

## Testing de Componentes React

### Setup Básico

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing con Mantine UI

Para componentes que usan Mantine, necesitas wrappear con MantineProvider:

```typescript
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from '@/lib/mantine-theme';

function renderWithMantine(component: React.ReactElement) {
  return render(
    <MantineProvider theme={mantineTheme}>
      {component}
    </MantineProvider>
  );
}

describe('MyMantineComponent', () => {
  it('should render with Mantine', () => {
    renderWithMantine(<MyMantineComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Testing de Hooks

Usa `@testing-library/react-hooks` (incluido en React Testing Library v16.3+):

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useTrends } from './useTrends';

describe('useTrends', () => {
  it('should fetch trends', async () => {
    const { result } = renderHook(() => useTrends('MLA'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.trends).toBeDefined();
  });
});
```

## Mocking

### Mock de fetch API

```typescript
import { vi } from 'vitest';

describe('API calls', () => {
  it('should fetch data', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test' }),
      } as Response)
    );

    const result = await fetchData();
    expect(result).toEqual({ data: 'test' });
  });
});
```

### Mock de módulos

```typescript
import { vi } from 'vitest';

vi.mock('@/utils/api', () => ({
  fetchTrends: vi.fn(() => Promise.resolve([{ keyword: 'test' }])),
}));
```

## Cobertura de Código

### Generar Reporte

```bash
npm run test:coverage
```

Esto genera:
- Reporte en consola (text)
- Reporte JSON (`coverage/coverage-final.json`)
- Reporte HTML (`coverage/index.html`)

### Ver Reporte HTML

```bash
open coverage/index.html
```

### Metas de Cobertura

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Mejores Prácticas

### ✅ DO

- Testear comportamiento, no implementación
- Usar `screen` de testing-library para queries
- Testear casos edge y errores
- Mantener tests simples y enfocados
- Usar descriptores claros en español
- Mock solo lo necesario

### ❌ DON'T

- No testear detalles de implementación
- No testear librerías externas (ya están testeadas)
- No crear tests frágiles que se rompan con cambios menores
- No ignorar warnings de testing-library
- No usar `container.querySelector` (usa `screen` queries)

## Integración con CI/CD

El script `check` corre automáticamente:

```bash
npm run check
```

Esto ejecuta:
1. Type checking (`tsc --noEmit`)
2. Linting (`eslint`)
3. Tests (`vitest run`)

Usar este comando en GitHub Actions / pre-commit hooks.

## Recursos

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mantine Testing Guide](https://mantine.dev/guides/testing/)

## Estado Actual (Actualizado: Noviembre 2024)

### Estadísticas de Cobertura

- **Total Tests**: 472 tests passing
- **Archivos Testeados**: 23 test files
- **Framework**: Vitest 4.0.13
- **MSW**: Configurado para mocking de APIs

### Cobertura por Categoría

#### ✅ Utilities (100% cubierto)
- `utils/constants.test.ts` - 16 tests
- `utils/trends.test.ts` - 45 tests
- `utils/storage.test.ts` - 22 tests
- `utils/productCategories.test.ts` - 18 tests

#### ✅ Infraestructura (100% cubierto)
- `lib/redis.test.ts` - 27 tests (cache con memory fallback)
- `lib/searchAPI.test.ts` - 39 tests (incluye CloudFront edge cases)
- `lib/logger/index.test.ts` - 3 tests
- `lib/logger/utils.test.ts` - 10 tests

#### ✅ API Routes (100% cubierto)
- `app/api/token/route.test.ts` - 26 tests (OAuth endpoint)
- `app/api/trends/[country]/route.test.ts` - 13 tests
- `app/api/categories/[country]/route.test.ts` - 13 tests
- `app/api/trends/[country]/enriched/route.test.ts` - 6 tests

#### ✅ React Hooks (100% cubierto)
- `hooks/useTrends.test.tsx` - 23 tests
- `hooks/useCategories.test.ts` - 27 tests
- `hooks/useClientEnrichedTrends.test.tsx` - 43 tests (batching & enrichment)
- `hooks/useEnrichTrendOnDemand.test.ts` - 14 tests

#### ✅ Components (Cobertura Crítica)
- `components/trends/TrendCard.test.tsx` - 17 tests
- `components/trends/EnrichedTrendCard.test.tsx` - 26 tests
- `components/common/ErrorState.test.tsx` - 29 tests
- `components/common/LoadingSkeleton.test.tsx` - 8 tests
- `components/common/ListSkeleton.test.tsx` - 22 tests
- `components/common/OverviewSkeleton.test.tsx` - 23 tests

#### ⏭️ Componentes Omitidos (demasiado complejos)
- `components/layout/Header.tsx` - Navegación compleja (país, idioma, tema)
- `components/trends/CategoryColumn.tsx` - Dynamic imports
- `components/trends/CategoryDistributionChart.tsx` - Visualización de datos

#### ✅ Test Utilities
- `test-utils/render.test.tsx` - 2 tests

### Configuración Avanzada

#### Supresión de Ruido en Output
El proyecto usa `onConsoleLog` en `vitest.config.ts` para filtrar:
- React Testing Library act() warnings (stderr)
- Logger test outputs con tag `[Test]`

```typescript
onConsoleLog(log: string, type: 'stdout' | 'stderr'): boolean | void {
  // Suppress React Testing Library act() warnings
  if (type === 'stderr' && log.includes('act(...)')) {
    return false;
  }
  // Suppress logger test outputs
  if (log.includes('[Test]')) {
    return false;
  }
  return true;
}
```

#### MSW (Mock Service Worker)
Configurado en `mocks/` para mockear:
- OAuth token endpoint
- MercadoLibre Trends API
- MercadoLibre Categories API
- Internal API routes

### Roadmap

1. [x] Setup Vitest + Testing Library
2. [x] Tests para utils (constants, trends, storage, productCategories)
3. [x] Tests para infraestructura (redis, searchAPI, logger)
4. [x] Tests para API routes (con MSW)
5. [x] Tests para hooks (useTrends, useCategories, enrichment hooks)
6. [x] Tests para componentes críticos (TrendCard, ErrorState, Skeletons)
7. [x] Configuración de supresión de ruido (onConsoleLog)
8. [ ] Tests E2E con Playwright (futuro)
9. [ ] Tests de componentes complejos (Header, CategoryColumn, Charts)
