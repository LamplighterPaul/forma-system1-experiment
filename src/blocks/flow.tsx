// Diagrams, drawn with React Flow. Jev decides that a brief needs one and which shape it takes;
// the writer names the boxes and says how they connect; code validates the graph and lays it out.
import { Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMemo } from 'react'
import { graphOf, type Graph, type TextItem } from '@shared/text'
import type { BlockProps } from './types'

type Shape = 'pipeline' | 'tree' | 'hub' | 'cycle'
type Side = 'l' | 'r' | 't' | 'b'
const SIDES: Record<Side, Position> = { l: Position.Left, r: Position.Right, t: Position.Top, b: Position.Bottom }
const W = 200, H = 72

// Pre-written graphs, used when Luna is off. Boxes point TO the numbers in the last column.
const SAMPLES: Record<Shape, [string, string, string][]> = {
  pipeline: [['Sources', 'Where it starts', '2,3'], ['Validate', 'Checked and cleaned', '4'], ['Enrich', 'Context added', '4'], ['Process', 'The main work', '5,6'], ['Store', 'Kept safely', '7'], ['Notify', 'People are told', ''], ['Report', 'Out to the world', '']],
  tree: [['Home', 'The starting point', '2,3,4'], ['Products', 'What is offered', '5,6'], ['About', 'Who is behind it', '7'], ['Support', 'Help and contact', ''], ['Overview', 'The range', ''], ['Pricing', 'Plans and costs', ''], ['Team', 'The people', '']],
  hub: [['The idea', 'At the centre', '2,3,4,5,6,7'], ['People', 'Who is involved', ''], ['Product', 'What is made', ''], ['Money', 'How it is funded', ''], ['Market', 'Who it is for', ''], ['Operations', 'How it runs', ''], ['Risks', 'What could go wrong', '']],
  cycle: [['Plan', 'Decide what matters', '2'], ['Build', 'Make the thing', '3'], ['Measure', 'See what happened', '4'], ['Learn', 'Understand why', '5'], ['Adjust', 'Change course', '']],
}

/** Every box has a connection point on each side; edges use whichever pair faces each other. */
function Box({ data }: NodeProps<Node<{ label: string; detail: string; lead: boolean }>>) {
  return (
    <div className={`flex h-full flex-col justify-center border px-3.5 py-2 text-left shadow-sm ${data.lead ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-card-foreground'}`} style={{ borderRadius: 'var(--radius)' }}>
      <p className="text-[13px] leading-tight font-medium">{data.label}</p>
      {data.detail ? <p className={`mt-1 text-[11px] leading-snug ${data.lead ? 'opacity-80' : 'text-muted-foreground'}`}>{data.detail}</p> : null}
      {(Object.keys(SIDES) as Side[]).flatMap(side => [
        <Handle key={`s${side}`} id={`s${side}`} type="source" position={SIDES[side]} isConnectable={false} className="!size-0 !min-h-0 !min-w-0 !border-0 !bg-transparent" />,
        <Handle key={`t${side}`} id={`t${side}`} type="target" position={SIDES[side]} isConnectable={false} className="!size-0 !min-h-0 !min-w-0 !border-0 !bg-transparent" />,
      ])}
    </div>
  )
}
const nodeTypes = { box: Box }

/** Longest-path layering: a box sits one rank after the latest box that points to it. Back-edges are drawn but do not affect rank. */
function ranks(g: Graph): number[] {
  const rank = g.nodes.map(() => 0)
  for (let pass = 0; pass < g.nodes.length; pass++) for (const [a, b] of g.edges) if (a < b) rank[b] = Math.max(rank[b], rank[a] + 1)
  return rank
}

function place(g: Graph, shape: Shape): { x: number; y: number }[] {
  const n = g.nodes.length
  if (shape === 'hub' || shape === 'cycle') {
    const ring = shape === 'hub' ? n - 1 : n, rx = Math.max(300, ring * 52), ry = Math.max(190, ring * 34)
    return g.nodes.map((_, i) => {
      if (shape === 'hub' && i === 0) return { x: 0, y: 0 }
      const k = shape === 'hub' ? i - 1 : i
      const angle = (2 * Math.PI * k) / ring - Math.PI / 2
      return { x: Math.cos(angle) * rx, y: Math.sin(angle) * ry }
    })
  }
  const rank = ranks(g)
  const rows = new Map<number, number[]>()
  rank.forEach((r, i) => rows.set(r, [...(rows.get(r) ?? []), i]))
  if (shape === 'tree') {
    return g.nodes.map((_, i) => {
      const row = rows.get(rank[i])!, offset = row.indexOf(i) - (row.length - 1) / 2
      return { x: offset * (W + 36), y: rank[i] * (H + 70) }
    })
  }
  // A long pipeline wraps like text: four stages to a line, alternating direction so each turn is a short drop.
  // One long row would be shrunk to fit and become unreadable.
  const PER_LINE = 4
  const tallest = (line: number) => Math.max(1, ...[...rows].filter(([r]) => Math.floor(r / PER_LINE) === line).map(([, ids]) => ids.length))
  const lineTop: number[] = []
  for (let line = 0, y = 0; line <= Math.floor(Math.max(...rank) / PER_LINE); line++) { lineTop[line] = y + (tallest(line) * (H + 34)) / 2; y += tallest(line) * (H + 34) + 56 }
  return g.nodes.map((_, i) => {
    const row = rows.get(rank[i])!, offset = row.indexOf(i) - (row.length - 1) / 2
    const line = Math.floor(rank[i] / PER_LINE), col = rank[i] % PER_LINE
    return { x: (line % 2 ? PER_LINE - 1 - col : col) * (W + 80), y: lineTop[line] + offset * (H + 34) }
  })
}

