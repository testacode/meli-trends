# Search API 403 Investigation - November 2025

## Executive Summary

As of November 2025, the MercadoLibre Search API (`/sites/{site_id}/search`) is returning 403 Forbidden errors with CloudFront blocking (`x-cache: Error from cloudfront`) for all requests, regardless of authentication status, headers, or request source. This affects both server-side and client-side requests, including those from residential IP addresses.

**Status**: Blocking appears to be CloudFront/WAF-based IP filtering, not authentication-related.

---

## Test Results (November 23, 2025)

### Test Environment
- **Location**: Residential IP, direct connection (no VPN/proxy)
- **Access Token**: Valid OAuth token from `/api/token` endpoint
- **Token Format**: `APP_USR-8365283660980845-112311-c8c70ff5a36fad0e482df32c92741790-110274`

### Test A: Authenticated Request (Basic)
```bash
curl -H "Authorization: Bearer {TOKEN}" \
     "https://api.mercadolibre.com/sites/MLA/search?q=iphone&limit=3"
```

**Result**: 403 Forbidden
```json
{
  "message": "forbidden",
  "error": "forbidden",
  "status": 403,
  "cause": []
}
```
**Headers**: `x-cache: Error from cloudfront`

### Test B: Authenticated Request with Browser Headers
```bash
curl -H "Authorization: Bearer {TOKEN}" \
     -H "User-Agent: Mozilla/5.0 (...)" \
     -H "Accept: application/json" \
     -H "Referer: http://localhost:3000/" \
     -H "Origin: http://localhost:3000" \
     "https://api.mercadolibre.com/sites/MLA/search?q=iphone&limit=3"
```

**Result**: 403 Forbidden (identical to Test A)

### Test C: Unauthenticated Request
```bash
curl "https://api.mercadolibre.com/sites/MLA/search?q=iphone&limit=3"
```

**Result**: 403 Forbidden (identical to Tests A and B)

### Key Finding
**Authentication status has zero impact on the 403 error.** This confirms the blocking is IP-based, not authentication-based.

---

## Research Findings

### Community Reports

