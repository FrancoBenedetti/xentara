# Xentara Build & Deployment Guidelines

To ensure stable deployments on Vercel and avoid common Edge Runtime or TypeScript build failures, all contributions must follow these rules:

## 1. Middleware Constraints
- **Return Type**: The `middleware` function MUST always return a `NextResponse` or `Response`. Returning `undefined` (implicit `void`) will cause `MIDDLEWARE_INVOCATION_FAILED`.
- **Exclusion Logic**: When bypassing middleware (e.g., for Inngest API), use `return NextResponse.next()`.

## 2. Environment Variable Safety (Edge Runtime)
- **Null Checks**: Before calling `createServerClient` or other environment-dependent utilities in Middleware or Server Components, verify that required variables like `NEXT_PUBLIC_SUPABASE_URL` exist.
- **Non-Assertion**: Avoid using the `!` non-null assertion operator on environment variables in logic that runs on the Edge Runtime.

## 3. React Inline Styling
- **No Shorthands**: Standard React `style` objects do not support shorthand properties like `ml`, `mt`, `px`, etc. Use full CSS property names (e.g., `marginLeft`, `marginTop`, `paddingLeft`).
- **Unit Strings**: Always specify units for non-zero values (e.g., `0.5rem` instead of `0.5`).

## 4. TypeScript Strictness
- **Implicit Any**: Never initialize empty arrays without a type. Use `let items: any[] = []` or a specific interface.
- **Supabase Responses**: When using `.single()`, the Supabase return type can sometimes resolve to `never`. Use `(data as any).property` when schema types are not fully synchronized to prevent build-blocking errors.

## 5. Absolute Imports
- **Alias Usage**: Use the `@/` prefix for all internal utility and component imports to ensure path consistency across different directory depths.
