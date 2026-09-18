import {
  Activity, Award, BadgeCheck, Bell, BookOpen, Calendar, Camera, ChartColumn, Check, CircleX, Clock, Code, Download, Gift, GitBranch,
  Globe, GraduationCap, Hammer, Headphones, Heart, History, House, KeyRound, LayoutGrid, Leaf, Lock, Map, MapPin, MessageCircle,
  Percent, Play, Plug, Receipt, Recycle, Search, Send, ShieldCheck, Smartphone, Smile, Sparkles, Star, Tag, Target, Terminal,
  ThumbsUp, Ticket, TrendingUp, Truck, Undo2, UserCheck, Users, Video, Wallet, Watch, WifiOff, Workflow, Zap, type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  users: Users, plug: Plug, workflow: Workflow, chart: ChartColumn, code: Code, key: KeyRound, layout: LayoutGrid, phone: Smartphone,
  bell: Bell, search: Search, sparkles: Sparkles, download: Download, history: History, wifi_off: WifiOff, terminal: Terminal,
  git: GitBranch, zap: Zap, activity: Activity, lock: Lock, shield: ShieldCheck, truck: Truck, undo: Undo2, calendar: Calendar,
  leaf: Leaf, recycle: Recycle, heart: Heart, gift: Gift, star: Star, map_pin: MapPin, target: Target, trending: TrendingUp,
  award: Award, message: MessageCircle, watch: Watch, play: Play, clock: Clock, wallet: Wallet, send: Send, receipt: Receipt,
  globe: Globe, percent: Percent, map: Map, tag: Tag, check: Check, x_circle: CircleX, thumbs_up: ThumbsUp, headphones: Headphones,
  ticket: Ticket, graduation: GraduationCap, badge: BadgeCheck, book: BookOpen, video: Video, hammer: Hammer, user_check: UserCheck,
  camera: Camera, smile: Smile, home: House,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Sparkles
  return <Cmp className={className} aria-hidden />
}
