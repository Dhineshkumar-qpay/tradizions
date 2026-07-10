"use client";

import React, { useEffect, useState } from "react";

const content: Record<string, any> = {
  EN: {
    title: "Shipping and Delivery Policy",
    lastUpdated: "Last Updated: May 02, 2026",
    intro: "At Tradizions, we ensure safe and timely delivery of your orders including food items, pooja essentials, and gift packs.",
    sections: [
      {
        id: 1,
        title: "1. Order Processing",
        list: [
          "Orders are processed within 1–2 business days",
          "Weekend/holiday orders processed next working day",
          "Confirmation sent via SMS/Email"
        ]
      },
      {
        id: 2,
        title: "2. Shipping Coverage",
        list: ["We deliver across India", "International shipping may be available on request"]
      },
      {
        id: 3,
        title: "3. Delivery Timeline",
        list: [
          "Standard delivery: 3–7 business days",
          "Metro cities: Faster delivery possible",
          "Remote areas may take longer"
        ],
        delayTitle: "Delays may occur due to:",
        delayList: ["Weather", "Courier issues", "Government restrictions"]
      },
      {
        id: 4,
        title: "4. Shipping Charges",
        list: ["Calculated at checkout", "Free shipping above ₹999 (if applicable)"]
      },
      {
        id: 5,
        title: "5. Order Tracking",
        content: "Tracking link shared via SMS/Email."
      },
      {
        id: 6,
        title: "6. Delivery Attempts",
        list: [
          "Courier will attempt delivery 2–3 times",
          "If unavailable, rescheduling may be required",
          "Failed deliveries may incur re-shipping charges"
        ]
      },
      {
        id: 7,
        title: "7. Incorrect Address",
        list: [
          "Customer is responsible for correct details",
          "We are not liable for delivery failures due to incorrect address"
        ]
      },
      {
        id: 8,
        title: "8. Perishable & Sensitive Products",
        intro: "Since we deal in:",
        list: ["Food items (nuts, millets, spices)", "Pooja items", "Gift packs"],
        footerTitle: "Please ensure:",
        footerList: ["Someone is available to receive the order", "Products are checked immediately upon delivery"]
      },
      {
        id: 9,
        title: "9. Damaged / Tampered Packages",
        list: ["Do not accept visibly damaged packages", "If accepted, report within 48 hours with proof"]
      },
      {
        id: 10,
        title: "10. Bulk & Gifting Orders",
        list: ["Delivery timelines may vary", "Customised orders may require additional time"]
      },
      {
        id: 11,
        title: "11. Force Majeure",
        intro: "We are not responsible for delays due to:",
        list: ["Natural disasters", "Strikes", "Lockdowns"]
      },
      {
        id: 12,
        title: "12. Contact Us",
        content: "If you have any questions, please contact us:",
        email: "tradizions@gmail.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  TA: {
    title: "ஷிப்பிங் மற்றும் டெலிவரி கொள்கை",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது: மே 02, 2026",
    intro: "Tradizions-இல், உணவுப் பொருட்கள், பூஜை அத்தியாவசியப் பொருட்கள் மற்றும் பரிசுப் பொதிகள் உள்ளிட்ட உங்கள் ஆர்டர்களின் பாதுகாப்பான மற்றும் சரியான நேரத்தில் டெலிவரி செய்யப்படுவதை நாங்கள் உறுதி செய்கிறோம்.",
    sections: [
      {
        id: 1,
        title: "1. ஆர்டர் செயலாக்கம்",
        list: [
          "ஆர்டர்கள் 1-2 வணிக நாட்களுக்குள் செயல்படுத்தப்படும்",
          "வார இறுதி/விடுமுறை நாட்களில் வரும் ஆர்டர்கள் அடுத்த வேலை நாளில் செயல்படுத்தப்படும்",
          "SMS/மின்னஞ்சல் மூலம் உறுதிப்படுத்தல் அனுப்பப்படும்"
        ]
      },
      {
        id: 2,
        title: "2. டெலிவரி வரம்பு",
        list: ["நாங்கள் இந்தியா முழுவதும் வழங்குகிறோம்", "கோரிக்கையின் பேரில் சர்வதேச ஷிப்பிங் கிடைக்கக்கூடும்"]
      },
      {
        id: 3,
        title: "3. டெலிவரி காலக்கெடு",
        list: [
          "சாதாரண டெலிவரி: 3-7 வணிக நாட்கள்",
          "மெட்ரோ நகரங்கள்: வேகமான டெலிவரி சாத்தியம்",
          "தொலைதூரப் பகுதிகளுக்கு அதிக நேரம் ஆகலாம்"
        ],
        delayTitle: "இதன் காரணமாக தாமதங்கள் ஏற்படலாம்:",
        delayList: ["வானிலை", "கூரியர் சிக்கல்கள்", "அரசு கட்டுப்பாடுகள்"]
      },
      {
        id: 4,
        title: "4. ஷிப்பிங் கட்டணங்கள்",
        list: ["செக்-அவுட் செய்யும் போது கணக்கிடப்படும்", "₹999-க்கு மேல் இலவச ஷிப்பிங் (பொருந்தினால்)"]
      },
      {
        id: 5,
        title: "5. ஆர்டர் கண்காணிப்பு",
        content: "SMS/மின்னஞ்சல் மூலம் கண்காணிப்பு இணைப்பு பகிரப்படும்."
      },
      {
        id: 6,
        title: "6. டெலிவரி முயற்சிகள்",
        list: [
          "கூரியர் 2-3 முறை டெலிவரி செய்ய முயற்சிக்கும்",
          "கிடைக்கவில்லை என்றால், மறுதிட்டமிடல் தேவைப்படலாம்",
          "தோல்வியுற்ற டெலிவரிகளுக்கு மீண்டும் ஷிப்பிங் கட்டணங்கள் விதிக்கப்படலாம்"
        ]
      },
      {
        id: 7,
        title: "7. தவறான முகவரி",
        list: [
          "சரியான விவரங்களை வழங்குவது வாடிக்கையாளரின் பொறுப்பு",
          "தவறான முகவரியால் ஏற்படும் டெலிவரி தோல்விகளுக்கு நாங்கள் பொறுப்பல்ல"
        ]
      },
      {
        id: 8,
        title: "8. அழியக்கூடிய & உணர்திறன் கொண்ட தயாரிப்புகள்",
        intro: "நாங்கள் கையாளும் தயாரிப்புகள்:",
        list: ["உணவுப் பொருட்கள் (கொட்டைகள், சிறுதானியங்கள், மசாலாப் பொருட்கள்)", "பூஜை பொருட்கள்", "பரிசுப் பொதிகள்"],
        footerTitle: "தயவுசெய்து உறுதிப்படுத்தவும்:",
        footerList: ["ஆர்டரைப் பெற யாராவது இருக்கிறார்கள்", "டெலிவரி செய்யப்பட்டவுடன் தயாரிப்புகள் உடனடியாக சரிபார்க்கப்படுகின்றன"]
      },
      {
        id: 9,
        title: "9. சேதமடைந்த / சிதைந்த தொகுப்புகள்",
        list: ["வெளிப்படையாக சேதமடைந்த தொகுப்புகளை ஏற்க வேண்டாம்", "ஏற்றுக்கொண்டால், 48 மணி நேரத்திற்குள் ஆதாரத்துடன் தெரிவிக்கவும்"]
      },
      {
        id: 10,
        title: "10. மொத்த மற்றும் பரிசு ஆர்டர்கள்",
        list: ["டெலிவரி காலக்கெடு மாறக்கூடும்", "தனிப்பயனாக்கப்பட்ட ஆர்டர்களுக்கு கூடுதல் நேரம் தேவைப்படலாம்"]
      },
      {
        id: 11,
        title: "11. எதிர்பாராத நிகழ்வுகள்",
        intro: "இதன் காரணமாக ஏற்படும் தாமதங்களுக்கு நாங்கள் பொறுப்பல்ல:",
        list: ["இயற்கை பேரழிவுகள்", "வேலைநிறுத்தங்கள்", "லாக்டவுன்கள்"]
      },
      {
        id: 12,
        title: "12. எங்களைத் தொடர்பு கொள்ள",
        content: "உங்களுக்கு ஏதேனும் கேள்விகள் இருந்தால், எங்களைத் தொடர்பு கொள்ளவும்:",
        email: "tradizions@gmail.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  HI: {
    title: "शिपिंग और डिलीवरी नीति",
    lastUpdated: "अंतिम अपडेट: 02 मई, 2026",
    intro: "Tradizions में, हम खाद्य पदार्थ, पूजा की आवश्यक वस्तुएं और गिफ्ट पैक सहित आपके आदेशों की सुरक्षित और समय पर डिलीवरी सुनिश्चित करते हैं।",
    sections: [
      {
        id: 1,
        title: "1. ऑर्डर प्रोसेसिंग",
        list: [
          "आदेश 1-2 कार्य दिवसों के भीतर संसाधित किए जाते हैं",
          "सप्ताहांत/छुट्टी के आदेश अगले कार्य दिवस पर संसाधित किए जाते हैं",
          "पुष्टि एसएमएस/ईमेल के माध्यम से भेजी जाती है"
        ]
      },
      {
        id: 2,
        title: "2. शिपिंग कवरेज",
        list: ["हम पूरे भारत में डिलीवरी करते हैं", "अनुरोध पर अंतरराष्ट्रीय शिपिंग उपलब्ध हो सकती है"]
      },
      {
        id: 3,
        title: "3. डिलीवरी समयसीमा",
        list: [
          "मानक डिलीवरी: 3-7 कार्य दिवस",
          "मेट्रो शहर: तेज डिलीवरी संभव",
          "दूरदराज के क्षेत्रों में अधिक समय लग सकता् है"
        ],
        delayTitle: "देरी इनके कारण हो सकती है:",
        delayList: ["मौसम", "कूरियर के मुद्दे", "सरकारी प्रतिबंध"]
      },
      {
        id: 4,
        title: "4. शिपिंग शुल्क",
        list: ["चेकआउट पर गणना की जाती है", "₹999 से ऊपर मुफ्त शिपिंग (यदि लागू हो)"]
      },
      {
        id: 5,
        title: "5. ऑर्डर ट्रैकिंग",
        content: "ट्रैकिंग लिंक एसएमएस/ईमेल के माध्यम से साझा किया जाता है।"
      },
      {
        id: 6,
        title: "6. डिलीवरी के प्रयास",
        list: [
          "कूरियर 2-3 बार डिलीवरी का प्रयास करेगा",
          "यदि उपलब्ध नहीं है, तो रीशेड्यूलिंग की आवश्यकता हो सकती है",
          "विफल डिलीवरी पर पुनः शिपिंग शुल्क लग सकता है"
        ]
      },
      {
        id: 7,
        title: "7. गलत पता",
        list: [
          "सही विवरण के लिए ग्राहक जिम्मेदार है",
          "गलत पते के कारण डिलीवरी विफलताओं के लिए हम उत्तरदायी नहीं हैं"
        ]
      },
      {
        id: 8,
        title: "8. खराब होने वाले और संवेदनशील उत्पाद",
        intro: "चूंकि हम इनमें व्यवहार करते हैं:",
        list: ["खाद्य पदार्थ (नट्स, बाजरा, मसाले)", "पूजा का सामान", "गिफ्ट पैक"],
        footerTitle: "कृपया सुनिश्चित करें:",
        footerList: ["आर्डर प्राप्त करने के लिए कोई उपलब्ध है", "डिलीवरी के तुरंत बाद उत्पादों की जाँच की जाती है"]
      },
      {
        id: 9,
        title: "9. क्षतिग्रस्त / छेड़छाड़ किए गए पैकेज",
        list: ["स्पष्ट रूप से क्षतिग्रस्त पैकेज स्वीकार न करें", "यदि स्वीकार किया जाता है, तो 48 घंटों के भीतर प्रमाण के साथ सूचित करें"]
      },
      {
        id: 10,
        title: "10. थोक और उपहार आदेश",
        list: ["डिलीवरी समयसीमा भिन्न हो सकती है", "कस्टमाइज्ड ऑर्डर के लिए अतिरिक्त समय की आवश्यकता हो सकती है"]
      },
      {
        id: 11,
        title: "11. अपरिहार्य परिस्थितियां",
        intro: "हम इनके कारण होने वाली देरी के लिए जिम्मेदार नहीं हैं:",
        list: ["प्राकृतिक आपदाएं", "हड़ताल", "लॉकडाउन"]
      },
      {
        id: 12,
        title: "12. हमसे संपर्क करें",
        content: "यदि आपके कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:",
        email: "tradizions@gmail.com",
        phone: "+91 99406 20019"
      }
    ]
  }
};

export default function ShippingPolicyPage() {
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
    <main className="min-h-screen bg-white py-10 text-gray-800">
      <div className="max-w-4xl mx-auto px-6">
        {/* Professional Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
          {t.title}
        </h1>
        <p className="text-sm text-gray-500 mb-8 font-light">
          {t.lastUpdated}
        </p>

        {/* Policy Content - Clean Text Style */}
        <div className="space-y-10 text-[15px] leading-relaxed ">
          <p>{t.intro}</p>

          {t.sections.map((section: any) => (
            <section key={section.id}>
              <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-900">
                {section.title}
              </h2>
              
              {section.intro && <p className="mb-4">{section.intro}</p>}

              {section.list && (
                <ul className="list-disc pl-6 space-y-3">
                  {section.list.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}

              {section.content && <p>{section.content}</p>}

              {section.delayTitle && (
                <>
                  <p className="mt-4 font-bold text-gray-700">{section.delayTitle}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    {section.delayList.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {section.footerTitle && (
                <>
                  <p className="font-bold text-gray-700 mt-4">{section.footerTitle}</p>
                  <ul className="list-disc pl-6 mt-2 space-y-2">
                    {section.footerList.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}

              {section.id === 12 && (
                <div className="space-y-3 mt-3">
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
                    <span className="font-bold">Phone/WhatsApp:</span>{" "}
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
