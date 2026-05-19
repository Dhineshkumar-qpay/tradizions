"use client";

import React, { useEffect, useState } from "react";

const content: Record<string, any> = {
  EN: {
    title: "Terms and Conditions",
    lastUpdated: "Last Updated: May 02, 2026",
    intro: "Welcome to Tradizions. By accessing or using our website and purchasing our products, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully.",
    sections: [
      {
        id: 1,
        title: "1. General",
        content: "This website is operated by Tradizions. By using our website, you agree to these Terms, Privacy Policy, and other policies."
      },
      {
        id: 2,
        title: "2. Eligibility",
        list: ["Users must be 18+", "Minors must use under guardian supervision"]
      },
      {
        id: 3,
        title: "3. Products",
        intro: "We offer:",
        list: ["Nuts & dry fruits", "Millets", "Spices", "Pooja items", "Gift boxes & hampers"],
        footer: "All products are subject to availability."
      },
      {
        id: 4,
        title: "4. Orders & Payments",
        list: [
          "Orders are confirmed only after successful payment",
          "COD (if applicable) is subject to availability",
          "Prices may change without notice",
          "Offers may have separate terms"
        ]
      },
      {
        id: 5,
        title: "5. Shipping & Delivery",
        list: [
          "Delivery timelines are estimates and may vary",
          "Delays due to courier or external factors are not our responsibility",
          "Customer must provide accurate address details"
        ]
      },
      {
        id: 6,
        title: "6. Subscription Services",
        list: [
          "Subscription plans are auto-renewed unless cancelled",
          "Customers can modify or cancel before the next cycle",
          "No cancellation after order processing"
        ]
      },
      {
        id: 7,
        title: "7. Bulk & Corporate Orders",
        list: [
          "Bulk orders may require advance payment",
          "Customised orders cannot be cancelled once confirmed",
          "Delivery timelines may differ from regular orders"
        ]
      },
      {
        id: 8,
        title: "8. Health Disclaimer",
        list: ["Customers must check ingredients for allergens", "We are not liable for allergic reactions"]
      },
      {
        id: 9,
        title: "9. User Responsibilities",
        list: ["No misuse or fraud", "Maintain account security"]
      },
      {
        id: 10,
        title: "10. Limitation of Liability",
        list: ["Liability limited to order value", "No indirect damages covered"]
      },
      {
        id: 11,
        title: "11. Intellectual Property",
        content: "All website content belongs to Tradizions."
      },
      {
        id: 12,
        title: "12. Third-Party Services",
        content: "We are not responsible for payment gateways or courier services."
      },
      {
        id: 13,
        title: "13. Force Majeure",
        content: "We are not liable for delays due to unforeseen events."
      },
      {
        id: 14,
        title: "14. Governing Law",
        content: "Applicable laws: India / Tamil Nadu",
        footer: "Jurisdiction: Chennai"
      },
      {
        id: 15,
        title: "15. Contact",
        content: "If you have any questions, please contact us:",
        email: "qpay@tradizions.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  TA: {
    title: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது: மே 02, 2026",
    intro: "Tradizions-க்கு உங்களை வரவேற்கிறோம். எங்கள் வலைத்தளத்தைப் பயன்படுத்துவதன் மூலமும் எங்கள் தயாரிப்புகளை வாங்குவதன் மூலமும், பின்வரும் விதிமுறைகள் மற்றும் நிபந்தனைகளுக்கு கட்டுப்பட ஒப்புக்கொள்கிறீர்கள். தயவுசெய்து அவற்றை கவனமாகப் படிக்கவும்.",
    sections: [
      {
        id: 1,
        title: "1. பொதுவானவை",
        content: "இந்த வலைத்தளம் Tradizions மூலம் இயக்கப்படுகிறது. எங்கள் வலைத்தளத்தைப் பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகள், தனியுரிமைக் கொள்கை மற்றும் பிற கொள்கைகளுக்கு நீங்கள் ஒப்புக்கொள்கிறீர்கள்."
      },
      {
        id: 2,
        title: "2. தகுதி",
        list: ["பயனர்கள் 18 வயதுக்கு மேற்பட்டவர்களாக இருக்க வேண்டும்", "மைனர்கள் பாதுகாவலர் மேற்பார்வையில் பயன்படுத்த வேண்டும்"]
      },
      {
        id: 3,
        title: "3. தயாரிப்புகள்",
        intro: "நாங்கள் வழங்குபவை:",
        list: ["கொட்டைகள் & உலர்ந்த பழங்கள்", "சிறு தானியங்கள்", "மசாலா பொருட்கள்", "பூஜை பொருட்கள்", "பரிசு பெட்டிகள்"],
        footer: "அனைத்து தயாரிப்புகளும் கையிருப்பை பொறுத்தது."
      },
      {
        id: 4,
        title: "4. ஆர்டர்கள் & கட்டணங்கள்",
        list: [
          "வெற்றிகரமான கட்டணத்திற்குப் பிறகே ஆர்டர்கள் உறுதிப்படுத்தப்படும்",
          "COD (இருந்தால்) இருப்பு நிலையைப் பொறுத்தது",
          "முன் அறிவிப்பின்றி விலைகள் மாறலாம்",
          "சலுகைகளுக்கு தனித்தனி விதிமுறைகள் இருக்கலாம்"
        ]
      },
      {
        id: 5,
        title: "5. ஷிப்பிங் & டெலிவரி",
        list: [
          "டெலிவரி காலக்கெடு மதிப்பீடுகள் மட்டுமே மற்றும் மாறக்கூடும்",
          "கூரியர் அல்லது வெளிப்புற காரணிகளால் ஏற்படும் தாமதங்களுக்கு நாங்கள் பொறுப்பல்ல",
          "வாடிக்கையாளர் துல்லியமான முகவரி விவரங்களை வழங்க வேண்டும்"
        ]
      },
      {
        id: 6,
        title: "6. சந்தா சேவைகள்",
        list: [
          "ரத்து செய்யப்படாத வரை சந்தா திட்டங்கள் தானாகவே புதுப்பிக்கப்படும்",
          "அடுத்த சுழற்சிக்கு முன் வாடிக்கையாளர்கள் மாற்றலாம் அல்லது ரத்து செய்யலாம்",
          "ஆர்டர் செயலாக்கத்திற்குப் பிறகு ரத்து செய்ய முடியாது"
        ]
      },
      {
        id: 7,
        title: "7. மொத்த மற்றும் கார்ப்பரேட் ஆர்டர்கள்",
        list: [
          "மொத்த ஆர்டர்களுக்கு முன்கூட்டியே கட்டணம் தேவைப்படலாம்",
          "உறுதிப்படுத்தப்பட்ட பிறகு தனிப்பயனாக்கப்பட்ட ஆர்டர்களை ரத்து செய்ய முடியாது",
          "டெலிவரி காலக்கெடு சாதாரண ஆர்டர்களிலிருந்து வேறுபடலாம்"
        ]
      },
      {
        id: 8,
        title: "8. சுகாதார மறுப்பு",
        list: ["வாடிக்கையாளர்கள் ஒவ்வாமைக்கான பொருட்களை சரிபார்க்க வேண்டும்", "ஒவ்வாமை எதிர்விளைவுகளுக்கு நாங்கள் பொறுப்பல்ல"]
      },
      {
        id: 9,
        title: "9. பயனர் பொறுப்புகள்",
        list: ["தவறான பயன்பாடு அல்லது மோசடி கூடாது", "கணக்கு பாதுகாப்பை பராமரிக்கவும்"]
      },
      {
        id: 10,
        title: "10. பொறுப்பு வரம்பு",
        list: ["பொறுப்பு ஆர்டர் மதிப்புக்கு மட்டுமே உட்பட்டது", "மறைமுக சேதங்கள் ஈடுசெய்யப்படாது"]
      },
      {
        id: 11,
        title: "11. அறிவுசார் சொத்து",
        content: "அனைத்து வலைத்தள உள்ளடக்கமும் Tradizions-க்கு சொந்தமானது."
      },
      {
        id: 12,
        title: "12. மூன்றாம் தரப்பு சேவைகள்",
        content: "கட்டண நுழைவாயில்கள் அல்லது கூரியர் சேவைகளுக்கு நாங்கள் பொறுப்பல்ல."
      },
      {
        id: 13,
        title: "13. எதிர்பாராத நிகழ்வுகள்",
        content: "எதிர்பாராத நிகழ்வுகளால் ஏற்படும் தாமதங்களுக்கு நாங்கள் பொறுப்பல்ல."
      },
      {
        id: 14,
        title: "14. ஆளும் சட்டம்",
        content: "பொருந்தக்கூடிய சட்டங்கள்: இந்தியா / தமிழ்நாடு",
        footer: "அதிகார வரம்பு: சென்னை"
      },
      {
        id: 15,
        title: "15. தொடர்பு",
        content: "உங்களுக்கு ஏதேனும் கேள்விகள் இருந்தால், எங்களைத் தொடர்பு கொள்ளவும்:",
        email: "qpay@tradizions.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  HI: {
    title: "नियम और शर्तें",
    lastUpdated: "अंतिम अपडेट: 02 मई, 2026",
    intro: "Tradizions में आपका स्वागत है। हमारी वेबसाइट का उपयोग करके और हमारे उत्पादों को खरीदकर, आप निम्नलिखित नियमों और शर्तों का पालन करने के लिए सहमत होते हैं। कृपया उन्हें ध्यान से पढ़ें।",
    sections: [
      {
        id: 1,
        title: "1. सामान्य",
        content: "यह वेबसाइट Tradizions द्वारा संचालित है। हमारी वेबसाइट का उपयोग करके, आप इन शर्तों, गोपनीयता नीति और अन्य नीतियों से सहमत होते हैं।"
      },
      {
        id: 2,
        title: "2. पात्रता",
        list: ["उपयोगकर्ताओं की आयु 18+ होनी चाहिए", "नाबालिगों को अभिभावक की देखरेख में उपयोग करना चाहिए"]
      },
      {
        id: 3,
        title: "3. उत्पाद",
        intro: "हम प्रदान करते हैं:",
        list: ["नट्स और सूखे मेवे", "बाजरा", "मसाले", "पूजा का सामान", "गिफ्ट बॉक्स और हैंपर्स"],
        footer: "सभी उत्पाद उपलब्धता के अधीन हैं।"
      },
      {
        id: 4,
        title: "4. आदेश और भुगतान",
        list: [
          "सफल भुगतान के बाद ही आदेश की पुष्टि की जाती है",
          "सीओडी (यदि लागू हो) उपलब्धता के अधीन है",
          "कीमतें बिना किसी सूचना के बदल सकती हैं",
          "ऑफर की अलग-अलग शर्तें हो सकती हैं"
        ]
      },
      {
        id: 5,
        title: "5. शिपिंग और डिलीवरी",
        list: [
          "डिलीवरी की समय सीमा केवल अनुमान है और भिन्न हो सकती है",
          "कूरियर या बाहरी कारकों के कारण होने वाली देरी के लिए हम जिम्मेदार नहीं हैं",
          "ग्राहक को सटीक पते का विवरण देना होगा"
        ]
      },
      {
        id: 6,
        title: "6. सदस्यता सेवाएँ",
        list: [
          "सदस्यता योजनाएं तब तक स्वतः नवीनीकृत होती हैं जब तक रद्द न की जाएं",
          "ग्राहक अगले चक्र से पहले संशोधन या रद्द कर सकते हैं",
          "ऑर्डर प्रोसेसिंग के बाद कोई रद्दीकरण नहीं"
        ]
      },
      {
        id: 7,
        title: "7. थोक और कॉर्पोरेट आदेश",
        list: [
          "थोक आदेशों के लिए अग्रिम भुगतान की आवश्यकता हो सकती है",
          "पुष्टि होने के बाद कस्टमाइज्ड ऑर्डर रद्द नहीं किए जा सकते",
          "डिलीवरी की समय सीमा नियमित ऑर्डर से भिन्न हो सकती है"
        ]
      },
      {
        id: 8,
        title: "8. स्वास्थ्य अस्वीकरण",
        list: ["ग्राहकों को एलर्जी के लिए सामग्री की जांच करनी चाहिए", "हम एलर्जी प्रतिक्रियाओं के लिए उत्तरदायी नहीं हैं"]
      },
      {
        id: 9,
        title: "9. उपयोगकर्ता की जिम्मेदारियाँ",
        list: ["कोई दुरुपयोग या धोखाधड़ी नहीं", "अकाउंट की सुरक्षा बनाए रखें"]
      },
      {
        id: 10,
        title: "10. दायित्व की सीमा",
        list: ["दायित्व केवल ऑर्डर मूल्य तक सीमित है", "कोई अप्रत्यक्ष क्षति कवर नहीं की जाएगी"]
      },
      {
        id: 11,
        title: "11. बौद्धिक संपदा",
        content: "वेबसाइट की सभी सामग्री Tradizions की है।"
      },
      {
        id: 12,
        title: "12. तृतीय-पक्ष सेवाएँ",
        content: "हम भुगतान गेटवे या कूरियर सेवाओं के लिए जिम्मेदार नहीं हैं।"
      },
      {
        id: 13,
        title: "13. अपरिहार्य परिस्थितियां",
        content: "हम अप्रत्याशित घटनाओं के कारण होने वाली देरी के लिए उत्तरदायी नहीं हैं।"
      },
      {
        id: 14,
        title: "14. शासी कानून",
        content: "लागू कानून: भारत / तमिलनाडु",
        footer: "क्षेत्राधिकार: चेन्नई"
      },
      {
        id: 15,
        title: "15. संपर्क",
        content: "यदि आपके कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:",
        email: "qpay@tradizions.com",
        phone: "+91 99406 20019"
      }
    ]
  }
};

export default function TermsPolicyPage() {
  const [selectedLang, setSelectedLang] = useState("EN");
  const t = content[selectedLang] || content["EN"];

  useEffect(() => {
    const updateLang = () => {
      const savedLang = localStorage.getItem("selectedLang");
      if (savedLang && content[savedLang]) {
        setSelectedLang(savedLang);
      }
    };

    updateLang();
    window.addEventListener("languageChange", updateLang);
    return () => window.removeEventListener("languageChange", updateLang);
  }, []);

  return (
    <main className="min-h-screen bg-white pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6 text-gray-800">
        {/* Professional Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
          {t.title}
        </h1>
        <p className="text-sm text-gray-500 mb-8 font-light">
          {t.lastUpdated}
        </p>

        {/* Terms Content - Professional Text Style */}
        <div className="space-y-10 text-[15px] leading-relaxed ">
          <p>{t.intro}</p>

          {t.sections.map((section: any) => (
            <section key={section.id}>
              <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-900">
                {section.title}
              </h2>
              
              {section.content && <p className={section.id === 15 ? "mb-3" : ""}>{section.content}</p>}
              
              {section.intro && <p className="mb-4">{section.intro}</p>}
              
              {section.list && (
                <ul className="list-disc pl-6 space-y-3">
                  {section.list.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
              
              {section.footer && (
                <p className={`mt-4 ${section.id === 3 ? "italic text-gray-500" : ""}`}>
                  {section.footer}
                </p>
              )}

              {section.id === 15 && (
                <div className="space-y-3">
                  <p>
                    <span className="font-bold">Email:</span>{" "}
                    <a
                      href={`mailto:${section.email}`}
                      className="font-normal text-[var(--sky-blue)]"
                    >
                      {section.email}
                    </a>
                  </p>
                  <p>
                    <span className="font-bold">Phone:</span>{" "}
                    <a
                      href={`tel:${section.phone.replace(/\s/g, '')}`}
                      className="font-normal text-[var(--orange)]"
                    >
                      {section.phone}
                    </a>
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
