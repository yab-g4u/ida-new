
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, KeyRound, Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const phoneFormSchema = z.object({
  phone: z.string().min(10, 'Please enter a valid phone number.'),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('email');

  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Success', description: 'Logged in successfully.' });
      router.push('/home');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function handleGoogleSignIn() {
    if (!auth) return;
    setIsSubmitting(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Success', description: 'Logged in with Google.' });
      router.push('/home');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast({
        variant: 'destructive',
        title: 'Google Sign-In Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Placeholder for phone submission
  function onPhoneSubmit(values: z.infer<typeof phoneFormSchema>) {
    console.log(values);
    toast({ title: "Coming Soon", description: "Phone sign-in is not yet implemented."})
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-headline font-bold text-primary-foreground">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue to IDA</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Enter your email" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Password</FormLabel>
                       <FormControl>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password" 
                              {...field} 
                              className="pl-10 pr-10"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
                            </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="phone">
              <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6 mt-6">
                <FormField control={phoneForm.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input type="tel" placeholder="Enter your phone number" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Code
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                <Icons.google className="mr-2 h-5 w-5" />
                Sign in with Google
            </Button>
            {/* Placeholders for other providers */}
            <Button variant="outline" className="w-full" disabled>
                <Icons.apple className="mr-2 h-5 w-5" />
                Sign in with Apple
            </Button>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
