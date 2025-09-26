import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ["/admin"]

// Routes that require admin role
const adminRoutes = ["/admin"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const sessionToken = request.cookies.get("session-token")?.value

    if (!sessionToken) {
      // Redirect to home page if no token
      return NextResponse.redirect(new URL("/", request.url))
    }

    try {
      // Make internal API call to validate session
      const baseUrl = request.nextUrl.origin
      const response = await fetch(`${baseUrl}/api/auth/validate-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionToken }),
      })

      if (!response.ok) {
        // Invalid session, redirect to home and clear cookie
        const redirectResponse = NextResponse.redirect(new URL("/", request.url))
        redirectResponse.cookies.delete("session-token")
        return redirectResponse
      }

      const { user } = await response.json()

      // Check admin routes
      if (adminRoutes.some((route) => pathname.startsWith(route))) {
        if (user.role !== "admin") {
          return NextResponse.redirect(new URL("/", request.url))
        }
      }

      // Add user info to headers for server components
      const nextResponse = NextResponse.next()
      nextResponse.headers.set("x-user-id", user._id)
      nextResponse.headers.set("x-user-role", user.role)
      return nextResponse
    } catch (error) {
      console.error("Middleware auth error:", error)
      // Invalid session, redirect to home and clear cookie
      const redirectResponse = NextResponse.redirect(new URL("/", request.url))
      redirectResponse.cookies.delete("session-token")
      return redirectResponse
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
