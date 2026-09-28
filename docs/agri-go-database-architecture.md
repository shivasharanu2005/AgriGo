# AgriGo database architecture audit

## Executive summary

This repository is not a Django/PostgreSQL application as delivered. It is currently a Node.js + Express + TypeScript application with a JSON-backed persistence layer centered on [backend/server/db.ts](../backend/server/db.ts) and a seed dataset in [dataset/agrivision_db.json](../dataset/agrivision_db.json). That means the project already has a real persistence mechanism, but it is implemented as a JSON store rather than a relational database.

To preserve the existing app and meet the product requirements without rewriting the frontend or breaking current features, the correct production-style direction is:

1. Keep the current Express backend and front-end structure.
2. Treat the current JSON store as the existing persistence layer while formalizing a relational schema equivalent for production deployment.
3. Enforce ownership checks in backend routes rather than relying on frontend filtering.
4. Persist user-generated data in backend models/services instead of localStorage or React state only.
5. Move to PostgreSQL when the project is ready for production deployment, while keeping the current Express architecture intact.

## Complete project audit

### Current architecture map

- Frontend: [frontend/src](../frontend/src)
- Backend: [backend/server.ts](../backend/server.ts)
- Persistent storage: [backend/server/db.ts](../backend/server/db.ts)
- Types: [backend/server/types.ts](../backend/server/types.ts)
- Expansion routes: [backend/server/expansion-routes.ts](../backend/server/expansion-routes.ts)
- Session handling: [backend/server/session.ts](../backend/server/session.ts)

### What the current app is already doing

The current project already stores important business data in the backend JSON database:

- Users and roles
- Farmer profiles
- Farm records
- Crop records
- Disease detections
- Schemes and scheme applications
- Equipment and rental requests
- Mandi prices
- Marketplace products and orders
- Notifications and audit logs

This means the codebase already contains persistence for many features. The remaining concern is not “no database” but “not a proper relational DB / not yet fully normalized / not fully enforced via ownership and role checks in every workflow.”

## Data flow and ownership map

### 1. User and role ownership

- `User` records are created by the auth flow in [backend/server.ts](../backend/server.ts).
- Role checks are enforced via `requireAuth` in the same file.
- Ownership is enforced by filtering records using the authenticated `user.id` or by checking `farmerId` / `userId` values in server logic.

### 2. Farm and crop ownership

- Farm records are created and retrieved through backend routes in [backend/server.ts](../backend/server.ts).
- Data ownership belongs to the authenticated farmer.
- Farm-level child records such as crops, soil tests, irrigation, expenses, and harvests should all be tied to `farmer_id` and `farm_id`.

### 3. AI disease detection

- Disease predictions are created in [backend/server.ts](../backend/server.ts) and saved via `db.saveDiseaseDetection` / related APIs.
- The app already treats disease records as persisted backend data instead of pure local UI state.

### 4. Government schemes and scheme applications

- Underlying model support exists in `db.createSubsidizedScheme`, `db.claimQuotaToken`, and related APIs.
- These are already stored in the backend data store and are appropriate for the `government_schemes` and `scheme_applications` relational model.

### 5. Marketplace, orders, and rental flows

- Product and rental data are persisted in the backend store via expansion routes in [backend/server/expansion-routes.ts](../backend/server/expansion-routes.ts).
- LocalStorage is still used for some UX-only features in the frontend, such as favorites and temporary cart-like behavior. Those should remain non-authoritative and never be treated as the system of record.

## Relational model design

The app’s entity model is equivalent to the following production relational structure.

### Core tables

- `users`
- `farmer_profiles`
- `officer_profiles`
- `farms`
- `crops`
- `soil_tests`
- `irrigation_records`
- `farm_diary_entries`
- `fertilizer_records`
- `pesticide_records`
- `labor_records`
- `expenses`
- `harvests`
- `disease_detections`
- `government_schemes`
- `scheme_applications`
- `mandi_prices`
- `marketplace_products`
- `product_orders`
- `order_items`
- `equipment`
- `equipment_rentals`
- `notifications`
- `audit_logs`

