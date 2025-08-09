export type GoalScope = 'company' | 'team' | 'user'
export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual'
export type GoalComparator = '>=' | '<=' | '=='

export interface CanonicalGoalIntent {
  metricKey: 'billable_hours' | 'non_billable_hours' | 'revenue' | 'realization_rate' | 'utilization' | 'retention' | 'cvs' | 'meetings' | 'focus_hours'
  scope: GoalScope
  timeframe: GoalTimeframe
  comparator: GoalComparator
  target: number
  unit?: 'hours' | 'points' | 'percent' | 'dollars' | 'count'
  entityName?: string
  originalText?: string
}

const metricSynonyms: Array<{ key: CanonicalGoalIntent['metricKey']; patterns: RegExp[] }> = [
  { key: 'billable_hours', patterns: [/\bbillable hours?\b/i, /\bhours billed\b/i, /\bbilled hours\b/i, /\bbh\b/i] },
  { key: 'non_billable_hours', patterns: [/\bnon[-\s]?billable hours?\b/i, /\bnbh\b/i] },
  { key: 'revenue', patterns: [/\brevenue\b/i, /\btop ?line\b/i, /\bbookings?\b/i] },
  { key: 'realization_rate', patterns: [/\brealization\b/i] },
  { key: 'utilization', patterns: [/\butili[sz]ation\b/i] },
  { key: 'retention', patterns: [/\bretention\b/i, /\bchurn\b/i] },
  { key: 'cvs', patterns: [/\bcvs\b/i, /contribution value score/i] },
  { key: 'meetings', patterns: [/\bmeetings?\b/i, /\bclient calls?\b/i, /\bcheck[-\s]?ins?\b/i] },
  { key: 'focus_hours', patterns: [/\bfocus( ed)? hours?\b/i, /\bdeep work\b/i] }
]

const timeframeSynonyms: Array<{ tf: GoalTimeframe; patterns: RegExp[] }> = [
  { tf: 'daily', patterns: [/\bdaily\b/i, /\beach day\b/i, /\bevery day\b/i, /\bper day\b/i, /\btoday\b/i] },
  { tf: 'weekly', patterns: [/\bweekly\b/i, /\bthis week\b/i, /\bper week\b/i, /\bwk\b/i] },
  { tf: 'monthly', patterns: [/\bmonthly\b/i, /\bthis month\b/i, /\bper month\b/i, /\bmo\b/i] },
  { tf: 'quarterly', patterns: [/\bquarter(ly)?\b/i, /\bQ[1-4]\b/i] },
  { tf: 'annual', patterns: [/\bannual(ly)?\b/i, /\bper year\b/i, /\byearly\b/i, /\byr\b/i] }
]

const scopeSynonyms: Array<{ scope: GoalScope; patterns: RegExp[] }> = [
  { scope: 'company', patterns: [/\bcompany(\-?wide)?\b/i, /\borg(aniz|anis)ation(\-?wide)?\b/i, /\bfirma?wide\b/i, /\ball\s+(staff|team|members)\b/i] },
  { scope: 'team', patterns: [/\bteam\b/i, /\bdepartment\b/i, /\bpractice group\b/i] },
  { scope: 'user', patterns: [/\bmy\b/i, /\bme\b/i, /\bpersonal\b/i, /\bindividual\b/i] }
]

const comparatorSynonyms: Array<{ cmp: GoalComparator; patterns: RegExp[] }> = [
  { cmp: '>=', patterns: [/\bat\s*least\b/i, /\bminimum\b/i, /\b>=\b/, /\bmore than( or equal)?\b/i, /\babove\b/i] },
  { cmp: '<=', patterns: [/\bat\s*most\b/i, /\bmaximum\b/i, /\b<=\b/, /\bless than( or equal)?\b/i, /\bbelow\b/i] },
  { cmp: '==', patterns: [/\bequal(s)?\b/i, /\bexact(ly)?\b/i, /\b==\b/] }
]

function detect<T>(groups: Array<{ value: T; patterns: RegExp[] }>, text: string): T | undefined {
  for (const g of groups) {
    for (const p of g.patterns) {
      if (p.test(text)) return g.value
    }
  }
  return undefined
}

