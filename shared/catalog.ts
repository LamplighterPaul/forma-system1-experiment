// The catalog is everything Jev can pick from. Jev never writes text or code:
// every string below was written in advance, and Jev only chooses among them.

export type Layout = 'marketing_page' | 'app_screen' | 'centered_card'

export const LAYOUTS: Record<Layout, string> = {
  marketing_page:
    'A public web page that scrolls: landing page, product page, portfolio, event page, pricing page',
  app_screen:
    'A screen inside a logged-in application: dashboard, admin panel, inbox, table of records, analytics, settings',
  centered_card:
    'One focused card in the middle of the screen: sign in, sign up, waitlist, contact form, short form',
}

// Named by meaning, never by hex: Jev judges words better than numbers.
export const ACCENTS: Record<string, { about: string; light: string; dark: string }> = {
  neutral: { about: 'Black and white, no accent colour: minimal, editorial, luxury, monochrome', light: 'oklch(0.205 0 0)', dark: 'oklch(0.922 0 0)' },
  blue: { about: 'Blue: trust, business software, finance, healthcare, technology', light: 'oklch(0.546 0.215 262)', dark: 'oklch(0.623 0.188 260)' },
  indigo: { about: 'Indigo: modern software, productivity tools, AI products', light: 'oklch(0.511 0.23 277)', dark: 'oklch(0.585 0.204 277)' },
  violet: { about: 'Violet or purple: creative tools, journaling, wellbeing, imagination', light: 'oklch(0.541 0.247 293)', dark: 'oklch(0.606 0.219 293)' },
  pink: { about: 'Pink: beauty, fashion, dating, playful consumer products', light: 'oklch(0.592 0.218 0.6)', dark: 'oklch(0.656 0.212 354)' },
  red: { about: 'Red: urgency, news, sport, bold energy, sales', light: 'oklch(0.577 0.215 27)', dark: 'oklch(0.637 0.208 25)' },
  orange: { about: 'Orange: food, warmth, community, construction, energy', light: 'oklch(0.646 0.194 41)', dark: 'oklch(0.705 0.187 48)' },
  amber: { about: 'Amber or yellow: coffee, bakery, honey, sunshine, optimism, craft', light: 'oklch(0.666 0.157 58)', dark: 'oklch(0.769 0.165 70)' },
  green: { about: 'Green: nature, plants, sustainability, money, health, growth', light: 'oklch(0.527 0.137 150)', dark: 'oklch(0.648 0.175 150)' },
  teal: { about: 'Teal: calm, wellness, travel, water, clarity', light: 'oklch(0.511 0.086 186)', dark: 'oklch(0.704 0.123 182)' },
  sky: { about: 'Sky blue: weather, flight, cloud services, children, freshness', light: 'oklch(0.588 0.139 242)', dark: 'oklch(0.685 0.148 237)' },
}

export const FONTS: Record<string, string> = {
  sans: 'Clean sans-serif: software, modern brands, most products',
  serif: 'Serif: editorial, literary, luxury, heritage, journaling, food and wine',
  mono: 'Monospace: developer tools, terminals, technical or hacker feel',
}

export const RADIUS_LEVELS = [
  'Sharp square corners: serious, technical, editorial, financial',
  'Softly rounded corners: neutral and modern',
  'Very round, pill-like corners: friendly, playful, consumer, for children',
]
export const DENSITY_LEVELS = [
  'Spacious and airy with generous whitespace: marketing, luxury, calm',
  'Balanced spacing',
  'Compact and information-dense: data tools, admin, trading, operations',
]

export interface Headline { h: string; sub: string }
// {name} is replaced with the product name when Jev finds one in the brief.
export const HEADLINES: Record<string, Headline> = {
  work_faster: { h: 'Do your best work, faster', sub: '{name} brings your team, tasks and tools into one place so nothing slips.' },
  one_place: { h: 'Everything in one place', sub: 'Stop switching tabs. {name} keeps what matters together and easy to find.' },
  built_for_teams: { h: 'Built for teams that ship', sub: 'Plan, build and release together with {name}.' },
  know_numbers: { h: 'Know your numbers', sub: '{name} turns your data into clear answers you can act on today.' },
  developers_first: { h: 'Made for developers', sub: 'A fast, scriptable toolkit with an API for everything. {name} gets out of your way.' },
  ai_assist: { h: 'Let AI handle the busywork', sub: '{name} automates the repetitive parts so you can focus on the work that matters.' },
  delivered_fresh: { h: 'Delivered fresh to your door', sub: 'Choose what you love and {name} brings it to you, right on schedule.' },
  taste_difference: { h: 'Taste the difference', sub: 'Small-batch, carefully sourced and made to be savoured. That is {name}.' },
  shop_collection: { h: 'Find something you will love', sub: 'Browse the new {name} collection, thoughtfully made and fairly priced.' },
  book_table: { h: 'Good food, good company', sub: 'Seasonal plates and a warm welcome. Book your table at {name}.' },
  stronger_every_day: { h: 'Stronger every day', sub: 'Personal plans, real coaching and progress you can see with {name}.' },
  feel_better: { h: 'Feel better, one day at a time', sub: '{name} helps you build calm, healthy habits that last.' },
  care_you_trust: { h: 'Care you can trust', sub: 'Book appointments, talk to professionals and manage your health with {name}.' },
  money_simple: { h: 'Money, made simple', sub: 'Track spending, save more and stay in control with {name}.' },
  get_paid: { h: 'Get paid faster', sub: 'Send invoices, accept payments and keep your books tidy with {name}.' },
  next_trip: { h: 'Your next trip starts here', sub: 'Plan, book and explore with {name}. Less searching, more travelling.' },
  stay_somewhere: { h: 'Stay somewhere special', sub: 'Hand-picked places and honest prices from {name}.' },
  dont_miss: { h: 'Do not miss it', sub: 'Get your tickets for {name} before they are gone.' },
  learn_anything: { h: 'Learn something new today', sub: 'Expert-led courses you can take at your own pace on {name}.' },
  selected_work: { h: 'Selected work', sub: '{name} designs and builds thoughtful things for good people.' },
  tell_story: { h: 'Stories worth your time', sub: 'Thoughtful writing, delivered regularly. Read {name}.' },
  write_it_down: { h: 'A quiet place to think', sub: '{name} is a private space for your notes, thoughts and reflections.' },
  find_people: { h: 'Find your people', sub: 'Join the {name} community and meet others who care about the same things.' },
  make_difference: { h: 'Make a difference today', sub: 'Your support helps {name} do more good, where it is needed most.' },
  home_sorted: { h: 'Your home, sorted', sub: 'Trusted local professionals, booked in minutes with {name}.' },
  find_home: { h: 'Find a place to call home', sub: 'Search homes to buy or rent with {name}.' },
  play_now: { h: 'Ready to play?', sub: 'Jump in, team up and climb the ranks in {name}.' },
  listen_now: { h: 'Press play', sub: 'Music, podcasts and playlists made for you on {name}.' },
  coming_soon: { h: 'Something new is coming', sub: '{name} is almost ready. Join the waitlist to be first in line.' },
  hire_talent: { h: 'Find the right people', sub: 'Post a role and meet qualified candidates quickly with {name}.' },
  pets_love: { h: 'Because they are family', sub: 'Everything your pet needs, chosen with care by {name}.' },
  kids_fun: { h: 'Learning that feels like play', sub: '{name} makes practice fun with games children actually enjoy.' },
}

