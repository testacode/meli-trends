# Codecov Setup Guide

This guide will help you configure Codecov integration for the meli-trends repository to display test coverage badges and reports.

## Overview

Codecov provides automated test coverage reporting that integrates seamlessly with GitHub Actions. Once configured, it will:

- Display a coverage badge in the README showing test coverage percentage
- Generate detailed coverage reports for every commit
- Comment on pull requests with coverage changes
- Track coverage trends over time

## Prerequisites

- GitHub repository access (admin permissions to add secrets)
- Test coverage already configured (✅ already done via `npm run test:coverage`)
- Codecov account (free for open source projects)

## Setup Steps

### Step 1: Create Codecov Account

1. Go to [codecov.io](https://codecov.io/)
2. Click **"Sign Up"** in the top-right corner
3. Click **"Sign in with GitHub"**
4. Authorize Codecov to access your GitHub account
5. Grant permissions when prompted

### Step 2: Add Repository to Codecov

1. After signing in, you'll see the Codecov dashboard
2. Click **"Add new repository"** or **"Not yet setup"** tab
3. Find `testacode/meli-trends` in the list
4. Click **"Setup repo"** next to the repository name
5. Codecov will display setup instructions - you can skip these since the CI workflow is already configured

### Step 3: Get Codecov Upload Token

1. On the repository setup page, locate the **"Step 2: Copy Upload Token"** section
2. Click the **"Copy"** button to copy the token to your clipboard
3. The token looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

⚠️ **Important:** Keep this token secure - treat it like a password!

### Step 4: Add Token to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/testacode/meli-trends`
2. Click **"Settings"** tab (top navigation)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**
4. Click the **"New repository secret"** button
5. Fill in the form:
   - **Name:** `CODECOV_TOKEN` (must be exactly this)
   - **Secret:** Paste the token you copied from Codecov
6. Click **"Add secret"**

### Step 5: Verify the Integration

1. Make a small change to trigger the CI workflow (or manually trigger it)
2. Push the change to the `master` branch:
   ```bash
   git add .
   git commit -m "test: trigger CI to verify Codecov integration"
   git push origin master
   ```
3. Go to **"Actions"** tab in GitHub
4. Wait for the CI workflow to complete
5. Check the workflow logs for the **"Upload coverage to Codecov"** step
6. If successful, you'll see: `✓ Upload coverage to Codecov`

### Step 6: View Coverage Reports

1. Go to [codecov.io/gh/testacode/meli-trends](https://codecov.io/gh/testacode/meli-trends)
2. You should see your coverage report with:
   - Overall coverage percentage
   - Coverage by file
   - Coverage trends over time
   - Uncovered lines highlighted

### Step 7: Verify Badge in README

1. Open the README.md on GitHub
2. The Codecov badge should now display the current coverage percentage
3. Click the badge to navigate to the full coverage report

## Troubleshooting

### Badge Shows "unknown"

**Cause:** Codecov hasn't received coverage data yet.

**Solution:**
- Wait for the CI workflow to complete after setup
- Verify the upload step succeeded in GitHub Actions logs
- Check Codecov dashboard for error messages

### Upload Step Fails with 401 Error

**Cause:** Invalid or missing `CODECOV_TOKEN`.

**Solution:**
- Verify the token is correct in GitHub Secrets
- Ensure the secret name is exactly `CODECOV_TOKEN` (case-sensitive)
- Re-copy the token from Codecov dashboard

### Coverage Report Not Appearing

**Cause:** Coverage file not found or not generated.

**Solution:**
- Verify `npm run test:coverage` generates `coverage/lcov.info`
- Check CI workflow logs for coverage generation errors
- Ensure Vitest is configured correctly in `vitest.config.ts`

### Badge Shows 0% Coverage

**Cause:** Coverage file is empty or tests aren't running.

**Solution:**
- Run `npm run test:coverage` locally to verify it works
- Check that test files are being discovered (`.test.ts`, `.test.tsx`)
- Verify coverage output in `coverage/` directory

## Workflow Configuration

The CI workflow (`.github/workflows/ci.yml`) has been configured with the following step:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    flags: unittests
    name: codecov-umbrella
    fail_ci_if_error: false
```

**Configuration explained:**
- `token`: Authentication token from GitHub Secrets
- `files`: Path to the coverage report (lcov format)
- `flags`: Label for this coverage upload (helps organize multiple coverage types)
- `name`: Friendly name for this upload
- `fail_ci_if_error: false`: CI won't fail if Codecov upload fails (prevents blocking deployments)

## Additional Resources

- [Codecov Documentation](https://docs.codecov.com/)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [Vitest Coverage Guide](https://vitest.dev/guide/coverage.html)

## Support

If you encounter issues not covered in this guide:

1. Check the [Codecov Community](https://community.codecov.com/)
2. Review GitHub Actions workflow logs for detailed error messages
3. Verify coverage is being generated locally with `npm run test:coverage`

---

**Last Updated:** November 24, 2025
**Status:** ✅ CI workflow configured, awaiting Codecov account setup
