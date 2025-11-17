// lib/auth.ts → inside your authOptions.providers array
CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.email || !credentials?.password) return null;

    const email = credentials.email.toLowerCase().trim();

    // Find user — adjust this line to match your actual Drizzle query style
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        password: users.password,
        totalCredits: users.totalCredits,
      })
      .from(users)
      .where(eq(users.email, email))
      .then(rows => rows[0]);

    if (!user || !user.password) return null;

    const isValid = await bcrypt.compare(credentials.password, user.password);
    if (!isValid) return null;

    // CRITICAL: return ONLY these fields + id as string
    return {
      id: String(user.id),                    // ← must be string
      email: user.email,
      totalCredits: user.totalCredits ?? 0,   // safe default
    };
  },
}),