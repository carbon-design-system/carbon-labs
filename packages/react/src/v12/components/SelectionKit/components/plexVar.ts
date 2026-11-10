/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * IBM Plex Sans Variable (Latin 1), for `selectedWeight`: declared by the
 * kit's styles (`_plex-var.scss`), fetched once on first use. Resolves when
 * it has loaded, so the selected weight can be measured on it.
 */
export const PLEX_VAR = 'IBM Plex Sans Var';

let plexVarLoad: Promise<void> | null = null;

export function loadPlexVar(): Promise<void> {
  if (plexVarLoad) {
    return plexVarLoad;
  }
  if (
    typeof document === 'undefined' ||
    typeof FontFace === 'undefined' ||
    !document.fonts
  ) {
    return (plexVarLoad = Promise.resolve());
  }
  // No face yet (its styles not on the page): asked again on the next use.
  plexVarLoad = document.fonts.load(`1em "${PLEX_VAR}"`).then(
    (faces) => {
      if (faces.length === 0) {
        plexVarLoad = null;
      }
    },
    () => undefined
  );
  return plexVarLoad;
}
