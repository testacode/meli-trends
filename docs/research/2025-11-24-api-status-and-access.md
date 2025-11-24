# MercadoLibre APIs: Estado Actual y Proceso de Acceso - Noviembre 2025

**Fecha de investigación**: 24 de noviembre de 2025, 22:16 UTC
**Última actualización**: 24 de noviembre de 2025, 22:16 UTC

## Resumen Ejecutivo

**Estado de las APIs investigadas:**
- 🟢 **Trends API**: Funcional ✅
- 🔴 **Search API**: Bloqueada por CloudFront (403) ❌
- 🔴 **Highlights API**: Bloqueada por CloudFront (403) + sin CORS ❌

**Conclusión principal**: Las APIs de Search y Highlights **NO están deprecadas**, pero están **protegidas por CloudFront/WAF** que bloquea IPs de datacenters y no soporta CORS para llamadas client-side.

---

## 1. APIs de MercadoLibre - Estado Actual

### 1.1 Trends API ✅ FUNCIONAL

**Endpoint**: `GET https://api.mercadolibre.com/trends/{SITE_ID}`

**Estado**:
- ✅ Funciona server-side desde Vercel/AWS
- ✅ Requiere OAuth 2.0 (ya implementado)
- ✅ Sin problemas de CloudFront

**Uso actual**: Página principal de trends (`/trends/[country]`)

---

### 1.2 Search API ❌ BLOQUEADA

**Endpoint**: `GET https://api.mercadolibre.com/sites/{SITE_ID}/search?q={KEYWORD}`

**Estado actual** (confirmado 24/11/2025):
- ❌ **Server-side**: CloudFront 403 (datacenter IPs bloqueadas)
- ❌ **Client-side**: CloudFront 403 (ahora también bloqueado desde navegador)
- ⚠️ Anteriormente funcionaba client-side, ahora bloqueado completamente

**Error típico**:
```
GET https://api.mercadolibre.com/sites/MLA/search?q=samsung 403 (Forbidden)
x-cache: Error from cloudfront
```

**Impacto**:
- Enrichment de trends completamente no disponible
- Botón "+" en EnrichedTrendCard no funciona
- No se pueden obtener precios, stock, sold_quantity

**¿Está deprecada?**: NO. La API está activa pero protegida por CloudFront.

---

### 1.3 Highlights API (Best Sellers) ❌ BLOQUEADA

**Endpoint**: `GET https://api.mercadolibre.com/highlights/{SITE_ID}/category/{CATEGORY_ID}`

**Estado actual**:
- ❌ **Server-side**: CloudFront 403 (datacenter IPs bloqueadas)
- ❌ **Client-side**: CORS bloqueado (no headers de Access-Control-Allow-Origin)
- ❌ Requiere `Authorization: Bearer` header (no compatible con JSONP)

**Doble bloqueo**:
1. CloudFront bloquea requests desde datacenters (Vercel, AWS, Azure)
2. Sin CORS headers, imposible llamar desde navegador

**¿Está deprecada?**: NO. Está documentada oficialmente pero inaccesible para apps web.

