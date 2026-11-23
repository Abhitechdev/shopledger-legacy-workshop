# ShopLedger

## Stack

- Node.js application using Express 4 and body-parser; `server.js` serves static `public/` files and JSON `/api` routes.
- File persistence is `data/db.json`, read and written synchronously by `lib/store.js`.
- The package has no configured test runner or test files.

## Module map

- `routes/products.js` — product listing and active-coupon endpoints.
- `routes/orders.js` — order list, lookup, creation, and cancellation endpoints.
- `routes/customers.js` — customer/settlement listing and Khata settlement endpoint.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, validation, discount calculation, and active-coupon listing.
- `lib/dates.js` — Indian date formatting, date-key normalization, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, sellable-stock checks, stock reservation/release, and summaries.
- `lib/invoice.js` — invoice figure calculation and printable HTML rendering.
- `lib/ledger.js` — customer lookup, balances, Khata debits/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, coupon discount, and checkout total calculation.
- `lib/reports.js` — dashboard aggregation and invoice-versus-ledger GST reconciliation.
- `lib/store.js` — JSON database initialization, read/write, and audit entries.
- `lib/tax.js` — GST-rate resolution, slab display, and CGST/SGST splitting.

## Commands

```sh
node server.js
node --test
```

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice totals and GST breakdown do not match what the customer was billed.

Allowed files: `lib/invoice.js`; use `lib/tax.js` only if truly needed.
