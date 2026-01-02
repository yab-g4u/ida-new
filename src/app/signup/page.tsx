import { redirect } from 'next/navigation';

// This page is no longer needed with anonymous authentication.
// Redirect users to the home page, where the auth flow will handle them.
export default function SignupPage() {
  redirect('/home');
}
