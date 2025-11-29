/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "replicate.delivery",
      },
    ],
  },

  // ADD THIS BLOCK — this is the fix
  async headers() {
    return [
      {
        // Make sure the Google verification file (and any other static file) is served with correct content-type and no interference
        source: "/googlecf7d10ee7021f8e8.html",
        headers: [
          { key: "Content-Type", value: "text/html" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // Optional: protect all static files in /public from being redirected
        source: "/:path((?!api/|remove|editor|pricing|login|signup).*)",
        headers: [
          { key: "X-Static-File", value: "true" },
        ],
      },
    ];
  },

  // OPTIONAL but recommended — prevent Next.js from treating unknown static-looking paths as app routes
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;