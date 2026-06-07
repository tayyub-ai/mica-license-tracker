export type GlossaryEntry = {
  term: string
  /** A short one-line gloss for previews. */
  short: string
  /** A plain-language explanation, 2 to 4 sentences. */
  body: string
}

/** Plain-language MiCA glossary. Neutral, accurate, no jargon. */
export const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'MiCA',
    short: "The EU's single rulebook for crypto.",
    body: "MiCA is the EU's Markets in Crypto-Assets Regulation, formally Regulation (EU) 2023/1114. It creates one set of rules for crypto-assets across the EU and the wider EEA, replacing the patchwork of separate national regimes. Firms that issue tokens or provide crypto services to people in the EU fall under it.",
  },
  {
    term: 'CASP (Crypto-Asset Service Provider)',
    short: 'A firm that provides crypto services and needs a MiCA licence.',
    body: 'A CASP is a firm that provides crypto services such as running an exchange, holding assets in custody, or brokering trades. To serve clients in the EU, a CASP needs a MiCA authorisation from a national regulator. Once authorised it is listed on the official EU register.',
  },
  {
    term: 'ART (Asset-Referenced Token)',
    short: 'A token referencing a basket of assets or currencies.',
    body: 'An asset-referenced token aims to hold a stable value by referencing a basket of assets, such as several currencies or commodities. Issuers of ARTs need authorisation under MiCA and must meet reserve and disclosure requirements. ARTs are one of the two stablecoin categories MiCA defines.',
  },
  {
    term: 'EMT (E-Money Token)',
    short: 'A token referencing a single official currency.',
    body: 'An e-money token references a single official currency, for example a euro stablecoin pegged one-to-one to the euro. EMTs can only be issued by authorised e-money institutions or credit institutions. They are the second stablecoin category under MiCA, alongside asset-referenced tokens.',
  },
  {
    term: 'Authorisation / licence',
    short: 'The approval that lets a firm operate under MiCA.',
    body: 'An authorisation, also called a licence, is the formal approval a firm receives from a national competent authority to operate under MiCA. It confirms the firm has met the regulatory requirements. Authorised firms and issuers are recorded on the ESMA register, which is the source this tracker checks.',
  },
  {
    term: 'NCA (National Competent Authority)',
    short: 'The national regulator that authorises and supervises firms.',
    body: 'A national competent authority is the regulator in each member state that grants authorisations and supervises firms day to day. Examples include BaFin in Germany, the AMF in France, and the AFM in the Netherlands. A firm applies to the NCA in the country where it is based.',
  },
  {
    term: 'Passporting',
    short: 'One licence, access across the EU and EEA.',
    body: 'Passporting means that once a firm is authorised in one EU or EEA country, it can provide its services across the others without applying for a separate licence in each. This is one of the central benefits of MiCA for firms. It turns many national approvals into a single market-wide one.',
  },
  {
    term: 'Article 143(3) / transitional period',
    short: 'The grandfathering window before firms must be MiCA-authorised.',
    body: 'Article 143(3) sets out a transitional, or grandfathering, period that lets firms already operating under prior national regimes continue for a limited time. It runs until the firm’s authorisation is granted or refused, or until the outer limit, whichever comes first. The window ends no later than 1 July 2026, and member states could shorten it.',
  },
  {
    term: 'ESMA register',
    short: 'The official EU list of authorised firms and issuers.',
    body: 'The ESMA register is the official EU register that lists authorised crypto-asset service providers and token issuers. It is maintained by the European Securities and Markets Authority. This tracker checks the register to confirm whether a firm is listed.',
  },
  {
    term: 'The 1 July 2026 deadline',
    short: 'The EU-wide outer limit of the transitional period.',
    body: 'The 1 July 2026 deadline is the EU-wide outer limit of the Article 143(3) transitional period. It is the latest date any member state could allow pre-existing firms to keep operating without a MiCA authorisation. After it, a firm needs a MiCA licence to provide crypto-asset services in the EU.',
  },
]
