# Frontend Patterns and Conventions

## Component Architecture
- **Pages** (`src/pages/`): Thin wrappers that lazy-load section views. File-system style naming (`[id]/index.tsx`).
- **Section Views** (`src/sections/*/view/`): Full page views with business logic. Named `*-list-view.tsx`, `*-details-view.tsx`, etc.
- **Section Components** (`src/sections/*/`): Feature-specific components (table rows, filters, dialogs, forms).
- **Shared Components** (`src/components/`): Reusable across features (StatCard, DataTable, TradingCalculator, etc.).

## Form Handling
- **Library**: react-hook-form + zod schemas + @hookform/resolvers
- **MUI Integration**: Custom `hook-form/` wrappers for MUI fields
- **Pattern**: Define zod schema -> useForm with zodResolver -> render with RHF Controller components
- **Date/Time**: dayjs for parsing/formatting. Time stored as `HH:mm:ss` string, parsed with helper format `2000-01-01 ${tradeTime}`

## Data Fetching
- **SWR**: Used for data caching and revalidation
- **Axios**: Configured in `src/lib/axios.ts` with:
  - JWT token from localStorage/sessionStorage added via interceptor
  - 401 handler: clears token, redirects to login
  - Network error toast notifications
- **Service Classes**: Static methods returning typed responses. All in `src/services/`.
- **Endpoints**: Defined as constants in `src/lib/axios.ts` -> `endpoints` object

## Auth
- **JWT-based**: Token stored in localStorage (remember me) or sessionStorage
- **AuthGuard**: Wraps all dashboard routes, redirects to `/auth/jwt/sign-in` if not authenticated
- **Context**: JWT auth context provides user state

## State Management
- No global state library (no Redux/Zustand)
- Local component state (useState/useReducer)
- SWR for server state caching
- react-hook-form for form state

## UI Patterns
- **Dialogs**: MUI Dialog components for create/edit/exit actions. Common pattern: parent manages open state, passes trade data as prop.
- **Tables**: MUI DataGrid or custom data-table component with toolbar and filters
- **Cards**: Feature cards (trades-card, coins-card, etc.) for list items
- **Toast**: sonner for success/error notifications
- **Loading**: LoadingScreen component with Suspense for lazy routes
- **Quick Add**: Trade quick-add dialog with add-and-clear pattern (form persists between submissions, localStorage for last values)

## Key Shared Components
- `TradingCalculatorDialog`: Complex dialog for creating/editing trades with position sizing calculator
- `StatCard` / `StatsGrid`: Dashboard stat display components
- `ProfitLossDisplay`: Colored P&L display with trend indicators
- `TradeStatusBadge`: OPEN/CLOSED status chip
- `PriceDisplay` / `CoinDisplay`: Formatted price and coin info display

## Styling
- MUI theme customization in `src/theme/`
- Emotion CSS-in-JS via MUI's `sx` prop
- PWA support with safe-area-insets for mobile notch handling
- Fonts: DM Sans, Inter, Nunito Sans, Public Sans, Barlow

## ESLint
- perfectionist/sort-imports: Alphabetical sorting, shorter paths before longer, sibling before parent
- unused-imports plugin: Removes unused imports
- TypeScript strict mode
