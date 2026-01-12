import type { LoginRequest, SignupRequest } from 'src/types/auth';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = LoginRequest;

export type SignUpParams = SignupRequest;

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.login, params);

    const rawToken = res.data.data?.token || res.data.token;

    if (!rawToken) {
      throw new Error('Access token not found in response');
    }

    // Remove "Bearer " prefix if present
    const accessToken = rawToken.replace(/^Bearer\s+/i, '');

    setSession(accessToken);
  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signup, params);

    const rawToken = res.data.data?.token || res.data.token;

    if (!rawToken) {
      throw new Error('Access token not found in response');
    }

    // Remove "Bearer " prefix if present
    const accessToken = rawToken.replace(/^Bearer\s+/i, '');

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
