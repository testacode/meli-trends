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

### Option 1: Implement Highlights API (RECOMMENDED WITH CAUTION)

⚠️ **CRITICAL WARNING: CloudFront Blocking Risk**

Before implementing, we need to verify that the Highlights API doesn't suffer from the same CloudFront blocking issue as the Search API.

**Known CloudFront Behavior**:
- ✅ **Trends API** (`/trends/{SITE_ID}`) - Works server-side without issues
- ✅ **OAuth Token API** - Works server-side without issues
- ❌ **Search API** (`/sites/{SITE_ID}/search`) - **BLOCKED server-side** (403 from CloudFront)
- ❓ **Highlights API** (`/highlights/{SITE_ID}/category/{CATEGORY_ID}`) - **UNKNOWN, NEEDS TESTING**

**Why This Matters**:
MercadoLibre's Search API uses CloudFront with aggressive bot detection that blocks datacenter IPs (Vercel, AWS). Server-side requests from these IPs get 403 errors (`x-cache: Error from cloudfront`).

See: `/docs/architecture/search-api-403-investigation-2025-11.md` for full details.

**Verification Steps Required**:
1. Test Highlights API from server-side route in development
2. Test from Vercel deployment (production datacenter IPs)
3. Monitor for `x-cache: Error from cloudfront` in response headers
4. If blocked, implement client-side fallback similar to Search API

**If CloudFront blocks Highlights API**:
- Need to implement client-side calls (browser → API direct)
- Add to `lib/searchAPI.ts` or create `lib/salesAPI.ts`
- Use batching and delays to prevent rate limiting
- Update implementation plan below accordingly

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
2. 🔴 **PRIORITY: Test CloudFront blocking** - Verify Highlights API doesn't get blocked server-side
   - Create test endpoint in development
   - Monitor response headers for `x-cache: Error from cloudfront`
   - Test from Vercel deployment (production environment)
   - Document findings in `/docs/architecture/search-api-403-investigation-2025-11.md`
3. ⏳ **Decision needed**: Which option to implement? (depends on CloudFront testing)
   - Option 1: New "Best Sellers" feature (Highlights API) - only if server-side works
   - Option 2: Enhance existing enrichment - safe fallback if Highlights is blocked
   - Option 3: Combine both
4. ⏳ **Get category IDs**: If using Highlights API, need to map categories per country
5. ⏳ **Test authentication**: Verify Highlights API works with current OAuth setup

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

**Yes, MercadoLibre has a Sales API**: The **Highlights API** (`/highlights/{SITE_ID}/category/{CATEGORY_ID}`) provides official best-seller rankings.

**Key Differences from Trends API**:
| Feature | Trends API (Current) | Highlights API (Sales) |
|---------|---------------------|------------------------|
| Data Type | Search trends (what people search for) | Best sellers (what people buy) |
| Scope | Keywords only | Actual product IDs with rankings |
| Results | Variable (10-20+ trends) | Fixed top 20 per category |
| Granularity | Site-wide trends | Category-specific |
| Authentication | OAuth 2.0 ✅ | OAuth 2.0 ✅ |
| Server-side | Yes ✅ | Yes ✅ |

**Recommendation**: Implement **Option 1** (Highlights API) as a new "Best Sellers" feature to complement existing Trends views, providing users with both search trends AND actual sales data.