function build(items: TextItem[], shape: Shape): { nodes: Node[]; edges: Edge[] } {
  const g = graphOf(items)
  // A mind map radiates from its centre and a cycle closes on itself, whatever connections the writer gave.
  if (shape === 'hub') g.edges = g.nodes.slice(1).map((_, i) => [0, i + 1])
  if (shape === 'cycle') g.edges = g.nodes.map((_, i) => [i, (i + 1) % g.nodes.length])
  const at = place(g, shape)
  const nodes: Node[] = g.nodes.map((node, i) => ({ id: `n${i}`, type: 'box', position: { x: at[i].x - W / 2, y: at[i].y - H / 2 }, width: W, height: H,
    data: { label: node.label, detail: node.detail, lead: i === 0 && shape !== 'cycle' } }))
  const edges: Edge[] = g.edges.map(([a, b]) => {
    const dx = at[b].x - at[a].x, dy = at[b].y - at[a].y
    const [from, to]: [Side, Side] = Math.abs(dx) * (H / W) >= Math.abs(dy) ? (dx >= 0 ? ['r', 'l'] : ['l', 'r']) : (dy >= 0 ? ['b', 't'] : ['t', 'b'])
    return { id: `e${a}-${b}`, source: `n${a}`, target: `n${b}`, sourceHandle: `s${from}`, targetHandle: `t${to}`, type: shape === 'pipeline' || shape === 'tree' ? 'smoothstep' : 'default',
      animated: shape === 'pipeline' || shape === 'cycle', style: { stroke: 'var(--primary)', strokeWidth: 1.5 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--primary)', width: 16, height: 16 } }
  })
  return { nodes, edges }
}

export function Flow({ spec, props, text }: BlockProps) {
  const shape = (['pipeline', 'tree', 'hub', 'cycle'].includes(String(props.shape)) ? props.shape : 'pipeline') as Shape
  const items = text?.items.length ? text.items : SAMPLES[shape].map(([title, body, meta]) => ({ title, body, meta }))
  const { nodes, edges } = useMemo(() => build(items, shape), [items, shape])
  const whole = spec.layout === 'diagram'

  const diagram = (
    // `key` remounts the diagram when the graph changes, so it is fitted to view again.
    <div className={`w-full overflow-hidden rounded-xl border bg-muted/30 ${whole ? 'h-[620px]' : 'h-[440px]'}`}>
      <ReactFlow key={`${shape}:${items.map(i => `${i.title}>${i.meta}`).join('|')}`} defaultNodes={nodes} defaultEdges={edges} nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding: whole ? 0.24 : 0.14, maxZoom: 1.15 }} minZoom={0.35} maxZoom={1.6} colorMode={spec.theme.dark ? 'dark' : 'light'} proOptions={{ hideAttribution: true }}
        nodesConnectable={false} elementsSelectable={false} zoomOnScroll={false} preventScrolling={false} zoomOnDoubleClick>
        <Background gap={20} size={1} color="var(--border)" />
        <Controls showInteractive={false} position="bottom-left" />
        {whole ? <MiniMap pannable zoomable position="top-right" nodeColor="var(--primary)" maskColor="color-mix(in oklab, var(--background) 70%, transparent)" style={{ background: 'var(--card)', border: '1px solid var(--border)', width: 112, height: 76, margin: 8 }} /> : null}
      </ReactFlow>
    </div>
  )

  if (whole) {
    return (
      <section className="p-6 @3xl:p-10">
        <h1 className="forma-heading text-3xl font-semibold tracking-tight text-balance @3xl:text-4xl">{text?.heading || spec.brief.split('\n')[0].slice(0, 80)}</h1>
        <p className="mt-2 mb-6 max-w-2xl text-muted-foreground">{text?.sub || 'A sample diagram. Switch Luna on to have the boxes written for this brief.'}</p>
        {diagram}
        <p className="mt-3 text-xs text-muted-foreground">Drag to pan. Drag a box to move it.</p>
      </section>
    )
  }
  if (spec.layout === 'app_screen') return <div className="rounded-xl border bg-card p-4"><p className="mb-3 font-medium">{text?.heading || 'Pipeline'}</p>{diagram}</div>
  return (
    <section className="section px-6">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="forma-heading text-3xl font-semibold tracking-tight text-balance">{text?.heading || 'How it fits together'}</h2>
        {text?.sub ? <p className="mt-3 text-muted-foreground">{text.sub}</p> : null}
      </div>
      {diagram}
    </section>
  )
}