export const CTAS: Record<string, string | null> = {
  'Get started': null, 'Start free trial': null, 'Book a demo': null, 'Shop now': null,
  'Subscribe': null, 'Join the waitlist': null, 'Download the app': null, 'Sign up free': null,
  'Book now': null, 'Get tickets': null, 'Donate': null, 'Contact us': null, 'Read the docs': null,
  'Start learning': null, 'View work': null, 'Play now': null, 'Get a quote': null, 'Book a table': null,
}

export interface Feature { title: string; desc: string; icon: string }
export const FEATURES: Record<string, Feature> = {
  collaboration: { title: 'Real-time collaboration', desc: 'Work together on the same thing at the same time.', icon: 'users' },
  integrations: { title: 'Integrations', desc: 'Connects with the tools you already use.', icon: 'plug' },
  automation: { title: 'Automation', desc: 'Set up rules once and let repetitive work run itself.', icon: 'workflow' },
  analytics: { title: 'Analytics', desc: 'Clear charts and reports that show what is working.', icon: 'chart' },
  api: { title: 'Developer API', desc: 'A documented API and webhooks for everything.', icon: 'code' },
  sso: { title: 'Single sign-on', desc: 'Enterprise login, roles and permissions.', icon: 'key' },
  templates: { title: 'Templates', desc: 'Start quickly from ready-made templates.', icon: 'layout' },
  mobile_apps: { title: 'Mobile apps', desc: 'Native apps for iPhone and Android.', icon: 'phone' },
  notifications: { title: 'Smart notifications', desc: 'Hear about what matters and nothing else.', icon: 'bell' },
  search: { title: 'Instant search', desc: 'Find anything in a moment.', icon: 'search' },
  ai_assistant: { title: 'AI assistant', desc: 'Drafts, summarises and answers questions for you.', icon: 'sparkles' },
  import_export: { title: 'Import and export', desc: 'Bring your data in and take it out whenever you like.', icon: 'download' },
  audit_log: { title: 'Audit log', desc: 'A full history of who changed what and when.', icon: 'history' },
  offline: { title: 'Works offline', desc: 'Keep going without a connection; it syncs later.', icon: 'wifi_off' },
  cli: { title: 'Command-line tool', desc: 'Script everything from your terminal.', icon: 'terminal' },
  open_source: { title: 'Open source', desc: 'Read the code, self-host it, contribute back.', icon: 'git' },
  fast: { title: 'Fast by default', desc: 'Built for speed, from first load to every click.', icon: 'zap' },
  monitoring: { title: 'Monitoring and alerts', desc: 'Know about problems before your users do.', icon: 'activity' },
  private: { title: 'Private by design', desc: 'Your data is encrypted and never sold.', icon: 'lock' },
  secure: { title: 'Bank-level security', desc: 'Encryption, two-factor login and fraud protection.', icon: 'shield' },
  free_shipping: { title: 'Free shipping', desc: 'Free delivery on every order, no minimum.', icon: 'truck' },
  easy_returns: { title: 'Easy returns', desc: 'Changed your mind? Send it back within 30 days.', icon: 'undo' },
  flexible_plan: { title: 'Flexible subscription', desc: 'Pause, skip or cancel whenever you like.', icon: 'calendar' },
  fresh: { title: 'Freshly made', desc: 'Prepared in small batches and sent out the same week.', icon: 'leaf' },
  sustainable: { title: 'Sustainably sourced', desc: 'Fair prices for producers and recyclable packaging.', icon: 'recycle' },
  curated: { title: 'Curated for you', desc: 'A selection matched to your taste that gets better over time.', icon: 'heart' },
  gifts: { title: 'Perfect for gifting', desc: 'Send a box or a gift card with a personal note.', icon: 'gift' },
  rewards: { title: 'Loyalty rewards', desc: 'Earn points on every order and spend them on treats.', icon: 'star' },
  local_delivery: { title: 'Local delivery', desc: 'Same-day delivery in your area.', icon: 'map_pin' },
  personal_plan: { title: 'Personal plans', desc: 'A programme built around your goals and schedule.', icon: 'target' },
  progress: { title: 'Progress tracking', desc: 'See how far you have come with simple charts.', icon: 'trending' },
  coaches: { title: 'Expert coaches', desc: 'Guidance from qualified professionals.', icon: 'award' },
  community: { title: 'Supportive community', desc: 'Challenges, groups and people cheering you on.', icon: 'message' },
  wearables: { title: 'Wearable sync', desc: 'Connects to your watch and health apps.', icon: 'watch' },
  guided: { title: 'Guided sessions', desc: 'Follow along with audio and video sessions.', icon: 'play' },
  reminders: { title: 'Gentle reminders', desc: 'Nudges that help you build the habit.', icon: 'clock' },
  budgeting: { title: 'Budgets and goals', desc: 'Set a budget, track spending and reach savings goals.', icon: 'wallet' },
  transfers: { title: 'Instant transfers', desc: 'Send and receive money in seconds.', icon: 'send' },
  invoicing: { title: 'Invoices and payments', desc: 'Send invoices and get paid online.', icon: 'receipt' },
  multi_currency: { title: 'Multi-currency', desc: 'Hold, send and spend in many currencies.', icon: 'globe' },
  low_fees: { title: 'Low, clear fees', desc: 'No hidden charges. Ever.', icon: 'percent' },
  itinerary: { title: 'Trip planning', desc: 'Build a day-by-day itinerary and share it.', icon: 'map' },
  best_price: { title: 'Best price promise', desc: 'Find it cheaper and we refund the difference.', icon: 'tag' },
  instant_booking: { title: 'Instant booking', desc: 'Confirm in seconds, no back and forth.', icon: 'check' },
  free_cancel: { title: 'Free cancellation', desc: 'Plans change. Cancel free up to 24 hours before.', icon: 'x_circle' },
  reviews: { title: 'Honest reviews', desc: 'Ratings from real, verified customers.', icon: 'thumbs_up' },
  support: { title: 'Support, day and night', desc: 'Real people ready to help at any hour.', icon: 'headphones' },
  tickets_qr: { title: 'Mobile tickets', desc: 'Your ticket is a QR code on your phone.', icon: 'ticket' },
  instructors: { title: 'Expert instructors', desc: 'Learn from people who do it for a living.', icon: 'graduation' },
  certificates: { title: 'Certificates', desc: 'Earn a certificate when you finish a course.', icon: 'badge' },
  self_paced: { title: 'Learn at your own pace', desc: 'Lifetime access, on any device.', icon: 'book' },
  live_classes: { title: 'Live classes', desc: 'Join live sessions and ask questions.', icon: 'video' },
  handmade: { title: 'Made by hand', desc: 'Crafted with care by skilled makers.', icon: 'hammer' },
  vetted_pros: { title: 'Vetted professionals', desc: 'Every professional is checked, insured and reviewed.', icon: 'user_check' },
  photos: { title: 'Beautiful photography', desc: 'High-quality images that show every detail.', icon: 'camera' },
  kid_safe: { title: 'Safe for children', desc: 'No adverts, no chat with strangers, parent controls.', icon: 'smile' },
}

