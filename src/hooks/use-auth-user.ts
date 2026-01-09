import type { User } from 'src/types/auth';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export interface AuthUser extends User {
  accessToken: string;
  displayName: string;
}

export function useAuthUser(): AuthUser | null {
  const { user } = useAuthContext();

  if (!user) {
    return null;
  }

  return {
    ...user,
    displayName: `${user.firstName} ${user.lastName}`.trim(),
  } as AuthUser;
}
