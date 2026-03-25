/**
 * Canonical Firestore document path builders.
 * All services must use these instead of inline string literals.
 */
export const FIRESTORE_PATHS = {
  currency: (uid: string) => `currency/${uid}`,
  goals: (uid: string) => `goals/${uid}`,
  userPreferences: (uid: string) => `users/${uid}/preferences/locale`,
};
