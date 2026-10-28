/**
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { usePrefix } from '@carbon/react';
import { ChevronDown, ChevronUp, Copy } from '@carbon/icons-react';
import { MegaButton } from '@carbon-labs/react-mega-button';
import { highlight as builtIn, type CodeSnippetHighlighter } from './highlight';

// How long "Copied" stays before the button reads "Copy code" again: Carbon's
// CodeSnippet feedback timeout.
const copiedFeedbackMs = 2000;

export interface CodeSnippetTranslations {
  copy: string;
  copied: string;
  showMore: string;
  showLess: string;
  /** Builds the line count in the header, `15 lines`. */
  lines: (count: number) => string;
}

export interface CodeSnippetProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onCopy'
> {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className?: string;

  /**
   * The code, exactly as it should be copied.
   */
  code: string;

  /**
   * Lines shown before Show more. Code no longer than this shows in full and
   * has no toggle.
   */
  collapsedLines?: number;

  /**
   * Open on mount (uncontrolled).
   */
  defaultExpanded?: boolean;

  /**
   * Show every line (controlled). Pair with `onExpandedChange`.
   */
  expanded?: boolean;

  /**
   * Turns the code into coloured tokens. The built-in lexer covers the
   * C-family and Python; pass a grammar-based one for anything else, or
   * `false` to show the code uncoloured.
   */
  highlight?: CodeSnippetHighlighter | false;

  /**
   * The language, shown in the header and used to name the code region
   * (`JavaScript`, `Python`, `page.py`).
   */
  language?: string;

  /**
   * Called after the code is copied to the clipboard.
   */
  onCopy?: (code: string) => void;

  /**
   * Called when Show more or Show less is pressed.
   */
  onExpandedChange?: (expanded: boolean) => void;

  /**
   * Number the lines. The numbers are never copied or read out.
   */
  showLineNumbers?: boolean;

  /**
   * The words the snippet uses, for translation.
   */
  translations?: Partial<CodeSnippetTranslations>;
}

const defaultTranslations: CodeSnippetTranslations = {
  copy: 'Copy code',
  copied: 'Copied',
  showMore: 'Show more',
  showLess: 'Show less',
  lines: (count) => (count === 1 ? '1 line' : `${count} lines`),
};

/**
 * Code an agent wrote or ran, inside a conversation: the language and line
 * count, a round Copy, numbered and coloured lines, and Show more for anything
 * longer than `collapsedLines`. Carbon's CodeSnippet is the nearest; it has no
 * syntax colour, and its show-more is a flush bar rather than a round control.
 */
