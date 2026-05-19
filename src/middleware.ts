import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isPublicRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/l/") ||
    pathname === "/";

  const isPendingPage = pathname.startsWith("/pendiente");
  const isRejectedPage = pathname.startsWith("/rechazado");

  if (!user && !isPublicRoute && !isPendingPage && !isRejectedPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/admin")) {
    const role = user?.user_metadata?.role;
    if (role !== "superadmin" && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Check registration approval for non-superadmin authenticated users
  if (user && !isPendingPage && !isRejectedPage && !isPublicRoute) {
    const role = user.user_metadata?.role;
    if (role !== "superadmin") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (profile?.status === "pending") {
        return NextResponse.redirect(new URL("/pendiente", request.url));
      }
      if (profile?.status === "rejected") {
        return NextResponse.redirect(new URL("/rechazado", request.url));
      }
      // null profile = user existed before this feature → let through
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
