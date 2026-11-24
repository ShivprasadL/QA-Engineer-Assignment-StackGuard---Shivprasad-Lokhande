/** Public demo accounts listed on the Sauce Demo login page. */
export const PASSWORD = 'secret_sauce';

export const USERS = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  problem: { username: 'problem_user', password: PASSWORD },
  performanceGlitch: { username: 'performance_glitch_user', password: PASSWORD },
  error: { username: 'error_user', password: PASSWORD },
  visual: { username: 'visual_user', password: PASSWORD },
} as const;

/** Every account that is allowed to log in (everyone except the locked-out user). */
export const LOGIN_ALLOWED_USERS = [
  USERS.standard,
  USERS.problem,
  USERS.performanceGlitch,
  USERS.error,
  USERS.visual,
];
