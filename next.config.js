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

  async headers() {
    return [
      // Google Search Console verification file
      {
        source: "/googlecf7d10ee7021f8e8.html",
        headers: [
          { key: "Content-Type", value: "text/html" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      // HSTS — forces HTTPS forever and prevents downgrade attacks
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;