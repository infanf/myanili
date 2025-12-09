# Release Process

This project uses automated GitHub Actions workflows to manage releases. The process creates a release PR with version updates, and automatically tags the merge commit when the PR is merged.

## Quick Start

1. **Trigger the release workflow** with your desired version number
2. **Review the auto-generated PR** and ensure all checks pass
3. **Merge the PR** to beta branch
4. **Automatic tagging** creates the version tag and triggers deployment

## Detailed Steps

### 1. Create a Release PR

Navigate to the **Actions** tab in GitHub and select the **"Create Release PR"** workflow.

1. Click **"Run workflow"**
2. Enter the new version number in format `X.Y.Z` (e.g., `2.35.0`)
3. Click **"Run workflow"** button

The workflow will:
- ✅ Validate the version format
- ✅ Check that the version tag doesn't already exist
- ✅ Create a new branch `release/vX.Y.Z`
- ✅ Update version in:
  - Root `package.json`
  - `frontend/package.json`
  - `backend/composer.json`
- ✅ Update lock files:
  - Root `package-lock.json`
  - `frontend/package-lock.json`
  - `backend/composer.lock`
- ✅ Commit all changes
- ✅ Create a Pull Request to `beta` branch with label `release`

### 2. Review the Release PR

The auto-generated PR will be titled **"Release vX.Y.Z"** and include:
- Version updates in all package files
- Updated lock files
- A checklist to verify changes

**Review checklist:**
- [ ] Version number is correct
- [ ] All lock files have been updated
- [ ] CI checks pass (build workflow)
- [ ] No unintended changes were made

### 3. Merge the Release PR

Once you've verified everything:
1. Approve the PR (if your repo requires reviews)
2. Merge the PR using **"Squash and merge"** or **"Create a merge commit"**

⚠️ **Important:** Do not delete the branch immediately if you want to preserve the commit history.

### 4. Automatic Tagging & Deployment

When the release PR is merged, the **"Tag Release"** workflow automatically:
- ✅ Extracts the version from the PR title
- ✅ Verifies the version matches `package.json`
- ✅ Creates a git tag `vX.Y.Z` on the merge commit
- ✅ Creates a GitHub Release with the PR description as release notes
- ✅ Triggers the **deploy.yml** workflow (builds Docker images and deploys to GCP)

### Deployment Stages

After tagging, your existing `deploy.yml` workflow handles deployment:

**For version tags (e.g., `v2.35.0`):**
- Builds and pushes Docker images tagged with version, `release`, and `latest`
- Deploys to **production** Google Cloud Run instance (`myanili`)

**For beta branch commits:**
- Builds and pushes Docker images tagged with `beta`
- Deploys to **beta** Google Cloud Run instances

## Version Numbering

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** version (X.0.0): Incompatible API changes
- **MINOR** version (X.Y.0): New functionality (backwards-compatible)
- **PATCH** version (X.Y.Z): Bug fixes (backwards-compatible)

Examples:
- `2.34.4` → `2.34.5` (patch: bug fixes)
- `2.34.4` → `2.35.0` (minor: new features)
- `2.34.4` → `3.0.0` (major: breaking changes)

## Troubleshooting

### Version already exists
**Error:** `Version tag vX.Y.Z already exists`

**Solution:** Check existing tags with `git tag -l` and choose a different version number.

### PR checks failing
**Error:** CI checks fail on the release PR

**Solution:**
- Review the failed check logs
- If needed, push fixes to the `release/vX.Y.Z` branch
- Wait for checks to pass before merging

### Version mismatch error
**Error:** `Version in package.json does not match PR title version`

**Solution:** This usually means the PR was modified after creation. Verify the versions in all files match the PR title.

### Tag not created after merge
**Error:** Merge commit wasn't tagged

**Solution:**
- Ensure the PR had the `release` label
- Check the "Tag Release" workflow run in the Actions tab
- Manually create the tag if needed: `git tag -a vX.Y.Z -m "Release X.Y.Z" && git push origin vX.Y.Z`

## Manual Release (Emergency Only)

If the automated workflows are unavailable, you can create a release manually:

```bash
# Update versions
npm version X.Y.Z --no-git-tag-version
cd frontend && npm version X.Y.Z --no-git-tag-version && cd ..
cd backend && composer config version X.Y.Z && cd ..

# Update lock files
npm install --package-lock-only
cd frontend && npm install --package-lock-only && cd ..
cd backend && composer install --no-interaction && cd ..

# Commit and tag
git add .
git commit -m "chore: bump version to X.Y.Z"
git tag -a vX.Y.Z -m "Release X.Y.Z"
git push origin beta
git push origin vX.Y.Z
```

## Workflow Files

- **`.github/workflows/create-release-pr.yml`** - Creates release PR with version updates
- **`.github/workflows/tag-release.yml`** - Auto-tags merge commits from release PRs
- **`.github/workflows/deploy.yml`** - Builds Docker images and deploys to GCP