// Metrics double as marketing stats and dashboard stat cards.
export interface Metric { label: string; value: string; delta: string; about: string }
export const METRICS: Record<string, Metric> = {
  revenue: { label: 'Revenue', value: '$48,290', delta: '+12.4%', about: 'money earned from sales' },
  mrr: { label: 'Monthly recurring revenue', value: '$18.2k', delta: '+6.1%', about: 'subscription software income per month' },
  orders: { label: 'Orders', value: '1,284', delta: '+8.2%', about: 'shop or restaurant orders placed' },
  customers: { label: 'Customers', value: '9,420', delta: '+3.7%', about: 'people who have bought' },
  active_users: { label: 'Active users', value: '24.8k', delta: '+5.3%', about: 'people using an app' },
  subscribers: { label: 'Subscribers', value: '12,600', delta: '+9.0%', about: 'newsletter, channel or subscription members' },
  conversion: { label: 'Conversion rate', value: '3.8%', delta: '+0.4%', about: 'visitors who become customers' },
  churn: { label: 'Churn', value: '1.9%', delta: '-0.3%', about: 'subscribers who cancel' },
  sessions: { label: 'Sessions', value: '182k', delta: '+14%', about: 'website visits and traffic' },
  avg_order: { label: 'Average order', value: '$37.60', delta: '+2.1%', about: 'typical basket value in a shop' },
  bookings: { label: 'Bookings', value: '642', delta: '+11%', about: 'reservations, appointments or stays' },
  occupancy: { label: 'Occupancy', value: '86%', delta: '+4%', about: 'rooms, tables or seats filled' },
  tickets_sold: { label: 'Tickets sold', value: '3,910', delta: '+18%', about: 'event tickets' },
  open_tickets: { label: 'Open tickets', value: '38', delta: '-12%', about: 'customer support requests waiting' },
  response_time: { label: 'Response time', value: '1h 12m', delta: '-9%', about: 'how fast support replies' },
  satisfaction: { label: 'Satisfaction', value: '4.8 / 5', delta: '+0.1', about: 'customer ratings and reviews' },
  tasks_done: { label: 'Tasks completed', value: '214', delta: '+22', about: 'project or to-do items finished' },
  projects: { label: 'Active projects', value: '17', delta: '+2', about: 'ongoing projects or clients' },
  deploys: { label: 'Deployments', value: '126', delta: '+31', about: 'software releases shipped' },
  uptime: { label: 'Uptime', value: '99.98%', delta: '+0.01%', about: 'service availability for infrastructure' },
  errors: { label: 'Error rate', value: '0.12%', delta: '-0.05%', about: 'software errors and failed requests' },
  balance: { label: 'Balance', value: '$12,480', delta: '+$820', about: 'money in an account' },
  spending: { label: 'Spending', value: '$2,140', delta: '-6%', about: 'personal or company expenses' },
  invoices_due: { label: 'Invoices due', value: '$7,300', delta: '5 open', about: 'unpaid invoices' },
  workouts: { label: 'Workouts', value: '18', delta: '+4', about: 'exercise sessions this month' },
  steps: { label: 'Daily steps', value: '8,412', delta: '+620', about: 'walking and activity' },
  streak: { label: 'Streak', value: '23 days', delta: 'best yet', about: 'days in a row of a habit, lesson or journal' },
  students: { label: 'Students', value: '2,340', delta: '+120', about: 'learners enrolled in courses' },
  completion: { label: 'Completion rate', value: '72%', delta: '+5%', about: 'courses or lessons finished' },
  donations: { label: 'Donations', value: '$64,900', delta: '+21%', about: 'money raised for a cause' },
  stock: { label: 'Low stock items', value: '14', delta: '+3', about: 'inventory that needs restocking' },
  patients: { label: 'Patients today', value: '42', delta: '+5', about: 'clinic or healthcare appointments' },
}

