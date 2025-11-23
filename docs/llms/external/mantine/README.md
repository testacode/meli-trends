# Mantine UI - External Documentation

This directory contains the complete Mantine UI library documentation in LLM-optimized format.

## Source

**Original URL**: https://mantine.dev/llms.txt
**Library**: Mantine UI v8
**Format**: llms.txt (LLM-optimized documentation)
**Size**: 79k lines, ~2.2MB

## Purpose

Mantine is the UI component library used throughout the MeLi Trends project. This documentation provides:

- Complete component API reference
- Usage examples for all components
- Styling and theming patterns
- Hooks and utilities

## When to Use

Reference this documentation when:
- Implementing new UI components
- Customizing existing Mantine components
- Working with Mantine hooks or utilities
- Troubleshooting component behavior

## File Structure

```
external/mantine/
├── README.md           # This file
└── mantine.txt         # Complete Mantine documentation (79k lines)
```

## Integration with MeLi Trends

MeLi Trends uses Mantine with custom theme configuration:
- **Theme file**: `/lib/mantine-theme.ts`
- **Custom colors**: `meliBlue` and `meliYellow` palettes
- **Dark/Light mode**: Built-in Mantine theming

## Important Notes

- This is external reference documentation (not part of MeLi Trends codebase)
- Keep this file synchronized with Mantine updates when needed
- For MeLi Trends-specific components, see `/docs/llms/meli-trends.txt`

---

**Last Updated**: 2025-11-23
**Mantine Version**: 8.x
