'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Search, MapPin, QrCode, ChevronRight, User, Settings, ShieldCheck, BrainCircuit, Clock, HeartPulse, Siren, Phone, Mail, LogOut, Languages } from 'lucide-react';
import { useAuth } from '@/contexts/auth-provider';
import { useLanguage } from '@/hooks/use-language';
import { ThemeToggle } from '@/components/theme-toggle';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';

const featureCards = [
    { 
        href: '/search-medicine', 
        icon: Search, 
        iconBg: 'bg-green-100 dark:bg-green-900/50',
        iconColor: 'text-green-600 dark:text-green-400',
        title: { en: 'Search Medicine Info', am: 'መድሃኒት ፈልግ', om: 'Odeeffannoo Qorichaa Barbaadi' },
        description: { en: 'Find information about your medication.', am: 'ስለ መድሃኒትዎ መረጃ ያግኙ።', om: 'Waa\'ee qoricha keetii odeeffannoo argadhu.' },
    },
    { 
        href: '/locate-pharmacy', 
        icon: MapPin, 
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        title: { en: 'Locate Pharmacy', am: 'ፋርማሲ ያግኙ', om: 'Faarmaasii Barbaadi' },
        description: { en: 'Find pharmacies near you.', am: 'በአቅራቢያዎ ያሉ ፋርማሲዎችን ያግኙ።', om: 'Faarmaasiiwwan dhiyoo kee jiran argadhu.' },
    },
    { 
        href: '/my-qr-info', 
        icon: QrCode, 
        iconBg: 'bg-purple-100 dark:bg-purple-900/50',
        iconColor: 'text-purple-600 dark:text-purple-400',
        title: { en: 'My QR Info', am: 'የእኔ QR መረጃ', om: 'Odeeffannoo QR Koo' },
        description: { en: 'Your emergency health information.', am: 'የእርስዎ የድንገተኛ የጤና መረጃ።', om: 'Odeeffannoo kee kan fayyaa yeroo hatattamaa.' },
    },
];

const smallFeatureCards = [
    {
        icon: Clock,
        label: { en: '24/7', am: '24/7', om: '24/7' },
    },
    {
        icon: BrainCircuit,
        label: { en: 'AI Powered', am: 'AI የተጎላበተ', om: 'AI-Aan Deeggarame' },
    },
    {
        icon: ShieldCheck,
        label: { en: 'Secure', am: 'ደህንነቱ የተጠበቀ', om: 'Nagaa\'aa' },
    }
];

const healthTips = {
  en: [
    "Drink at least 8 glasses of water a day to stay hydrated.",
    "Aim for 30 minutes of moderate exercise most days of the week.",
    "Eat a variety of fruits and vegetables every day.",
    "Get 7-9 hours of quality sleep per night.",
    "Wash your hands frequently to prevent the spread of germs.",
  ],
  am: [
    "ውሃ ለመቆየት በቀን ቢያንስ 8 ብርጭቆ ውሃ ይጠጡ።",
    "በሳምንቱ ብዙ ቀናት ለ30 ደቂቃ መካከለኛ የአካል ብቃት እንቅስቃሴ ለማድረግ አስቡ።",
    "በየቀኑ የተለያዩ ፍራፍሬዎችን እና አትክልቶችን ይመገቡ።",
    "በሌሊት ከ7-9 ሰአታት ጥራት ያለው እንቅልፍ ያግኙ።",
    "የጀርሞችን ስርጭት ለመከላከል እጅዎን ቶሎ ቶሎ ይታጠቡ።",
  ],
  om: [
    "Guyyaatti bishaan burcuqqoo 8 yoo xiqqaate dhuguun qaama keessan jiidhinaa.",
    "Torbanitti guyyoota hedduu daqiiqaa 30f sochii qaamaa giddu-galeessaa gochuuf yaalaa.",
    "Guyyaa guyyaan kuduraalee fi muduraalee adda addaa nyaadhaa.",
    "Halkan tokko sa'aatii 7-9f hirriba gaarii rafaa.",
    "Tamsa'ina jarmootaa ittisuuf yeroo yeroon harka keessan dhiqadhaa.",
  ]
};

type EmergencyContact = {
    name: string;
    phone: string;
}

