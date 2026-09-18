import type { Spec, SpecBlock } from '@shared/harness'
import type { BlockText, DesignLink, TextItem } from '@shared/text'

export interface BlockProps {
  spec: Spec
  props: SpecBlock['props']
  /** The writer's words for this block. Undefined when Luna is off: blocks fall back to pre-written copy. */
  text?: BlockText
  /** Outbound links, taken from what the person typed. */
  links: DesignLink[]
}

export const list = (v: unknown) => (Array.isArray(v) ? (v as string[]) : [])

/** The writer's items when it supplied any, otherwise the pre-written ones. */
export const items = (text: BlockText | undefined, fallback: TextItem[]): TextItem[] => (text?.items.length ? text.items : fallback)