export const NAV_ITEMS: Record<string, string> = {
  Features: 'product features', Pricing: 'plans and prices', About: 'who is behind it', Blog: 'articles and news',
  Docs: 'developer documentation', Shop: 'browse products to buy', Menu: 'restaurant or cafe menu',
  Work: 'portfolio of past projects', Courses: 'list of classes', Events: 'upcoming dates',
  Community: 'forum or members', Contact: 'get in touch', Careers: 'jobs', Destinations: 'places to travel',
  Donate: 'give money to a cause', Changelog: 'software release notes', Locations: 'physical branches',
}

export const SIDEBAR_ITEMS: Record<string, { icon: string; about: string }> = {
  Dashboard: { icon: 'home', about: 'overview of key numbers' }, Analytics: { icon: 'chart', about: 'charts and reports' },
  Orders: { icon: 'receipt', about: 'shop or restaurant orders' }, Products: { icon: 'tag', about: 'catalogue and inventory' },
  Customers: { icon: 'users', about: 'people who buy or subscribe' }, Projects: { icon: 'layout', about: 'ongoing work' },
  Tasks: { icon: 'check', about: 'to-do items' }, Calendar: { icon: 'calendar', about: 'schedule and bookings' },
  Inbox: { icon: 'message', about: 'messages and conversations' }, Invoices: { icon: 'wallet', about: 'billing and payments' },
  Transactions: { icon: 'send', about: 'money moving in and out' }, Team: { icon: 'user_check', about: 'staff and members' },
  Tickets: { icon: 'headphones', about: 'customer support requests' }, Deployments: { icon: 'zap', about: 'software releases' },
  Logs: { icon: 'terminal', about: 'technical logs and events' }, Courses: { icon: 'book', about: 'lessons and learning content' },
  Students: { icon: 'graduation', about: 'learners' }, Workouts: { icon: 'activity', about: 'training sessions' },
  Patients: { icon: 'heart', about: 'healthcare records' }, Bookings: { icon: 'map_pin', about: 'reservations and stays' },
  Campaigns: { icon: 'sparkles', about: 'marketing and email' }, Journal: { icon: 'book', about: 'personal entries and notes' },
  Settings: { icon: 'key', about: 'preferences' },
}

export const FORM_FIELDS: Record<string, { label: string; type: string; placeholder: string; about: string }> = {
  name: { label: 'Full name', type: 'text', placeholder: 'Ada Lovelace', about: "the person's name" },
  email: { label: 'Email', type: 'email', placeholder: 'ada@example.com', about: 'email address' },
  phone: { label: 'Phone', type: 'tel', placeholder: '+356 2123 4567', about: 'telephone number' },
  company: { label: 'Company', type: 'text', placeholder: 'Analytical Engines Ltd', about: 'business or employer name' },
  role: { label: 'Job title', type: 'text', placeholder: 'Head of Operations', about: 'position at work' },
  website: { label: 'Website', type: 'url', placeholder: 'https://example.com', about: 'a web address' },
  team_size: { label: 'Team size', type: 'select', placeholder: '11 to 50', about: 'number of employees' },
  budget: { label: 'Budget', type: 'select', placeholder: '$5k to $10k', about: 'how much they can spend on a project' },
  date: { label: 'Preferred date', type: 'date', placeholder: '', about: 'a day for a booking, appointment or event' },
  guests: { label: 'Number of guests', type: 'number', placeholder: '2', about: 'party size for a table, event or stay' },
  address: { label: 'Address', type: 'text', placeholder: '12 Republic Street, Valletta', about: 'postal or delivery address' },
  subject: { label: 'Subject', type: 'text', placeholder: 'How can we help?', about: 'topic of a message' },
  message: { label: 'Message', type: 'textarea', placeholder: 'Tell us a little more…', about: 'free-text message or details' },
  cv: { label: 'Link to CV or portfolio', type: 'url', placeholder: 'https://', about: 'job application material' },
  dietary: { label: 'Dietary requirements', type: 'text', placeholder: 'Vegetarian, no nuts…', about: 'food allergies and preferences' },
  rating: { label: 'How would you rate us?', type: 'select', placeholder: 'Very good', about: 'a feedback score' },
  newsletter: { label: 'Send me occasional updates', type: 'checkbox', placeholder: '', about: 'marketing opt-in' },
  terms: { label: 'I agree to the terms', type: 'checkbox', placeholder: '', about: 'legal consent' },
}

export const LOGIN_PROVIDERS: Record<string, string> = {
  Google: 'a Google account (almost everyone)', Apple: 'an Apple ID (consumer and iPhone apps)', GitHub: 'a GitHub account (developers and technical tools)',
  Microsoft: 'a Microsoft work account (enterprise and office software)', Facebook: 'a Facebook account (social and community apps)', 'Single sign-on': 'company SSO (large business customers)',
}

export const FORM_TITLES: Record<string, string> = {
  'Contact us': 'a general message', 'Join the waitlist': 'a product that has not launched yet',
  'Book a demo': 'sales call for business software', 'Request a quote': 'pricing for a custom job or service',
  'Apply now': 'job or programme application', 'Reserve a table': 'restaurant booking', RSVP: 'reply to an event invitation',
  'Book an appointment': 'clinic, salon or professional visit', 'Share your feedback': 'opinions about a product or visit',
  'Get in touch': 'start a project with a freelancer or studio',
}

