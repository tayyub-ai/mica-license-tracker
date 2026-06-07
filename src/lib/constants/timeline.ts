export type TimelineEvent = {
  /** ISO date, e.g. '2023-06-09' */
  date: string
  /** Human display date, e.g. '9 June 2023' */
  display: string
  title: string
  description: string
  sourceUrl?: string
  sourceLabel?: string
  /** True for events dated after today */
  future?: boolean
  /** True for the EU-wide outer-limit milestone (gold accent) */
  milestone?: boolean
}

/**
 * The road to MiCA. Sourced events, ordered ascending by date.
 * MiCA = Regulation (EU) 2023/1114.
 */
export const TIMELINE: TimelineEvent[] = [
  {
    date: '2023-05-31',
    display: '31 May 2023',
    title: 'MiCA adopted by the Council of the EU',
    description:
      'The Council of the EU gave final approval to the Markets in Crypto-Assets Regulation, completing the EU legislative process and clearing the way for publication.',
    sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2023/1114/oj',
    sourceLabel: 'EUR-Lex',
  },
  {
    date: '2023-06-09',
    display: '9 June 2023',
    title: 'Published in the Official Journal',
    description:
      'MiCA was published in the Official Journal of the EU as Regulation (EU) 2023/1114, the moment from which its entry-into-force and application dates are counted.',
    sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2023/1114/oj',
    sourceLabel: 'EUR-Lex',
  },
  {
    date: '2023-06-29',
    display: '29 June 2023',
    title: 'MiCA enters into force',
    description:
      'The regulation entered into force 20 days after publication. Entry into force is not the same as application. Most obligations applied later, on the dates below.',
    sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2023/1114/oj',
    sourceLabel: 'EUR-Lex',
  },
  {
    date: '2024-06-30',
    display: '30 June 2024',
    title: 'Stablecoin rules become applicable',
    description:
      'The rules for asset-referenced tokens (ARTs) and e-money tokens (EMTs), Titles III and IV, became applicable. From this date stablecoin issuers needed to meet MiCA requirements.',
    sourceUrl: 'https://www.esma.europa.eu/',
    sourceLabel: 'ESMA / EBA',
  },
  {
    date: '2024-12-30',
    display: '30 December 2024',
    title: 'Full application, including the CASP regime',
    description:
      'The rest of MiCA became fully applicable, including the crypto-asset service provider (CASP) regime. From this date firms providing crypto-asset services in the EU fall under the MiCA authorisation framework.',
    sourceUrl: 'https://www.esma.europa.eu/',
    sourceLabel: 'ESMA',
  },
  {
    date: '2025-06-30',
    display: 'From mid-2025',
    title: 'Shorter national transitional windows begin to close',
    description:
      'Under Article 143(3), member states could shorten their transitional ("grandfathering") windows. The earliest close around 30 June 2025 (Netherlands, Latvia, Hungary, Slovenia, Finland), then around 30 September 2025 (Sweden), then around 31 December 2025 (Germany, Ireland, Lithuania, Austria, Slovakia, Norway).',
    sourceUrl: 'https://www.esma.europa.eu/',
    sourceLabel: 'ESMA Article 143(3) list',
  },
  {
    date: '2026-04-17',
    display: '17 April 2026',
    title: 'ESMA statement on the end of the transitional periods',
    description:
      'ESMA issued a statement on the end of the transitional periods under MiCA, ahead of the EU-wide outer limit, setting out supervisory expectations as national windows close.',
    sourceUrl:
      'https://www.esma.europa.eu/sites/default/files/2026-04/ESMA75-113276571-1679_Statement_on_the_end_of_transitional_periods_under_MiCA.pdf',
    sourceLabel: 'ESMA statement',
  },
  {
    date: '2026-06-30',
    display: '30 June 2026',
    title: "Italy's transitional operating period ends",
    description:
      "Italy's transitional operating period for pre-existing firms ends under Decreto Legge 95/2025, one day before the EU-wide outer limit.",
    sourceUrl: 'https://www.gazzettaufficiale.it/',
    sourceLabel: 'Italian Official Gazette',
    future: true,
  },
  {
    date: '2026-07-01',
    display: '1 July 2026',
    title: 'EU-wide outer limit of the transitional period',
    description:
      'This is the longest any member state’s transitional period may run under Article 143(3). After this date a firm must hold a MiCA authorisation to provide crypto-asset services in the EU. No member state could extend beyond it; many ended sooner.',
    sourceUrl: 'https://eur-lex.europa.eu/eli/reg/2023/1114/oj',
    sourceLabel: 'MiCA Article 143(3)',
    future: true,
    milestone: true,
  },
]
