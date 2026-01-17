# Logo Colour Risk Model - Moody's Prototype

A desktop-first web application prototype that helps underwriters and portfolio managers explore and understand the relationship between logo colours and insurance risk levels. This tool enables non-technical users to make data-driven decisions using colour-based risk signals on the Moody's Intelligent Risk Platform.

## Overview

This prototype allows users to:

- **Explore Risk**: View ranked logo colours and their associated insurance risk levels
- **Analyze Portfolio**: Filter companies by colour, view aggregate portfolio statistics, and risk distributions
- **Compare Companies**: Select multiple companies to compare their risk profiles side-by-side
- **Simulate Scenarios**: Run "what-if" simulations to understand how changing a company's logo colour could impact its risk profile

## Key Features

### 1. Colour Risk Explorer (/overview)
- Ranked list of logo colours sorted by average risk score
- Visual colour swatches with risk tier and confidence indicators
- Interactive detail panel showing risk tier distribution
- Bar chart displaying average risk scores and company counts by colour

### 2. Portfolio Dashboard (/portfolio)
- Multi-select colour filters for quick portfolio segmentation
- Full-text search across company names
- Aggregate portfolio KPIs: total companies, average risk, tier breakdown, total exposure
- Risk tier distribution visualization
- Sortable company table with industry and region information

### 3. Compare Companies (/compare)
- Interactive company selector with search functionality
- Side-by-side comparison cards showing risk profiles
- Comparison chart displaying risk scores across selected companies
- Portfolio average indicator to contextualize individual company risk
- Risk delta calculation showing deviation from portfolio average

### 4. Company Detail + What-If (/company/:id)
- Detailed company profile with logo colour, risk tier, industry, and exposure
- Interactive colour picker for what-if simulation
- Real-time impact analysis showing:
  - Current risk profile
  - Predicted risk if colour changes
  - Risk delta with direction indicator
  - Confidence level in prediction
- Clear disclaimer that results are analytical signals, not recommendations

## Data Model

### Company
```typescript
type RiskTier = "Low" | "Medium" | "High" | "Severe";
type Confidence = "Low" | "Medium" | "High";

interface Company {
  id: string;
  name: string;
  industry?: string;
  region?: string;
  logoColor: {
    name: string;    // e.g., "Navy"
    hex: string;     // e.g., "#0B1F3B"
  };
  risk: {
    score: number;   // 0-100
    tier: RiskTier;
    confidence: Confidence;
  };
  exposure?: number; // optional numeric value for weighting
}
```

### Colour Risk Summary
Derived from aggregated company data to identify patterns in colour-risk correlation.

### What-If Simulation
Client-side deterministic mapping based on colour summary averages. Provides predicted risk and confidence without external API calls.

## Mock Data

The prototype uses a seeded dataset of **120 companies** distributed across:
- **10 Logo Colours**: Navy, Forest Green, Burgundy, Slate, Gold, Teal, Crimson, Charcoal, Indigo, Sage
- **10 Industries**: Financial Services, Technology, Healthcare, Energy, Manufacturing, Retail, Real Estate, Telecommunications, Utilities, Consumer Goods
- **5 Regions**: North America, Europe, Asia Pacific, Latin America, Middle East & Africa

Each colour has deterministic risk characteristics that vary by company (simulating real-world variance), enabling realistic what-if simulations.

## Technology Stack

- **Framework**: Next.js 16 with React 19 and TypeScript
- **State Management**: Zustand for lightweight global state (company selection, filters)
- **Charts**: Recharts for bar charts and data visualizations
- **Styling**: Tailwind CSS 4 for responsive, desktop-first design
- **UI Components**: Custom components built with Radix UI primitives
- **Data**: Local JSON file structure (mockData.ts)

## Project Structure

```
coloured-risk-model/
├── app/
│   ├── layout.tsx              # Root layout with navigation
│   ├── page.tsx                # Redirect to /overview
│   ├── globals.css             # Global styles
│   ├── overview/               # Colour Risk Explorer
│   │   └── page.tsx
│   ├── portfolio/              # Portfolio Dashboard
│   │   └── page.tsx
│   ├── compare/                # Compare Companies
│   │   └── page.tsx
│   └── company/                # Company Detail
│       └── [id]/page.tsx
├── components/
│   ├── navigation.tsx          # Header and navigation
│   └── shared.tsx              # Reusable UI components
├── lib/
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions for calculations
├── store/
│   └── index.ts                # Zustand stores for comparison & filters
├── data/
│   └── mockData.ts             # Seeded mock companies & colour summaries
└── public/
    └── (assets)
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd coloured-risk-model
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically redirect to the Overview page.

### Building for Production

```bash
npm run build
npm start
```

## Usage Guide

### Underwriter Workflow
1. Start at **Overview** to see which colours carry highest risk
2. Go to **Portfolio** to filter your book by colour and see aggregate exposure
3. Use **Compare** to evaluate specific companies against portfolio benchmarks
4. Drill into **Company Detail** to understand individual risk drivers and explore scenarios

### Portfolio Manager Workflow
1. Check **Overview** for portfolio-wide colour risk distribution
2. Review **Portfolio Dashboard** KPIs and tier breakdown
3. Use **Compare** to identify concentration risks by colour
4. Run **What-If** scenarios to assess impact of brand changes

## Non-Functional Requirements Met

- ✅ **Desktop-first layout** (minimum 1280px)
- ✅ **Clear hierarchy** with legible data density
- ✅ **Loading & empty states** handled gracefully
- ✅ **Accessibility**: Never rely on colour alone (all tiers use text labels)
- ✅ **Responsive design** works on tablets at reduced functionality
- ✅ **Fast interactions** using local state and no external API calls

## Compliance & Disclaimers

The prototype includes clear disclaimers in the What-If feature:
> "This is an analytical signal and should be used alongside other risk factors."

This ensures users understand the tool is exploratory and does not constitute formal risk assessment or underwriting recommendations.

## Future Enhancements (Out of Scope)

- Export portfolio view to CSV
- Save custom scenarios locally
- Integration with Moody's production risk models
- Real data connection replacing mock dataset
- Advanced filtering by exposure-weighted metrics
- Portfolio comparison across teams
- Historical trend analysis

## Support & Feedback

This is a prototype for evaluation and usability testing. Please provide feedback on:
- Clarity of risk signals
- Usefulness of what-if scenarios
- Colour picker and interactive elements
- Navigation and information hierarchy

## License

Internal Moody's prototype - All rights reserved.
# logo-colour-risk-model
