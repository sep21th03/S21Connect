 
import { PagesOptions } from 'next-auth';

export const pagesOptions: Partial<PagesOptions> = {
  signIn: '/authentication/login',
  error: '/authentication/error',
};
