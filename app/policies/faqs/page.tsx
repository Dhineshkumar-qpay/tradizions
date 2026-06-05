"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const content: Record<string, any> = {
  EN: {
    title: "Frequently Asked Questions",
    stillQuestions: "Still have questions?",
    contactIntro: "If you couldn't find the answer you were looking for, please contact our support team:",
    faqs: [
      {
        q: "Can I shop in my preferred language?",
        a: (
          <div>
            <p className="mb-2">Yes, our website is available in:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>English</li>
              <li>Tamil</li>
              <li>Hindi</li>
            </ul>
          </div>
        ),
      },
      {
        q: "What products do you sell?",
        a: (
          <div>
            <p className="mb-2">We offer a wide range of:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nuts & dry fruits</li>
              <li>Millets</li>
              <li>Spices</li>
              <li>Pooja essentials</li>
              <li>Gift boxes & hampers</li>
            </ul>
            <p className="mt-2">All our products are carefully sourced and hygienically packed for quality and freshness.</p>
          </div>
        ),
      },
      {
        q: "Are your products organic?",
        a: "Some of our products are organically sourced, while others are conventionally sourced from trusted suppliers. Please refer to individual product descriptions for details.",
      },
      {
        q: "How do I place an order?",
        a: "Browse products, add them to your cart, and proceed to checkout. Follow the payment steps to complete your order.",
      },
      {
        q: "What payment methods do you accept?",
        a: (
          <div>
            <p className="mb-2">We accept:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>UPI</li>
              <li>Debit/Credit Cards</li>
              <li>Net Banking</li>
              <li>Wallets</li>
              <li>Cash on Delivery (if available)</li>
            </ul>
          </div>
        ),
      },
      {
        q: "Do you deliver across India or internationally?",
        a: "We currently deliver across India. International shipping may be available on request.",
      },
      {
        q: "How long will my order take to arrive?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li>Orders are processed within 1–2 business days</li>
            <li>Delivery typically takes 3–7 business days, depending on your location</li>
          </ul>
        ),
      },
      {
        q: "Can I track my order?",
        a: "Yes. Once shipped, you will receive a tracking link via SMS/email.",
      },
      {
        q: "What is your return and refund policy?",
        a: (
          <div>
            <p className="mb-2">Due to the nature of food products, returns are not accepted. However, refunds/replacements are provided if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Wrong product delivered</li>
              <li>Damaged product</li>
              <li>Expired product</li>
            </ul>
            <p className="mt-2">(Refer to our Refund Policy for full details)</p>
          </div>
        ),
      },
      {
        q: "How should I store products?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li><span className="font-bold">Millets:</span> Store in airtight containers in a cool, dry place</li>
            <li><span className="font-bold">Nuts:</span> Store in airtight containers; refrigeration recommended</li>
            <li><span className="font-bold">Spices:</span> Keep in dry, airtight containers away from moisture</li>
          </ul>
        ),
      },
      {
        q: "Do your products contain allergens?",
        a: "Some products may be processed in facilities handling nuts, sesame, or gluten. Please check product details carefully if you have allergies.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled before dispatch only. Once shipped, cancellation is not possible.",
      },
      {
        q: "Do you offer subscription plans?",
        a: (
          <div>
            <p className="mb-2">Yes, we offer subscription plans for selected products including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Monthly essentials</li>
              <li>Pooja kits</li>
              <li>Health combos</li>
            </ul>
            <p className="mt-2">You can manage or cancel subscriptions before the next billing cycle.</p>
          </div>
        ),
      },
      {
        q: "Do you offer bulk or corporate orders?",
        a: (
          <div>
            <p className="mb-2">Yes, we provide:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Bulk orders</li>
              <li>Wedding return gifts</li>
              <li>Corporate gifting solutions</li>
            </ul>
            <p className="mt-2">Contact us for custom pricing and branding options.</p>
          </div>
        ),
      },
      {
        q: "Do you offer customized gift boxes?",
        a: "Yes, you can create personalized gift hampers with selected products and custom messages.",
      },
      {
        q: "What if I receive a damaged package?",
        a: "Please report within 48 hours with photo/video proof for replacement or refund.",
      },
      {
        q: "How can I contact customer support?",
        a: "If you have any questions, please contact us at qpay@tradizions.com or via WhatsApp at +91 99406 20019.",
      },
    ]
  },
  TA: {
    title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    stillQuestions: "இன்னும் கேள்விகள் உள்ளதா?",
    contactIntro: "நீங்கள் தேடும் விடையை உங்களால் கண்டுபிடிக்க முடியவில்லை என்றால், எங்களது ஆதரவு குழுவைத் தொடர்பு கொள்ளவும்:",
    faqs: [
      {
        q: "நான் விரும்பும் மொழியில் ஷாப்பிங் செய்ய முடியுமா?",
        a: (
          <div>
            <p className="mb-2">ஆம், எங்கள் வலைத்தளம் இதில் கிடைக்கிறது:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>ஆங்கிலம்</li>
              <li>தமிழ்</li>
              <li>இந்தி</li>
            </ul>
          </div>
        ),
      },
      {
        q: "நீங்கள் என்ன தயாரிப்புகளை விற்பனை செய்கிறீர்கள்?",
        a: (
          <div>
            <p className="mb-2">நாங்கள் பலதரப்பட்ட தயாரிப்புகளை வழங்குகிறோம்:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>கொட்டைகள் & உலர்ந்த பழங்கள்</li>
              <li>சிறுதானியங்கள்</li>
              <li>மசாலா பொருட்கள்</li>
              <li>பூஜை அத்தியாவசிய பொருட்கள்</li>
              <li>பரிசு பெட்டிகள்</li>
            </ul>
            <p className="mt-2">எங்கள் தயாரிப்புகள் அனைத்தும் தரமானதாகவும், புதியதாகவும் இருப்பதை உறுதி செய்ய சுகாதாரமான முறையில் பேக் செய்யப்படுகின்றன.</p>
          </div>
        ),
      },
      {
        q: "உங்கள் தயாரிப்புகள் ஆர்கானிக் தானா?",
        a: "எங்கள் தயாரிப்புகளில் சில ஆர்கானிக் முறையிலும், மற்றவை நம்பகமான சப்ளையர்களிடமிருந்தும் பெறப்படுகின்றன. விவரங்களுக்கு தனிப்பட்ட தயாரிப்பு விளக்கங்களைப் பார்க்கவும்.",
      },
      {
        q: "ஆர்டர் செய்வது எப்படி?",
        a: "தயாரிப்புகளைப் பார்த்து, அவற்றை உங்கள் கார்ட்டில் சேர்த்து, செக்-அவுட் செய்யவும். ஆர்டரை முடிக்க கட்டண முறையைப் பின்பற்றவும்.",
      },
      {
        q: "எந்த கட்டண முறைகளை நீங்கள் ஏற்றுக்கொள்கிறீர்கள்?",
        a: (
          <div>
            <p className="mb-2">நாங்கள் ஏற்றுக்கொள்பவை:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>UPI</li>
              <li>டெபிட்/கிரெடிட் கார்டுகள்</li>
              <li>நெட் பேங்கிங்</li>
              <li>வாலட்கள்</li>
              <li>கேஷ் ஆன் டெலிவரி (இருந்தால்)</li>
            </ul>
          </div>
        ),
      },
      {
        q: "நீங்கள் இந்தியா முழுவதும் அல்லது சர்வதேச அளவில் டெலிவரி செய்கிறீர்களா?",
        a: "நாங்கள் தற்போது இந்தியா முழுவதும் டெலிவரி செய்கிறோம். கோரிக்கையின் பேரில் சர்வதேச ஷிப்பிங் கிடைக்கக்கூடும்.",
      },
      {
        q: "எனது ஆர்டர் வந்து சேர எவ்வளவு காலம் ஆகும்?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li>ஆர்டர்கள் 1-2 வணிக நாட்களுக்குள் செயல்படுத்தப்படும்</li>
            <li>உங்கள் இருப்பிடத்தைப் பொறுத்து டெலிவரி பொதுவாக 3-7 வணிக நாட்கள் ஆகும்</li>
          </ul>
        ),
      },
      {
        q: "எனது ஆர்டரை நான் கண்காணிக்க முடியுமா?",
        a: "ஆம். ஷிப் செய்யப்பட்டதும், SMS/மின்னஞ்சல் மூலம் கண்காணிப்பு இணைப்பைப் பெறுவீர்கள்.",
      },
      {
        q: "உங்கள் ரிட்டர்ன் மற்றும் ரீஃபண்ட் கொள்கை என்ன?",
        a: (
          <div>
            <p className="mb-2">உணவுப் பொருட்களின் தன்மையால், ரிட்டர்ன்கள் ஏற்கப்படுவதில்லை. இருப்பினும், பின்வரும் சந்தர்ப்பங்களில் ரீஃபண்ட்/மாற்றீடு வழங்கப்படும்:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>தவறான தயாரிப்பு வழங்கப்பட்டால்</li>
              <li>சேதமடைந்த தயாரிப்பு</li>
              <li>காலாவதியான தயாரிப்பு</li>
            </ul>
            <p className="mt-2">(முழு விவரங்களுக்கு எங்கள் ரீஃபண்ட் கொள்கையைப் பார்க்கவும்)</p>
          </div>
        ),
      },
      {
        q: "தயாரிப்புகளை நான் எப்படி சேமிக்க வேண்டும்?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li><span className="font-bold">சிறுதானியங்கள்:</span> குளிர்ந்த, உலர்ந்த இடத்தில் காற்றுப்புகாத கொள்கலன்களில் சேமிக்கவும்</li>
            <li><span className="font-bold">கொட்டைகள்:</span> காற்றுப்புகாத கொள்கலன்களில் சேமிக்கவும்; குளிரூட்ட பரிந்துரைக்கப்படுகிறது</li>
            <li><span className="font-bold">மசாலா பொருட்கள்:</span> ஈரப்பதம் இல்லாத உலர்ந்த, காற்றுப்புகாத கொள்கலன்களில் வைக்கவும்</li>
          </ul>
        ),
      },
      {
        q: "உங்கள் தயாரிப்புகளில் ஒவ்வாமை உண்டாக்கும் பொருட்கள் உள்ளதா?",
        a: "சில தயாரிப்புகள் கொட்டைகள், எள் அல்லது பசையம் (gluten) கையாளும் வசதிகளில் செயலாக்கப்படலாம். உங்களுக்கு ஒவ்வாமை இருந்தால் தயாரிப்பு விவரங்களை கவனமாக சரிபார்க்கவும்.",
      },
      {
        q: "எனது ஆர்டரை நான் ரத்து செய்ய முடியுமா?",
        a: "ஆனுப்பப்படுவதற்கு முன்னதாக மட்டுமே ஆர்டர்களை ரத்து செய்ய முடியும். ஷிப் செய்யப்பட்ட பிறகு ரத்து செய்ய முடியாது.",
      },
      {
        q: "நீங்கள் சந்தா திட்டங்களை வழங்குகிறீர்களா?",
        a: (
          <div>
            <p className="mb-2">ஆம், தேர்ந்தெடுக்கப்பட்ட தயாரிப்புகளுக்கு நாங்கள் சந்தா திட்டங்களை வழங்குகிறோம்:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>மாதாந்திர அத்தியாவசிய பொருட்கள்</li>
              <li>பூஜை கிட்கள்</li>
              <li>சுகாதார காம்போக்கள்</li>
            </ul>
            <p className="mt-2">அடுத்த பில்லிங் சுழற்சிக்கு முன் நீங்கள் சந்தாக்களை நிர்வகிக்கலாம் அல்லது ரத்து செய்யலாம்.</p>
          </div>
        ),
      },
      {
        q: "நீங்கள் மொத்த அல்லது கார்ப்பரேட் ஆர்டர்களை வழங்குகிறீர்களா?",
        a: (
          <div>
            <p className="mb-2">ஆம், நாங்கள் வழங்குகிறோம்:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>மொத்த ஆர்டர்கள்</li>
              <li>திருமண ரிட்டர்ன் பரிசுகள்</li>
              <li>கார்ப்பரேட் பரிசு தீர்வுகள்</li>
            </ul>
            <p className="mt-2">தனிப்பயன் விலை மற்றும் பிராண்டிங் விருப்பங்களுக்கு எங்களைத் தொடர்பு கொள்ளவும்.</p>
          </div>
        ),
      },
      {
        q: "நீங்கள் தனிப்பயனாக்கப்பட்ட பரிசு பெட்டிகளை வழங்குகிறீர்களா?",
        a: "ஆம், நீங்கள் தேர்ந்தெடுக்கப்பட்ட தயாரிப்புகள் மற்றும் தனிப்பயன் செய்திகளுடன் தனிப்பயனாக்கப்பட்ட பரிசுப் பொதிகளை உருவாக்கலாம்.",
      },
      {
        q: "எனது பேக்கேஜ் சேதமடைந்தால் என்ன செய்வது?",
        a: "மாற்றீடு அல்லது ரீஃபண்ட் பெற 48 மணி நேரத்திற்குள் புகைப்படம்/வீடியோ ஆதாரத்துடன் தெரிவிக்கவும்.",
      },
      {
        q: "வாடிக்கையாளர் ஆதரவை நான் எப்படி தொடர்பு கொள்வது?",
        a: "உங்களுக்கு ஏதேனும் கேள்விகள் இருந்தால், எங்களை qpay@tradizions.com அல்லது வாட்ஸ்அப் மூலம் +91 99406 20019 என்ற எண்ணில் தொடர்பு கொள்ளவும்.",
      },
    ]
  },
  HI: {
    title: "अक्सर पूछे जाने वाले प्रश्न",
    stillQuestions: "अभी भी प्रश्न हैं?",
    contactIntro: "यदि आपको वह उत्तर नहीं मिला जिसे आप ढूंढ रहे थे, तो कृपया हमारी सहायता टीम से संपर्क करें:",
    faqs: [
      {
        q: "क्या मैं अपनी पसंदीदा भाषा में खरीदारी कर सकता हूँ?",
        a: (
          <div>
            <p className="mb-2">हाँ, हमारी वेबसाइट उपलब्ध है:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>अंग्रेजी</li>
              <li>तमिल</li>
              <li>हिंदी</li>
            </ul>
          </div>
        ),
      },
      {
        q: "आप कौन से उत्पाद बेचते हैं?",
        a: (
          <div>
            <p className="mb-2">हम उत्पादों की एक विस्तृत श्रृंखला प्रदान करते हैं:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>नट्स और सूखे मेवे</li>
              <li>बाजरा</li>
              <li>मसाले</li>
              <li>पूजा की आवश्यक वस्तुएं</li>
              <li>गिफ्ट बॉक्स और हैंपर्स</li>
            </ul>
            <p className="mt-2">हमारे सभी उत्पाद गुणवत्ता और ताजगी सुनिश्चित करने के लिए सावधानीपूर्वक मंगवाए जाते हैं और स्वच्छता से पैक किए जाते हैं।</p>
          </div>
        ),
      },
      {
        q: "क्या आपके उत्पाद जैविक (organic) हैं?",
        a: "हमारे कुछ उत्पाद जैविक रूप से मंगवाए जाते हैं, जबकि अन्य भरोसेमंद आपूर्तिकर्ताओं से पारंपरिक रूप से मंगवाए जाते हैं। विवरण के लिए कृपया व्यक्तिगत उत्पाद विवरण देखें।",
      },
      {
        q: "मैं ऑर्डर कैसे दूँ?",
        a: "उत्पादों को देखें, उन्हें अपने कार्ट में जोड़ें, और चेकआउट पर आगे बढ़ें। अपना ऑर्डर पूरा करने के लिए भुगतान चरणों का पालन करें।",
      },
      {
        q: "आप कौन से भुगतान के तरीके स्वीकार करते हैं?",
        a: (
          <div>
            <p className="mb-2">हम स्वीकार करते हैं:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>UPI</li>
              <li>डेबिट/क्रेडिट कार्ड</li>
              <li>नेट बैंकिंग</li>
              <li>वॉलेट</li>
              <li>कैश ऑन डिलीवरी (यदि उपलब्ध हो)</li>
            </ul>
          </div>
        ),
      },
      {
        q: "क्या आप पूरे भारत में या अंतरराष्ट्रीय स्तर पर डिलीवरी करते हैं?",
        a: "हम वर्तमान में पूरे भारत में डिलीवरी करते हैं। अनुरोध पर अंतरराष्ट्रीय शिपिंग उपलब्ध हो सकती है।",
      },
      {
        q: "मेरे ऑर्डर को आने में कितना समय लगेगा?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li>आदेश 1-2 कार्य दिवसों के भीतर संसाधित किए जाते हैं</li>
            <li>डिलीवरी में आमतौर पर आपके स्थान के आधार पर 3-7 कार्य दिवस लगते हैं</li>
          </ul>
        ),
      },
      {
        q: "क्या मैं अपना ऑर्डर ट्रैक कर सकता हूँ?",
        a: "हाँ। एक बार शिप होने के बाद, आपको एसएमएस/ईमेल के माध्यम से एक ट्रैकिंग लिंक प्राप्त होगा।",
      },
      {
        q: "आपकी रिटर्न और रिफंड नीति क्या है?",
        a: (
          <div>
            <p className="mb-2">खाद्य उत्पादों की प्रकृति के कारण, रिटर्न स्वीकार नहीं किया जाता है। हालांकि, रिफंड/रिप्लेसमेंट प्रदान किया जाता है यदि:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>गलत उत्पाद वितरित किया गया</li>
              <li>क्षतिग्रस्त उत्पाद</li>
              <li>समय सीमा समाप्त उत्पाद</li>
            </ul>
            <p className="mt-2">(पूरी जानकारी के लिए हमारी रिफंड नीति देखें)</p>
          </div>
        ),
      },
      {
        q: "मुझे उत्पादों को कैसे स्टोर करना चाहिए?",
        a: (
          <ul className="list-disc pl-6 space-y-1">
            <li><span className="font-bold">बाजरा:</span> ठंडी, सूखी जगह पर एयरटाइट कंटेनर में स्टोर करें</li>
            <li><span className="font-bold">नट्स:</span> एयरटाइट कंटेनर में स्टोर करें; रेफ्रिजरेशन की सिफारिश की जाती है</li>
            <li><span className="font-bold">मसाले:</span> नमी से दूर सूखे, एयरटाइट कंटेनर में रखें</li>
          </ul>
        ),
      },
      {
        q: "क्या आपके उत्पादों में एलर्जी पैदा करने वाले तत्व हैं?",
        a: "कुछ उत्पादों को नट्स, तिल या ग्लूटेन को संभालने वाली सुविधाओं में संसाधित किया जा सकता है। यदि आपको एलर्जी है तो कृपया उत्पाद विवरण सावधानीपूर्वक जांचें।",
      },
      {
        q: "क्या मैं अपना ऑर्डर रद्द कर सकता हूँ?",
        a: "आदेश केवल डिस्पैच से पहले रद्द किए जा सकते हैं। एक बार शिप होने के बाद, रद्दीकरण संभव नहीं है।",
      },
      {
        q: "क्या आप सदस्यता योजनाएं प्रदान करते हैं?",
        a: (
          <div>
            <p className="mb-2">हाँ, हम चुनिंदा उत्पादों के लिए सदस्यता योजनाएं प्रदान करते हैं जिनमें शामिल हैं:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>मासिक आवश्यक वस्तुएं</li>
              <li>पूजा किट</li>
              <li>हेल्थ कॉम्बो</li>
            </ul>
            <p className="mt-2">आप अगले बिलिंग चक्र से पहले सदस्यता को प्रबंधित या रद्द कर सकते हैं।</p>
          </div>
        ),
      },
      {
        q: "क्या आप थोक या कॉर्पोरेट आदेश प्रदान करते हैं?",
        a: (
          <div>
            <p className="mb-2">हाँ, हम प्रदान करते हैं:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>थोक आदेश</li>
              <li>शादी के रिटर्न गिफ्ट</li>
              <li>कॉर्पोरेट उपहार समाधान</li>
            </ul>
            <p className="mt-2">कस्टम मूल्य निर्धारण और ब्रांडिंग विकल्पों के लिए हमसे संपर्क करें।</p>
          </div>
        ),
      },
      {
        q: "क्या आप कस्टमाइज्ड गिफ्ट बॉक्स प्रदान करते हैं?",
        a: "हाँ, आप चयनित उत्पादों और कस्टम संदेशों के साथ व्यक्तिगत गिफ्ट हैम्पर्स बना सकते हैं।",
      },
      {
        q: "यदि मुझे क्षतिग्रस्त पैकेज प्राप्त हो तो क्या होगा?",
        a: "कृपया रिप्लेसमेंट या रिफंड के लिए फोटो/वीडियो प्रमाण के साथ 48 घंटों के भीतर रिपोर्ट करें।",
      },
      {
        q: "मैं ग्राहक सहायता से कैसे संपर्क कर सकता हूँ?",
        a: "यदि आपके कोई प्रश्न हैं, तो कृपया हमें qpay@tradizions.com पर संपर्क करें या +91 99406 20019 पर व्हाट्सएप के माध्यम से संपर्क करें।",
      },
    ]
  }
};

