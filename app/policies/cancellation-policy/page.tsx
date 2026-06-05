"use client";

import { useEffect, useState } from "react";

const content: Record<string, any> = {
  EN: {
    title: "Cancellation and Refund Policy",
    lastUpdated: "Last Updated: May 02, 2026",
    intro: "At Tradizions, we strive to provide high-quality products including nuts, millets, spices, pooja essentials, and gift items. Due to the nature of our products, the following policy applies:",
    sections: [
      {
        id: 1,
        title: "1. Order Cancellation",
        list: [
          "Orders can be cancelled before dispatch only.",
          "Once the order is shipped, cancellation is not allowed.",
          "For cancellation requests, contact us via Email/WhatsApp with your order details.",
          "Eligible refunds will be processed within 5–7 working days."
        ]
      },
      {
        id: 2,
        title: "2. Refunds & Replacements",
        highlight: "We do not accept returns due to the perishable nature of food products.",
        intro: "Refunds/replacements are allowed only if:",
        list: ["Wrong product delivered", "Damaged product", "Expired product"],
        footer: "You must notify within 48 hours of delivery with photo/video proof."
      },
      {
        id: 3,
        title: "3. Non-Refundable Cases",
        intro: "Refunds will NOT be provided for:",
        list: [
          "Opened or used products",
          "Taste preference issues",
          "Incorrect address provided",
          "Failed delivery due to customer unavailability",
          "Delay caused by courier partners"
        ]
      },
      {
        id: 4,
        title: "4. Subscription Orders",
        list: [
          "Subscription orders can be paused or cancelled before the next billing cycle",
          "Once processed, the order cannot be cancelled"
        ]
      },
      {
        id: 5,
        title: "5. Bulk / Gifting Orders",
        list: [
          "Bulk and customized gift orders are non-cancellable and non-refundable once confirmed",
          "Any damage claims must be reported within 48 hours"
        ]
      },
      {
        id: 6,
        title: "6. Refund Processing",
        list: ["Refunds will be issued to the original payment method", "Processing time: 5–7 business days"]
      },
      {
        id: 7,
        title: "7. Contact Us",
        content: "If you have any questions, please contact us:",
        email: "qpay@tradizions.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  TA: {
    title: "ரத்து மற்றும் ரீஃபண்ட் கொள்கை",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது: மே 02, 2026",
    intro: "Tradizions-இல், கொட்டைகள், சிறுதானியங்கள், மசாலாப் பொருட்கள், பூஜை அத்தியாவசியப் பொருட்கள் மற்றும் பரிசுப் பொருட்கள் உள்ளிட்ட உயர்தர தயாரிப்புகளை வழங்க நாங்கள் முயற்சி செய்கிறோம். எங்களது தயாரிப்புகளின் தன்மையைக் கருத்தில் கொண்டு, பின்வரும் கொள்கைகள் பொருந்தும்:",
    sections: [
      {
        id: 1,
        title: "1. ஆர்டர் ரத்து செய்தல்",
        list: [
          "அனுப்பப்படுவதற்கு (dispatch) முன்னதாக மட்டுமே ஆர்டர்களை ரத்து செய்ய முடியும்.",
          "ஆர்டர் ஷிப் செய்யப்பட்ட பிறகு, ரத்து செய்ய அனுமதி இல்லை.",
          "ரத்து கோரிக்கைகளுக்கு, உங்கள் ஆர்டர் விவரங்களுடன் மின்னஞ்சல்/வாட்ஸ்அப் மூலம் எங்களைத் தொடர்பு கொள்ளவும்.",
          "தகுதியுள்ள ரீஃபண்டுகள் 5-7 வேலை நாட்களுக்குள் செயல்படுத்தப்படும்."
        ]
      },
      {
        id: 2,
        title: "2. ரீஃபண்ட் & மாற்றீடு (Replacements)",
        highlight: "உணவுப் பொருட்களின் அழியக்கூடிய தன்மையால் நாங்கள் ரிட்டர்ன்களை ஏற்பதில்லை.",
        intro: "பின்வரும் சந்தர்ப்பங்களில் மட்டுமே ரீஃபண்ட்/மாற்றீடு அனுமதிக்கப்படும்:",
        list: ["தவறான தயாரிப்பு வழங்கப்பட்டால்", "சேதமடைந்த தயாரிப்பு", "காலாவதியான தயாரிப்பு"],
        footer: "டெலிவரி செய்யப்பட்ட 48 மணி நேரத்திற்குள் புகைப்படம்/வீடியோ ஆதாரத்துடன் தெரிவிக்க வேண்டும்."
      },
      {
        id: 3,
        title: "3. ரீஃபண்ட் வழங்கப்படாத சந்தர்ப்பங்கள்",
        intro: "பின்வருவனவற்றிற்கு ரீஃபண்ட் வழங்கப்படாது:",
        list: [
          "திறக்கப்பட்ட அல்லது பயன்படுத்தப்பட்ட தயாரிப்புகள்",
          "சுவை விருப்பம் தொடர்பான சிக்கல்கள்",
          "தவறான முகவரி வழங்கப்பட்டால்",
          "வாடிக்கையாளர் இல்லாததால் டெலிவரி தோல்வியுற்றால்",
          "கூரியர் கூட்டாளர்களால் ஏற்படும் தாமதம்"
        ]
      },
      {
        id: 4,
        title: "4. சந்தா ஆர்டர்கள் (Subscription Orders)",
        list: [
          "அடுத்த பில்லிங் சுழற்சிக்கு முன் சந்தா ஆர்டர்களை இடைநிறுத்தலாம் அல்லது ரத்து செய்யலாம்",
          "செயலாக்கப்பட்ட பிறகு, ஆர்டரை ரத்து செய்ய முடியாது"
        ]
      },
      {
        id: 5,
        title: "5. மொத்த மற்றும் பரிசு ஆர்டர்கள்",
        list: [
          "மொத்த மற்றும் தனிப்பயனாக்கப்பட்ட பரிசு ஆர்டர்கள் உறுதிப்படுத்தப்பட்ட பிறகு ரத்து செய்யவோ ரீஃபண்ட் பெறவோ முடியாது",
          "ஏதேனும் சேத உரிமைகோரல்கள் 48 மணி நேரத்திற்குள் தெரிவிக்கப்பட வேண்டும்"
        ]
      },
      {
        id: 6,
        title: "6. ரீஃபண்ட் செயலாக்கம்",
        list: ["அசல் கட்டண முறைக்கே ரீஃபண்ட் வழங்கப்படும்", "செயலாக்க நேரம்: 5-7 வணிக நாட்கள்"]
      },
      {
        id: 7,
        title: "7. எங்களைத் தொடர்பு கொள்ள",
        content: "உங்களுக்கு ஏதேனும் கேள்விகள் இருந்தால், எங்களைத் தொடர்பு கொள்ளவும்:",
        email: "qpay@tradizions.com",
        phone: "+91 99406 20019"
      }
    ]
  },
  HI: {
    title: "रद्दीकरण और धनवापसी नीति",
    lastUpdated: "अंतिम अपडेट: 02 मई, 2026",
    intro: "Tradizions में, हम नट्स, बाजरा, मसाले, पूजा की आवश्यक वस्तुएं और उपहार आइटम सहित उच्च गुणवत्ता वाले उत्पाद प्रदान करने का प्रयास करते हैं। हमारे उत्पादों की प्रकृति के कारण, निम्नलिखित नीति लागू होती है:",
    sections: [
      {
        id: 1,
        title: "1. ऑर्डर रद्दीकरण",
        list: [
          "आदेश केवल डिस्पैच से पहले रद्द किए जा सकते हैं।",
          "एक बार ऑर्डर शिप हो जाने के बाद, रद्दीकरण की अनुमति नहीं है।",
          "रद्दीकरण अनुरोधों के लिए, अपने ऑर्डर विवरण के साथ ईमेल/व्हाट्सएप के माध्यम से हमसे संपर्क करें।",
          "पात्र धनवापसी 5-7 कार्य दिवसों के भीतर संसाधित की जाएगी।"
        ]
      },
      {
        id: 2,
        title: "2. रिफंड और रिप्लेसमेंट",
        highlight: "खाद्य उत्पादों की खराब होने वाली प्रकृति के कारण हम रिटर्न स्वीकार नहीं करते हैं।",
        intro: "रिफंड/रिप्लेसमेंट की अनुमति केवल तभी दी जाती है जब:",
        list: ["गलत उत्पाद वितरित किया गया", "क्षतिग्रस्त उत्पाद", "समय सीमा समाप्त (Expired) उत्पाद"],
        footer: "आपको फोटो/वीडियो प्रमाण के साथ डिलीवरी के 48 घंटों के भीतर सूचित करना होगा।"
      },
      {
        id: 3,
        title: "3. गैर-रिफंडेबल मामले",
        intro: "इनके लिए रिफंड प्रदान नहीं किया जाएगा:",
        list: [
          "खुले या उपयोग किए गए उत्पाद",
          "स्वाद वरीयता के मुद्दे",
          "गलत पता प्रदान किया गया",
          "ग्राहक की अनुपलब्धता के कारण विफल डिलीवरी",
          "कूरियर भागीदारों के कारण हुई देरी"
        ]
      },
      {
        id: 4,
        title: "4. सदस्यता आदेश",
        list: [
          "सदस्यता आदेशों को अगले बिलिंग चक्र से पहले रोका या रद्द किया जा सकता है",
          "एक बार संसाधित होने के बाद, आदेश रद्द नहीं किया जा सकता"
        ]
      },
      {
        id: 5,
        title: "5. थोक / उपहार आदेश",
        list: [
          "थोक और कस्टमाइज्ड उपहार आदेश एक बार पुष्टि होने के बाद गैर-रद्दीकरण योग्य और गैर-रिफंडेबल होते हैं",
          "किसी भी क्षति के दावे की रिपोर्ट 48 घंटों के भीतर की जानी चाहिए"
        ]
      },
      {
        id: 6,
        title: "6. रिफंड प्रोसेसिंग",
        list: ["रिफंड मूल भुगतान विधि में जारी किया जाएगा", "प्रसंस्करण समय: 5-7 कार्य दिवस"]
      },
      {
        id: 7,
        title: "7. हमसे संपर्क करें",
        content: "यदि आपके कोई प्रश्न हैं, तो कृपया हमसे संपर्क करें:",
        email: "qpay@tradizions.com",
        phone: "+91 99406 20019"
      }
    ]
  }
};

export default function CancellationPolicyPage() {
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
              
              {section.highlight && (
                <p className="mb-4 font-bold text-gray-700 italic">{section.highlight}</p>
              )}

              {section.intro && <p className="mb-4">{section.intro}</p>}

              {section.list && (
                <ul className="list-disc pl-6 space-y-3">
                  {section.list.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}

              {section.content && <p>{section.content}</p>}

              {section.footer && (
                <p className="mt-4 italic">
                  {section.footer}
                </p>
              )}

              {section.id === 7 && (
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
