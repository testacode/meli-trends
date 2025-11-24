# MercadoLibre Sales API Research - November 2025

## Objective

Research MercadoLibre APIs to obtain **real sales data** (products most sold) by country, beyond the existing Trends API (which provides search trends, not sales data).

## Current Status

The project currently uses:
- ✅ **Trends API**: Keywords for most searched, fastest-growing, and most popular products
- ✅ **Search API**: Product enrichment with prices, availability, and estimated metrics

**Gap**: No direct access to actual sales volume data or official "best sellers" rankings.

---

## Key Findings

### 1. Highlights API - Best Sellers Endpoint ⭐ RECOMMENDED

MercadoLibre provides an official `/highlights` API endpoint that returns **top 20 best-selling products**.

**Endpoint Structure:**
```
GET https://api.mercadolibre.com/highlights/{SITE_ID}/category/{CATEGORY_ID}
Authorization: Bearer $ACCESS_TOKEN
```

**Query Variants:**
- By category: `/highlights/{SITE_ID}/category/{CATEGORY_ID}`
- By brand within category: `/highlights/{SITE_ID}/category/{CATEGORY_ID}?attribute_name=BRAND&attribute_value={VALUE}`
- By product: `/highlights/{SITE_ID}/product/{PRODUCT_ID}`
- By item: `/highlights/{SITE_ID}/item/{ITEM_ID}`

**Example Request:**
```bash
curl -X GET \
  -H 'Authorization: Bearer $ACCESS_TOKEN' \
  https://api.mercadolibre.com/highlights/MLB/category/MLB432825
```

**Example Response:**
```json
{
  "query_data": {
    "highlight_type": "BEST_SELLER",
    "criteria": "CATEGORY",
    "id": "MLB432825"
  },
  "content": [
    {
      "id": "MLB1481736854",
      "position": 1,
      "type": "ITEM"
    },
    {
      "id": "MLB1530545830",
      "position": 2,
      "type": "ITEM"
    }
    // ... up to 20 items total
  ]
}
```

**Key Features:**
- Returns **top 20 best sellers** by category
- Includes **ranking position** (1-20)
- Supports filtering by **brand**, **product**, or **item**
- **Requires OAuth authentication** (same as current Trends API)

**Limitations:**
- Maximum 20 items per response
- Requires knowing category IDs beforehand
- No global "all categories" endpoint
- Sales volume numbers not included (only rankings)

---

### 2. Sold Quantity Field in Search/Items APIs

The existing **Search API** and **Items API** include `sold_quantity` field in responses.

**Available Fields:**
- `sold_quantity`: Number of items sold (historical total)
- `available_quantity`: Current stock available
- `initial_quantity`: Starting inventory

**Example in Search Response:**
```json
{
  "results": [
    {
      "id": "MLA123456789",
      "title": "Product Name",
      "price": 1500,
      "sold_quantity": 342,
      "available_quantity": 15
    }
  ]
}
```

