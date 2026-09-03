// Custom commit hook for changesets.
//
// We only implement `getAddMessage` so that running `pnpm changeset` (the
// `changeset add` command) auto-commits the generated changeset file with a
// Conventional Commits message.
//
// We deliberately leave `getVersionMessage` undefined so that
// `changeset version` does NOT auto-commit: the release workflow (changesets
// GitHub Action) handles the version commit itself, and running
// `pnpm version-packages` locally should leave the version bump + CHANGELOG
// edits uncommitted for review.

export default {
	getAddMessage: (changeset) => `docs(changeset): ${changeset.summary}`,
};