export default function FAQsPage() {
  const [selectedLang, setSelectedLang] = useState("EN");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-white pt-40 lg:pt-48 pb-32 text-gray-800">
      <div className="max-w-4xl mx-auto px-6">
        {/* Professional Header */}
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
          {t.title}
        </h1>

        {/* FAQ Accordion */}
        <div className="space-y-2">
          {t.faqs.map((faq: any, i: number) => (
            <div key={i} className="border-b border-gray-200">
              <button
                onClick={() => toggleAccordion(i)}
                className="w-full flex items-center justify-between py-6 text-left hover:text-[var(--olive)] transition-all group"
              >
                <span
                  className={`text-md font-bold transition-colors ${
                    openIndex === i ? "text-[var(--olive)]" : "text-gray-900"
                  }`}
                >
                  {i + 1}. {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    openIndex === i
                      ? "rotate-180 text-[var(--olive)]"
                      : "text-gray-400"
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i
                    ? "max-h-[800px] opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="text-[15px] leading-relaxed text-gray-600 pl-6 pb-6">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Footer */}
        <section className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-lg font-bold mb-6 uppercase tracking-wider text-gray-900">
            {t.stillQuestions}
          </h2>
          <div className="space-y-3 text-[15px]">
            <p>{t.contactIntro}</p>
            <p>
              <span className="font-bold">Email:</span>{" "}
              <a
                href="mailto:qpay@tradizions.com"
                className="font-normal text-[var(--sky-blue)]"
              >
                qpay@tradizions.com
              </a>
            </p>
            <p>
              <span className="font-bold">Phone/WhatsApp:</span>{" "}
              <a
                href="tel:+919940620019"
                className="font-normal text-[var(--orange)]"
              >
                +91 99406 20019
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
