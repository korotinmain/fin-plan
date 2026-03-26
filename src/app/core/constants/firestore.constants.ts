/**
 * Canonical Firestore document path builders.
 * All services must use these instead of inline string literals.
 */
export const FIRESTORE_PATHS = {
  currency: (uid: string) => `currency/${uid}`,
  expectedFunds: (uid: string) => `expectedFunds/${uid}`,
  goals: (uid: string) => `goals/${uid}`,
  operations: (uid: string) => `operations/${uid}`,
  sources: (uid: string) => `sources/${uid}`,
  userPreferences: (uid: string) => `users/${uid}/preferences/ui`,
};
