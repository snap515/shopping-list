export const getAuthErrorKey = (code) => {
  switch (code) {
    case 'auth/invalid-email':
      return 'auth.error.invalidEmail';
    case 'auth/weak-password':
      return 'auth.error.weakPassword';
    case 'auth/email-already-in-use':
      return 'auth.error.emailInUse';
    case 'auth/user-not-found':
      return 'auth.error.userNotFound';
    case 'auth/wrong-password':
      return 'auth.error.wrongPassword';
    case 'auth/too-many-requests':
      return 'auth.error.tooManyRequests';
    case 'auth/operation-not-allowed':
      return 'auth.error.operationNotAllowed';
    case 'auth/requires-recent-login':
      return 'auth.error.requiresRecentLogin';
    default:
      return 'auth.error.generic';
  }
};
