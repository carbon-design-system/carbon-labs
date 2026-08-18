# Processing v2.0 proposal plan

## Overview
Add a new interactive controls story for Processing in Carbon Labs and document it in the existing attached MDX docs as a proposed v2.0 update. The lightest-weight repo-aligned approach is to extend the current Processing Storybook surface rather than introduce a separate proposal artifact. The implemented proposal now frames v2.0 around default loading behavior that continues until a new mode is triggered, removing the need for separate loop and no-loop Labs story variants while keeping migration additive.

## Sub-tasks

### 1. Inspect the existing Processing story and docs structure
- **Intent** — Ground the implementation in the current Processing story exports, story naming, docs composition, and any existing proposal-style wording so the new v2.0 material fits the repo’s established patterns.
- **Expected Outcomes** — Clear understanding of how [`src/stories/Processing.stories.tsx`](src/stories/Processing.stories.tsx) is organized, how [`src/stories/Processing.mdx`](src/stories/Processing.mdx) references it, and whether any existing story or doc content can be extended directly.
- **Todo List**
  1. Read [`src/stories/Processing.stories.tsx`](src/stories/Processing.stories.tsx).
  2. Read [`src/stories/Processing.mdx`](src/stories/Processing.mdx).
  3. Check for nearby examples of interactive demo stories or proposal wording in other component docs if needed.
  4. Confirm whether any generated metadata requires source changes or is build-generated only.
- **Relevant Context** — [`index.json`](index.json), [`project.json`](project.json), [`src/stories/Processing.stories.tsx`](src/stories/Processing.stories.tsx), [`src/stories/Processing.mdx`](src/stories/Processing.mdx).
- **Status** — [x] done

### 2. Add the Processing interactive controls story
- **Intent** — Introduce a dedicated story that lets reviewers explore the Processing element through interactive controls, making the proposed v2.0 behavior tangible inside Carbon Labs.
- **Expected Outcomes** — A new or updated story export appears under the Processing component in Storybook, uses existing story conventions, hides deprecated loop-variant distinctions, and exposes only the controls needed for the v2.0 proposal without unnecessary refactoring.
- **Todo List**
  1. Identify the smallest story addition that demonstrates interactive controls clearly.
  2. Reuse existing Processing story helpers and args patterns where possible.
  3. Add or adjust argTypes only where needed to support the proposed interactive controls experience.
  4. Keep story naming aligned with current Processing naming conventions.
- **Relevant Context** — [`src/stories/Processing.stories.tsx`](src/stories/Processing.stories.tsx) and any shared helpers it already uses.
- **Status** — [x] done

### 3. Document the proposed v2.0 update in the attached MDX docs
- **Intent** — Capture the broader v2.0 proposal in the current Processing docs page so the new story is framed with intended use cases, interaction guidance, behavior or API changes, and migration guidance for adopting the new modes without changing the existing base behavior.
- **Expected Outcomes** — The Processing docs page clearly presents v2.0 as a proposal, links to or embeds the interactive controls v2.0 proposal story, explains the design intent in a reviewable format consistent with existing docs, and clarifies that migration is limited to opting into new modes while existing base loading behavior remains unchanged.
- **Todo List**
  1. Add a proposed v2.0 section to [`src/stories/Processing.mdx`](src/stories/Processing.mdx).
  2. Document intended use cases for the updated Processing element.
  3. Document interaction guidance and expected user behavior.
  4. Describe any proposed behavior or API changes, scoped to what the repo already surfaces in stories/docs.
  5. Add migration guidance that explains the existing base behavior is preserved and only adoption of new modes requires change.
  6. Reference the new interactive controls story from the MDX page.
- **Relevant Context** — [`src/stories/Processing.mdx`](src/stories/Processing.mdx), [`src/stories/Processing.stories.tsx`](src/stories/Processing.stories.tsx).
- **Status** — [x] done

### 4. Validate navigation and repo metadata impact
- **Intent** — Ensure the new story and doc updates fit the existing Carbon Labs navigation and metadata model without introducing extra repo changes that are not required.
- **Expected Outcomes** — Confidence that attached MDX navigation remains correct, and any additional metadata or generated artifacts are updated only if the repo workflow already expects them.
- **Todo List**
  1. Verify whether Storybook navigation is source-driven from stories and MDX only.
  2. Check whether changelog or proposal status labels exist in source files rather than generated outputs.
  3. Limit changes to required source files unless repo conventions clearly require more.
- **Relevant Context** — [`index.json`](index.json), [`project.json`](project.json), Storybook source files discovered during implementation.
- **Status** — [x] done

### 5. Run the relevant validation for the changed Storybook content
- **Intent** — Confirm the updated stories and docs render cleanly and do not introduce regressions before implementation is considered complete.
- **Expected Outcomes** — Relevant Storybook or project validation passes for the touched files, with no new failures introduced by the Processing v2.0 proposal changes and only the pre-existing Vite chunk-size warnings remaining during Storybook build.
- **Todo List**
  1. Identify the repo’s available validation commands for Storybook content.
  2. Run the smallest relevant validation after edits.
  3. Resolve any issues directly caused by the changes.
- **Relevant Context** — package scripts and project configuration to be inspected during implementation.
- **Status** — [x] done
