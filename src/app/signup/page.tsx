import { redirect } from 'next/navigation';


// Redirect users to the home page, where the auth flow will handle them.
export default function SignupPage() {
  redirect('/home');
}