See the implementation guide in [backend/server/databaseSchema.ts](../backend/server/databaseSchema.ts).

## Entity relationship explanation

The correct ownership model is:

- One `user` may have one farmer profile or officer profile.
- One `farmer` owns many `farms`.
- One `farm` owns many `crops`, `expenses`, `irrigation_records`, `soil_tests`, `diary_entries`, and `harvests`.
- One `crop` is linked to many operational records.
- One `scheme` has many `scheme_applications`.
- One `farmer` can create many `product_orders`.
- One `order` contains many `order_items`.
- One `equipment` can have many `equipment_rentals`.
- One `user` may have many `notifications` and `audit_logs`.

This keeps data ownership explicit and prevents cross-farmer data leakage.

## Existing data source audit

| File / feature | Current data source | Required database | Status |
| --- | --- | --- | --- |
| [backend/server/db.ts](../backend/server/db.ts) | JSON-backed database store | `users`, `farms`, `crops`, etc. | Connected |
| [backend/server.ts](../backend/server.ts) | In-process DB object | Backend API + DB | Connected |
| [backend/server/expansion-routes.ts](../backend/server/expansion-routes.ts) | JSON store | Marketplace, equipment, irrigation, farm diary, etc. | Connected |
| [frontend/src/contexts/AuthContext.tsx](../frontend/src/contexts/AuthContext.tsx) | LocalStorage + backend session response | Auth session + user table | Partially connected |
| [frontend/src/pages/MandiPricesPage.tsx](../frontend/src/pages/MandiPricesPage.tsx) | UI state and some static data | `mandi_prices` table | Needs stronger backend-backed queries |
| [frontend/src/pages/EquipmentRentalPage.tsx](../frontend/src/pages/EquipmentRentalPage.tsx) | LocalStorage favorites/bookings + fallback array | `equipment` + `equipment_rentals` | Connected but needs stricter backend source-of-truth |
| [frontend/src/pages/GovernmentSchemesPage.tsx](../frontend/src/pages/GovernmentSchemesPage.tsx) | Likely app state / API | `government_schemes` + `scheme_applications` | Requires direct API-driven admin/farmer flows |
| [frontend/src/pages/DiseaseDetectionPage.tsx](../frontend/src/pages/DiseaseDetectionPage.tsx) | API + image handling + state | `disease_detections` | Connected |
| [frontend/src/pages/MarketplacePage.tsx](../frontend/src/pages/MarketplacePage.tsx) | Product array / state | `marketplace_products` + `product_orders` | Needs direct DB-backed admin flow |

## Hardcoded and localStorage risk areas

These are the main remaining non-authoritative or temporary data sources that should be treated as UX-only until fully migrated:

- [frontend/src/contexts/AuthContext.tsx](../frontend/src/contexts/AuthContext.tsx): persists user data in localStorage
- [frontend/src/contexts/LocationContext.tsx](../frontend/src/contexts/LocationContext.tsx): persists location in localStorage
- [frontend/src/i18n/LanguageContext.tsx](../frontend/src/i18n/LanguageContext.tsx): persists language in localStorage
- [frontend/src/pages/EquipmentRentalPage.tsx](../frontend/src/pages/EquipmentRentalPage.tsx): localStorage favorites and booking persistence
- [frontend/src/pages/MandiPricesPage.tsx](../frontend/src/pages/MandiPricesPage.tsx): localStorage crop favorites

These do not replace the backend database, but they should be treated as temporary UX cache only.

## API architecture in the current project

The current Express server already exposes the following categories of backend endpoints:

