import { supabase } from '../lib/supabase';

const ADMIN_AUTH_KEY = 'silah_admin_authenticated';
const ADMIN_AUTH_VERSION = 'supabase-auth-v1';

export const isAdminAuthenticated = (): boolean => {
  return (
    localStorage.getItem(ADMIN_AUTH_KEY) === 'true' &&
    localStorage.getItem(`${ADMIN_AUTH_KEY}_version`) === ADMIN_AUTH_VERSION
  );
};

export const loginAdmin = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password
  });

  if (!error && data.user?.app_metadata?.role === 'admin') {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    localStorage.setItem(`${ADMIN_AUTH_KEY}_version`, ADMIN_AUTH_VERSION);
    return { success: true };
  }

  if (!error) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'This account is not authorized for the admin portal.'
    };
  }

  return {
    success: false,
    error: error.message
  };
};

export const changeAdminPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const email = userData.user?.email;

  if (userError || !email) {
    return { success: false, error: 'Your admin session has expired. Please sign in again.' };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword
  });

  if (verifyError) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true };
};

export const logoutAdmin = async (): Promise<void> => {
  await supabase.auth.signOut();
  localStorage.removeItem(ADMIN_AUTH_KEY);
  localStorage.removeItem(`${ADMIN_AUTH_KEY}_version`);
};
