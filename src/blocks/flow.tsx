// A diagram block built on React Flow. Jev decides whether a brief needs one; the writer names the nodes.
import { Background, Position, ReactFlow, type Edge, type Node } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { items, type BlockProps } from './types'

const SAMPLE = [['Input', 'What comes in'], ['Validate', 'Checked and cleaned'], ['Process', 'The main work'], ['Review', 'A second look'], ['Deliver', 'Out to the world']]

export function Flow({ spec, text }: BlockProps) {
  const steps = items(text, SAMPLE.map(([title, body]) => ({ title, body, meta: '' })))
  const nodes: Node[] = steps.map((s, i) => ({
    id: `n${i}`, position: { x: i * 230, y: i % 2 ? 46 : 0 }, sourcePosition: Position.Right, targetPosition: Position.Left,
    data: { label: <div className="text-left"><p className="text-sm font-medium">{s.title}</p>{s.body ? <p className="mt-0.5 text-xs text-muted-foreground">{s.body}</p> : null}</div> },
    style: { width: 180, borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--card-foreground)', padding: 12, boxShadow: 'none' },
  }))
  const edges: Edge[] = steps.slice(1).map((_, i) => ({ id: `e${i}`, source: `n${i}`, target: `n${i + 1}`, animated: true, style: { stroke: 'var(--primary)', strokeWidth: 1.5 } }))
  const diagram = (
    <div className="h-64 w-full overflow-hidden rounded-xl border bg-muted/30">
      <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.12 }} proOptions={{ hideAttribution: true }} colorMode={spec.theme.dark ? 'dark' : 'light'}
        nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false} zoomOnDoubleClick={false} preventScrolling={false}>
        <Background gap={18} size={1} color="var(--border)" />
      </ReactFlow>
    </div>
  )
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
