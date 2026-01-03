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
  // Greeting
  {
    id: 'greeting-hello',
    q: {
      en: 'Hello',
      am: 'ሰላም',
      om: 'Akkam',
    },
    a: {
      en: 'Hello! How can I help you today?',
      am: 'ሰላም! ዛሬ እንዴት ልረዳዎት እችላለሁ? (Selam! Zarē ēndēt liredawoti ichilalehu?)',
      om: 'Akkam! Har\'a akkamittan si gargaaruu danda\'a?',
    },
  },
  {
    id: 'greeting-how-are-you',
    q: {
      en: 'How are you?',
      am: 'እንዴት ነህ?',
      om: 'Akkam jirta?',
    },
    a: {
      en: "I'm an AI, so I don't have feelings, but I'm here and ready to help!",
      am: 'እኔ AI ነኝ፣ ስለዚህ ስሜት የለኝም፣ ግን እዚህ ለመርዳት ዝግጁ ነኝ! (Inē AI neny, silezīhi simēti yelenyimi, gini izīhi lemeridati zigijū neny!)',
      om: 'Ani AI dha, kanaaf miira hin qabu, garuu asan jira gargaaruuf qophaa\'ee!',
    },
  },
  {
    id: 'farewell-thank-you',
    q: {
        en: 'Thank you',
        am: 'አመሰግናለሁ',
        om: 'Galatoomi',
    },
    a: {
        en: 'You\'re welcome! Let me know if you have any other questions.',
        am: 'ምንም አይደለም! ሌላ ጥያቄ ካሎት ያሳውቁኝ። (Minimi āyidelemi! Lēla t’iyak’ē kaloti yasawik’unyi.)',
        om: 'Rakkookiin hin jiru! Gaaffii biraa yoo qabaatte na beeksisi.',
    }
  },

  // Common Questions from the main page
  {
    id: 'flu-symptoms',
    q: {
      en: 'What are the symptoms of the flu?',
      am: 'የጉንፋን ምልክቶች ምንድናቸው?',
      om: 'Mallattooleen utaalloo maali?',
    },
    a: {
      en: 'Common flu symptoms include fever, cough, sore throat, muscle or body aches, headaches, and fatigue. Some people may have vomiting and diarrhea, though this is more common in children than adults.',
      am: 'የተለመዱ የጉንፋን ምልክቶች ትኩሳት፣ ሳል፣ የጉሮሮ መቁሰል፣ የጡንቻ ወይም የሰውነት ህመም፣ ራስ ምታት እና ድካም ያካትታሉ። አንዳንድ ሰዎች ማስታወክ እና ተቅማጥ ሊኖራቸው ይችላል፣ ምንም እንኳን ይህ ከአዋቂዎች ይልቅ በልጆች ላይ የተለመደ ቢሆንም። (Yetelamedu yegunifani milikitochi tikusati, sali, yegurorō mek’useli, yet’inicha weyimi yesewineti ḥimemi, rasi mitati ina dikami yakatitሉ። Ānedanidi sewochi masitawoki ina tek’imat’i līnorachewi yichilali, minimi inikwani yihi ke’āwak’īwochi yilik’i belijochi layi yetelamede bīhonimi።)',
      om: 'Mallattooleen utaalloo beekamoon ho\'a, qufaa, qoonqoo madaa\'uu, dhukkubbii maashaa yookiin qaamaa, mataa bowwuu, fi dadhabbii of keessatti qabatu. Namoonni tokko tokko diddigaa fi garaa kaasaa qabaachuu danda\'u, kun garuu umurii guddaa caalaa daa\'imman irratti baay\'inaan mul\'ata.',
    },
  },
  {
    id: 'lower-blood-pressure',
    q: {
      en: 'How can I lower my blood pressure?',
      am: 'የደም ግፊቴን እንዴት ዝቅ ማድረግ እችላለሁ?',
      om: 'Dhiibbaa dhiigaa koo akkamittan gadi buusuu danda\'a?',
    },
    a: {
      en: 'To help lower blood pressure, you can try regular exercise, eating a healthy diet low in salt, limiting alcohol, avoiding smoking, cutting back on caffeine, and reducing stress. It is very important to talk to a doctor for personalized advice.',
      am: 'የደም ግፊትን ለመቀነስ መደበኛ የአካል ብቃት እንቅስቃሴን፣ በጨው ዝቅተኛ የሆነ ጤናማ አመጋገብን መመገብ፣ አልኮልን መገደብ፣ ማጨስን ማስወገድ፣ ካፌይን መቀነስ እና ጭንቀትን መቀነስ መሞከር ይችላሉ። ለግል የተበጀ ምክር ለማግኘት ከሐኪም ጋር መነጋገር በጣም አስፈላጊ ነው። (Yedemi gifītini lemek’enesi medebenya ye’ākali bik’ati inik’isik’asēni, bech’ewi zik’it’enya yehone t’ēnama āmigebabi mimegebi, ālikoholini megedebi, mach’esini masinegedi, kafēyini mek’enesi ina ch’ink’etini mek’enesi memokeri yichalalu። Legili yetebeje mikiri lemaginyeti kehakīmi gari menigageri bet’ami āsefelagī newi።)',
      om: 'Dhiibbaa dhiigaa gadi buusuuf gargaaruuf, sochii qaamaa yeroo yeroon gochuu, nyaata fayya qabeessa soogidda xiqqaa qabu nyaachuu, alkoolii daangessuu, tamboo xuuxuu irraa of qusachuu, kaaffeeyinii hir\'isuu, fi dhiphina hir\'isuu yaaluu dandeessa.  Gorsa dhuunfaaf ogeessa fayyaa dubbisuun baay\'ee barbaachisaadha.',
    },
  },
  {
    id: 'healthy-diet-benefits',
    q: {
      en: 'What are the benefits of a healthy diet?',
      am: 'የጤናማ አመጋገብ ጥቅሞች ምንድ ናቸው?',
      om: 'Faayidaan nyaata fayya qabeessa maali?',
    },
    a: {
      en: 'A healthy diet has many benefits, including weight management, stronger bones and teeth, improved memory, better gut health, and a reduced risk of chronic diseases like heart disease, type 2 diabetes, and some cancers.',
      am: 'ጤናማ አመጋገብ ክብደትን መቆጣጠር፣ ጠንካራ አጥንትና ጥርስ፣ የተሻለ የማስታወስ ችሎታ፣ የተሻለ የሆድ ዕቃ ጤንነት፣ እና እንደ የልብ በሽታ، ዓይነት 2 የስኳር በሽታ እና አንዳንድ የካንሰር አይነቶች ያሉ ሥር የሰደዱ በሽታዎችን የመጋለጥ እድልን መቀነስን ጨምሮ ብዙ ጥቅሞች አሉት። (T’ēnama āmigebi kibideti mek’ot’at’eri, t’enikara āt’initina t’irisi, yeteshale yemasitawesi chilota, yeteshale yehodi ik’a t’ēninineti, ina inide yelibi beshita, ‘type 2’ yessikwari beshita ina ānidenandi yekanis̱eri āyinetochi yalu sirisededu beshitawochini yemigalēt’i idilini mek’enesi ch’emiro bizu t’ik’imochi āluti።)',
      om: 'Nyaanni fayya qabeessi faayidaa hedduu qaba, kanneen akka too\'annoo ulfaatinaa, lafee fi ilkaan jabaataa, yaadannoo fooyya\'e, fayyaa garaachaa fooyya\'e, fi carraa dhukkuboota yeroo dheeraa kanneen akka dhukkuba onnee, sukkaara gosa 2, fi kaansariiwwan tokko tokkoo hir\'isuu dabalata.',
    },
  },
];