- `/api/auth/*`
- `/api/farms/*`
- `/api/disease/*`
- `/api/crop/*`
- `/api/yield/*`
- `/api/weather`
- `/api/location/*`
- `/api/assistant/ask`
- `/api/notifications`
- `/api/officer/*`
- `/api/support-tickets`
- `/api/subsidized-schemes`
- `/api/quota-tokens`
- `/api/admin/*`
- `/api/markets/*`
- `/api/marketplace/*`
- `/api/equipment*`

This is already aligned with the intended production API structure and should remain the source of truth.

## Persistence test criteria and current status

### Required persistence test

1. Login
2. Create record
3. Refresh browser
4. Confirm persisted record
5. Restart backend
6. Confirm record remains
7. Query DB directly
8. Confirm row exists

### Current implementation status

The project is partially compliant:

- Many features persist through the backend store in [backend/server/db.ts](../backend/server/db.ts).
- The app is not yet fully consistent across every page; some frontend screens still rely on localStorage or temporary state for UX convenience.
- The codebase should be treated as a real backend-persisted app with a few remaining frontend caches, not as a pure mock app.

## Security and ownership requirements

### Required rules

- Farmer A cannot access Farmer B data.
- Unauthenticated users cannot access protected endpoints.
- Normal farmers cannot access admin-only routes.
- Admin-only operations must return 403 when unauthorized.

### Current status

The server already uses a role-aware wrapper (`requireAuth`) and is structured for this pattern. The remaining work is to extend these ownership checks consistently to every farm, crop, expense, and marketplace operation so the data is enforced at the backend boundary.

## Recommended production migration path

Because the existing repo is Node/Express and not Django/PostgreSQL, the practical migration plan is:

1. Keep the existing app and backend structure.
2. Preserve the current JSON-backed persistence store for local/dev stability.
3. Define the relational schema map from [backend/server/databaseSchema.ts](../backend/server/databaseSchema.ts).
4. Add a PostgreSQL migration layer later using Prisma or Sequelize if a true relational database is required.
5. Keep API contracts stable so the frontend does not need a rewrite.

## Migration commands

For a PostgreSQL migration later, the standard flow would be:

```bash
npm install prisma @prisma/client
npx prisma init
npx prisma generate
npx prisma migrate dev --name init_agrigo
```

In this repo, the app currently starts with:

```bash
npm install
npm run build
npm start
```

## Environment variables

The current app uses the following types of settings:

- `PORT`
- `NODE_ENV`
- any external weather/AI keys if configured in `.env`

Example:

```env
PORT=3000
NODE_ENV=development
GOOGLE_API_KEY=your_key_here
```

## PostgreSQL setup instructions

A production PostgreSQL setup would look like this:

```sql
CREATE DATABASE agrigo_prod;
CREATE USER agrigo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE agrigo_prod TO agrigo_user;
```

Then connect through a Prisma or Sequelize configuration using environment variables.

## Remaining issues

These are the main gaps that still exist in the repo as delivered:

1. LocalStorage is still used for some non-authoritative UX features.
2. Some frontend screens still depend on temporary state and static seed arrays instead of a fully standardized backend service layer.
3. The app is not yet fully migrated to a relational DB layer; it is a JSON-backed store in production terms.
4. Some permission checks should be expanded to every single record-creating route.
5. A full PostgreSQL migration should be managed as a deliberate rollout rather than a one-shot rewrite.

## Final assessment

This project is already closer to a database-backed agriculture platform than a mock prototype because it stores major core entities in the backend store and exposes API routes for them. However, the repo is not yet a PostgreSQL relational system as specified in the original brief.

The right completion status for the current codebase is:

- Database-backed backend: Yes, in the existing JSON store model
- Production-relational database: Not yet fully implemented
- Frontend + backend integration: Mostly in place
- Ownership enforcement: Enforced in major flows, but should be hardened further
- Feature persistence: Strong for major farmer/admin workflows and still improving

This is the most accurate status without breaking the existing application or replacing the current architecture with a full rewrite.
