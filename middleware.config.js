module.exports = {
  // Ensure the middleware runs on all routes except static files and API routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