export const CodeSnippet = forwardRef<HTMLDivElement, CodeSnippetProps>(
  function CodeSnippet(
    {
      className,
      code,
      collapsedLines = 9,
      defaultExpanded = false,
      expanded: expandedProp,
      highlight = builtIn,
      language,
      onCopy,
      onExpandedChange,
      showLineNumbers = true,
      translations,
      ...rest
    },
    ref
  ) {
    const prefix = usePrefix();
    const block = `${prefix}--code-snippet`;
    const t = { ...defaultTranslations, ...translations };
    const regionId = useId();
    const [expandedState, setExpandedState] = useState(defaultExpanded);
    const expanded = expandedProp ?? expandedState;
    const [copied, setCopied] = useState(false);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const preRef = useRef<HTMLPreElement | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    const lines = useMemo(() => code.replace(/\n$/, '').split('\n'), [code]);
    const tokens = useMemo(
      () => (highlight ? highlight(code, language) : null),
      [code, language, highlight]
    );
    const collapsible = lines.length > collapsedLines;

    useEffect(() => () => clearTimeout(timer.current), []);

    // A block-size cannot transition to auto, so the viewport gets measured
    // lengths: the collapsed lines, or the whole code. Written through the
    // ref, because labs lint forbids a style prop.
    useLayoutEffect(() => {
      const viewport = viewportRef.current;
      const pre = preRef.current;
      if (!viewport || !pre) {
        return undefined;
      }
      const measure = () => {
        if (!collapsible) {
          viewport.style.blockSize = '';
          return;
        }
        const lineHeight = parseFloat(getComputedStyle(pre).lineHeight) || 0;
        // Collapsed, the viewport drops its bottom padding so the cut falls
        // on a line boundary; open, scrollHeight includes that padding.
        viewport.style.blockSize = expanded
          ? `${viewport.scrollHeight}px`
          : `${lineHeight * collapsedLines}px`;
      };
      measure();
      if (typeof ResizeObserver === 'undefined') {
        return undefined;
      }
      const observer = new ResizeObserver(measure);
      observer.observe(pre);
      return () => observer.disconnect();
    }, [expanded, collapsible, collapsedLines, lines.length]);

    function toggle() {
      const next = !expanded;
      if (expandedProp === undefined) {
        setExpandedState(next);
      }
      onExpandedChange?.(next);
    }

    async function copy() {
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        // A refused clipboard reports nothing as copied.
        return;
      }
      setCopied(true);
      onCopy?.(code);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), copiedFeedbackMs);
    }

    return (
      <div ref={ref} className={cx(block, className)} {...rest}>
        <div className={`${block}__header`}>
          <span className={`${block}__meta`}>
            {language ? (
              <>
                <span className={`${block}__language`}>{language}</span>
                <span className={`${block}__count`} aria-hidden="true">
                  —
                </span>
              </>
            ) : null}
            <span className={`${block}__count`}>{t.lines(lines.length)}</span>
          </span>
          <MegaButton
            kind="ghost"
            size="sm"
            hasIconOnly
            renderIcon={Copy}
            tooltipAlignment="left"
            className={`${block}__copy`}
            onClick={copy}>
            {copied ? t.copied : t.copy}
          </MegaButton>
          {/* The button's name changes to "Copied"; a status region says it
              aloud, since a name change alone is not announced. */}
          <span className={`${prefix}--visually-hidden`} aria-live="polite">
            {copied ? t.copied : ''}
          </span>
        </div>
        {/* The code scrolls sideways rather than wrapping, so the region must
            be reachable from the keyboard. */}
        <div
          ref={viewportRef}
          id={regionId}
          className={cx(`${block}__viewport`, {
            [`${block}__viewport--collapsed`]: collapsible && !expanded,
          })}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="region"
          aria-label={language ? `${language} code` : 'Code'}>
          {showLineNumbers ? (
            <span className={`${block}__numbers`} aria-hidden="true">
              {lines.map((_, index) => index + 1).join('\n')}
            </span>
          ) : null}
          <pre ref={preRef} className={`${block}__pre`}>
            <code className={`${block}__code`}>
              {tokens
                ? tokens.map((token, index) =>
                    token.kind === 'plain' ? (
                      token.text
                    ) : (
                      <span
                        // Tokens are positional and never reorder.
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        className={`${block}__token--${token.kind}`}>
                        {token.text}
                      </span>
                    )
                  )
                : code}
            </code>
          </pre>
        </div>
        {collapsible ? (
          <div className={`${block}__footer`}>
            <MegaButton
              kind="ghost"
              size="xs"
              renderIcon={expanded ? ChevronUp : ChevronDown}
              iconPosition="trailing"
              aria-expanded={expanded}
              aria-controls={regionId}
              onClick={toggle}>
              {expanded ? t.showLess : t.showMore}
            </MegaButton>
          </div>
        ) : null}
      </div>
    );
  }
);

CodeSnippet.displayName = 'CodeSnippet';

CodeSnippet.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * The code, exactly as it should be copied.
   */
  code: PropTypes.string.isRequired,

  /**
   * Lines shown before Show more. Code no longer than this shows in full and
   * has no toggle.
   */
  collapsedLines: PropTypes.number,

  /**
   * Open on mount (uncontrolled).
   */
  defaultExpanded: PropTypes.bool,

  /**
   * Show every line (controlled). Pair with `onExpandedChange`.
   */
  expanded: PropTypes.bool,

  /**
   * Turns the code into coloured tokens. The built-in lexer covers the
   * C-family and Python; pass a grammar-based one for anything else, or
   * `false` to show the code uncoloured.
   */
  highlight: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([false])]),

  /**
   * The language, shown in the header and used to name the code region
   * (`JavaScript`, `Python`, `page.py`).
   */
  language: PropTypes.string,

  /**
   * Called after the code is copied to the clipboard.
   */
  onCopy: PropTypes.func,

  /**
   * Called when Show more or Show less is pressed.
   */
  onExpandedChange: PropTypes.func,

  /**
   * Number the lines. The numbers are never copied or read out.
   */
  showLineNumbers: PropTypes.bool,

  /**
   * The words the snippet uses, for translation.
   */
  translations: PropTypes.shape({
    copy: PropTypes.string,
    copied: PropTypes.string,
    showMore: PropTypes.string,
    showLess: PropTypes.string,
    lines: PropTypes.func,
  }),
} as React.WeakValidationMap<CodeSnippetProps>;