**Important Limitations:**
- In **public resources**, `sold_quantity` is **referential** (may not be accurate)
- Full access to `sold_quantity` may require **owner token** (seller's own products)
- Not suitable for global "most sold" rankings across all sellers

**Current Project Status:**
- ✅ Already used in enrichment hooks (`useClientEnrichedTrends`, `useEnrichTrendOnDemand`)
- ✅ Included in opportunity score calculation (25% weight)
- ⚠️ Data is referential for public searches

---

### 3. Other Approaches Investigated

#### 3.1 Mercado Libre Public "Más Vendidos" Pages
- MercadoLibre has public web pages showing best sellers
- URL: `https://www.mercadolibre.com.ar/mas-vendidos`
- **Not an API** - would require web scraping (not recommended)

#### 3.2 Third-Party Analytics Tools
- **Nubimetrics**: Commercial tool for MercadoLibre analytics
- Provides sales trends and best-seller data
- Not a MercadoLibre official API

#### 3.3 "Más vendido" Product Labels
- MercadoLibre automatically assigns labels to high-selling items
- Visible in Search API responses via `attributes` or `tags` fields
- Not a dedicated endpoint for querying best sellers

---

## Recommendations

### Option 1: Implement Highlights API ⛔ **NOT VIABLE - BLOCKED**

🔴 **CONFIRMED: CloudFront Blocking on Highlights API**

**Testing Results** (November 24, 2025):
- ❌ **Highlights API** (`/highlights/{SITE_ID}/category/{CATEGORY_ID}`) - **CONFIRMED BLOCKED server-side**
- Response: `403 Forbidden` with `x-cache: Error from cloudfront`
- Tested on: Local development (localhost:3000)
- Category tested: `MLA1051` (Celulares y Teléfonos)

**Known CloudFront Behavior**:
- ✅ **Trends API** (`/trends/{SITE_ID}`) - Works server-side without issues
- ✅ **OAuth Token API** - Works server-side without issues
- ❌ **Search API** (`/sites/{SITE_ID}/search`) - **BLOCKED server-side** (403 from CloudFront)
- ❌ **Highlights API** (`/highlights/{SITE_ID}/category/{CATEGORY_ID}`) - **CONFIRMED BLOCKED server-side** (403 from CloudFront)

**Root Cause Analysis**:

MercadoLibre uses AWS CloudFront + WAF to protect their APIs from malicious traffic. According to [AWS Architecture Blog](https://aws.amazon.com/blogs/architecture/mercado-libre-how-to-block-malicious-traffic-in-a-dynamic-environment/):
- MercadoLibre processes ~2.2M requests/second through CloudFront
- Their WAF creates IPSets to block IPs that source malicious traffic
- Datacenter IPs (Vercel, AWS, Azure) are classified as "hosting provider IPs" and frequently blocked

**Why Highlights API Gets Blocked**:
1. **Datacenter IP Blocking**: Server-side requests from Vercel/AWS use datacenter IPs, which CloudFront/WAF flags as potential bots
2. **Residential IPs Work**: Browser requests from end-users (residential IPs) bypass CloudFront blocking
3. **Official Pattern**: Other developers reported [same issue on Search API](https://github.com/mercadolibre/golang-restclient/issues/9)

**Critical Discovery: CORS Limitation**

⚠️ **The Highlights API faces TWO blocking mechanisms simultaneously**:

1. ❌ **Server-side calls**: Blocked by CloudFront (403 from datacenter IPs)
2. ❌ **Client-side calls**: Blocked by CORS (no `Access-Control-Allow-Origin` header)

According to [Stack Overflow reports](https://stackoverflow.com/questions/60098805/trying-to-get-json-from-mercadolibre-api-but-always-gets-the-same-cors-error), MercadoLibre APIs **do NOT support CORS**. Direct browser fetch calls fail with:
```
Response to preflight request doesn't pass access control check:
It does not have HTTP ok status
```

**Alternative Workarounds Evaluated**:

1. ❌ **JSONP**: MercadoLibre supports JSONP (`?callback=functionName`), but:
   - Cannot send custom headers (no Bearer token support)
   - Highlights API requires `Authorization: Bearer` header
   - Not viable for authenticated endpoints

2. ❌ **CORS Proxy**: Third-party proxy services could work, but:
   - Security risk: Exposes OAuth token to third party
   - Not recommended for production
   - Unreliable (proxies can go down)

3. ❌ **Residential IP Proxy**: Using residential proxies could bypass CloudFront, but:
   - Against MercadoLibre Terms of Service
   - Expensive and unreliable
   - Not a sustainable solution

**Conclusion: Dead End**

The Highlights API is effectively **inaccessible** for web applications due to:
- CloudFront blocking server-side requests (datacenter IPs)
- CORS blocking client-side requests (no CORS headers)
- No Bearer token support in JSONP (only workaround available)

**Recommended Action**: Contact MercadoLibre support to:
1. Request **certified integrator status**
2. Request **IP whitelisting** for production servers
3. Request **CORS header support** for Highlights API
4. Or request alternative API endpoint for best-seller data

---

**Use Case**: Add a new "Best Sellers" view showing top 20 products by category and country.

**Implementation Plan** (assuming server-side works - verify first!):

1. **Create API Route**: `/api/sales/[country]/route.ts`
   ```typescript
   // Server-side route (requires OAuth token)
   export async function GET(
     request: Request,
     { params }: { params: { country: SiteId } }
   ) {
     const { country } = params;
     const categoryId = request.url.searchParams.get('category');

     // Get OAuth token
     const tokenResponse = await fetch(`${origin}/api/token`);
     const { access_token } = await tokenResponse.json();

     // Fetch highlights
     const response = await fetch(
       `https://api.mercadolibre.com/highlights/${country}/category/${categoryId}`,
       { headers: { Authorization: `Bearer ${access_token}` } }
     );

     return Response.json(await response.json());
   }
   ```

2. **Create React Hook**: `hooks/useBestSellers.ts`
   ```typescript
   export function useBestSellers(country: SiteId, categoryId: string) {
     return useQuery({
       queryKey: ['best-sellers', country, categoryId],
       queryFn: async () => {
         const res = await fetch(`/api/sales/${country}?category=${categoryId}`);
         return res.json();
       }
     });
   }
   ```

3. **Create UI View**: `/[locale]/sales/[country]/page.tsx`
   - Similar to current trends pages
   - Show top 20 best sellers by category
   - Allow category filtering via dropdown

**Pros:**
- ✅ Official MercadoLibre API
- ✅ Real sales rankings (not search trends)
- ✅ Same OAuth authentication already in use
- ✅ Server-side implementation (no CloudFront blocking issues)

**Cons:**
- ⚠️ Limited to 20 items per category
- ⚠️ Requires category IDs (not global ranking)
- ⚠️ No sales volume numbers (only positions 1-20)

---

### Option 2: Enhance Current Enrichment with Sold Quantity ✅ **IMPLEMENTED**

**Status**: Implemented on November 24, 2025

**Implementation Summary:**

1. ✅ **Updated Opportunity Score Weights** (in both `useClientEnrichedTrends.ts` and `useEnrichTrendOnDemand.ts`):
   ```typescript
   // Previous weights:
   // - Search volume: 30%
   // - Sold quantity: 25%
   // - Free shipping: 20%
   // - Price range: 15%
   // - Available stock: 10%

   // NEW weights (Nov 2025):
   const weights = {
     soldQuantity: 0.35,  // 35% ⬆️ +10% (increased from 25%)
     searchVolume: 0.25,  // 25% ⬇️ -5% (decreased from 30%)
     freeShipping: 0.20,  // 20% (unchanged)
     priceRange: 0.10,    // 10% ⬇️ -5% (decreased from 15%)
     availableStock: 0.10 // 10% (unchanged)
   };
   ```

2. ✅ **Added Prominent Sold Quantity Badge** in `EnrichedTrendCard.tsx`:
   - Green badge in card header showing total sold units
   - Format: "1,234 vendidos" / "1,234 sold" / "1,234 vendidos"
   - Displayed next to rank badge when trend is enriched
   - Includes tooltip: "Suma de unidades vendidas de los productos principales"

3. ✅ **Added i18n Translations** (ES, EN, PT-BR):
   - `trends.sold`: "vendidos" / "sold" / "vendidos"
   - `trends.totalSoldTooltip`: Tooltip text for sold quantity badge

4. ⏳ **Sorting by Sold Quantity**: Not implemented yet
   - Current architecture uses on-demand enrichment (one-by-one)
   - Sorting requires architectural changes to batch-enrich all trends first
   - Documented as future enhancement (see "Future Enhancements" section below)

**Files Modified:**
- `hooks/useClientEnrichedTrends.ts` - Updated weights in `calculateMetrics()`
- `hooks/useEnrichTrendOnDemand.ts` - Updated weights in `calculateMetrics()`
- `components/trends/EnrichedTrendCard.tsx` - Added sold quantity badge to header
- `locales/es.json`, `locales/en.json`, `locales/pt-BR.json` - Added translations

**Impact:**
- Opportunity scores now prioritize products with proven sales history
- Users can immediately see sales volume for trending products
- More accurate reflection of actual market performance vs. search interest

**Pros:**
- ✅ No new API integration needed
- ✅ Immediate implementation
- ✅ Leverages existing data
- ✅ Emphasizes actual sales over search trends

**Cons:**
- ⚠️ `sold_quantity` is referential for public searches (not 100% accurate)
- ⚠️ Not as accurate as official Highlights API (which is blocked)
- ⚠️ Doesn't provide official "best seller" rankings

---

### Option 3: Combine Both Approaches

**Use Case**: Create a comprehensive sales insights feature.

1. **"Best Sellers" Page**: Use Highlights API for official top 20 by category
2. **Enhanced Trends**: Improve existing enriched trends with better sold_quantity emphasis
3. **Comparison View**: Show trending keywords (Trends API) vs. actual best sellers (Highlights API)

---

## Implementation Status

1. ✅ **Research completed** - APIs identified and documented
2. ✅ **CloudFront blocking confirmed** - Highlights API blocked server-side (403 from CloudFront)
3. ✅ **CORS limitation confirmed** - Highlights API does not support CORS for client-side calls
4. ✅ **Prototype created** - `/prototype/best-sellers` page demonstrates CloudFront blocking behavior
5. ✅ **External investigation completed** - Confirmed other developers face same issue
6. ✅ **Option 2 implemented** (Nov 24, 2025) - Enhanced enrichment with sold_quantity emphasis
   - Updated opportunity score weights (sold_quantity: 25% → 35%)
   - Added prominent sold quantity badge to enriched trend cards
   - Added i18n translations (ES, EN, PT-BR)

## Next Steps

1. 🔴 **Contact MercadoLibre support**: Request access to Highlights API
   - Request certified integrator status
   - Request IP whitelisting for production servers
   - Request CORS header support for Highlights API
   - Or request alternative API endpoint for best-seller data
2. ⏳ **Future Enhancements** (see section below)

---

## Future Enhancements

### Sorting by Sold Quantity

**Goal**: Allow users to sort enriched trends by sold quantity (descending)

**Current Limitation**:
- The enriched trends page uses on-demand enrichment (one trend at a time via user click)
- Sorting requires all trends to be enriched simultaneously
- Current architecture (`useEnrichTrendOnDemand`) doesn't support batch enrichment

**Proposed Solution**:
1. Create a new page `/[locale]/trends/[country]/enriched-batch` that uses `useClientEnrichedTrends` hook
2. Enrich all trends in batches automatically (like overview page)
3. Add sort selector: "Rank (default)" / "Sold Quantity (high to low)" / "Opportunity Score (high to low)"
4. Implement client-side sorting:
   ```typescript
   const sortedTrends = useMemo(() => {
     if (sortBy === 'sold_quantity') {
       return [...trends].sort((a, b) =>
         (b.total_sold || 0) - (a.total_sold || 0)
       );
     }
     if (sortBy === 'opportunity_score') {
       return [...trends].sort((a, b) =>
         (b.opportunity_score || 0) - (a.opportunity_score || 0)
       );
     }
     return trends; // Default: by rank
   }, [trends, sortBy]);
   ```

**Complexity**: Medium
**Benefit**: High - Users can quickly identify products with highest sales

---

## Technical Notes

### Authentication Requirements

**Highlights API**:
- ✅ Uses same OAuth 2.0 flow as Trends API
- ✅ Can reuse `/api/token` endpoint
- ❓ Server-side implementation **pending CloudFront verification** (see warning above)

**No Additional Credentials Needed**: Current `MELI_CLIENT_SECRET` and `NEXT_PUBLIC_MELI_APP_ID` are sufficient.

### Rate Limiting Considerations

- Highlights API likely has similar rate limits as Trends API
- Implement caching for category-based queries (5-minute TTL recommended)
- Server-side only (no batching delays needed like Search API)

### Category ID Mapping

To use Highlights API effectively, need to:
1. Fetch top categories per country via Categories API
2. Create mapping in `utils/constants.ts`
3. Add category selector to UI

**Categories API Endpoint**:
```
GET https://api.mercadolibre.com/sites/{SITE_ID}/categories
```

---

## References

- [Best sellers in Mercado Libre - Official Docs](https://developers.mercadolibre.com.ar/en_us/best-sellers-in-mercado-libre)
- [Más vendidos en Mercado Libre - Spanish Docs](https://developers.mercadolibre.com.ar/es_ar/mas-vendidos-en-mercado-libre)
- [Items and Searches API](https://developers.mercadolibre.com.ar/en_us/items-and-searches)
- [MercadoLibre API Essentials](https://rollout.com/integration-guides/mercado-libre/api-essentials)

---

## Conclusion

**Yes, MercadoLibre has a Sales API, but it's currently inaccessible**: The **Highlights API** (`/highlights/{SITE_ID}/category/{CATEGORY_ID}`) provides official best-seller rankings, but faces blocking issues.

**Key Differences from Trends API**:
| Feature | Trends API (Current) | Highlights API (Sales) |
|---------|---------------------|------------------------|
| Data Type | Search trends (what people search for) | Best sellers (what people buy) |
| Scope | Keywords only | Actual product IDs with rankings |
| Results | Variable (10-20+ trends) | Fixed top 20 per category |
| Granularity | Site-wide trends | Category-specific |
| Authentication | OAuth 2.0 ✅ | OAuth 2.0 ✅ |
| Server-side Access | Yes ✅ | **No ❌ (CloudFront 403)** |
| Client-side Access | N/A (requires secret) | **No ❌ (CORS blocked)** |
| Accessible | **Yes ✅** | **No ❌ (Blocked both ways)** |

**Final Status**:
- ✅ **API exists and is documented** - Official MercadoLibre API for best sellers
- ❌ **Not accessible from web applications** - Blocked by CloudFront (server) and CORS (client)
- ⚠️ **Prototype created** - `/prototype/best-sellers` page demonstrates blocking behavior
- 🔴 **Action Required** - Contact MercadoLibre support for certified integrator status or IP whitelisting

**Recommendation**:
1. **Short-term**: Implement **Option 2** (enhance existing enrichment with sold_quantity emphasis)
2. **Long-term**: Contact MercadoLibre support to request access to Highlights API or alternative best-seller endpoint

**External Research Sources**:
- [MercadoLibre CloudFront Architecture (AWS Blog)](https://aws.amazon.com/blogs/architecture/mercado-libre-how-to-block-malicious-traffic-in-a-dynamic-environment/)
- [CloudFront 403 Issue (GitHub)](https://github.com/mercadolibre/golang-restclient/issues/9)
- [MercadoLibre CORS Limitation (Stack Overflow)](https://stackoverflow.com/questions/60098805/trying-to-get-json-from-mercadolibre-api-but-always-gets-the-same-cors-error)
- [Best Sellers API Documentation (Official)](https://developers.mercadolibre.com.ar/en_us/best-sellers-in-mercado-libre)
