import { NavItem, Program, ImpactMetric, GalleryItem, UpdateArticle } from '../types';

export const SITE_CONFIG = {
  name: 'Silah-e-Khair Foundation',
  shortName: 'Silah-e-Khair',
  tagline: 'Connecting Hearts Through Giving',
  heroSubtitle: 'Together, we turn small monthly contributions into meaningful support for families and communities in need.',
  description: 'A community-based charitable foundation created by friends who contribute together to support people in need with dignity and transparency.',
  
  // Real Provided Contact & Links
  whatsappNumber: '+92 318 3182308',
  whatsappRaw: '923183182308',
  surveyHeartFormUrl: 'https://surveyheart.com/form/6a18b08f2323087029d9cc12',
  instagramUrl: 'https://www.instagram.com/silahekhairfoundation?igsh=MWw0MzcwbjVsN2V1cA==',
  tiktokUrl: 'https://www.tiktok.com/@silahekhair?_r=1&_t=ZS-98gIXTzgCNp',
  
  // Public fallback used until live member records are available from Supabase.
  // Keep this in source control because browser localStorage is not shared with
  // visitors on Vercel.
  activeMembersCount: '3+',

  // Navigation Links
  navItems: [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Our Work', path: '/our-work' },
    { label: 'Impact', path: '/impact' },
    { label: 'Transparency', path: '/transparency' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Updates', path: '/updates' },
    { label: 'Contact', path: '/contact' },
  ] as NavItem[],

  // Default WhatsApp Messages
  whatsappMessages: {
    general: 'Assalam-o-Alaikum, I would like to know more about Silah-e-Khair Foundation.',
    support: 'Assalam-o-Alaikum, I would like to support Silah-e-Khair Foundation with funds/donation.',
    ourWork: 'Assalam-o-Alaikum, I would like to know more about the work of Silah-e-Khair Foundation.',
    membership: 'Assalam-o-Alaikum, I am interested in becoming a contributing member of Silah-e-Khair Foundation.',
    contact: 'Assalam-o-Alaikum, I would like to contact Silah-e-Khair Foundation.',
  }
};

export const PROGRAMS: Program[] = [
  {
    id: 'ration-support',
    title: 'Monthly Ration Support',
    category: 'Essential Relief',
    shortDescription: 'Providing essential food supplies and monthly staple packages to families facing financial hardship.',
    fullDescription: 'Our Monthly Ration Support initiative ensures that vulnerable households receive nutritious staple groceries including flour, rice, pulses, cooking oil, tea, and sugar every month.',
    purpose: 'To restore nutritional security and peace of mind to families who struggle to meet basic grocery needs.',
    deliveryMethod: 'Hand-delivered with utmost respect and discretion directly to pre-verified households monthly.',
    impactExplanation: 'Saves families from food starvation and allows parents to redirect scarce income toward rent or child education.',
    iconName: 'PackageCheck'
  },
  {
    id: 'meal-distribution',
    title: 'Daily Meal Distribution',
    category: 'Food Security',
    shortDescription: 'Preparing and serving freshly cooked meals to daily wage earners, travelers, and individuals in need.',
    fullDescription: 'Every day, our volunteer network organizes clean, hygienic meal distributions at designated community spots for workers, laborers, and unsheltered individuals.',
    purpose: 'To ensure no worker or passerby goes hungry after a hard day of physical labor.',
    deliveryMethod: 'Freshly prepared meals served warm at field distribution points.',
    impactExplanation: 'Provides immediate nourishment and dignity to hard-working daily earners.',
    iconName: 'Utensils'
  },
  {
    id: 'emergency-relief',
    title: 'Emergency Relief',
    category: 'Crisis Response',
    shortDescription: 'Rapid deployment of humanitarian assistance during seasonal hardship, winter freezes, or local emergencies.',
    fullDescription: 'When extreme weather or unforeseen crises strike, Silah-e-Khair mobilizes immediate aid including warm blankets, winter clothing, clean water, and emergency food supplies.',
    purpose: 'To protect vulnerable community members during sudden hardship or climate extremes.',
    deliveryMethod: 'On-ground swift distribution teams targeting affected local areas.',
    impactExplanation: 'Saves lives and provides immediate protection during critical winter and disaster seasons.',
    iconName: 'ShieldAlert'
  },
  {
    id: 'widow-orphan-support',
    title: 'Widow & Orphan Support',
    category: 'Family Welfare',
    shortDescription: 'Providing monthly financial stipends, essential rations, and living support to empower widows and orphaned children.',
    fullDescription: 'Our Widow & Orphan Support initiative provides dignified financial stipends, educational care, and food security to widowed mothers and orphaned children struggling without a primary breadwinner.',
    purpose: 'To ensure widows and orphaned children live with dignity, stability, and emotional and financial peace.',
    deliveryMethod: 'Direct monthly financial support transfers and household care packages.',
    impactExplanation: 'Protects vulnerable families from poverty, keeping children in school and ensuring household stability.',
    iconName: 'HeartPulse'
  },
  {
    id: 'education-support',
    title: 'Education Support',
    category: 'Future Empowerment',
    shortDescription: 'Covering essential school fees, books, and uniforms for deserving students from low-income families.',
    fullDescription: 'Education is the most sustainable pathway out of poverty. We sponsor school fees, uniforms, and learning supplies for bright children whose families cannot afford schooling costs.',
    purpose: 'To keep promising children in school and prevent dropouts caused by financial distress.',
    deliveryMethod: 'Direct tuition fee disbursements paid directly to accredited schools.',
    impactExplanation: 'Empowers the next generation with literacy, skills, and hope for a brighter future.',
    iconName: 'GraduationCap'
  }
];

export const IMPACT_METRICS: ImpactMetric[] = [
  {
    id: 'members',
    label: 'Active Contributing Members',
    value: SITE_CONFIG.activeMembersCount,
    description: 'A growing collective of dedicated friends and members pooling monthly contributions.',
    isVerifiedLive: true,
    source: 'Official Foundation Register'
  },
  {
    id: 'families',
    label: 'Ration Packages Distributed',
    value: 'Ongoing',
    unit: 'Monthly',
    description: 'Regular monthly food security packages provided directly to verified beneficiary families.',
    isVerifiedLive: false,
    source: 'Field Distribution Logs'
  },
  {
    id: 'meals',
    label: 'Hot Meals Served',
    value: 'Community Drives',
    description: 'Freshly prepared nutritious meals distributed to daily workers and vulnerable individuals.',
    isVerifiedLive: false,
    source: 'Kitchen & Field Logs'
  },
  {
    id: 'transparency',
    label: 'Financial Transparency',
    value: '100%',
    description: 'Every rupee collected is recorded, audited internally, and documented.',
    isVerifiedLive: true,
    source: 'Member Audit Ledgers'
  }
];

export const PROCESS_STEPS = [
  {
    number: '01',
    title: 'Members Contribute',
    description: 'Friends and community members commit a fixed or flexible monthly contribution into the pooled foundation fund.'
  },
  {
    number: '02',
    title: 'Funds Are Pooled',
    description: 'All contributions are safely consolidated with complete digital record-keeping and member visibility.'
  },
  {
    number: '03',
    title: 'Needs Are Identified',
    description: 'Our field volunteers personally visit and discreetly verify families, patients, and urgent humanitarian cases.'
  },
  {
    number: '04',
    title: 'Support Is Distributed',
    description: 'Ration supplies, medical aid, or warm meals are delivered directly to verified recipients with utmost dignity.'
  },
  {
    number: '05',
    title: 'Activities Documented',
    description: 'Full financial ledgers and field distribution reports are shared with all members for complete transparency.'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [];

export const UPDATES_PREVIEW: UpdateArticle[] = [];
