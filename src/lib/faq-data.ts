export type FaqItem = {
  id: string;
  q: {
    en: string;
    am: string;
    om: string;
  };
  a: {
    en: string;
    am: string;
    om: string;
  };
};

export const faqData: FaqItem[] = [
  // Greetings & Basic Interaction
  {
    id: 'greeting-hello',
    q: {
      en: 'Hello Hi Selam Akkam',
      am: 'ሰላም ሃይ',
      om: 'Akkam Selam Hi',
    },
    a: {
      en: 'Hello! I am IDA, your health ally. How can I help you today?',
      am: 'ሰላም! እኔ IDA ነኝ፣ የጤና አጋርዎ። ዛሬ እንዴት ልረዳዎት እችላለሁ?',
      om: 'Akkam! Ani IDA dha, gargaaraa fayyaa keessanii. Har\'a akkamittan si gargaaruu danda\'a?',
    },
  },
  {
    id: 'greeting-how-are-you',
    q: {
      en: 'How are you?',
      am: 'እንዴት ነህ? እንዴት ነሽ?',
      om: 'Akkam jirta?',
    },
    a: {
      en: "I'm an AI, so I don't have feelings, but I'm here and ready to help! What's on your mind?",
      am: 'እኔ AI ነኝ፣ ስለዚህ ስሜት የለኝም፣ ግን ለመርዳት ዝግጁ ነኝ! ምን እያሰቡ ነው?',
      om: 'Ani AI dha, kanaaf miira hin qabu, garuu asan jira gargaaruuf qophaa\'ee! Maaltu sammuu kee keessa jira?',
    },
  },
  {
    id: 'farewell-thank-you',
    q: {
        en: 'Thank you Thanks',
        am: 'አመሰግናለሁ',
        om: 'Galatoomi',
    },
    a: {
        en: 'You\'re welcome! Stay safe and feel free to ask if anything else comes up.',
        am: 'ምንም አይደለም! ጤናማ ይሁኑ እና ሌላ ጥያቄ ካለዎት ለመጠየቅ አያመንቱ።',
        om: 'Rakkookiin hin jiru! Nagaan tursi, gaaffii biraa yoo qabaatte na gaafadhu.',
    }
  },
   {
    id: 'user-sick',
    q: {
        en: 'i was sick amogn nbr',
        am: 'አሞኝ ነበር',
        om: 'dhukkubsachaan ture',
    },
    a: {
        en: 'I am sorry to hear that. How are you feeling now? I hope you are recovering well. Do you have any remaining symptoms?',
        am: 'ይቅርታ። አሁን እንዴት ነዎት? በደንብ እያገገሙ እንደሆነ ተስፋ አደርጋለሁ። የቀሩ ምልክቶች አሉዎት?',
        om: 'Dhaga\'uunko na gaddisiise. Amma akkam sitti jira? Sirriitti akka fayyine abdiin qaba. Mallattooleen hafan jiru?',
    }
  },

  // Common Symptoms
  {
    id: 'symptom-stomach-pain',
    q: {
        en: 'my stomach hurts hoden eyamemegn nw garaa na dhukkuba',
        am: 'ሆዴን እያመመኝ ነው',
        om: 'garaa na dhukkuba',
    },
    a: {
        en: 'Sorry to hear that. Stomach pain can happen for many reasons. Have you had anything warm to drink, like tea? Sometimes that can help soothe it. If the pain is severe or continues, please visit a clinic.',
        am: 'ይህን በመስማቴ አዝኛለሁ። የሆድ ህመም በተለያዩ ምክንያቶች ሊከሰት ይችላል። እንደ ሻይ ያለ ትኩስ ነገር ጠጥተዋል? አንዳንድ ጊዜ ያ ማስታገስ ይችላል። ህመሙ ከባድ ከሆነ ወይም ከቀጠለ እባክዎ ክሊኒክ ይጎብኙ።',
        om: 'Dhaga\'uunko na gaddisiise. Garaa dhukkubbiin sababa adda addaatiin dhufuu danda\'a. Wantoota ho\'aa kan akka shaayii dhugdeettaa? Yeroo tokko tokko kun ni tasgabbeessa. Yoo dhukkubbiin hammaataa ta\'e yookiin itti fufe, maaloo kilinika deemi.',
    }
  },
  {
    id: 'symptom-headache',
    q: {
        en: 'I have a headache',
        am: 'ራሴን አመመኝ',
        om: 'Mataan na dhukkuba',
    },
    a: {
        en: 'For a mild headache, resting in a quiet, dark room and drinking water can help. Gently massaging your temples might also provide relief. If it\'s a very bad headache or doesn\'t go away, you should see a healthcare provider.',
        am: 'ለቀላል ራስ ምታት፣ ጸጥ ባለ ጨለማ ክፍል ውስጥ ማረፍ እና ውሃ መጠጣት ሊረዳ ይችላል። የጆሮዎትን አካባቢ በቀስታ ማሸትም እፎይታ ሊሰጥ ይችላል። በጣም ከባድ ከሆነ ወይም የማይጠፋ ከሆነ የጤና ባለሙያ ማየት አለብዎት።',
        om: 'Mataa dhukkubbii salphaadhaaf, kutaa dukkanaa\'aa fi callinsaa qabu keessa boqochuunii fi bishaan dhuguun gargaaruu danda\'a. Suuta jedhanii naannoo gurraa keessanii dhiibuuunis fayyuu danda\'a. Yoo baay\'ee hamaa ta\'e yookiin hin badne, ogeessa fayyaa arguu qabda.',
    }
  },
  {
    id: 'symptom-flu',
    q: {
      en: 'What are the symptoms of the flu?',
      am: 'የጉንፋን ምልክቶች ምንድናቸው?',
      om: 'Mallattooleen utaalloo maali?',
    },
    a: {
      en: 'Common flu symptoms include fever, cough, sore throat, body aches, headaches, and fatigue. It is important to get plenty of rest and drink fluids.',
      am: 'የተለመዱ የጉንፋን ምልክቶች ትኩሳት፣ ሳል፣ የጉሮሮ መቁሰል፣ የሰውነት ህመም፣ ራስ ምታት እና ድካም ያካትታሉ። ብዙ እረፍት ማግኘት እና ፈሳሽ መጠጣት አስፈላጊ ነው።',
      om: 'Mallattooleen utaalloo beekamoon ho\'a, qufaa, qoonqoo madaa\'uu, dhukkubbii qaamaa, mataa bowwuu, fi dadhabbii of keessatti qabatu. Boqonnaa ga\'aa argachuunii fi dhangala\'oo dhuguun barbaachisaadha.',
    },
  },

  // General Health Advice
  {
    id: 'advice-lower-blood-pressure',
    q: {
      en: 'How can I lower my blood pressure?',
      am: 'የደም ግፊቴን እንዴት ዝቅ ማድረግ እችላለሁ?',
      om: 'Dhiibbaa dhiigaa koo akkamittan gadi buusuu danda\'a?',
    },
    a: {
      en: 'To help lower blood pressure, you can try regular exercise, eating a healthy diet low in salt, limiting alcohol, and avoiding smoking. For personalized advice, it is very important to talk to a doctor at a health center.',
      am: 'የደም ግፊትን ለመቀነስ መደበኛ የአካል ብቃት እንቅስቃሴ፣ በጨው ዝቅተኛ የሆነ ጤናማ አመጋገብ፣ አልኮልን መገደብ እና ማጨስን ማስወገድ መሞከር ይችላሉ። ለግል ምክር፣ በጤና ጣቢያ ውስጥ ከሐኪም ጋር መነጋገር በጣም አስፈላጊ ነው።',
      om: 'Dhiibbaa dhiigaa gadi buusuuf gargaaruuf, sochii qaamaa yeroo yeroon gochuu, nyaata fayya qabeessa soogidda xiqqaa qabu nyaachuu, alkoolii daangessuu, fi tamboo xuuxuu irraa of qusachuu yaaluu dandeessa. Gorsa dhuunfaaf, wiirtuu fayyaa keessatti hakiima dubbisuun baay\'ee barbaachisaadha.',
    },
  },
  {
    id: 'advice-healthy-diet',
    q: {
      en: 'What is a healthy diet?',
      am: 'ጤናማ አመጋገብ ምንድነው?',
      om: 'Nyaanni fayya qabeessi maali?',
    },
    a: {
      en: 'A healthy diet in Ethiopia often includes a variety of foods like teff (for injera), lentils, chickpeas, cabbage, potatoes, and some meat or eggs. Eating lots of fruits and vegetables is key. It helps you maintain a healthy weight and lowers your risk of many diseases.',
      am: 'በኢትዮጵያ ጤናማ አመጋገብ እንደ ጤፍ (ለእንጀራ)፣ ምስር፣ ሽምብራ፣ ጎመን፣ ድንች እና አንዳንድ ስጋ ወይም እንቁላል ያሉ የተለያዩ ምግቦችን ያጠቃልላል። ብዙ ፍራፍሬዎችን እና አትክልቶችን መመገብ ቁልፍ ነው። ጤናማ ክብደትን ለመጠበቅ ይረዳል እና ለብዙ በሽታዎች ተጋላጭነትዎን ይቀንሳል።',
      om: 'Nyaanni fayya qabeessi Itoophiyaa keessatti yeroo baay\'ee nyaatawwan adda addaa kan akka xaafii (biddeenaaf), misira, shumburaa, raafuu, dinnichaa, fi foon yookiin hanqaaquu tokko tokko of keessatti qabata. Kuduraalee fi muduraalee hedduu nyaachuun furtuudha. Ulfaatina fayya qabeessa ta\'e eeguuf si gargaara, fi carraa dhukkuboota hedduu ni hir\'isa.',
    },
  },
];
