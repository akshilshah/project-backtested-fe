# API Architecture

## Middleware Chain (in order)
1. Sentry request/tracing handlers
2. CORS (open)
3. JSON body parser
4. Static file serving
5. URL-encoded body parser
6. Morgan (dev logging)
7. Compression (gzip, skips SSE)
8. Helmet (security headers)
9. Express helper methods (ok, created, error, etc.) added to res object
10. **Auth routes** (`/api/auth`) - public
11. **JWT protect middleware** - all subsequent routes require valid token
12. Protected routes: coins, strategies, trades, backtest, upload

## Service Layer Pattern (per domain)
Each service has:
- `*.router.js` - Express router with route definitions
- `*.controller.js` - Request handlers (business logic, DB queries via Prisma)
- `constants.js` - Domain-specific constants

## Auth Flow
- JWT-based authentication
- `protect` middleware extracts token from Authorization header, verifies, attaches user to req
- User object on `req.user` includes organizationId for multi-tenancy scoping
- Password hashed with bcrypt

## Validation
- Primary: Joi schemas in `src/utils/validation.js`
- Some newer code uses Zod
- Key schemas: createTradeSchema, updateTradeSchema, exitTradeSchema, createBacktestTradeSchema

## Database Access
- Prisma Client initialized once, imported across services
- All queries filter by `organizationId` from authenticated user
- Transactions used for complex operations (e.g., trade exit with P&L calculation)

## Express Helper Methods
Custom response helpers added to `res` object:
- `res.ok(data)` - 200 success
- `res.created(data)` - 201 created
- `res.error(message)` - 500 error
- `res.unauthorized()` - 401
- `res.forbidden()` - 403
- `res.notFound()` - 404
- `res.conflict()` - 409

## API Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "optional message"
}
```

For lists with pagination:
```json
{
  "success": true,
  "data": {
    "trades": [...],
    "pagination": { "page": 1, "limit": 25, "total": 100, "totalPages": 4 }
  }
}
```

## File Upload
- Multer for multipart handling
- S3 storage via multer-s3
- Used for coin images

## Environment
- dotenv for env vars
- `VITE_API_BASE_URL` on frontend points to API (default: http://localhost:3000)
- Production: PM2 process manager on port 31003
- AWS deployment via CodeDeploy (appspec.yml present)