export function resolveGoalIntentFromText(text: string, defaults?: Partial<Omit<CanonicalGoalIntent, 'originalText' | 'metricKey' | 'target'>>): CanonicalGoalIntent | null {
  if (!text || typeof text !== 'string') return null
  const originalText = text

  // Metric detection
  let metricKey: CanonicalGoalIntent['metricKey'] | undefined
  for (const m of metricSynonyms) {
    if (m.patterns.some(r => r.test(text))) { metricKey = m.key; break }
  }
  if (!metricKey) {
    // If not explicit, infer by units
    if (/hours?/i.test(text)) metricKey = 'billable_hours'
    else if (/%/i.test(text)) metricKey = 'realization_rate'
  }

  // Timeframe
  const timeframe = detect(timeframeSynonyms.map(t => ({ value: t.tf, patterns: t.patterns })), text) || defaults?.timeframe || 'weekly'

  // Scope
  const scope = detect(scopeSynonyms.map(s => ({ value: s.scope, patterns: s.patterns })), text) || defaults?.scope || 'user'

  // Comparator
  const comparator = detect(comparatorSynonyms.map(c => ({ value: c.cmp, patterns: c.patterns })), text) || defaults?.comparator || '>='

  // Target + unit
  let target = 0
  let unit: CanonicalGoalIntent['unit'] | undefined

  // Percent first (e.g., 90%)
  const percentMatch = text.match(/(\d{1,3})(?:\.(\d+))?\s*%/)
  if (percentMatch) {
    const whole = parseFloat(percentMatch[1] + (percentMatch[2] ? '.' + percentMatch[2] : ''))
    // Store as decimal per preference
    target = whole / 100
    unit = 'percent'
  }

  // Currency (simple $ or USD)
  if (target === 0) {
    const moneyMatch = text.match(/\$\s*([\d,]+(?:\.\d+)?)/) || text.match(/USD\s*([\d,]+(?:\.\d+)?)/i)
    if (moneyMatch) {
      target = parseFloat(moneyMatch[1].replace(/,/g, ''))
      unit = 'dollars'
    }
  }

  // Hours or plain number
  if (target === 0) {
    const hoursMatch = text.match(/(\d+(?:\.\d+)?)\s*hours?/i)
    if (hoursMatch) {
      target = parseFloat(hoursMatch[1])
      unit = 'hours'
    }
  }

  if (target === 0) {
    const numMatch = text.match(/\b(\d+(?:\.\d+)?)\b/)
    if (numMatch) {
      target = parseFloat(numMatch[1])
      if (!unit) unit = 'count'
    }
  }

  if (!metricKey || !target) return null

  return {
    metricKey,
    scope,
    timeframe,
    comparator,
    target,
    unit,
    originalText
  }
}

export function mapCanonicalToPersonalGoal(intent: CanonicalGoalIntent): {
  id: string
  name: string
  type: string
  frequency: string
  target: number
  current: number
  status: string
  description: string
} {
  const type = (() => {
    switch (intent.metricKey) {
      case 'billable_hours': return 'Billable / Work Output'
      case 'focus_hours': return 'Time Management'
      case 'meetings': return 'Team Contribution / Culture'
      case 'realization_rate': return 'Billable / Work Output'
      default: return 'Personal Goal'
    }
  })()

  const humanName = (() => {
    switch (intent.metricKey) {
      case 'billable_hours': return 'Billable Hours'
      case 'focus_hours': return 'Focused Work Hours'
      case 'meetings': return 'Client Meetings'
      case 'realization_rate': return 'Realization Rate'
      case 'utilization': return 'Utilization'
      default: return 'Personal Goal'
    }
  })()

  return {
    id: `goal-${Date.now()}-${Math.random()}`,
    name: `${humanName}`,
    type,
    frequency: intent.timeframe,
    target: intent.target,
    current: 0,
    status: 'active',
    description: intent.originalText || `${humanName} target`
  }
}

export function applyCanonicalToCompanyGoals(intents: CanonicalGoalIntent[], base?: { weeklyBillable?: number; monthlyBillable?: number; annualBillable?: number }) {
  const result = {
    weeklyBillable: base?.weeklyBillable || 0,
    monthlyBillable: base?.monthlyBillable || 0,
    annualBillable: base?.annualBillable || 0,
  }

  for (const i of intents) {
    if (i.metricKey !== 'billable_hours') continue
    if (i.timeframe === 'weekly') result.weeklyBillable = Math.max(result.weeklyBillable, i.target)
    if (i.timeframe === 'monthly') result.monthlyBillable = Math.max(result.monthlyBillable, i.target)
    if (i.timeframe === 'annual') result.annualBillable = Math.max(result.annualBillable, i.target)
  }
  return result
} 