export default function HomePage() {
  const { user, signOut } = useAuth();
  const db = useFirestore();
  const { getTranslation, language } = useLanguage();
  const { toast } = useToast();
  
  const [dailyTip, setDailyTip] = useState('');
  const [hasEmergencyContact, setHasEmergencyContact] = useState(false);
  const [isContactLoading, setIsContactLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempContact, setTempContact] = useState<EmergencyContact>({name: '', phone: ''});
  
  const welcomeTitle = getTranslation({ en: `Welcome to IDA`, am: 'ወደ IDA እንኳን በደህና መጡ', om: 'Gara IDA tti Nagaan Dhuftan' });
  const welcomeSubtitle = getTranslation({ en: 'Your intelligent health assistant', am: 'ብልህ የጤና ረዳትዎ', om: 'Gargaaraa fayyaa kee oo\'annoo qabu' });

  const translations = useMemo(() => ({
    sosSentTitle: {en: "SOS Sent", am: "SOS ተልኳል", om: "SOS Ergameera"},
    sosSentDesc: {en: "An emergency alert has been sent to your contact.", am: "የድንገተኛ ጊዜ ማንቂያ ወደ እውቂያዎ ተልኳል።", om: "Beeksisa hatattamaa quunnamtii keessaniif ergameera."},
    sosConfirmTitle: {en: "Confirm SOS?", am: "SOSን ያረጋгጡ?", om: "SOS Mirkaneessituu?"},
    sosConfirmDesc: {en: "This will send an emergency alert to your saved contact. Are you sure?", am: "ይህ ለተቀመጠው እውቂያዎ የድንገተኛ ጊዜ ማንቂያ ይልካል። እርግጠኛ ነዎት?", om: "Kun quunnamtii kee galmaa'eef beeksisa hatattamaa erga. Ni mirkaneessitaa?"},
    cancel: {en: "Cancel", am: "ሰርዝ", om: "Haqi"},
    confirm: {en: "Confirm", am: "አረጋግጥ", om: "Mirkaneessi"},
    setupContactTitle: {en: "Setup Emergency Contact", am: "የድንገተኛ ጊዜ እውቂያ ያዘጋጁ", om: "Quunnamtii Hatattamaa Qopheessi"},
    setupContactDesc: {en: "You need to add an emergency contact before using the SOS feature.", am: "የSOS ባህሪን ከመጠቀምዎ በፊት የድንገተኛ ጊዜ እውቂያ ማከል አለብዎት።", om: "Amala SOS fayyadamuu keessan dura quunnamtii hatattamaa dabaluu qabdu."},
    contactName: {en: "Contact Name", am: "የእውቂያ ስም", om: "Maqaa Quunnamtii"},
    contactPhone: {en: "Contact Phone", am: "የእውቂያ ስልክ", om: "Bilbila Quunnamtii"},
    save: {en: "Save", am: "አስቀምጥ", om: "Olkaa'i"},
    contactSaved: {en: "Emergency contact saved.", am: "የድንገተኛ ጊዜ እውቂያ ተቀምጧል።", om: "Quunnamtiin hatattamaa galmaa'eera."},
    contactError: {en: "Failed to save contact.", am: "እውቂያን ማስቀመጥ አልተቻለም።", om: "Quunnamtii olkaa'uun hin danda'amne."},
    validationError: {en: "Validation Error", am: "የማረጋገጫ ስህተት", om: "Dogoggora Mirkaneessuu"},
    validationErrorDesc: {en: "Please fill out a valid name and phone number.", am: "እባክዎ ትክክለኛ ስም እና ስልክ ቁጥር ይሙሉ።", om: "Maaloo maqaa sirrii fi lakkoofsa bilbilaa galchaa."},
    profile: {en: "Profile", am: "መገለጫ", om: "Piroofaayilii"},
    signOut: {en: "Sign Out", am: "ውጣ", om: "Bahi"},
  }), [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tipsForLanguage = healthTips[language];
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).valueOf()) / 86400000);
      const randomIndex = dayOfYear % tipsForLanguage.length;
      setDailyTip(tipsForLanguage[randomIndex]);
    }
  }, [language]);

  useEffect(() => {
    // For demo purposes, we use localStorage instead of a live Firestore call
    // to prevent network-related delays.
    setIsContactLoading(true);
    try {
      const storedContact = localStorage.getItem('ida-emergency-contact');
      setHasEmergencyContact(!!storedContact);
    } catch (e) {
      console.warn("Could not access localStorage for emergency contact.");
      setHasEmergencyContact(false);
    }
    setIsContactLoading(false);
  }, []);

  const handleSendSOS = () => {
    let contactName = 'your contact';
    try {
      const storedContact = localStorage.getItem('ida-emergency-contact');
      if (storedContact) {
        contactName = JSON.parse(storedContact).name;
      }
    } catch(e) {/* ignore */}

    console.log(`SOS sent to ${contactName}`);
    toast({
        title: translations.sosSentTitle[language as keyof typeof translations.sosSentTitle],
        description: `${translations.sosSentDesc[language as keyof typeof translations.sosSentDesc]} (${contactName})`,
    });
  };

  const handleSaveContact = async () => {
    const isPhoneValid = /^\+?[0-9\s-]{7,15}$/.test(tempContact.phone);
    const isNameValid = tempContact.name.trim().length > 1;

    if (!isNameValid || !isPhoneValid) {
        toast({variant: 'destructive', title: translations.validationError[language as keyof typeof translations.validationError], description: translations.validationErrorDesc[language as keyof typeof translations.validationErrorDesc]});
        return;
    }
    
    setIsSaving(true);
    try {
        localStorage.setItem('ida-emergency-contact', JSON.stringify(tempContact));
        setHasEmergencyContact(true);
        toast({ title: translations.contactSaved[language as keyof typeof translations.contactSaved]});
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Error saving contact:", error);
        toast({variant: 'destructive', title: translations.contactError[language as keyof typeof translations.contactError]});
    } finally {
        setIsSaving(false);
    }
  }

  const sosButtonContent = () => {
    if (isContactLoading) {
        return (
             <Button variant="destructive" size="icon" className="rounded-full w-14 h-14 shadow-lg" disabled>
                <Loader2 className="h-6 w-6 animate-spin" />
            </Button>
        );
    }
    if (hasEmergencyContact) {
        return (
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" className="rounded-full w-14 h-14 shadow-lg flex-col">
                        <Siren className="w-6 h-6"/>
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{translations.sosConfirmTitle[language as keyof typeof translations.sosConfirmTitle]}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {translations.sosConfirmDesc[language as keyof typeof translations.sosConfirmDesc]}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{translations.cancel[language as keyof typeof translations.cancel]}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSendSOS}>{translations.confirm[language as keyof typeof translations.confirm]}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                 <Button variant="destructive" size="icon" className="rounded-full w-14 h-14 shadow-lg flex-col">
                    <Siren className="w-6 h-6"/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{translations.setupContactTitle[language as keyof typeof translations.setupContactTitle]}</DialogTitle>
                    <DialogDescription>
                        {translations.setupContactDesc[language as keyof typeof translations.setupContactDesc]}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="contact-name">{translations.contactName[language as keyof typeof translations.contactName]}</Label>
                        <Input id="contact-name" value={tempContact.name} onChange={e => setTempContact({...tempContact, name: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact-phone">{translations.contactPhone[language as keyof typeof translations.contactPhone]}</Label>
                        <Input id="contact-phone" type="tel" value={tempContact.phone} onChange={e => setTempContact({...tempContact, phone: e.target.value})}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveContact} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {translations.save[language as keyof typeof translations.save]}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30 dark:bg-background">
        <header className="bg-background dark:bg-muted/30 p-4 md:p-6 sticky top-0 z-10 shadow-sm">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="font-headline text-2xl font-bold">{welcomeTitle}</h1>
                    <p className="text-sm text-muted-foreground">{welcomeSubtitle}</p>
                </div>
                <div className="flex items-center gap-1">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <User className="w-6 h-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{user?.displayName || 'User'}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href="/my-qr-info" className="w-full flex items-center gap-2"><User />{translations.profile[language as keyof typeof translations.profile]}</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                                <LogOut /> {translations.signOut[language as keyof typeof translations.signOut]}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <LanguageSwitcher />
                    <ThemeToggle />
                </div>
            </div>
        </header>
      
        <main className="flex-grow p-4 md:p-6 space-y-6">
            
            <div className="grid grid-cols-3 gap-3 text-center">
                {smallFeatureCards.map((feature, index) => (
                    <Card key={index} className="bg-card/80 dark:bg-card p-3 flex flex-col items-center justify-center shadow-sm">
                        <feature.icon className="w-6 h-6 mb-1 text-primary"/>
                        <span className="text-xs font-semibold">{getTranslation(feature.label)}</span>
                    </Card>
                ))}
            </div>

            <Card className="bg-accent/50 dark:bg-accent/20 border-none shadow-lg">
                <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                    <HeartPulse className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline text-lg">{getTranslation({ en: 'Daily Health Tip', am: 'የዕለት ጤና ምክር', om: 'Gorsa Fayyaa Guyyaa' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-foreground/80 italic">"{dailyTip}"</p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {featureCards.map((feature, index) => (
                    <Link href={feature.href} key={index} passHref>
                        <Card className="shadow-md hover:shadow-lg transition-shadow p-4 flex items-center bg-card">
                            <div className={`p-3 rounded-lg ${feature.iconBg} mr-4`}>
                                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                            </div>
                            <div className="flex-grow">
                                <h2 className="font-bold text-base">{getTranslation(feature.title)}</h2>
                                <p className="text-sm text-muted-foreground">{getTranslation(feature.description)}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </Card>
                    </Link>
                ))}
            </div>
        </main>
        <div className="fixed bottom-24 right-4 z-50">
            {sosButtonContent()}
        </div>
    </div>
  );
}