**Documentación oficial**: [Best sellers in Mercado Libre](https://developers.mercadolibre.com.ar/en_us/best-sellers-in-mercado-libre)

---

## 2. ¿Por Qué Están Bloqueadas? Arquitectura CloudFront de MercadoLibre

### 2.1 Contexto Técnico

MercadoLibre procesa ~2.2 millones de requests/segundo a través de AWS CloudFront + WAF.

**Sistema de protección** (según [AWS Blog oficial](https://aws.amazon.com/blogs/architecture/mercado-libre-how-to-block-malicious-traffic-in-a-dynamic-environment/)):
- WAF crea IPSets dinámicos para bloquear tráfico malicioso
- IPs de datacenters (hosting providers) son bloqueadas automáticamente
- Diseñado para prevenir bots, scrapers, DDoS

### 2.2 Clasificación de IPs

**IPs Bloqueadas** ❌:
- AWS (Vercel, EC2, Lambda)
- Azure
- Google Cloud
- Datacenters en general

**IPs Permitidas** ✅:
- IPs residenciales (usuarios finales)
- IPs de integradores certificados (whitelisted)

### 2.3 Casos Documentados

- [GitHub Issue #9](https://github.com/mercadolibre/golang-restclient/issues/9): Confirmación de CloudFront bloqueando Search API
- [Stack Overflow](https://stackoverflow.com/questions/60098805/trying-to-get-json-from-mercadolibre-api-but-always-gets-the-same-cors-error): Confirmación de CORS bloqueado
- [Reclame Aqui (Brasil)](https://www.reclameaqui.com.br/mercado-livre/erro-403-no-cloudfront-ao-autenticar-api-do-mercado-livre_xYAVMN8KeiVUX-vV/): Usuarios reportando 403 en autenticación

---

## 3. Cómo Obtener Acceso: Developer Partner Program

### 3.1 Programa Oficial de Certificación

MercadoLibre tiene un **Developer Partner Program** para integradores certificados.

**Niveles de certificación**:
- 🥉 Bronze
- 🥈 Silver
- 🥇 Gold
- 💎 Platinum

**Beneficios de ser certificado**:
- ✅ Acceso a soporte vía ticket system
- ✅ Contacto directo con Partner Development team
- ✅ Posible whitelisting de IPs (no confirmado oficialmente)
- ✅ Prioridad en resolución de problemas

**Fuente**: [Developer Partner Program](https://developers.mercadolibre.com.ar/en_us/developer-partner-program)

### 3.2 Requisitos para Certificación

#### Requisito 1: GMV(e) - Gross Merchandise Volume
- **Definición**: Facturación mensual en dólares de usuarios activos (uso en últimos 3 meses)
- **Medición**: Por trimestre
- **Mínimo**: Variable según categoría y región (no especificado públicamente)

#### Requisito 2: Security Assessment
- **Evaluación**: Assessment de seguridad de la aplicación
- **Puntaje mínimo**: 65% o más para aprobar
- **Propósito**: Validar que la integración cumple estándares de seguridad

#### Requisito 3: Iniciativas de Desarrollo
- **Descripción**: Desarrollos mínimos requeridos asignados por Integration Expert
- **Objetivo**: Construir integración competitiva dentro del ecosistema de partners
- **Timeline**: Cumplir deadlines establecidos para medalla SILVER

#### Requisito 4: Usuarios Activos
- **Mínimo**: Al menos 2 usuarios interactuando con API resources
- **Período**: Durante los últimos 3 meses
- **Propósito**: Demostrar tracción y uso real de la integración

### 3.3 Proceso de Certificación

**Pasos generales** (basado en documentación):

1. **Registro inicial**: Crear cuenta de desarrollador en DevCenter
2. **Desarrollo de integración**: Crear aplicación usando APIs disponibles
3. **Conseguir usuarios**: Obtener 2+ usuarios activos (últimos 3 meses)
4. **Aplicar a certificación**: Enviar candidatura vía formulario
5. **Asignación de Integration Expert**: MercadoLibre asigna experto para acompañar proceso
6. **Security Assessment**: Completar evaluación de seguridad (65%+ requerido)
7. **Desarrollar iniciativas**: Implementar desarrollos mínimos requeridos
8. **Aprobación**: Certificación aprobada, medalla otorgada
9. **Regionalización** (opcional): Solicitar expansión a otros países

**Fuente**: [Developer Partner Program](https://developers.mercadolibre.com.ar/en_us/developer-partner-program)

---

## 4. Cómo Contactar Soporte de MercadoLibre

### 4.1 Soporte para Desarrolladores

**Sistema de tickets** (requiere cuenta de desarrollador):
- Acceso vía DevCenter portal
- Solo disponible para aplicaciones certificadas (según documentación)
- Contacto directo con Partner Development team

**Fuente**: [How to contact us and get support](https://global-selling.mercadolibre.com/learning-center/news/how-to-contact-us-and-get-support)

### 4.2 Soporte General

**Chat 24/7**:
- Disponible desde Help Center
- Requiere login en plataforma
- Puede no tener acceso a soporte técnico de APIs

**Email**:
- Vía sistema de tickets en Help Center
- No email directo público

### 4.3 Números de Teléfono (No oficiales para developers)

**Según terceras fuentes**:
- 🇲🇽 México: +52 554 973 7300
- 🇧🇷 Brasil: +55 11 2543 4219

⚠️ **Nota**: MercadoLibre no tiene línea de soporte telefónico oficial para developers. Todo se maneja vía portal web.

**Fuente**: [MercadoLibre Customer Service](https://mercado-libre.pissedconsumer.com/customer-service.html)

---

## 5. Causas Específicas de Error 403 (Según Docs Oficiales)

Según la [documentación oficial de error 403](https://developers.mercadolibre.com.ar/es_ar/error-403), las causas comunes incluyen:

### 5.1 Errores de Permisos y Restricciones
- Usuario inactivo
- Requests desde IPs no permitidas ⚠️ **NUESTRO CASO**
- Scopes inválidos
- Aplicación bloqueada o deshabilitada

### 5.2 Errores de Autenticación
- Redirect URL inválida (ej: `https://localhost/redirect` ya no es permitido)
- Token sin permisos para el endpoint específico
- Usuario sin completar validación de datos

### 5.3 Soluciones Recomendadas (Oficiales)

1. ✅ **Validar scopes**: Verificar en DevCenter que scopes estén correctos
2. ✅ **Verificar owner token**: Access token debe pertenecer al dueño de la información
3. ✅ **Usar URL válida**: Reemplazar localhost por URL real y accesible
4. ✅ **Validar cuenta**: Asegurar que usuario completó proceso de validación
5. ⚠️ **Whitelisting de IPs**: No mencionado explícitamente pero inferido del contexto

---

## 6. Opciones Disponibles para MeLi Trends

### Opción 1: Solicitar Certificación como Partner ⭐ RECOMENDADA

**Pasos a seguir**:

1. **Pre-requisitos**:
   - ✅ Ya tenemos aplicación funcionando (Trends API works)
   - ❌ Necesitamos 2+ usuarios activos (últimos 3 meses)
   - ❌ Necesitamos generar GMV(e) mínimo

2. **Conseguir usuarios activos**:
   - Desplegar aplicación actual (solo con Trends API)
   - Crear sistema de autenticación de usuarios (OAuth flow completo)
   - Permitir que usuarios conecten sus cuentas de MercadoLibre
   - Usar alguna funcionalidad que genere requests a API (ej: guardar trends favoritos)

3. **Aplicar a certificación**:
   - Llenar formulario de candidatura en DevCenter
   - Esperar asignación de Integration Expert
   - Completar Security Assessment

4. **Solicitar whitelisting o CORS**:
   - Una vez certificados, contactar Partner Development team
   - Solicitar explícitamente:
     - IP whitelisting para Search API
     - CORS headers para Highlights API
     - O endpoint alternativo para best sellers

**Pros**:
- ✅ Solución oficial y sostenible
- ✅ Acceso a soporte técnico
- ✅ Posible acceso a APIs protegidas
- ✅ Reconocimiento como partner oficial

**Cons**:
- ⏰ Proceso largo (semanas a meses)
- 💰 Requiere inversión de tiempo y posiblemente dinero
- 📊 Necesita usuarios activos (chicken & egg problem)
- ❓ No garantiza whitelisting de IPs (no confirmado en docs)

---

### Opción 2: Usar Solo Trends API (Estado Actual) ✅ YA IMPLEMENTADA

**Descripción**: Mantener aplicación solo con Trends API que funciona.

**Pros**:
- ✅ Ya funciona perfectamente
- ✅ Sin bloqueos de CloudFront
- ✅ No requiere certificación
- ✅ Código ya implementado y testeado

**Cons**:
- ❌ Sin enrichment de productos
- ❌ Sin métricas de precios/stock/ventas
- ❌ Solo keywords, sin productos reales
- ❌ Sin best sellers rankings

**Estado actual**: Implementado en `/trends/[country]`

---

### Opción 3: Usar Datos Públicos + Web Scraping ⚠️ NO RECOMENDADA

**Descripción**: Scraping de páginas públicas de MercadoLibre (ej: www.mercadolibre.com.ar/mas-vendidos)

**Pros**:
- ✅ No requiere certificación
- ✅ Acceso a datos de best sellers

**Cons**:
- ❌ Contra términos de servicio de MercadoLibre
- ❌ Legalmente riesgoso
- ❌ Técnicamente frágil (cambios en HTML rompen scraper)
- ❌ Puede resultar en bloqueo de IP permanente
- ❌ Poco ético

**Recomendación**: NO implementar

---

### Opción 4: Usar API de Terceros (Nubimetrics) 💰 PAGO

**Descripción**: Usar servicios comerciales como [Nubimetrics](https://www.nubimetrics.com/) que tienen acceso a datos de MercadoLibre.

**Pros**:
- ✅ Acceso inmediato
- ✅ Datos de ventas y analytics
- ✅ Sin problemas de CloudFront
- ✅ API confiable y documentada

**Cons**:
- 💰 Servicio pago (pricing no público)
- 🔒 Dependencia de tercero
- ❓ No es API oficial de MercadoLibre
- ❓ Calidad y actualización de datos no garantizada

**Recomendación**: Evaluar si hay budget disponible

---

## 7. Recomendaciones Finales

### 7.1 Corto Plazo (Implementar Ya)

1. ✅ **Mantener Trends API funcionando** (ya está)
2. ✅ **Documentar limitaciones claramente** en UI (ya hecho en Beta Testing menu)
3. ✅ **Enfocarse en UX con datos disponibles** (trends keywords)

### 7.2 Mediano Plazo (1-3 meses)

1. 🎯 **Agregar autenticación de usuarios**:
   - Implementar OAuth flow completo
   - Permitir login con cuenta MercadoLibre
   - Guardar trends favoritos por usuario
   - **Objetivo**: Conseguir 2+ usuarios activos para certificación

2. 🎯 **Preparar aplicación para certificación**:
   - Implementar mejores prácticas de seguridad
   - Preparar para Security Assessment
   - Documentar uso de APIs

3. 🎯 **Aplicar a Developer Partner Program**:
   - Llenar formulario de candidatura
   - Contactar Integration Expert
   - Completar requisitos de certificación

### 7.3 Largo Plazo (3-6 meses)

1. 🎯 **Obtener certificación Silver+**
2. 🎯 **Solicitar whitelisting de IPs o CORS support**
3. 🎯 **Implementar Highlights API si acceso es concedido**
4. 🎯 **Expandir features de enrichment con Search API**

---

## 8. Próximos Pasos Concretos

### Paso 1: Decidir Estrategia

**Opción A - Certificación (Recomendada)**:
- Compromiso: 3-6 meses de desarrollo
- Inversión: Tiempo + posiblemente $$ (si certificación tiene costo)
- Resultado: Acceso sostenible y oficial

**Opción B - Status Quo**:
- Compromiso: Ninguno
- Inversión: Ninguna
- Resultado: App funcional pero limitada a Trends API

**Opción C - Terceros (Nubimetrics)**:
- Compromiso: Integración (2-4 semanas)
- Inversión: Suscripción mensual
- Resultado: Acceso inmediato pero con costo recurrente

### Paso 2: Si Elegimos Certificación

1. **Implementar autenticación de usuarios** (prioritario):
   ```typescript
   // Agregar OAuth flow completo
   // Permitir login con MercadoLibre
   // Guardar preferencias de usuario en DB
   ```

2. **Crear features que generen API requests**:
   - Favoritos de trends
   - Notificaciones de cambios
   - Historial de búsquedas
   - Dashboard personalizado

3. **Conseguir usuarios beta**:
   - Invitar a amigos/colegas
   - Publicar en redes (Twitter, LinkedIn)
   - Crear landing page explicando features
   - Objetivo: 2+ usuarios activos por 3 meses

4. **Aplicar a certificación**:
   - Una vez tengamos usuarios, aplicar oficialmente
   - Contactar Integration Expert
   - Completar Security Assessment

### Paso 3: Contactar Soporte (Una Vez Certificados)

**Email a enviar** (template):

```
Asunto: Solicitud de acceso a Search API y Highlights API - Aplicación certificada

Hola equipo de MercadoLibre Developer Relations,

Somos developers de MeLi Trends, una aplicación certificada en el Developer Partner Program (ID: XXX).

Nuestra aplicación ayuda a sellers y marketers a descubrir tendencias de productos en MercadoLibre usando la Trends API.

Queremos expandir funcionalidad para incluir:
1. Enrichment de trends con datos de productos (Search API)
2. Rankings de best sellers por categoría (Highlights API)

Problema actual:
- Search API retorna 403 (CloudFront blocking) desde nuestros servers Vercel
- Highlights API sin CORS headers para llamadas client-side

Solicitud:
1. IP whitelisting para Search API (IP: XXX.XXX.XXX.XXX)
2. CORS support para Highlights API
3. O endpoint alternativo que permita acceso a estos datos

¿Podrían asistirnos con este tema?

Gracias,
[Tu nombre]
[Email]
[Aplicación ID]
```

---

## 9. Referencias y Fuentes

### Documentación Oficial
- [Best sellers in Mercado Libre](https://developers.mercadolibre.com.ar/en_us/best-sellers-in-mercado-libre)
- [Developer Partner Program](https://developers.mercadolibre.com.ar/en_us/developer-partner-program)
- [Items and Searches API](https://developers.mercadolibre.com.ar/en_us/items-and-searches)
- [Error 403 Documentation](https://developers.mercadolibre.com.ar/es_ar/error-403)

### Arquitectura y Bloqueo
- [MercadoLibre CloudFront Architecture (AWS Blog)](https://aws.amazon.com/blogs/architecture/mercado-libre-how-to-block-malicious-traffic-in-a-dynamic-environment/)
- [CloudFront 403 Issue (GitHub)](https://github.com/mercadolibre/golang-restclient/issues/9)
- [CORS Limitation (Stack Overflow)](https://stackoverflow.com/questions/60098805/trying-to-get-json-from-mercadolibre-api-but-always-gets-the-same-cors-error)

### Soporte y Contacto
- [How to contact MercadoLibre Support](https://global-selling.mercadolibre.com/learning-center/news/how-to-contact-us-and-get-support)
- [MercadoLibre Customer Service](https://mercado-libre.pissedconsumer.com/customer-service.html)

### Certificación
- [Developer Partner Program Details](https://global-selling.mercadolibre.com/devsite/developer-partner-program-global-selling)
- [API Integration Guides](https://rollout.com/integration-guides/mercado-libre/api-essentials)

---

## Conclusión

**Las APIs de Search y Highlights NO están deprecadas**, pero están **intencionalmente protegidas** por CloudFront/WAF de MercadoLibre para prevenir abuso.

**Para obtener acceso**, el camino oficial es:
1. ✅ Conseguir usuarios activos (2+ por 3 meses)
2. ✅ Aplicar a Developer Partner Program
3. ✅ Obtener certificación (Bronze/Silver/Gold)
4. ✅ Solicitar whitelisting o CORS support a Partner Development team

**Alternativas**:
- Mantener status quo (solo Trends API)
- Usar servicios de terceros (Nubimetrics, $$$)
- Esperar a que MercadoLibre abra acceso público (poco probable)

**Decisión recomendada**: Invertir en certificación si hay interés en usar la app comercialmente. Si es proyecto personal/académico, mantener solo Trends API.
