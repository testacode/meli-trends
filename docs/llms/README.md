# MeLi Trends - Documentation

This directory contains comprehensive documentation for the MeLi Trends project, optimized for both human developers and AI assistants (LLMs).

## 📚 Documentation Structure

### For AI Assistants (LLMs)

**Start here:** [`/llms.txt`](../llms.txt) (root directory)

This project follows the `llms.txt` convention - a standardized format for LLM-optimized documentation (similar to `robots.txt` for web crawlers).

#### LLM Documentation Files

```
📁 Root
└── llms.txt                              # 📍 Main index (~500 tokens)
                                          # Quick navigation to specific topics
                                          # Critical architecture rules
                                          # Common patterns (copy-paste ready)

📁 docs/llms/
├── README.md                             # This file (Documentation guide)
├── meli-trends-complete.txt              # 📚 Complete reference (~4000 tokens)
│                                         # All components, hooks, API, types
│                                         # Use when you need comprehensive info
└── mantine.txt                           # 🎨 Mantine UI library reference
                                          # External reference (79k lines)
```

#### How to Use (For LLMs)

1. **Read the index first:** `/llms.txt` (~500 tokens)
   - Understand project structure
   - Identify relevant sections
   - Find critical architecture rules

2. **Read specific sections:** `/docs/llms/meli-trends-complete.txt`
   - Only read sections relevant to your task
   - ~75% token reduction vs reading everything

3. **Token Efficiency:**
   - Index-based approach: ~750-1000 tokens per query
   - Full documentation: ~4000 tokens
   - **Savings: ~75% for most queries**

#### Example Workflows

**User asks about components:**
- Read: `/llms.txt` (500 tokens)
- Search: "CORE COMPONENTS" in complete docs (300 tokens)
- Total: **800 tokens** ✅

**User asks about hooks:**
- Read: `/llms.txt` (500 tokens)
- Search: "REACT HOOKS" in complete docs (250 tokens)
- Total: **750 tokens** ✅

**User asks for overview:**
- Read: `/docs/llms-meli-trends-complete.txt` (4000 tokens)
- Total: **4000 tokens** (acceptable for comprehensive overview)

### For Human Developers

#### Architecture Documentation

- **[api-cloudfront-blocking.md](architecture/api-cloudfront-blocking.md)** - Critical guide to CloudFront blocking and Search API patterns
- **[search-api-403-investigation-2025-11.md](architecture/search-api-403-investigation-2025-11.md)** - Detailed investigation of API blocking issues

#### Development Guides

- **[CLAUDE.md](../CLAUDE.md)** - Instructions for Claude Code (AI assistant)
- **[README.md](../README.md)** - Main project documentation

#### Security

- **[SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)** - Security audit and best practices

## 🎯 Key Conventions

### llms.txt Standard

The `llms.txt` file follows an emerging industry standard for AI-readable documentation:

- **Similar to:** `robots.txt` for web crawlers
- **Purpose:** Provide structured, token-efficient documentation for LLMs
- **Adoption:** Mantine UI, Anthropic projects, and growing community

### File Naming

- `llms.txt` - Index file (root directory)
- `llms-[project]-complete.txt` - Complete documentation
- `llm-[library].txt` - External library references

### Documentation Principles

1. **Token Efficiency:** Minimize token consumption through smart indexing
2. **Modularity:** Split by topic when needed (future enhancement)
3. **Completeness:** Provide comprehensive examples with copy-paste ready code
4. **Discoverability:** Clear navigation and search guides

## 🚀 Contributing to Documentation

When adding new features, update:

1. **`/llms.txt`** - Add to quick reference if it's a common pattern
2. **`/docs/llms-meli-trends-complete.txt`** - Add detailed documentation in relevant section
3. **`CLAUDE.md`** - Update if it affects Claude Code workflow
4. **This README** - If adding new documentation files

## 📖 Additional Resources

- **Official Next.js Docs:** https://nextjs.org/docs
- **Mantine UI Docs:** https://mantine.dev/
- **MercadoLibre API:** https://developers.mercadolibre.com
- **Project Repository:** https://github.com/testacode/meli-trends

---

**Last Updated:** 2025-11-23
**Version:** 1.0.0