export const FAQS: Record<string, { q: string; a: string }> = {
  trial: { q: 'Is there a free trial?', a: 'Yes. Try everything free for 14 days, no card required.' },
  cancel: { q: 'Can I cancel at any time?', a: 'Of course. Cancel in two clicks and you will not be charged again.' },
  pause: { q: 'Can I pause or skip a delivery?', a: 'Yes, pause or skip from your account as often as you like.' },
  refund: { q: 'What is your refund policy?', a: 'If you are not happy within 30 days we refund you in full.' },
  shipping: { q: 'Where do you ship?', a: 'We deliver across the EU, UK and US. Shipping times appear at checkout.' },
  payment: { q: 'Which payment methods do you accept?', a: 'All major cards, Apple Pay, Google Pay and PayPal.' },
  security: { q: 'Is my data secure?', a: 'Data is encrypted in transit and at rest, and we never sell it.' },
  team: { q: 'Can I add my team?', a: 'Invite as many people as you like and control what each can see.' },
  export: { q: 'Can I export my data?', a: 'Yes, export everything at any time in standard formats.' },
  support: { q: 'How do I get help?', a: 'Message us from the app or by email. We reply within a few hours.' },
  beginners: { q: 'Is it suitable for beginners?', a: 'Yes. We start from the basics and build up at your pace.' },
  devices: { q: 'Which devices are supported?', a: 'Web, iPhone and Android, all kept in sync.' },
  allergens: { q: 'Do you cater for allergies?', a: 'Tell us in advance and we will gladly adapt your order.' },
  change_booking: { q: 'Can I change my booking?', a: 'Change or cancel free up to 24 hours before.' },
  tickets_refund: { q: 'Are tickets refundable?', a: 'Tickets are refundable until 7 days before the event.' },
  self_host: { q: 'Can I self-host it?', a: 'Yes. The project is open source and ships with a Docker image.' },
  tax: { q: 'Is my donation tax-deductible?', a: 'Yes, and we email a receipt straight away.' },
  custom: { q: 'Do you take custom work?', a: 'We do. Tell us what you have in mind and we will send a quote.' },
}

export const SETTINGS: Record<string, { label: string; desc: string; on: boolean }> = {
  email_notifications: { label: 'Email notifications', desc: 'Get an email when something needs you.', on: true },
  push: { label: 'Push notifications', desc: 'Alerts on your phone.', on: true },
  weekly_digest: { label: 'Weekly summary', desc: 'A digest of activity every Monday.', on: false },
  two_factor: { label: 'Two-factor login', desc: 'Ask for a code when you sign in.', on: true },
  public_profile: { label: 'Public profile', desc: 'Let others find and view your profile.', on: false },
  auto_renew: { label: 'Renew automatically', desc: 'Keep your plan active without interruption.', on: true },
  order_updates: { label: 'Order updates', desc: 'Delivery and order status messages.', on: true },
  marketing: { label: 'Offers and news', desc: 'Occasional promotions.', on: false },
  reminders: { label: 'Daily reminder', desc: 'A nudge to keep your habit going.', on: true },
  dark_mode: { label: 'Dark appearance', desc: 'Use the dark theme.', on: false },
  data_sharing: { label: 'Share usage data', desc: 'Help improve the product with anonymous statistics.', on: false },
  deploy_alerts: { label: 'Deployment alerts', desc: 'Tell me when a release fails.', on: true },
}

export interface Item { title: string; meta: string; price?: string }
export const ITEM_KINDS: Record<string, { about: string; heading: string; items: Item[] }> = {
  products: { about: 'physical goods for sale in a shop', heading: 'Bestsellers', items: [
    { title: 'The Everyday Tote', meta: 'Canvas · 3 colours', price: '$48' }, { title: 'Ceramic Pour-over Set', meta: 'Handmade', price: '$62' },
    { title: 'Merino Crew Sweater', meta: 'New season', price: '$120' }, { title: 'Walnut Desk Tray', meta: 'Limited run', price: '$35' },
    { title: 'Linen Bed Set', meta: 'Four sizes', price: '$180' }, { title: 'Brass Table Lamp', meta: 'Back in stock', price: '$95' } ] },
  food: { about: 'food and drink: coffee, meals, bakery, wine, groceries', heading: 'This month’s selection', items: [
    { title: 'Ethiopia Guji', meta: 'Light roast · blueberry, jasmine', price: '$18' }, { title: 'Colombia Huila', meta: 'Medium roast · caramel, orange', price: '$16' },
    { title: 'House Espresso', meta: 'Dark roast · cocoa, hazelnut', price: '$15' }, { title: 'Decaf Sugarcane', meta: 'Medium roast · toffee', price: '$17' },
    { title: 'Kenya Nyeri AA', meta: 'Light roast · blackcurrant', price: '$19' }, { title: 'Tasting Flight', meta: 'Four 100 g bags', price: '$24' } ] },
  articles: { about: 'blog posts, news, essays or newsletter issues', heading: 'Latest writing', items: [
    { title: 'What we learned shipping weekly', meta: '6 min read' }, { title: 'A calmer way to plan a quarter', meta: '9 min read' },
    { title: 'Notes on doing less, better', meta: '4 min read' }, { title: 'The case for boring technology', meta: '7 min read' },
    { title: 'How we think about pricing', meta: '8 min read' }, { title: 'A year in review', meta: '12 min read' } ] },
  places: { about: 'travel destinations, hotels, rentals or properties', heading: 'Popular right now', items: [
    { title: 'Valletta, Malta', meta: 'Harbour views · 4.9', price: 'from $140' }, { title: 'Lisbon, Portugal', meta: 'Old town loft · 4.8', price: 'from $110' },
    { title: 'Kyoto, Japan', meta: 'Garden townhouse · 4.9', price: 'from $190' }, { title: 'Amalfi, Italy', meta: 'Cliffside room · 4.7', price: 'from $230' },
    { title: 'Reykjavik, Iceland', meta: 'Harbour cabin · 4.8', price: 'from $175' }, { title: 'Oaxaca, Mexico', meta: 'Courtyard casa · 4.9', price: 'from $85' } ] },
  events: { about: 'concerts, festivals, conferences or meetups with dates', heading: 'Upcoming dates', items: [
    { title: 'Opening Night', meta: 'Fri 9 Oct · Main stage', price: '$35' }, { title: 'Harbour Sessions', meta: 'Sat 10 Oct · Waterfront', price: '$28' },
    { title: 'Workshop Day', meta: 'Sun 11 Oct · Studio 2', price: '$60' }, { title: 'Late Show', meta: 'Fri 16 Oct · Club room', price: '$22' },
    { title: 'Family Matinee', meta: 'Sat 17 Oct · Gardens', price: '$12' }, { title: 'Closing Party', meta: 'Sun 18 Oct · Main stage', price: '$40' } ] },
  courses: { about: 'classes, lessons, tutorials or workout programmes', heading: 'Popular courses', items: [
    { title: 'Foundations', meta: '12 lessons · Beginner', price: '$49' }, { title: 'Going Further', meta: '18 lessons · Intermediate', price: '$79' },
    { title: 'Masterclass', meta: '9 lessons · Advanced', price: '$129' }, { title: 'Weekend Intensive', meta: '2 days · Live', price: '$199' },
    { title: 'Daily Practice', meta: '30 short sessions', price: '$29' }, { title: 'Team Workshop', meta: 'For groups of 5+', price: 'Enquire' } ] },
  projects: { about: 'portfolio case studies, designs, photographs or client work', heading: 'Selected projects', items: [
    { title: 'Harbour Coffee', meta: 'Brand identity · 2026' }, { title: 'Northwind Bank', meta: 'Mobile app · 2026' },
    { title: 'Atlas Museum', meta: 'Website · 2025' }, { title: 'Field Notes', meta: 'Editorial · 2025' },
    { title: 'Sol Energy', meta: 'Campaign · 2025' }, { title: 'Kiln Studio', meta: 'E-commerce · 2024' } ] },
  people: { about: 'team members, speakers, coaches, doctors or candidates', heading: 'Meet the team', items: [
    { title: 'Maria Borg', meta: 'Founder' }, { title: 'Daniel Okafor', meta: 'Head of Product' }, { title: 'Yuki Tanaka', meta: 'Lead Designer' },
    { title: 'Elena Rossi', meta: 'Engineering' }, { title: 'Sam Carter', meta: 'Customer Care' }, { title: 'Priya Nair', meta: 'Operations' } ] },
}

