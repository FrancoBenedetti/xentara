export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_APP_URL ?? // Custom standard
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel auto-env
    'http://localhost:3001'

  // Ensure protocol is included
  url = url.includes('http') ? url : `https://${url}`
  // Remove trailing slash
  return url.replace(/\/$/, '')
}
