 
import { PagesOptions } from 'next-auth';

export const pagesOptions: Partial<PagesOptions> = {
  signIn: '/auth/login',
  error: '/authentication/error',
};