export interface TableDef { about: string; columns: string[]; rows: string[][] }
export const TABLES: Record<string, TableDef> = {
  orders: { about: 'shop, restaurant or subscription orders', columns: ['Order', 'Customer', 'Status', 'Total'], rows: [
    ['#4821', 'Maria Borg', 'Paid', '$64.00'], ['#4820', 'Daniel Okafor', 'Shipped', '$128.50'], ['#4819', 'Yuki Tanaka', 'Pending', '$32.00'],
    ['#4818', 'Elena Rossi', 'Paid', '$210.00'], ['#4817', 'Sam Carter', 'Refunded', '$18.00'] ] },
  customers: { about: 'customers, subscribers, members or leads', columns: ['Name', 'Email', 'Plan', 'Joined'], rows: [
    ['Maria Borg', 'maria@example.com', 'Pro', '12 Sep'], ['Daniel Okafor', 'daniel@example.com', 'Team', '9 Sep'], ['Yuki Tanaka', 'yuki@example.com', 'Free', '3 Sep'],
    ['Elena Rossi', 'elena@example.com', 'Pro', '28 Aug'], ['Sam Carter', 'sam@example.com', 'Free', '21 Aug'] ] },
  invoices: { about: 'invoices, bills or payments owed', columns: ['Invoice', 'Client', 'Status', 'Amount'], rows: [
    ['INV-0192', 'Northwind Ltd', 'Paid', '$2,400'], ['INV-0191', 'Atlas Museum', 'Overdue', '$1,150'], ['INV-0190', 'Kiln Studio', 'Sent', '$780'],
    ['INV-0189', 'Sol Energy', 'Paid', '$4,300'], ['INV-0188', 'Field Notes', 'Draft', '$560'] ] },
  transactions: { about: 'bank transactions, expenses or payments', columns: ['Date', 'Description', 'Category', 'Amount'], rows: [
    ['17 Sep', 'Harbour Coffee', 'Eating out', '-$4.80'], ['16 Sep', 'Salary', 'Income', '+$3,200'], ['15 Sep', 'City Transport', 'Travel', '-$26.00'],
    ['14 Sep', 'Green Grocer', 'Groceries', '-$58.20'], ['13 Sep', 'Streaming', 'Subscriptions', '-$11.99'] ] },
  tasks: { about: 'tasks, issues, to-dos or project work items', columns: ['Task', 'Owner', 'Status', 'Due'], rows: [
    ['Design onboarding flow', 'Yuki', 'In progress', '22 Sep'], ['Fix checkout bug', 'Elena', 'In review', '19 Sep'], ['Write launch post', 'Sam', 'To do', '25 Sep'],
    ['Customer interviews', 'Daniel', 'Done', '15 Sep'], ['Update pricing page', 'Maria', 'To do', '30 Sep'] ] },
  tickets: { about: 'customer support requests or helpdesk conversations', columns: ['Ticket', 'Subject', 'Priority', 'Status'], rows: [
    ['#1042', 'Cannot reset password', 'High', 'Open'], ['#1041', 'Charged twice in August', 'Urgent', 'Open'], ['#1040', 'How do I export data?', 'Low', 'Waiting'],
    ['#1039', 'App crashes on launch', 'High', 'In progress'], ['#1038', 'Change billing email', 'Low', 'Solved'] ] },
  products: { about: 'product catalogue, inventory or stock levels', columns: ['Product', 'SKU', 'Stock', 'Price'], rows: [
    ['Ethiopia Guji 250 g', 'COF-ETH-250', '182', '$18.00'], ['House Espresso 1 kg', 'COF-ESP-1K', '64', '$42.00'], ['Pour-over Set', 'EQP-POV-01', '12', '$62.00'],
    ['Paper Filters ×100', 'EQP-FLT-100', '340', '$8.00'], ['Gift Card', 'GFT-050', '∞', '$50.00'] ] },
  bookings: { about: 'reservations, appointments, stays or classes booked', columns: ['Guest', 'Date', 'Details', 'Status'], rows: [
    ['Maria Borg', 'Fri 19 Sep, 19:30', 'Table for 4', 'Confirmed'], ['Daniel Okafor', 'Fri 19 Sep, 20:00', 'Table for 2', 'Confirmed'], ['Yuki Tanaka', 'Sat 20 Sep, 13:00', 'Table for 6', 'Pending'],
    ['Elena Rossi', 'Sat 20 Sep, 20:30', 'Table for 2', 'Cancelled'], ['Sam Carter', 'Sun 21 Sep, 12:30', 'Table for 8', 'Confirmed'] ] },
  deployments: { about: 'software deployments, builds, servers or jobs', columns: ['Commit', 'Branch', 'Status', 'Duration'], rows: [
    ['a41f9c2', 'main', 'Live', '1m 42s'], ['9be03d7', 'feat/search', 'Preview', '1m 58s'], ['77c1e0a', 'main', 'Failed', '0m 47s'],
    ['3d9a5b8', 'fix/login', 'Preview', '2m 03s'], ['c02e6f1', 'main', 'Live', '1m 39s'] ] },
  students: { about: 'students, learners, patients, members or participants and their progress', columns: ['Name', 'Programme', 'Progress', 'Last active'], rows: [
    ['Maria Borg', 'Foundations', '82%', 'Today'], ['Daniel Okafor', 'Masterclass', '45%', 'Yesterday'], ['Yuki Tanaka', 'Going Further', '100%', '2 days ago'],
    ['Elena Rossi', 'Foundations', '12%', 'Today'], ['Sam Carter', 'Daily Practice', '67%', '5 days ago'] ] },
}

