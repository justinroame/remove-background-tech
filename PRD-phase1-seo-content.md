# PRD — Remove Background Tech Phase 1 SEO + Content Pass

## Objective
Complete Phase 1 for `remove-background.tech` without changing the site's overall look or layout. Improve SEO and search-intent coverage primarily through blog/comparison/use-case content and metadata cleanup.

## Non-goals
- Do not redesign the homepage or change the visual layout significantly.
- Do not add major new product features.
- Do not turn the homepage into a wall of text.

## Constraints
- Preserve current site structure and visual feel.
- Homepage changes should be limited to small text/metadata improvements only.
- Prefer credible, useful comparisons over exaggerated marketing claims.
- Use stable workspace paths only. Do not use tmp.

## Required outcomes
1. Rewrite weak or overclaiming blog content to be more credible and SEO-useful.
2. Add missing comparison pages:
   - Remove-Background.Tech vs remove.bg
   - Remove-Background.Tech vs Photoroom
   - Remove-Background.Tech vs Pixlr Background Remover
3. Add missing use-case pages:
   - remove background for Amazon listings
   - white background product photos
   - remove background without Photoshop
4. Tighten homepage metadata/copy without changing layout.
5. Improve sitemap/internal linking so the blog/content cluster is discoverable.
6. Leave the repo in a clean, review-ready state.

## Existing work already in progress
Some existing files have already been rewritten in the working tree. Preserve useful progress, but review for consistency and completeness.

## Likely files to inspect/update
- `app/page.tsx`
- `app/layout.tsx`
- `app/head.tsx`
- `app/blog/page.tsx`
- existing blog post files under `app/blog/*`
- `sitemap.xml`

## Deliverable
A concise summary of:
- files changed
- new pages added
- homepage/meta changes made
- sitemap/internal-link changes
- anything that should be rubberstamped before deploy
