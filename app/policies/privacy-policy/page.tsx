"use client";

import React, { useEffect, useState } from "react";

const content: Record<string, any> = {
  EN: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: May 02, 2026",
    intro: "At Tradizions, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website.",
    sections: [
      {
        id: 1,
        title: "1. Information We Collect",
        subsections: [
          {
            title: "Personal Information:",
            list: ["Name, phone number, email address", "Billing & shipping address", "Payment details (processed securely via payment gateways)"]
          },
          {
            title: "Non-Personal Information:",
            list: ["Device type, browser, IP address", "Website usage and browsing behaviour"]
          },
          {
            title: "Cookies & Tracking:",
            list: ["Used to improve experience, remember preferences, and personalize content"]
          }
        ]
      },
      {
        id: 2,
        title: "2. How We Use Your Information",
        intro: "We use your data to:",
        list: [
          "Process and deliver orders (including subscription orders)",
          "Communicate order updates, offers, and support",
          "Improve our products and website experience",
          "Send festival reminders, promotional messages (if opted in)",
          "Comply with legal obligations"
        ]
      },
      {
        id: 3,
        title: "3. Sharing of Information",
        highlight: "We do NOT sell your data.",
        intro: "We may share with:",
        list: ["Payment gateways (for secure transactions)", "Delivery/courier partners", "WhatsApp/SMS/email service providers", "Legal authorities if required"]
      },
      {
        id: 4,
        title: "4. Data Security",
        content: "We take reasonable measures to protect your data. However, no online system is 100% secure."
      },
      {
        id: 5,
        title: "5. Your Rights",
        intro: "You can:",
        list: ["Access or update your data", "Opt out of marketing messages", "Request deletion of your data"],
        footer: "Contact: tradizions@gmail.com"
      },
      {
        id: 6,
        title: "6. Cookies Policy",
        intro: "Cookies help:",
        list: ["Faster browsing", "Personalized experience"],
        footer: "You can disable cookies, but some features may not work."
      },
      {
        id: 7,
        title: "7. Third-Party Links",
        intro: "We are not responsible for:",
        list: ["Payment gateways", "Courier tracking sites"]
      },
      {
        id: 8,
        title: "8. Children’s Privacy",
        content: "Not intended for users under 18."
      },
      {
        id: 9,
        title: "9. Policy Updates",
        content: "We may update this policy. Changes will be posted here."
      },
      {
        id: 10,
        title: "10. Contact Us",
        content: "If you have any questions, please contact us:",
        email: "tradizions@gmail.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  TA: {
    title: "தனியுரிமைக் கொள்கை",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது: மே 02, 2026",
    intro: "Tradizions-இல், நாங்கள் உங்கள் நம்பிக்கையை மதிக்கிறோம் மற்றும் உங்கள் தனிப்பட்ட தகவல்களைப் பாதுகாக்க கடமைப்பட்டுள்ளோம். இந்தத் தனியுரிமைக் கொள்கையானது, எங்கள் வலைத்தளத்தைப் பயன்படுத்தும் போது உங்கள் தரவை நாங்கள் எவ்வாறு சேகரிக்கிறோம், பயன்படுத்துகிறோம் மற்றும் பாதுகாக்கிறோம் என்பதை விளக்குகிறது.",
    sections: [
      {
        id: 1,
        title: "1. நாங்கள் சேகரிக்கும் தகவல்கள்",
        subsections: [
          {
            title: "தனிப்பட்ட தகவல்கள்:",
            list: ["பெயர், தொலைபேசி எண், மின்னஞ்சல் முகவரி", "பில்லிங் & ஷிப்பிங் முகவரி", "கட்டண விவரங்கள் (பாதுகாப்பான கட்டண நுழைவாயில்கள் மூலம் செயல்படுத்தப்படுகின்றன)"]
          },
          {
            title: "தனிப்பட்டதல்லாத தகவல்கள்:",
            list: ["சாதன வகை, உலாவி, IP முகவரி", "வலைத்தள பயன்பாடு மற்றும் உலாவுதல் நடத்தை"]
          },
          {
            title: "குக்கீகள் & டிராக்கிங்:",
            list: ["அனுபவத்தை மேம்படுத்தவும், விருப்பங்களை நினைவில் கொள்ளவும் மற்றும் உள்ளடக்கத்தைத் தனிப்பயனாக்கவும் பயன்படுத்தப்படுகிறது"]
          }
        ]
      },
      {
        id: 2,
        title: "2. உங்கள் தகவலை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்",
        intro: "உங்கள் தரவை நாங்கள் இதற்குப் பயன்படுத்துகிறோம்:",
        list: [
          "ஆர்டர்களைச் செயலாக்க மற்றும் வழங்க (சந்தா ஆர்டர்கள் உட்பட)",
          "ஆர்டர் புதுப்பிப்புகள், சலுகைகள் மற்றும் ஆதரவைத் தெரிவிக்க",
          "எங்கள் தயாரிப்புகள் மற்றும் வலைத்தள அனுபவத்தை மேம்படுத்த",
          "திருவிழா நினைவூட்டல்கள், விளம்பரச் செய்திகளை அனுப்ப (நீங்கள் அனுமதித்தால்)",
          "சட்டபூர்வமான கடமைகளுக்கு இணங்க"
        ]
      },
      {
        id: 3,
        title: "3. தகவல்களைப் பகிர்தல்",
        highlight: "உங்கள் தரவை நாங்கள் விற்க மாட்டோம்.",
        intro: "நாங்கள் இவர்களுடன் பகிரலாம்:",
        list: ["கட்டண நுழைவாயில்கள் (பாதுகாப்பான பரிவர்த்தனைகளுக்கு)", "டெலிவரி/கூரியர் கூட்டாளர்கள்", "வாட்ஸ்அப்/SMS/மின்னஞ்சல் சேவை வழங்குநர்கள்", "தேவைப்பட்டால் சட்ட அதிகாரிகள்"]
      },
      {
        id: 4,
        title: "4. தரவு பாதுகாப்பு",
        content: "உங்கள் தரவைப் பாதுகாக்க நாங்கள் தகுந்த நடவடிக்கைகளை எடுக்கிறோம். இருப்பினும், எந்த ஆன்லைன் அமைப்பும் 100% பாதுகாப்பானது அல்ல."
      },
      {
        id: 5,
        title: "5. உங்கள் உரிமைகள்",
        intro: "நீங்கள் செய்யக்கூடியவை:",
        list: ["உங்கள் தரவை அணுகலாம் அல்லது புதுப்பிக்கலாம்", "விளம்பரச் செய்திகளிலிருந்து விலகலாம்", "உங்கள் தரவை நீக்கக் கோரலாம்"],
        footer: "தொடர்புக்கு: tradizions@gmail.com"
      },
      {
        id: 6,
        title: "6. குக்கீகள் கொள்கை",
        intro: "குக்கீகள் இதற்கு உதவுகின்றன:",
        list: ["வேகமான உலாவுதல்", "தனிப்பயனாக்கப்பட்ட அனுபவம்"],
        footer: "நீங்கள் குக்கீகளை முடக்கலாம், ஆனால் சில அம்சங்கள் செயல்படாமல் போகலாம்."
      },
      {
        id: 7,
        title: "7. மூன்றாம் தரப்பு இணைப்புகள்",
        intro: "நாங்கள் இதற்குப் பொறுப்பல்ல:",
        list: ["கட்டண நுழைவாயில்கள்", "கூரியர் கண்காணிப்பு தளங்கள்"]
      },
      {
        id: 8,
        title: "8. குழந்தைகளின் தனியுரிமை",
        content: "18 வயதிற்குட்பட்ட பயனர்களுக்காக இது உருவாக்கப்படவில்லை."
      },
      {
        id: 9,
        title: "9. கொள்கை புதுப்பிப்புகள்",
        content: "இந்தக் கொள்கையை நாங்கள் புதுப்பிக்கலாம். மாற்றங்கள் இங்கே பதிவிடப்படும்."
      },
      {
        id: 10,
        title: "10. எங்களைத் தொடர்பு கொள்ள",
        content: "உங்களுக்கு ஏதேனும் கேள்விகள் இருந்தால், எங்களைத் தொடர்பு கொள்ளவும்:",
        email: "tradizions@gmail.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  HI: {
    title: "गोपनीयता नीति",
    lastUpdated: "अंतिम अपडेट: 02 मई, 2026",
    intro: "Tradizions में, हम आपके भरोसे को महत्व देते हैं और आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए प्रतिबद्ध हैं। यह गोपनीयता नीति बताती है कि जब आप हमारी वेबसाइट का उपयोग करते हैं तो हम आपका डेटा कैसे एकत्र करते हैं, उपयोग करते हैं और सुरक्षित रखते हैं।",
    sections: [
      {
        id: 1,
        title: "1. जानकारी जो हम एकत्र करते हैं",
        subsections: [
          {
            title: "व्यक्तिगत जानकारी:",
            list: ["नाम, फोन नंबर, ईमेल पता", "बिलिंग और शिपिंग पता", "भुगतान विवरण (भुगतान गेटवे के माध्यम से सुरक्षित रूप से संसाधित)"]
          },
          {
            title: "गैर-व्यक्तिगत जानकारी:",
            list: ["डिवाइस प्रकार, ब्राउज़र, आईपी पता", "वेबसाइट उपयोग और ब्राउज़िंग व्यवहार"]
          },
          {
            title: "कुकीज़ और ट्रैकिंग:",
            list: ["अनुभव को बेहतर बनाने, प्राथमिकताओं को याद रखने और सामग्री को वैयक्तिकृत करने के लिए उपयोग किया जाता है"]
          }
        ]
      },
      {
        id: 2,
        title: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
        intro: "हम आपके डेटा का उपयोग इसके लिए करते हैं:",
        list: [
          "आदेशों को संसाधित करने और वितरित करने के लिए (सदस्यता आदेशों सहित)",
          "ऑर्डर अपडेट, ऑफ़र और सहायता के बारे में सूचित करने के लिए",
          "हमारे उत्पादों और वेबसाइट अनुभव को बेहतर बनाने के लिए",
          "त्योहारों की याद दिलाने, प्रचार संदेश भेजने के लिए (यदि चुना गया है)",
          "कानूनी दायित्वों का पालन करने के लिए"
        ]
      },
      {
        id: 3,
        title: "3. जानकारी साझा करना",
        highlight: "हम आपका डेटा बेचते नहीं हैं।",
        intro: "हम इनके साथ साझा कर सकते हैं:",
        list: ["भुगतान गेटवे (सुरक्षित लेनदेन के लिए)", "डिलीवरी/कूरियर भागीदार", "व्हाट्सएप/एसएमएस/ईमेल सेवा प्रदाता", "यदि आवश्यक हो तो कानूनी अधिकारी"]
      },
      {
        id: 4,
        title: "4. डेटा सुरक्षा",
        content: "हम आपके डेटा की सुरक्षा के लिए उचित उपाय करते हैं। हालांकि, कोई भी ऑनलाइन सिस्टम 100% सुरक्षित नहीं है।"
      },
      {
        id: 5,
        title: "5. आपके अधिकार",
        intro: "आप कर सकते हैं:",
        list: ["अपना डेटा एक्सेस या अपडेट करें", "प्रचार संदेशों से बाहर निकलें", "अपना डेटा हटाने का अनुरोध करें"],
        footer: "संपर्क: tradizions@gmail.com"
      },
      {
        id: 6,
        title: "6. कुकीज़ नीति",
        intro: "कुकीज़ मदद करती हैं:",
        list: ["तेजी से ब्राउज़िंग", "वैयक्तिकृत अनुभव"],
        footer: "आप कुकीज़ को अक्षम कर सकते हैं, लेकिन कुछ सुविधाएँ काम नहीं कर सकती हैं।"
      },
      {
        id: 7,
        title: "7. तृतीय-पक्ष लिंक",
        intro: "हम इनके लिए जिम्मेदार नहीं हैं:",
        list: ["भुगतान गेटवे", "कूरियर ट्रैकिंग साइटें"]
      },
      {
        id: 8,
        title: "8. बच्चों की गोपनीयता",
        content: "18 वर्ष से कम उम्र के उपयोगकर्ताओं के लिए अभिप्रेत नहीं है।"
      },
      {
        id: 9,
        title: "9. नीति अपडेट",
        content: "हम इस नीति को अपडेट कर सकते हैं। परिवर्तन यहां पोस्ट किए जाएंगे।"
      },
      {
        id: 10,
        title: "10. हमसे संपर्क करें",
        content: "यदि आपके कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:",
        email: "tradizions@gmail.com",
        phone: "+91 99406 20019"
      }
    ]
  }
};

export default function PrivacyPolicyPage() {
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
    <main className="min-h-screen bg-white pt-40 lg:pt-48 pb-32 text-gray-800">
      <div className="max-w-4xl mx-auto px-6">
        {/* Simple Professional Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
          {t.title}
        </h1>
        <p className="text-sm text-gray-500 mb-8 font-light">
          {t.lastUpdated}
        </p>

        {/* Policy Content - Clean Text Style */}
        <div className="space-y-10 text-[15px] leading-relaxed">
          <p>{t.intro}</p>

          {t.sections.map((section: any) => (
            <section key={section.id}>
              <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-900">
                {section.title}
              </h2>

              {section.highlight && (
                <p className="mb-4 text-gray-600 font-bold italic">{section.highlight}</p>
              )}

              {section.intro && <p className="mb-4">{section.intro}</p>}

              {section.subsections && (
                <div className="space-y-6">
                  {section.subsections.map((sub: any, idx: number) => (
                    <div key={idx}>
                      <p className="font-bold mb-2 text-gray-900">{sub.title}</p>
                      <ul className="list-disc pl-6 space-y-2">
                        {sub.list.map((item: string, i: number) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {section.list && (
                <ul className="list-disc pl-6 space-y-3">
                  {section.list.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}

              {section.content && <p>{section.content}</p>}

              {section.footer && (
                <p className="mt-4 text-gray-600">
                  {section.footer}
                </p>
              )}

              {section.id === 10 && (
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