// ---------------------------------------------------------------------------
// Blocks: the prebuilt shadcn/ui sections Jev can place on the canvas.

export type Param =
  | { kind: 'choice'; id: string; ask: string; options: Record<string, string | null>; fallback: string }
  | { kind: 'noul'; id: string; ask: string; fallback: boolean }
  /** One Noul per bank entry, all in the same call; code keeps the most probable ones. */
  | { kind: 'bank'; id: string; ask: string; bank: Record<string, string>; min: number; max: number; fallback: string[] }

export interface BlockDef {
  id: string
  title: string
  layouts: Layout[]
  /** A literal yes/no question; Jev reads instructions at face value. */
  need: string
  /** Always placed on these layouts, without asking. */
  always?: Layout[]
  params: Param[]
}

const bankOf = <T,>(src: Record<string, T>, about: (v: T, k: string) => string) =>
  Object.fromEntries(Object.entries(src).map(([k, v]) => [k, about(v, k)]))

export const BLOCKS: BlockDef[] = [
  { id: 'navbar', title: 'Navigation bar', layouts: ['marketing_page'], always: ['marketing_page'], need: '', params: [
    { kind: 'bank', id: 'items', ask: 'Would the website described in the brief have a top navigation link called', bank: NAV_ITEMS, min: 2, max: 5, fallback: ['Features', 'Pricing', 'About'] },
    { kind: 'noul', id: 'login', ask: 'Does the product in the brief have user accounts that people sign in to?', fallback: false } ] },
  { id: 'hero', title: 'Hero', layouts: ['marketing_page'], always: ['marketing_page'], need: '', params: [
    { kind: 'choice', id: 'variant', ask: 'Which hero layout suits the page described in the brief?', fallback: 'centered', options: {
      centered: 'Large centred headline with buttons: software, services, general',
      split: 'Headline on the left with a large picture on the right: physical products, food, travel, apps with a screenshot',
      email_capture: 'Headline with an email sign-up field: waitlists, newsletters, products not launched yet' } },
    { kind: 'noul', id: 'badge', ask: 'Does the brief mention a launch, a new release, a beta, an offer or an announcement?', fallback: false } ] },
  { id: 'logos', title: 'Customer logos', layouts: ['marketing_page'], need: 'Is the brief about software or a service sold to businesses, where showing customer company logos would build trust?', params: [] },
  { id: 'features', title: 'Features', layouts: ['marketing_page'], need: 'Should the page described in the brief include a section listing the features or benefits of the product or service?', params: [
    { kind: 'bank', id: 'items', ask: 'Is this a plausible benefit or feature of the specific product or service described in the brief', bank: bankOf(FEATURES, f => `${f.title}: ${f.desc}`), min: 3, max: 6, fallback: ['fast', 'secure', 'support'] },
    { kind: 'choice', id: 'variant', ask: 'How should the features be presented?', fallback: 'cards', options: {
      cards: 'A grid of bordered cards with icons', plain: 'A light grid of icons and text without borders: calm, minimal, editorial',
      list: 'A two-column layout with a heading on the left and a checklist on the right' } } ] },
  { id: 'showcase', title: 'Showcase grid', layouts: ['marketing_page', 'app_screen'], need: 'Should the UI described in the brief show a grid of items to browse, such as products, places, events, courses, articles, projects or people?', params: [
    { kind: 'choice', id: 'kind', ask: 'What kind of items would the grid show?', fallback: 'products', options: bankOf(ITEM_KINDS, v => v.about) } ] },
  { id: 'stats', title: 'Stats band', layouts: ['marketing_page'], need: 'Would the page described in the brief benefit from a band of impressive numbers, such as customers served or money raised?', params: [
    { kind: 'bank', id: 'items', ask: 'Would the organisation in the brief proudly show this number to visitors on its public website', bank: bankOf(METRICS, m => `${m.label} (${m.about})`), min: 3, max: 4, fallback: ['customers', 'satisfaction', 'orders'] } ] },
  { id: 'testimonials', title: 'Testimonials', layouts: ['marketing_page'], need: 'Should the page described in the brief include quotes or reviews from happy customers?', params: [
    { kind: 'choice', id: 'variant', ask: 'How should customer quotes be shown?', fallback: 'cards', options: {
      cards: 'Three short review cards side by side', single: 'One large centred quote: premium, editorial, calm' } } ] },
  { id: 'pricing', title: 'Pricing', layouts: ['marketing_page'], need: 'Should the page described in the brief show pricing plans, subscription tiers or membership options?', params: [
    { kind: 'choice', id: 'tiers', ask: 'How many pricing plans suit the product in the brief?', fallback: 'three', options: {
      two: 'Two plans: simple consumer subscriptions or memberships', three: 'Three plans: most software and services' } },
    { kind: 'noul', id: 'yearly', ask: 'Is the product in the brief billed as a recurring monthly or yearly subscription?', fallback: true } ] },
  { id: 'faq', title: 'FAQ', layouts: ['marketing_page'], need: 'Should the page described in the brief include a frequently asked questions section?', params: [
    { kind: 'bank', id: 'items', ask: 'Would a customer of the product or service in the brief plausibly ask this question', bank: bankOf(FAQS, f => f.q), min: 3, max: 5, fallback: ['cancel', 'refund', 'support'] } ] },
  { id: 'form', title: 'Form', layouts: ['marketing_page', 'centered_card'], need: 'Does the brief ask for a multi-field form that visitors fill in, such as contact, booking, waitlist, application, RSVP or quote request? A newsletter signup alone does not count.', params: [
    { kind: 'choice', id: 'title', ask: 'What is the purpose of the form in the brief?', fallback: 'Contact us', options: FORM_TITLES },
    { kind: 'bank', id: 'fields', ask: 'Should the form described in the brief ask for this field', bank: bankOf(FORM_FIELDS, f => `${f.label} (${f.about})`), min: 2, max: 7, fallback: ['name', 'email', 'message'] } ] },
  { id: 'auth', title: 'Sign-in card', layouts: ['centered_card'], need: 'Does the brief ask for a login, sign-in, sign-up or account registration screen?', params: [
    { kind: 'choice', id: 'mode', ask: 'Which account screen does the brief describe?', fallback: 'sign_in', options: {
      sign_in: 'Returning users log in with existing credentials', sign_up: 'New users create an account or register' } },
    { kind: 'noul', id: 'social', ask: 'Should people be able to continue with a third-party account such as Google, Apple or GitHub instead of a password?', fallback: true },
    { kind: 'bank', id: 'providers', ask: 'Would the audience of the product in the brief expect to sign in with', bank: LOGIN_PROVIDERS, min: 1, max: 3, fallback: ['Google', 'Apple'] } ] },
  { id: 'cta', title: 'Call to action', layouts: ['marketing_page'], need: 'Should the page described in the brief end with a large call-to-action band inviting the visitor to act?', params: [] },
  { id: 'newsletter', title: 'Newsletter signup', layouts: ['marketing_page'], need: 'Does the brief ask for a newsletter signup or an email subscription box, or describe a blog, publication or community that visitors would subscribe to by email?', params: [] },
  { id: 'footer', title: 'Footer', layouts: ['marketing_page'], always: ['marketing_page'], need: '', params: [
    { kind: 'choice', id: 'variant', ask: 'Which footer suits the site in the brief?', fallback: 'simple', options: {
      simple: 'One line: small sites, portfolios, single products', columns: 'Several columns of links: companies, shops, platforms' } } ] },

  { id: 'sidebar', title: 'App sidebar', layouts: ['app_screen'], always: ['app_screen'], need: '', params: [
    { kind: 'bank', id: 'items', ask: 'Would the application described in the brief have a sidebar section called', bank: bankOf(SIDEBAR_ITEMS, (v, k) => `${k} (${v.about})`), min: 4, max: 7, fallback: ['Dashboard', 'Analytics', 'Customers', 'Settings'] } ] },
  { id: 'stat_cards', title: 'Stat cards', layouts: ['app_screen'], need: 'Should the screen described in the brief show key numbers or KPIs as a row of summary cards?', params: [
    { kind: 'bank', id: 'items', ask: 'Would the application described in the brief track this number', bank: bankOf(METRICS, m => `${m.label} (${m.about})`), min: 3, max: 4, fallback: ['revenue', 'customers', 'orders', 'conversion'] } ] },
  { id: 'chart', title: 'Chart', layouts: ['app_screen'], need: 'Should the screen described in the brief include a chart showing a trend over time?', params: [
    { kind: 'choice', id: 'variant', ask: 'Which chart type suits the data in the brief?', fallback: 'area', options: {
      area: 'Smooth area line: continuous trends like revenue, traffic, balance, weight', bars: 'Bars: counts per day or week like orders, workouts, signups, tickets' } } ] },
  { id: 'table', title: 'Data table', layouts: ['app_screen'], need: 'Should the screen described in the brief include a table or list of records?', params: [
    { kind: 'choice', id: 'entity', ask: 'What records would the table list?', fallback: 'customers', options: bankOf(TABLES, t => t.about) } ] },
  { id: 'activity', title: 'Activity feed', layouts: ['app_screen'], need: 'Should the screen described in the brief show a feed of recent activity, events or notifications?', params: [] },
  { id: 'checklist', title: 'Checklist', layouts: ['app_screen'], need: 'Does the brief describe to-do items, habits, goals or a checklist that the user ticks off?', params: [] },
  { id: 'chat', title: 'Conversation', layouts: ['app_screen'], need: 'Does the brief describe messaging, chat, an inbox conversation or talking to an assistant?', params: [] },
  { id: 'settings', title: 'Settings panel', layouts: ['app_screen'], need: 'Does the brief ask for settings, preferences, an account page or notification options?', params: [
    { kind: 'bank', id: 'items', ask: 'Would the application described in the brief offer this setting', bank: bankOf(SETTINGS, s => `${s.label}: ${s.desc}`), min: 3, max: 6, fallback: ['email_notifications', 'two_factor', 'dark_mode'] } ] },
]

export const BLOCK_BY_ID = Object.fromEntries(BLOCKS.map(b => [b.id, b]))
