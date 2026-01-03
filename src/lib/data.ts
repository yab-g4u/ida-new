export const mockMedicineData = [
  {
    name: 'Amoxicillin',
    keywords: ['Amoxicillin', 'Antibiotic'],
    complexInstructions: {
      en: 'Administer one 500mg capsule orally every 8 hours for a duration of 7-10 days. Ensure the medication is taken with a full 8-ounce glass of water. May be taken with or without food; however, taking with food may reduce gastrointestinal upset. Complete the full prescribed course of therapy, even if symptoms resolve prematurely, to prevent the development of antibiotic resistance. Do not crush or chew the capsule.',
      am: 'አንድ 500mg ካፕሱል በየ 8 ሰዓቱ ከ7-10 ቀናት ውስጥ በአፍ ይውሰዱ። መድሃኒቱ ሙሉ 8-ኦውንስ ብርጭቆ ውሃ ጋር መወሰዱን ያረጋгጡ። ከምግብ ጋር ወይም ያለ ምግብ ሊወሰድ ይችላል፤ ሆኖም ከምግብ ጋር መውሰድ የሆድ መረበሽን ሊቀንስ ይችላል። የህመም ምልክቶች ቶሎ ቢጠፉም እንኳ፣ አንቲባዮቲክ መቋቋምን ለመከላከል ሙሉ የታዘዘውን የህክምና ኮርስ ይጨርሱ። ካፕሱሉን አይፍጩ ወይም አያኝኩ።',
      om: 'Qoricha Kaapsulii 500mg tokko sa\'aatii 8tti yeroo tokko, guyyoota 7-10f afaaniin fudhadhu. Qorichi bishaan burcuqqoo 8 guutuu wajjin fudhatamuu isaa mirkaneessi. Nyaata wajjinis ta\'e nyaata malee fudhatamuu ni danda\'a; haa ta\'u malee, nyaata wajjin fudhachuun garaa mufachuu hir\'isuu danda\'a. Mallattooleen yoo dafanii badanis, ittisa antibioticootaaf guddachuu ittisuuf, koorsii yaalaa guutuun ajajame fixi. Kaapsulicha hin caccabsin yookaan hin alanfatin.',
    },
    usage: {
      en: 'Used to treat a wide variety of bacterial infections.',
      am: 'የተለያዩ የባክቴሪያ ኢንፌክሽኖችን ለማከም ያገለግላል።',
      om: 'Infekshiniiwwan baakteeriyaa adda addaa yaaluuf gargaara.',
    },
    dosage: {
        en: '500mg every 8 hours.',
        am: '500mg በየ 8 ሰዓቱ።',
        om: '500mg sa\'aatii 8tti.',
    },
    sideEffects: {
        en: 'Nausea, vomiting, diarrhea, rash.',
        am: 'ማቅለшለሽ፣ ማስመለስ፣ ተቅማጥ፣ ሽፍታ።',
        om: 'Garaa naqsuu, diddiga, garaa kaasaa, fincaan.',
    },
    warnings: {
        en: 'Allergy to penicillin, kidney disease.',
        am: 'ለፔኒሲሊን አለርጂ፣ የኩላሊት በሽታ።',
        om: 'Aleerjii peenisiliinii, dhukkuba kalee.',
    }
  }
];

  export const mockPharmacies = [
    { id: 1, name: 'Bole Pharmacy', area: 'Bole', coordinates: [9.005, 38.791] as [number, number], distance: '4.1', hours: '10PM', phone: '+251 11 456 7890' },
    { id: 2, name: 'Medhanealem Pharmacy', area: 'Bole', coordinates: [9.0085, 38.7901] as [number, number], distance: '3.8', hours: '9PM', phone: '+251 11 661 1234' },
    { id: 3, name: 'Atlas Pharmacy', area: 'Bole', coordinates: [8.994, 38.793] as [number, number], distance: '4.5', hours: '10PM', phone: '+251 11 661 5555' },
    { id: 4, name: 'CityMed Pharmacy', area: 'Kirkos', coordinates: [8.9806, 38.7578] as [number, number], distance: '3.4', hours: '24 Hours', phone: '+251 11 345 6789' },
    { id: 5, name: 'Stadium Pharmacy', area: 'Kirkos', coordinates: [8.990, 38.761] as [number, number], distance: '2.9', hours: '9PM', phone: '+251 11 551 2233' },
    { id: 6, name: 'Arada Pharmacy', area: 'Arada', coordinates: [9.0355, 38.7525] as [number, number], distance: '0.8', hours: '8PM', phone: '+251 11 567 8901' },
    { id: 7, name: 'Giorgis Pharmacy', area: 'Arada', coordinates: [9.030, 38.760] as [number, number], distance: '1.2', hours: '10PM', phone: '+251 11 123 4567' },
    { id: 8, name: 'Lideta Pharmacy', area: 'Lideta', coordinates: [9.015, 38.74] as [number, number], distance: '1.5', hours: '24 Hours', phone: '+251 11 275 4455' },
    { id: 9, name: 'Mexico Square Pharmacy', area: 'Lideta', coordinates: [8.998, 38.745] as [number, number], distance: '2.1', hours: '11PM', phone: '+251 11 550 8899' },
    { id: 10, name: 'Saris Pharmacy', area: 'Nifas Silk-Lafto', coordinates: [8.945, 38.74] as [number, number], distance: '8.2', hours: '9PM', phone: '+251 11 321 9876' },
    { id: 11, name: 'Megenagna Pharmacy', area: 'Yeka', coordinates: [9.018, 38.805] as [number, number], distance: '4.8', hours: '24 Hours', phone: '+251 11 660 9988' },
    { id: 12, name: 'Hayat Pharmacy', area: 'Yeka', coordinates: [9.025, 38.815] as [number, number], distance: '6.0', hours: '10PM', phone: '+251 11 888 7766' },
  ];
  
  export type Pharmacy = typeof mockPharmacies[0];
  export type CommunityPharmacy = {
    id: number;
    name: string;
    comment?: string;
    coordinates: [number, number];
    addedByUser: true;
  };

export const sponsoredPharmacies = [
    {
        id: 'sp1',
        name: 'LifeCare Pharmacy',
        slogan: 'Your health is our priority. Visit us for quality medicines and expert advice.',
        location: 'Bole, Addis Ababa',
        hours: 'Open 24/7',
        offer: '20% off on all vitamins',
    },
    {
        id: 'sp2',
        name: 'HealthPlus Pharmacy',
        slogan: 'Your trusted partner in wellness. Wide range of products available.',
        location: 'CMC, Addis Ababa',
        hours: 'Closes at 11 PM',
        offer: 'Free delivery on orders over 500 ETB',
    },
    {
        id: 'sp3',
        name: 'Unity Pharmacy',
        slogan: 'Quality care, one prescription at a time.',
        location: 'Piazza, Addis Ababa',
        hours: 'Open 24/7',
        offer: '15% discount for senior citizens',
    },
];
  
  