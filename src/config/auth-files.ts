/** Where the setup project stores each logged-in session (git-ignored). */
export const AUTH_FILES = {
  standard: 'playwright/.auth/standard.json',
  problem: 'playwright/.auth/problem.json',
} as const;
