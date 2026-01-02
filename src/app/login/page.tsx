'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useAuth as useFirebaseAuth } from "@/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

export default function LoginPage() {
  const auth = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { getTranslation } = useLanguage();

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({
        title: getTranslation({ en: "Success", am: "ተሳክቷል", om: "Milkaa'eera" }),
        description: getTranslation({ en: "You have successfully signed in.", am: "በተሳካ ሁኔታ ገብተዋል።", om: "Milkaa'inaan seentaniittu." }),
      });
      router.push('/home');
    } catch (error) {
      console.error("Google sign-in error", error);
      toast({
        variant: "destructive",
        title: getTranslation({ en: "Error", am: "ስህተት", om: "Dogoggora" }),
        description: getTranslation({ en: "Could not sign in with Google. Please try again.", am: "በGoogle መግባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።", om: "Googlen seessisuun hin danda'amne. Irra deebi'ii yaali." }),
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">
            {getTranslation({ en: "Welcome Back", am: "እንኳን ደህና መጡ", om: "Baga Nagaan Dhuftan" })}
          </CardTitle>
          <CardDescription>
            {getTranslation({ en: "Sign in to continue to IDA", am: "ወደ IDA ለመቀጠል ይግቡ", om: "Gara IDA tti fufuuf seenuu" })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{getTranslation({ en: "Email", am: "ኢሜይል", om: "Imeelii" })}</Label>
            <Input id="email" type="email" placeholder="m@example.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{getTranslation({ en: "Password", am: "የይለፍ ቃል", om: "Jecha-icciti" })}</Label>
            <Input id="password" type="password" disabled />
          </div>
          <Button className="w-full" disabled>
            {getTranslation({ en: "Sign In", am: "ይግቡ", om: "Seeni" })}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {getTranslation({ en: "Or continue with", am: "ወይም በ", om: "Yookaan itti fufi" })}
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