**GitHub Issue (April 2025)**
- **Source**: [mercadolibre/golang-restclient #9](https://github.com/mercadolibre/golang-restclient/issues/9)
- **Reported**: April 1, 2025 (8 months ago)
- **Symptoms**: Same 403 error on Search API with valid tokens
- **Community feedback**:
  - "Mercado Libre has discontinued this type of search"
  - Multiple developers confirming the issue
  - No official response from MercadoLibre

### Official Documentation Status

**Search API Documentation** ([source](https://developers.mercadolibre.com.ar/en_us/items-and-searches))
- **Status**: Still active and documented
- **Authentication**: Listed as "public resource" (no auth required)
- **Example**: Shows bearer token usage but marks it as optional
- **No deprecation notice**: API appears officially supported

**403 Error Documentation** ([source](https://developers.mercadolibre.com.ar/es_ar/error-403))
- **Listed causes**:
  - Application blocked/disabled
  - Insufficient permissions
  - Inactive users
  - **IP restrictions: "requests from unapproved IP addresses"** ⚠️
  - Invalid OAuth scopes
  - Token ownership issues

**Authentication Requirements** ([source](https://developers.mercadolibre.com.ar/en_us/authentication-and-authorization))
- **Public resources**: Can be accessed anonymously
- **Search API**: Explicitly listed as public resource
- **OAuth scopes**: Not required for search

---

## Root Cause Analysis

### Most Likely Cause: Aggressive CloudFront WAF Rules

MercadoLibre appears to have implemented stricter CloudFront Web Application Firewall (WAF) rules in early 2025 that block:

1. **Datacenter IPs** (AWS, Vercel, cloud providers)
2. **IPs flagged by AWS IP Reputation Lists**
3. **Certain residential IP ranges** (ISP-dependent)
4. **Previously rate-limited IPs** (temporary blocking)
5. **Geographic regions** (possible but unconfirmed)

**Evidence**:
- All requests fail with identical `x-cache: Error from cloudfront` response
- Residential IPs are blocked (confirmed by user testing)
- Authentication is irrelevant (Tests A, B, C all fail identically)
- Multiple developers reporting issues since April 2025
- Error persists across different request methods

### Alternative Theories (Lower Probability)

1. **Undocumented API Restriction**
   - Search API requires IP whitelisting
   - Not publicly communicated
   - Contradicts official documentation

2. **Temporary Rate Limiting**
   - User's IP temporarily blocked
   - Should resolve after 24-48 hours
   - Unlikely given widespread reports

3. **API Deprecation in Progress**
   - MercadoLibre phasing out public Search API
   - Documentation not yet updated
   - Matches GitHub issue comments

---

## Impact on meli-trends Application

### Affected Features
- ✗ **Enriched Trends** (`/trends/[country]/enriched`): Completely broken
- ✗ **On-Demand Enrichment** (useEnrichTrendOnDemand hook): Non-functional
- ✗ **Progressive Batching** (useClientEnrichedTrends hook): Non-functional
- ✓ **Basic Trends** (`/trends/[country]`): Still working (uses Trends API, not Search API)

### Architecture Invalidation

The original architecture documented in `/docs/architecture/api-cloudfront-blocking.md` assumed:
1. ✗ Search API is publicly accessible (no longer true)
2. ✗ Client-side calls bypass CloudFront blocking (no longer reliable)
3. ✗ Datacenter IPs are the primary blocking target (residential IPs also blocked)

---

## Solution Options

### Option 1: Wait and Retry (Temporary Rate Limiting)
**Approach**: Wait 24-48 hours and test again

**Pros**:
- No code changes
- Zero cost

**Cons**:
- Unlikely to work (issue reported for 8 months)
- Doesn't solve underlying problem

**Recommendation**: Worth trying as baseline test

### Option 2: Contact MercadoLibre Support
**Approach**: Open support ticket requesting clarification

**Questions to ask**:
- Is Search API still publicly accessible?
- Are there new IP whitelisting requirements?
- What causes 403 errors for residential IPs?
- Is official deprecation planned?

**Pros**:
- Official answer from source
- May get IP whitelisted
- Clarifies API future

**Cons**:
- Slow response time (weeks)
- May not provide useful answer

**Recommendation**: Do this regardless of other options

### Option 3: Use Third-Party Scraping Service
**Approach**: Use [Apify MercadoLibre Scraper](https://apify.com/easyapi/mercadolibre-search-results-scraper/api)

**Pros**:
- Bypasses CloudFront blocking
- Maintained by third party
- Reliable infrastructure

**Cons**:
- Costs money (~$49-99/month)
- Not official API (ToS concerns)
- External dependency risk
- Requires API key management

**Recommendation**: Last resort only

### Option 4: Simplify to Basic Trends Only
**Approach**: Remove enrichment features, keep Trends API only

**Pros**:
- Uses working API (Trends API unaffected)
- No external dependencies
- Simple, reliable
- Lower maintenance

**Cons**:
- Significant feature loss
- Less valuable to users
- Removes main differentiator

**Recommendation**: Best short-term mitigation if others fail

### Option 5: Try Alternative Network Source
**Approach**: Test from different IP (mobile hotspot, VPN, different location)

**Pros**:
- Quick test
- May reveal IP-specific blocking
- Could provide temporary solution

**Cons**:
- Not scalable for production
- Users would still face same issue
- Doesn't solve architecture problem

**Recommendation**: Diagnostic only, not a solution

---

## Recommended Action Plan

### Phase 1: Immediate (Days 1-2)
1. ✓ **Document findings** (this document)
2. **Contact MercadoLibre support** with detailed error report
3. **Test from alternative IP** (mobile hotspot) to confirm IP-specific blocking
4. **Update CLAUDE.md** to reflect Search API status

### Phase 2: Short-term (Week 1)
1. **Add user-facing notice** on enriched trends page explaining the issue
2. **Implement graceful degradation**: Show basic trends with "enrichment unavailable" message
3. **Monitor MercadoLibre response** to support ticket

### Phase 3: Medium-term (Weeks 2-4)
Based on MercadoLibre response:
- **If API access restored**: Resume normal operation
- **If whitelisting required**: Provide IP for whitelisting
- **If API deprecated**: Implement Option 4 (simplify to basic trends)
- **If no response**: Evaluate Option 3 (scraping service) vs Option 4 (simplify)

---

## Testing Verification

To verify if the issue is resolved in the future:

```bash
# Test unauthenticated request (should work if API is truly public)
curl -i "https://api.mercadolibre.com/sites/MLA/search?q=test&limit=3"

# Expected success response:
# HTTP/2 200
# {"results": [...], "paging": {...}}

# Current failure response:
# HTTP/2 403
# x-cache: Error from cloudfront
# {"message":"forbidden","error":"forbidden","status":403,"cause":[]}
```

---

## References

### Issues and Reports
- [mercadolibre/golang-restclient #9](https://github.com/mercadolibre/golang-restclient/issues/9) - CloudFront 403 issue (April 2025)

### Official Documentation
- [Items & Searches API](https://developers.mercadolibre.com.ar/en_us/items-and-searches) - Search endpoint documentation
- [Error 403 Documentation](https://developers.mercadolibre.com.ar/es_ar/error-403) - 403 error causes
- [Authentication & Authorization](https://developers.mercadolibre.com.ar/en_us/authentication-and-authorization) - OAuth and public resources
- [Validations & Security Requirements](https://developers.mercadolibre.com.ar/en_us/validations-and-security-requirements) - Security best practices

### Technical Context
- [AWS CloudFront 403 Troubleshooting](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/http-403-permission-denied.html) - CloudFront permission errors

---

## Last Updated
- **Date**: November 23, 2025
- **Tester**: Development environment, Argentina region (MLA)
- **Status**: Issue ongoing, no resolution
