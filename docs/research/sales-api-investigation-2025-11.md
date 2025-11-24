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

### Option 2: Enhance Current Enrichment with Sold Quantity

**Use Case**: Improve existing enriched trends by emphasizing `sold_quantity` data.

**Implementation Plan:**

1. **Update Opportunity Score Weights** (in `calculateMetrics()` function):
   ```typescript
   // Current weights:
   const weights = {
     searchVolume: 0.30,  // 30%
     soldQuantity: 0.25,  // 25% - INCREASE THIS
     freeShipping: 0.20,  // 20%
     priceRange: 0.15,    // 15%
     availableStock: 0.10 // 10%
   };

   // Suggested new weights:
   const weights = {
     soldQuantity: 0.35,  // 35% - emphasize actual sales
     searchVolume: 0.25,  // 25%
     freeShipping: 0.20,  // 20%
     priceRange: 0.10,    // 10%
     availableStock: 0.10 // 10%
   };
   ```

2. **Add Sold Quantity Display** in `EnrichedTrendCard.tsx`:
   ```tsx
   <Badge leftSection={<IconShoppingCart size={14} />}>
     {item.metrics.total_sold.toLocaleString()} vendidos
   </Badge>
   ```

3. **Add Sorting by Sold Quantity** in trends lists:
   ```typescript
   const sortedTrends = trends.sort((a, b) =>
     b.metrics.total_sold - a.metrics.total_sold
   );
   ```

**Pros:**
- ✅ No new API integration needed
- ✅ Immediate implementation
- ✅ Leverages existing data

**Cons:**
- ⚠️ `sold_quantity` is referential for public searches
- ⚠️ Not as accurate as Highlights API
- ⚠️ Doesn't provide official "best seller" rankings

---

### Option 3: Combine Both Approaches

**Use Case**: Create a comprehensive sales insights feature.

1. **"Best Sellers" Page**: Use Highlights API for official top 20 by category
2. **Enhanced Trends**: Improve existing enriched trends with better sold_quantity emphasis
3. **Comparison View**: Show trending keywords (Trends API) vs. actual best sellers (Highlights API)

---

## Next Steps

1. ✅ **Research completed** - APIs identified and documented
2. ✅ **CloudFront blocking confirmed** - Highlights API blocked server-side (403 from CloudFront)
3. ✅ **CORS limitation confirmed** - Highlights API does not support CORS for client-side calls
4. ✅ **Prototype created** - `/prototype/best-sellers` page demonstrates CloudFront blocking behavior
5. ✅ **External investigation completed** - Confirmed other developers face same issue
6. 🔴 **Recommended Next Action**: Contact MercadoLibre support
   - Request certified integrator status
   - Request IP whitelisting for production servers
   - Request CORS header support for Highlights API
   - Or request alternative API endpoint for best-seller data
7. ⏳ **Fallback Decision**: While waiting for MercadoLibre response, implement **Option 2** (enhance existing enrichment with sold_quantity)

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
