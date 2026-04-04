export const navLinks = [
  { name: "Product", href: "/product" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export const faqs = [
  {
    question: "Is MediBridge AI clinically validated?",
    answer: "Yes, our models are trained on curated clinical datasets and reviewed by a board of medical professionals to ensure accuracy and empathy in every interaction."
  },
  {
    question: "How do you handle patient privacy?",
    answer: "We utilize end-to-end encryption and are fully HIPAA, GDPR, and SOC-2 compliant. Data is never used for training external models."
  },
  {
    question: "Can it integrate with our existing EHR?",
    answer: "Absolutely. We provide robust FHIR-based APIs and out-of-the-box connectors for Epic, Cerner, and other major platforms."
  }
];

export const stats = [
  { label: "Faster Triage", value: "90%", icon: "Zap" },
  { label: "Security", value: "HIPAA", icon: "ShieldCheck" },
  { label: "Admin Savings", value: "Drastic", icon: "PiggyBank" },
  { label: "Patient Trust", value: "Enhanced", icon: "Users" }
];

export const patientRecords = [
  { 
    id: "1", 
    name: "Eleanor Rigby", 
    priority: "High", 
    time: "12 mins ago", 
    insight: "AI detected anomalous heart rate variability. Patient requested follow-up on medication side effects.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
  },
  { 
    id: "2", 
    name: "Marcus Chen", 
    priority: "Stable", 
    time: "2 hrs ago", 
    insight: "AI answered routine questions about post-op diet. No intervention required.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
  }
];

export const researchProjects = [
  {
    id: "alpha",
    title: "Neurosurgery: Project Alpha",
    update: "AI synthesized 42 papers on neuroplasticity.",
    updatedAt: "4h ago",
    members: ["JV", "AI", "+2"]
  },
  {
    id: "cardiac",
    title: "Cardiac Care Pathways",
    update: "Protocol refinement in progress with Dr. Miller.",
    updatedAt: "Yesterday",
    members: ["JV", "AM"]
  }
];

export const chatResponses = {
  english: {
    normal: "The myocardial infarction mentioned in your report means a part of your heart muscle isn't getting enough blood.",
    simple: "Think of your heart like a house with water pipes. A 'myocardial infarction' is like a temporary blockage in one of those pipes that needs fixing."
  },
  hindi: {
    normal: "आपकी रिपोर्ट में बताए गए मायोकार्डियल इंफार्क्शन का मतलब है कि आपके दिल की मांसपेशियों के एक हिस्से को पर्याप्त रक्त नहीं मिल रहा है।",
    simple: "अपने दिल को पानी के पाइप वाले घर की तरह समझें। 'मायोकार्डियल इंफार्क्शन' उन पाइपों में से एक में अस्थायी रुकावट की तरह है जिसे ठीक करने की आवश्यकता है।"
  }
};
