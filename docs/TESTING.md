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

## Estado Actual

### Cobertura Actual

- ✅ `utils/constants.ts` - 100% (16 tests)
- 🔄 Próximos: hooks, components, API routes

### Roadmap

1. [x] Setup Vitest
2. [x] Tests para utils/constants
3. [ ] Tests para hooks/useTrends
4. [ ] Tests para components/TrendCard
5. [ ] Tests para API routes (con MSW)
6. [ ] Integration tests
