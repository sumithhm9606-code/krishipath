/* =====================================================================
   KRISHIPATH — 5-Page App JavaScript
   Complete Multi-Language System (English, ಕನ್ನಡ, हिंदी)
   ===================================================================== */
"use strict";

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

// =====================================================================
// DATA & STATE
// =====================================================================
let CR = [];   // all crops from API
let DISTRICTS = [];
let SOILS = [];
let sel = null; // selected crop index
let PlanData = null; // last plan response

// Language state: 'en', 'kn', or 'hi'
let LN = localStorage.getItem('kp_lang') || 'en';
if (LN !== 'en' && LN !== 'kn' && LN !== 'hi') LN = 'en';
const en = () => LN === 'en';

// Currency formatter
const INR = v => '₹' + Math.abs(Math.round(v)).toLocaleString('en-IN');
const n0  = v => Math.round(v).toLocaleString('en-IN');
const fmt_date = s => {
  if (!s) return '—';
  const d = new Date(s);
  const locale = LN === 'kn' ? 'kn-IN' : LN === 'hi' ? 'hi-IN' : 'en-IN';
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
};

// Hindi crop name mapping for all 57 Karnataka crops
const CROP_HI = {
  'Paddy': 'धान (चावल)', 'Ragi': 'रागी (मंडुआ)', 'Jowar': 'ज्वार', 'Maize': 'मक्का', 'Bajra': 'बाजरा', 'Wheat': 'गेहूँ', 'Foxtail millet (Navane)': 'कंगनी (रागी)',
  'Red gram (Tur)': 'अरहर (तूर)', 'Bengal gram': 'चना', 'Green gram': 'मूंग', 'Black gram': 'उड़द', 'Horse gram': 'कुलथी', 'Cowpea': 'लोबिया', 'Field bean (Avare)': 'सेम (अवारे)',
  'Groundnut': 'मूंगफली', 'Sunflower': 'सूरजमुखी', 'Soybean': 'सोयाबीन', 'Sesame': 'तिल', 'Safflower': 'कुसुम', 'Castor': 'अरंडी', 'Niger': 'रामतिल',
  'Sugarcane': 'गन्ना', 'Cotton': 'कपास', 'Tobacco (FCV)': 'तंबाकू', 'Mulberry (silk)': 'शहतूत (रेशम)',
  'Tomato': 'टमाटर', 'Onion': 'प्याज', 'Potato': 'आलू', 'Brinjal': 'बैंगन', 'Chilli': 'हरी मिर्च', 'Okra (Bhendi)': 'भिंडी',
  'Cabbage': 'पत्तागोभी', 'Cauliflower': 'फूलगोभी', 'Carrot': 'गाजर', 'Beetroot': 'चुकंदर', 'French beans': 'फ्रेंच बीन्स', 'Cucumber': 'खीरा',
  'Pumpkin': 'कद्दू', 'Bottle gourd': 'लौकी', 'Drumstick': 'सहजन (मोरिंगा)',
  'Banana': 'केला', 'Mango': 'आम', 'Grapes': 'अंगूर', 'Pomegranate': 'अनार', 'Papaya': 'पपीता', 'Sapota (Chikku)': 'चीकू', 'Guava': 'अमरूद', 'Watermelon': 'तरबूज',
  'Coffee': 'कॉफ़ी', 'Arecanut': 'सुपारी', 'Coconut': 'नारियल', 'Black pepper': 'काली मिर्च', 'Cardamom': 'इलायची', 'Turmeric': 'हल्दी', 'Ginger': 'अदरक', 'Cashew': 'काजू', 'Marigold': 'गेंदा'
};

function getCropName(c) {
  if (!c) return '';
  if (LN === 'kn') return c.kn || c.en;
  if (LN === 'hi') return CROP_HI[c.en] || c.en;
  return c.en;
}

// Category labels & icons
const CAT_LABELS = {
  C: { en: 'Cereals', kn: 'ಧಾನ್ಯಗಳು', hi: 'अनाज' },
  P: { en: 'Pulses', kn: 'ಬೇಳೆಕಾಳುಗಳು', hi: 'दालें' },
  O: { en: 'Oilseeds', kn: 'ಎಣ್ಣೆಕಾಳುಗಳು', hi: 'तिलहन' },
  N: { en: 'Commercial', kn: 'ವಾಣಿಜ್ಯ ಬೆಳೆ', hi: 'व्यावसायिक' },
  V: { en: 'Vegetables', kn: 'ತರಕಾರಿಗಳು', hi: 'सब्जियाँ' },
  F: { en: 'Fruits', kn: 'ಹಣ್ಣುಗಳು', hi: 'फल' },
  T: { en: 'Plantation', kn: 'ತೋಟಗಾರಿಕೆ', hi: 'बागवानी' }
};

const CROP_ICONS = { C: '🌾', P: '🫘', O: '🥜', N: '🏭', V: '🥦', F: '🍎', T: '☕' };
const CAT_ICONS_DETAILED = {
  'Paddy':'🌾','Ragi':'🌾','Jowar':'🌾','Maize':'🌽','Bajra':'🌾','Wheat':'🌾','Foxtail millet (Navane)':'🌾',
  'Red gram (Tur)':'🫘','Bengal gram':'🫘','Green gram':'🫘','Black gram':'🫘','Horse gram':'🫘','Cowpea':'🫘','Field bean (Avare)':'🫘',
  'Groundnut':'🥜','Sunflower':'🌻','Soybean':'🌿','Sesame':'🌾','Safflower':'🌸','Castor':'🌿','Niger':'🌿',
  'Sugarcane':'🎋','Cotton':'☁️','Tobacco (FCV)':'🍃','Mulberry (silk)':'🌿',
  'Tomato':'🍅','Onion':'🧅','Potato':'🥔','Brinjal':'🍆','Chilli':'🌶️','Okra (Bhendi)':'🥗',
  'Cabbage':'🥬','Cauliflower':'🥦','Carrot':'🥕','Beetroot':'🫚','French beans':'🫘','Cucumber':'🥒',
  'Pumpkin':'🎃','Bottle gourd':'🍵','Drumstick':'🌿',
  'Banana':'🍌','Mango':'🥭','Grapes':'🍇','Pomegranate':'🫐','Papaya':'🍈','Sapota (Chikku)':'🍑','Guava':'🍏','Watermelon':'🍉',
  'Coffee':'☕','Arecanut':'🌴','Coconut':'🥥','Black pepper':'🌶️','Cardamom':'🌿','Turmeric':'🧈','Ginger':'🫚','Cashew':'🌰','Marigold':'🌼'
};

// Fertilizer application timing & tips per category (UAS Bangalore & Dharwad standards)
const FERT_TIPS = {
  C: {
    en: 'Apply full dose of SSP and MOP as basal during final land preparation. Split Nitrogen (Urea) into 3 equal doses: at sowing/transplanting (50%), active tillering (30 days, 25%), and panicle initiation (60 days, 25%). For Paddy and Maize, apply Zinc Sulphate 10 kg/acre to prevent Khaira disease.',
    kn: 'ಅಂತಿಮ ಭೂಮಿ ಸಿದ್ಧತೆಯ ಸಮಯದಲ್ಲಿ ಎಸ್‌ಎಸ್‌ಪಿ ಮತ್ತು ಎಂಒಪಿಯ ಪೂರ್ಣ ಪ್ರಮಾಣವನ್ನು ತಳಪಾಯವಾಗಿ ನೀಡಿ. ಯೂರಿಯಾವನ್ನು 3 ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ: ಬಿತ್ತನೆ/ನಾಟಿ ಸಮಯದಲ್ಲಿ (50%), ಕವಲೊಡೆಯುವಾಗ (30 ದಿನ, 25%), ಮತ್ತು ತೆನೆ ಬರುವ ಮುನ್ನ (60 ದಿನ, 25%). ಭತ್ತ ಹಾಗೂ ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಜಿಂಕ್ ಸಲ್ಫೇಟ್ 10 ಕೆಜಿ/ಎಕರೆ ಬಳಸಿ.',
    hi: 'खेत की अंतिम तैयारी के समय एसएसपी और एमओपी की पूरी मात्रा बेसल डोज के रूप में डालें। यूरिया को 3 भागों में बांटें: बुवाई/रोपाई (50%), कल्ले फूटते समय (30 दिन, 25%), और बाली निकलने पर (60 दिन, 25%)। धान व मक्के में जिंक सल्फेट 10 किग्रा/एकड़ प्रयोग करें।'
  },
  P: {
    en: 'Legume pulses fix atmospheric Nitrogen via root nodules. Avoid excess Urea! SSP is strongly preferred over DAP because it provides 11% Sulphur and 19% Calcium crucial for protein formation. Always treat seeds with Rhizobium culture before sowing.',
    kn: 'ದ್ವಿದಳ ಧಾನ್ಯಗಳು ವಾತಾವರಣದ ಸಾರಜನಕವನ್ನು ಹೀರಿಕೊಳ್ಳುತ್ತವೆ. ಹೆಚ್ಚಿನ ಯೂರಿಯಾ ಬಳಸಬೇಡಿ! ಡಿಎಪಿಗಿಂತ ಎಸ್‌ಎಸ್‌ಪಿ ಉತ್ತಮ, ಏಕೆಂದರೆ ಇದು 11% ಗಂಧಕ ಮತ್ತು 19% ಕ್ಯಾಲ್ಸಿಯಂ ನೀಡುತ್ತದೆ. ಬಿತ್ತನೆಗೆ ಮುನ್ನ ರೈಜೋಬಿಯಂ ಜೈವಿಕ ಗೊಬ್ಬರದಿಂದ ಬೀಜೋಪಚಾರ ಮಾಡಿ.',
    hi: 'दलहनी फसलें अपनी जड़ों की ग्रंथियों से नाइट्रोजन स्थिर करती हैं। अत्यधिक यूरिया से बचें! डीएपी की तुलना में एसएसपी बेहतर है क्योंकि इसमें 11% सल्फर और 19% कैल्शियम होता है। बुवाई से पूर्व राइजोबियम से बीजोपचार अवश्य करें।'
  },
  O: {
    en: 'Sulphur is a primary determinant of oil content in Groundnut, Sunflower, Soybean and Sesame. Apply Gypsum 200 kg/acre at 35-40 days after sowing (pegging stage) to prevent empty pods. Spray Boron (0.2%) during head formation in Sunflower for full seed setting.',
    kn: 'ಕಡಲೆಕಾಯಿ, ಸೂರ್ಯಕಾಂತಿ, ಸೋಯಾಬೀನ್ ಮತ್ತು ಎಳ್ಳಿನಲ್ಲಿ ಎಣ್ಣೆ ಅಂಶ ಹೆಚ್ಚಿಸಲು ಗಂಧಕ ಅತ್ಯಗತ್ಯ. ಕಡಲೆಕಾಯಿಯಲ್ಲಿ ಬೀಜ ಕಟ್ಟುವ ಹಂತದಲ್ಲಿ (35-40 ದಿನ) ಜಿಪ್ಸಮ್ 200 ಕೆಜಿ/ಎಕರೆ ನೀಡಿ. ಸೂರ್ಯಕಾಂತಿಯಲ್ಲಿ ಹೂ ಬಿಡುವಾಗ ಬೋರಾನ್ (0.2%) ಸಿಂಪಡಿಸಿ.',
    hi: 'मूंगफली, सूरजमुखी, सोयाबीन और तिल में तेल की मात्रा के लिए सल्फर अत्यंत महत्वपूर्ण है। 35-40 दिनों में 200 किग्रा/एकड़ जिप्सम डालें। सूरजमुखी में फूल आते समय 0.2% बोरान का छिड़काव करें।'
  },
  N: {
    en: 'Heavy feeder crops: For Sugarcane, apply Urea in 4 splits (basal, 45, 90 and 120 days during earthing up) + Ferrous Sulphate to prevent yellowing. For Cotton, apply Magnesium Sulphate (10 kg/ac) and Boron (1 g/L) foliar spray to stop leaf reddening and square dropping.',
    kn: 'ಕಬ್ಬಿಗೆ 4 ಕಂತುಗಳಲ್ಲಿ ಯೂರಿಯಾ ನೀಡಿ (ನಾಟಿ, 45, 90 ಮತ್ತು 120 ದಿನಗಳ ಏರು ಹಾಕುವಾಗ) + ಎಲೆ ಹಳದಿ ತಡೆಗಟ್ಟಲು ಫೆರಸ್ ಸಲ್ಫೇಟ್ ನೀಡಿ. ಹತ್ತಿಗೆ ಎಲೆ ಕೆಂಪಾಗುವುದು ಮತ್ತು ಮೊಗ್ಗು ಉದುರುವುದನ್ನು ತಡೆಯಲು ಮೆಗ್ನೀಸಿಯಮ್ ಸಲ್ಫೇಟ್ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ.',
    hi: 'गन्ने में यूरिया 4 बार में दें (बुवाई, 45, 90 और 120 दिन की मिट्टी चढ़ाते समय) + फेरस सल्फेट डालें। कपास में पत्ती लाल होने व कली गिरने से रोकने हेतु मैग्नीशियम सल्फेट व बोरान का छिड़काव करें।'
  },
  V: {
    en: 'Vegetables have rapid nutrient uptake. For Tomato and Chilli, apply Calcium Nitrate (5 g/L) and Boron (1 g/L) foliar spray during fruit set to prevent blossom-end rot and fruit cracking. For Onion and Garlic, Potassium and Sulphur (via SSP) improve bulb size and storage life.',
    kn: 'ತರಕಾರಿಗಳಿಗೆ ಶೀಘ್ರ ಪೋಷಕಾಂಶಗಳ ಅಗತ್ಯವಿದೆ. ಟೊಮ್ಯಾಟೊ ಮತ್ತು ಮೆಣಸಿನಕಾಯಿಯಲ್ಲಿ ಹಣ್ಣು ಕೊಳೆಯುವುದು ಮತ್ತು ಬಿರುಕು ಬಿಡುವುದನ್ನು ತಡೆಯಲು ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ ಮತ್ತು ಬೋರಾನ್ ಸಿಂಪಡಿಸಿ. ಈರುಳ್ಳಿಗೆ ಪೊಟ್ಯಾಷ್ ಮತ್ತು ಗಂಧಕ ಗಾತ್ರ ಹಾಗೂ ಬಾಳಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತವೆ.',
    hi: 'टमाटर और मिर्च में फल सड़न व फटने से रोकने के लिए फल बनते समय कैल्शियम नाइट्रेट व बोरान का छिड़काव करें। प्याज व लहसुन में पोटाश व सल्फर से कंद का आकार और भंडारण क्षमता बढ़ती है।'
  },
  F: {
    en: 'Potassium (K) is the most critical element for fruit crops. Apply fertilizers in a ring basin 1–1.5m away from the trunk. For Banana, apply MOP in 4 equal splits at 60, 120, 180 and 240 days. For Mango and Grapes, spray Micronutrient mixture during pre-flowering flush.',
    kn: 'ಹಣ್ಣಿನ ಬೆಳೆಗಳಿಗೆ ಪೊಟ್ಯಾಷ್ (ಕೆ) ಅತ್ಯಂತ ನಿರ್ಣಾಯಕ. ಮರದಿಂದ 1-1.5 ಮೀಟರ್ ದೂರದಲ್ಲಿ ವೃತ್ತಾಕಾರದಲ್ಲಿ ಗೊಬ್ಬರ ಹಾಕಿ. ಬಾಳೆಗೆ ಎಂಒಪಿಯನ್ನು 60, 120, 180 ಮತ್ತು 240 ದಿನಗಳಲ್ಲಿ 4 ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ. ಮಾವು ಮತ್ತು ದ್ರಾಕ್ಷಿಗೆ ಹೂ ಬಿಡುವ ಮುನ್ನ ಸೂಕ್ಷ್ಮ ಪೋಷಕಾಂಶ ಸಿಂಪಡಿಸಿ.',
    hi: 'फलदार फसलों के लिए पोटाश सबसे महत्वपूर्ण है। तने से 1-1.5 मीटर दूर थाले में खाद दें। केले में 60, 120, 180 व 240 दिनों पर 4 बार पोटाश दें। आम व अंगूर में फूल आने से पहले सूक्ष्म पोषक तत्वों का छिड़काव करें।'
  },
  T: {
    en: 'For Arecanut and Coconut, apply fertilizer in 2 splits: May-June (pre-monsoon) and September-October (post-monsoon) in a shallow ring trench 1.5–2m from trunk. For Coconut, apply 1 kg Common Salt per palm per year for heavier copra. For Turmeric and Ginger, Neem cake prevents soil-borne rhizome rot.',
    kn: 'ಅಡಿಕೆ ಮತ್ತು ತೆಂಗಿಗೆ ವರ್ಷಕ್ಕೆ 2 ಬಾರಿ ಗೊಬ್ಬರ ನೀಡಿ: ಮೇ-ಜೂನ್ (ಮುಂಗಾರು ಪೂರ್ವ) ಮತ್ತು ಸೆಪ್ಟೆಂಬರ್-ಅಕ್ಟೋಬರ್ (ಮುಂಗಾರು ನಂತರ). ತೆಂಗಿಗೆ ಪ್ರತಿ ಮರಕ್ಕೆ 1 ಕೆಜಿ ಉಪ್ಪು ನೀಡಿದರೆ ಕೊಬ್ಬರಿ ತೂಕ ಹೆಚ್ಚುತ್ತದೆ. ಶುಂಠಿ ಮತ್ತು ಅರಿಶಿನಕ್ಕೆ ಬೇರು ಕೊಳೆತ ತಡೆಗಟ್ಟಲು ಬೇವಿನ ಹಿಂಡಿ ಬಳಸಿ.',
    hi: 'सुपारी और नारियल में साल में 2 बार खाद दें: मई-जून (मानसून पूर्व) और सितंबर-अक्टूबर (मानसून बाद)। नारियल में 1 किग्रा सादा नमक प्रति पेड़ डालने से खोपरा भारी होता है। हल्दी-अदरक में कंद सड़न रोकने हेतु नीम की खली डालें।'
  }
};

// =====================================================================
// COMPREHENSIVE MULTI-LANGUAGE DICTIONARY (EN, KN, HI)
// =====================================================================
const STRINGS = {
  // Topbar & Header
  gov_identity: {
    en: 'Government of Karnataka · Department of Agriculture',
    kn: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ · ಕೃಷಿ ಇಲಾಖೆ',
    hi: 'कर्नाटक सरकार · कृषि विभाग'
  },
  gov_portal_tag: {
    en: 'Official Agri-Advisory Portal',
    kn: 'ಅಧಿಕೃತ ಕೃಷಿ ಸಲಹಾ ಪೋರ್ಟಲ್',
    hi: 'आधिकारिक कृषि सलाहकार पोर्टल'
  },
  brand_title: {
    en: 'KRISHIPATH',
    kn: 'ಕೃಷಿಪಥ',
    hi: 'कृषिपथ'
  },
  brand_sub: {
    en: 'State Agricultural Decision Support System',
    kn: 'ರಾಜ್ಯ ಕೃಷಿ ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ',
    hi: 'राज्य कृषि निर्णय सहायता प्रणाली'
  },
  nav_crop: {
    en: 'Crop Select',
    kn: 'ಬೆಳೆ ಆಯ್ಕೆ',
    hi: 'फसल चयन'
  },
  nav_land: {
    en: 'Land Details',
    kn: 'ಜಮೀನಿನ ವಿವರ',
    hi: 'भूमि विवरण'
  },
  nav_plan: {
    en: 'My Plan',
    kn: 'ನನ್ನ ಯೋಜನೆ',
    hi: 'मेरी योजना'
  },
  nav_comm: {
    en: 'Farmer Community',
    kn: 'ರೈತ ಸಮುದಾಯ',
    hi: 'किसान समुदाय'
  },
  btn_logout: {
    en: 'Logout',
    kn: 'ಲಾಗ್ ಔಟ್',
    hi: 'लॉगआउट'
  },

  // Page 1: Login
  login_title: {
    en: 'KRISHIPATH',
    kn: 'ಕೃಷಿಪಥ',
    hi: 'कृषिपथ'
  },
  login_sub: {
    en: 'Karnataka Agricultural Decision Support System',
    kn: 'ಕರ್ನಾಟಕ ಕೃಷಿ ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ',
    hi: 'कर्नाटक कृषि निर्णय सहायता प्रणाली'
  },
  login_welcome: {
    en: 'Welcome, Farmer! Enter your User ID (Gmail), password, and select your district to begin your personalised farming plan.',
    kn: 'ಸ್ವಾಗತ ರೈತರೇ! ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕೃಷಿ ಯೋಜನೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಬಳಕೆದಾರರ ಐಡಿ (Gmail), ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    hi: 'स्वागत है किसान भाई! अपनी व्यक्तिगत कृषि योजना शुरू करने के लिए अपना यूज़र आईडी (Gmail), पासवर्ड और ज़िला चुनें।'
  },
  login_email_lbl: {
    en: 'User ID (Gmail)',
    kn: 'ಬಳಕೆದಾರರ ಐಡಿ (Gmail)',
    hi: 'यूज़र आईडी (Gmail)'
  },
  login_email_ph: {
    en: 'e.g. farmer@gmail.com',
    kn: 'ಉದಾ: farmer@gmail.com',
    hi: 'उदा: farmer@gmail.com'
  },
  login_pwd_lbl: {
    en: 'Password',
    kn: 'ಪಾಸ್‌ವರ್ಡ್',
    hi: 'पासवर्ड'
  },
  login_pwd_ph: {
    en: 'Enter your password',
    kn: 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ',
    hi: 'अपना पासवर्ड दर्ज करें'
  },
  login_name_lbl: {
    en: 'User ID (Gmail)',
    kn: 'ಬಳಕೆದಾರರ ಐಡಿ (Gmail)',
    hi: 'यूज़र आईडी (Gmail)'
  },
  login_name_ph: {
    en: 'e.g. farmer@gmail.com',
    kn: 'ಉದಾ: farmer@gmail.com',
    hi: 'उदा: farmer@gmail.com'
  },
  login_dist_lbl: {
    en: 'Your District',
    kn: 'ನಿಮ್ಮ ಜಿಲ್ಲೆ',
    hi: 'आपका ज़िला'
  },
  sel_district_opt: {
    en: '-- Select Karnataka District --',
    kn: '-- ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ --',
    hi: '-- कर्नाटक ज़िला चुनें --'
  },
  login_btn: {
    en: '🌱 Start My Farming Plan',
    kn: '🌱 ನನ್ನ ಕೃಷಿ ಯೋಜನೆ ಪ್ರಾರಂಭಿಸಿ',
    hi: '🌱 मेरी कृषि योजना शुरू करें'
  },
  login_feat_fert: {
    en: 'Crop-Specific Fertilizer Plans',
    kn: 'ಬೆಳೆ ನಿರ್ದಿಷ್ಟ ಗೊಬ್ಬರ ಯೋಜನೆ',
    hi: 'फसल-विशिष्ट उर्वरक योजनाएं'
  },
  login_feat_road: {
    en: 'Visual Step-by-Step Roadmap',
    kn: 'ಹಂತ-ಹಂತದ ಬೆಳವಣಿಗೆ ಮಾರ್ಗಸೂಚಿ',
    hi: 'चरण-दर-चरण फसल रोडमैप'
  },
  login_feat_mkt: {
    en: 'Market Price Intelligence',
    kn: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮುನ್ಸೂಚನೆ',
    hi: 'मंडी भाव व बाजार विश्लेषण'
  },
  login_feat_dis: {
    en: 'Crop Disease & Treatment Guide',
    kn: 'ಬೆಳೆ ರೋಗ ಮತ್ತು ಚಿಕಿತ್ಸಾ ಕೈಪಿಡಿ',
    hi: 'फसल रोग व उपचार गाइड'
  },
  stat_crops: {
    en: 'Crops Covered',
    kn: 'ಬೆಳೆಗಳು',
    hi: 'फसलें'
  },
  stat_dist: {
    en: 'Districts',
    kn: 'ಜಿಲ್ಲೆಗಳು',
    hi: 'ज़िले'
  },
  stat_soil: {
    en: 'Soil Types',
    kn: 'ಮಣ್ಣಿನ ವಿಧಗಳು',
    hi: 'मिट्टी के प्रकार'
  },
  stat_price: {
    en: 'Price Data',
    kn: 'ಬೆಲೆ ಮಾಹಿತಿ',
    hi: 'मंडी भाव'
  },
  illus_b1: {
    en: '🌾 Cereals & Millets',
    kn: '🌾 ಧಾನ್ಯಗಳು ಮತ್ತು ಸಿರಿಧಾನ್ಯಗಳು',
    hi: '🌾 अनाज और बाजरा'
  },
  illus_b2: {
    en: '🫘 Pulses',
    kn: '🫘 ಬೇಳೆಕಾಳುಗಳು',
    hi: '🫘 दालें'
  },
  illus_b3: {
    en: '🥜 Oilseeds',
    kn: '🥜 ಎಣ್ಣೆಕಾಳುಗಳು',
    hi: '🥜 तिलहन'
  },
  illus_b4: {
    en: '🍅 Vegetables',
    kn: '🍅 ತರಕಾರಿಗಳು',
    hi: '🍅 सब्जियाँ'
  },
  illus_b5: {
    en: '🍌 Fruits',
    kn: '🍌 ಹಣ್ಣುಗಳು',
    hi: '🍌 फल'
  },
  illus_b6: {
    en: '☕ Plantation',
    kn: '☕ ತೋಟದ ಬೆಳೆಗಳು',
    hi: '☕ बागवानी फसलें'
  },
  illus_cap: {
    en: "Karnataka's Complete Agricultural Guide<br><span>57 crops · Season-wise · District-wise</span>",
    kn: 'ಕರ್ನಾಟಕದ ಸಮಗ್ರ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ<br><span>57 ಬೆಳೆಗಳು · ಋತುವಾರು · ಜಿಲ್ಲಾವಾರು</span>',
    hi: 'कर्नाटक का संपूर्ण कृषि मार्गदर्शक<br><span>57 फसलें · ऋतु अनुसार · ज़िला अनुसार</span>'
  },

  // Page 2: Crop Selection
  p2_step_badge: {
    en: 'Step 1 of 3',
    kn: 'ಹಂತ ೧ / ೩',
    hi: 'चरण 1 / 3'
  },
  p2_title: {
    en: 'Select Your Crop',
    kn: 'ನಿಮ್ಮ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ',
    hi: 'अपनी फसल चुनें'
  },
  p2_sub: {
    en: 'Choose from 57 Karnataka-approved agro-climatic crops',
    kn: 'ಕರ್ನಾಟಕದ ಹವಾಮಾನಕ್ಕೆ ಸೂಕ್ತವಾದ 57 ಬೆಳೆಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ',
    hi: 'कर्नाटक के अनुकूल 57 फसलों में से चयन करें'
  },
  p2_search_ph: {
    en: 'Search crop by English, Kannada or Hindi name...',
    kn: 'ಬೆಳೆಯ ಹೆಸರನ್ನು ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಹುಡುಕಿ...',
    hi: 'फसल का नाम अंग्रेजी, कन्नड़ या हिंदी में खोजें...'
  },
  cat_all: { en: 'All (57)', kn: 'ಎಲ್ಲ (57)', hi: 'सभी (57)' },
  cat_c: { en: '🌾 Cereals', kn: '🌾 ಧಾನ್ಯಗಳು', hi: '🌾 अनाज' },
  cat_p: { en: '🫘 Pulses', kn: '🫘 ಬೇಳೆಕಾಳುಗಳು', hi: '🫘 दालें' },
  cat_o: { en: '🥜 Oilseeds', kn: '🥜 ಎಣ್ಣೆಕಾಳುಗಳು', hi: '🥜 तिलहन' },
  cat_n: { en: '🏭 Commercial', kn: '🏭 ವಾಣಿಜ್ಯ ಬೆಳೆ', hi: '🏭 व्यावसायिक' },
  cat_v: { en: '🥦 Vegetables', kn: '🥦 ತರಕಾರಿಗಳು', hi: '🥦 सब्जियाँ' },
  cat_f: { en: '🍎 Fruits', kn: '🍎 ಹಣ್ಣುಗಳು', hi: '🍎 फल' },
  cat_t: { en: '☕ Plantation', kn: '☕ ತೋಟದ ಬೆಳೆಗಳು', hi: '☕ बागवानी' },
  p2_no_results: {
    en: 'No crops found. Try a different search.',
    kn: 'ಯಾವುದೇ ಬೆಳೆ ಕಂಡುಬಂದಿಲ್ಲ. ಬೇರೆ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ.',
    hi: 'कोई फसल नहीं मिली। अन्य नाम से खोजें।'
  },
  p2_next_btn: {
    en: 'Next: Add Land Details →',
    kn: 'ಮುಂದೆ: ಜಮೀನಿನ ವಿವರ ಸೇರಿಸಿ →',
    hi: 'आगे: भूमि विवरण जोड़ें →'
  },

  // Page 3: Land Details
  p3_btn_back: {
    en: '← Back to Crops',
    kn: '← ಬೆಳೆಗಳ ಪಟ್ಟಿಗೆ',
    hi: '← फसलों की सूची'
  },
  p3_step_badge: {
    en: 'Step 2 of 3',
    kn: 'ಹಂತ ೨ / ೩',
    hi: 'चरण 2 / 3'
  },
  p3_title: {
    en: 'Land Details',
    kn: 'ಜಮೀನಿನ ವಿವರಗಳು',
    hi: 'भूमि विवरण'
  },
  p3_sub: {
    en: 'Provide your farm specifications to calculate precise resources and financials',
    kn: 'ನಿಖರವಾದ ಸಂಪನ್ಮೂಲ ಮತ್ತು ಹಣಕಾಸಿನ ಲೆಕ್ಕಾಚಾರಕ್ಕಾಗಿ ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರ ನೀಡಿ',
    hi: 'सटीक संसाधन व लागत गणना के लिए अपने खेत का विवरण दें'
  },
  p3_change_crop: {
    en: 'Change Crop',
    kn: 'ಬೆಳೆ ಬದಲಾಯಿಸಿ',
    hi: 'फसल बदलें'
  },
  p3_dist_lbl: {
    en: 'District *',
    kn: 'ಜಿಲ್ಲೆ *',
    hi: 'ज़िला *'
  },
  p3_soil_lbl: {
    en: 'Soil Type *',
    kn: 'ಮಣ್ಣಿನ ಪ್ರಕಾರ *',
    hi: 'मिट्टी का प्रकार *'
  },
  sel_soil_opt: {
    en: '-- Select Soil Type --',
    kn: '-- ಮಣ್ಣಿನ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ --',
    hi: '-- मिट्टी का प्रकार चुनें --'
  },
  sib_best_for: {
    en: '✅ Best for:',
    kn: '✅ ಸೂಕ್ತ ಬೆಳೆಗಳು:',
    hi: '✅ उपयुक्त फसलें:'
  },
  p3_area_lbl: {
    en: 'Land Area *',
    kn: 'ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ *',
    hi: 'भूमि का क्षेत्रफल *'
  },
  unit_acres: {
    en: 'acres',
    kn: 'ಎಕರೆ',
    hi: 'एकड़'
  },
  p3_sow_lbl: {
    en: 'Sowing / Planting Date *',
    kn: 'ಬಿತ್ತನೆ ದಿನಾಂಕ *',
    hi: 'बुवाई की तारीख *'
  },
  date_today: { en: 'Today', kn: 'ಇಂದು', hi: 'आज' },
  date_7d: { en: '+7 days', kn: '+೭ ದಿನ', hi: '+7 दिन' },
  date_14d: { en: '+14 days', kn: '+೧೪ ದಿನ', hi: '+14 दिन' },
  date_30d: { en: '+30 days', kn: '+೩೦ ದಿನ', hi: '+30 दिन' },
  p3_price_lbl: {
    en: 'Crop Selling Price (₹/qtl) *',
    kn: 'ಬೆಳೆ ಮಾರಾಟದ ಬೆಲೆ (₹/ಕ್ವಿಂಟಾಲ್) *',
    hi: 'फसल विक्रय मूल्य (₹/क्विंटल) *'
  },
  unit_per_qtl: {
    en: 'per qtl',
    kn: 'ಪ್ರತಿ ಕ್ವಿಂಟಾಲ್',
    hi: 'प्रति क्विंटल'
  },
  p3_weather_lbl: {
    en: 'Expected Weather',
    kn: 'ನಿರೀಕ್ಷಿತ ಹವಾಮಾನ',
    hi: 'अपेक्षित मौसम'
  },
  w_norm: { en: '☀️ Normal', kn: '☀️ ಸಾಮಾನ್ಯ ಮಳೆ', hi: '☀️ सामान्य मौसम' },
  w_low: { en: '🌧️ Low Rain', kn: '🌧️ ಕಡಿಮೆ ಮಳೆ', hi: '🌧️ कम बारिश' },
  w_heavy: { en: '⛈️ Heavy Rain', kn: '⛈️ ಅಧಿಕ ಮಳೆ', hi: '⛈️ भारी बारिश' },
  w_dry: { en: '🌡️ Heat Wave', kn: '🌡️ ಅತಿಯಾದ ಬಿಸಿಲು', hi: '🌡️ भीषण गर्मी' },
  p3_share_lbl: {
    en: 'Farmer Network Share:',
    kn: 'ರೈತ ನೆಟ್ವರ್ಕ್ ಪಾಲು:',
    hi: 'किसान नेटवर्क हिस्सेदारी:'
  },
  share_low: { en: 'Low Supply', kn: 'ಕಡಿಮೆ ಪೂರೈಕೆ', hi: 'कम आपूर्ति' },
  share_high: { en: 'High Supply', kn: 'ಹೆಚ್ಚು ಪೂರೈಕೆ', hi: 'अधिक आपूर्ति' },
  share_hint: {
    en: 'Higher % = more farmers growing this crop = lower mandi price pressure',
    kn: 'ಹೆಚ್ಚು % = ಹೆಚ್ಚಿನ ರೈತರು ಈ ಬೆಳೆ ಬೆಳೆಯುತ್ತಿದ್ದಾರೆ = ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಕುಸಿತದ ಸಾಧ್ಯತೆ',
    hi: 'अधिक % = अधिक किसान यह फसल उगा रहे हैं = मंडी भाव पर दबाव संभव'
  },
  ep_density: { en: 'Density', kn: 'ಸಾಂದ್ರತೆ', hi: 'घनत्व' },
  ep_water: { en: 'Water (mm)', kn: 'ನೀರು (ಮಿಮೀ)', hi: 'पानी (मिमी)' },
  ep_income: { en: 'Est. Income', kn: 'ನಿರೀಕ್ಷಿತ ಆದಾಯ', hi: 'अनुमानित आय' },
  p3_btn_generate: {
    en: '🌱 Generate My Farming Plan →',
    kn: '🌱 ನನ್ನ ಕೃಷಿ ಯೋಜನೆ ರೂಪಿಸಿ →',
    hi: '🌱 मेरी कृषि योजना तैयार करें →'
  },

  // Page 4: My Plan
  p4_btn_back: {
    en: '← Edit Land Details',
    kn: '← ಜಮೀನಿನ ವಿವರ ಬದಲಿಸಿ',
    hi: '← भूमि विवरण बदलें'
  },
  p4_plan_ready: {
    en: '✅ Your Farming Plan is Ready',
    kn: '✅ ನಿಮ್ಮ ಕೃಷಿ ಯೋಜನೆ ಸಿದ್ಧವಾಗಿದೆ',
    hi: '✅ आपकी कृषि योजना तैयार है'
  },
  p4_btn_print: {
    en: '🖨️ Print Plan',
    kn: '🖨️ ಮುದ್ರಿಸಿ (Print)',
    hi: '🖨️ प्रिंट करें'
  },
  p4_loading: {
    en: 'Generating your personalised farming plan...',
    kn: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಕೃಷಿ ಯೋಜನೆಯನ್ನು ರೂಪಿಸಲಾಗುತ್ತಿದೆ...',
    hi: 'आपकी व्यक्तिगत कृषि योजना तैयार हो रही है...'
  },
  p4_err_back: {
    en: '← Go Back',
    kn: '← ಹಿಂದೆ ಹೋಗಿ',
    hi: '← वापस जाएं'
  },
  rb_sow_lbl: { en: 'Sowing:', kn: 'ಬಿತ್ತನೆ:', hi: 'बुवाई:' },
  rb_harvest_lbl: { en: 'Expected Harvest:', kn: 'ಕೊಯ್ಲು:', hi: 'कटाई:' },
  rb_dist_lbl: { en: 'District:', kn: 'ಜಿಲ್ಲೆ:', hi: 'ज़िला:' },
  rb_soil_lbl: { en: 'Soil:', kn: 'ಮಣ್ಣು:', hi: 'मिट्टी:' },
  fin_cost_title: {
    en: 'Total Cultivation Cost',
    kn: 'ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ',
    hi: 'कुल उत्पादन लागत'
  },
  fin_cost_note: {
    en: 'Labour + Fertilizer + Seeds + Protection + Ops',
    kn: 'ಕೂಲಿ + ರಸಗೊಬ್ಬರ + ಬೀಜ + ರಕ್ಷಣೆ + ಇತರೆ',
    hi: 'मजदूरी + खाद + बीज + सुरक्षा + अन्य'
  },
  fin_total_sale_lbl: {
    en: 'Total Harvest Sale:',
    kn: 'ಒಟ್ಟು ಮಾರಾಟ ಆದಾಯ:',
    hi: 'कुल फसल बिक्री आय:'
  },
  fin_selling_title: {
    en: 'Crop Selling Price',
    kn: 'ಬೆಳೆ ಮಾರಾಟದ ಬೆಲೆ',
    hi: 'फसल विक्रय मूल्य'
  },
  fin_selling_hint: {
    en: 'Enter/change selling price to recalculate profit & loss',
    kn: 'ಮಾರಾಟ ಬೆಲೆ ನಮೂದಿಸಿ ಲಾಭ-ನಷ್ಟ ಲೆಕ್ಕ ಹಾಕಿ',
    hi: 'लाभ-हानि गणना हेतु विक्रय मूल्य दर्ज करें'
  },
  fin_profit_card_title: {
    en: 'Profit',
    kn: 'ನಿವ್ವಳ ಲಾಭ',
    hi: 'शुद्ध लाभ'
  },
  fin_profit_note: {
    en: 'Net earnings after covering all cultivation costs',
    kn: 'ಎಲ್ಲ ಕೃಷಿ ವೆಚ್ಚ ಕಳೆದು ಉಳಿಯುವ ನಿವ್ವಳ ಲಾಭ',
    hi: 'सभी खर्च निकालने के बाद शुद्ध मुनाफा'
  },
  fin_loss_title: {
    en: 'Loss',
    kn: 'ನಷ್ಟ',
    hi: 'नुकसान / हानि'
  },
  tab_res: {
    en: 'Resources & Fertilizers',
    kn: 'ಸಂಪನ್ಮೂಲ ಮತ್ತು ಗೊಬ್ಬರ',
    hi: 'संसाधन व उर्वरक'
  },
  tab_roadmap: {
    en: 'Crop Growth Roadmap',
    kn: 'ಬೆಳೆ ಬೆಳವಣಿಗೆಯ ಮಾರ್ಗಸೂಚಿ',
    hi: 'फसल वृद्धि रोडमैप'
  },
  tab_market: {
    en: 'Market Outlook',
    kn: 'ಮಾರುಕಟ್ಟೆ ಮುನ್ನೋಟ',
    hi: 'बाजार व मंडी भाव'
  },
  scs_crop_lbl: {
    en: 'Target Crop / ಬೆಳೆ ಆಯ್ಕೆ:',
    kn: 'ಗುರಿ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ:',
    hi: 'लक्षित फसल चुनें:'
  },
  scs_hint_txt: {
    en: 'Auto-identifies affected leaves or choose specific crop for targeted package',
    kn: 'ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಗುರುತಿಸುತ್ತದೆ ಅಥವಾ ನಿಖರ ಚಿಕಿತ್ಸೆಗಾಗಿ ನಿರ್ದಿಷ್ಟ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    hi: 'स्वचालित पहचान करता है या सटीक उपचार के लिए फसल चुनें'
  },
  tab_predict: {
    en: 'Disease Prediction',
    kn: 'ರೋಗ ಪತ್ತೆ (AI ಸ್ಕ್ಯಾನ್)',
    hi: 'रोग पहचान (AI स्कैन)'
  },
  predict_title: {
    en: 'AI Camera & Crop Disease Prediction',
    kn: 'AI ಕ್ಯಾಮೆರಾ ಮತ್ತು ಬೆಳೆ ರೋಗ ಪತ್ತೆ',
    hi: 'AI कैमरा और फसल रोग पहचान'
  },
  predict_sub: {
    en: 'Point live camera or upload a crop photo to detect plant diseases and get immediate treatments, or identify if a human is in frame.',
    kn: 'ಸಸ್ಯ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಮತ್ತು ತಕ್ಷಣದ ಚಿಕಿತ್ಸೆಗಳನ್ನು ಪಡೆಯಲು ಲೈವ್ ಕ್ಯಾಮೆರಾವನ್ನು ತೋರಿಸಿ ಅಥವಾ ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    hi: 'पौधों के रोगों का पता लगाने और उपचार प्राप्त करने के लिए लाइव कैमरा दिखाएं या फसल का फोटो अपलोड करें।'
  },
  btn_start_camera: {
    en: 'Start Camera',
    kn: 'ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ',
    hi: 'कैमरा शुरू करें'
  },
  btn_stop_camera: {
    en: 'Stop Camera',
    kn: 'ಕ್ಯಾಮೆರಾ ನಿಲ್ಲಿಸಿ',
    hi: 'कैमरा बंद करें'
  },
  btn_switch_camera: {
    en: 'Switch Camera',
    kn: 'ಕ್ಯಾಮೆರಾ ಬದಲಾಯಿಸಿ',
    hi: 'कैमरा बदलें'
  },
  btn_snap_camera: {
    en: 'Capture & Diagnose',
    kn: 'ಫೋಟೋ ತೆಗೆದು ಪತ್ತೆಹಚ್ಚಿ',
    hi: 'फोटो लें और जांचें'
  },
  btn_search_treatments: {
    en: 'Search Treatments',
    kn: 'ಚಿಕಿತ್ಸೆ ಹುಡುಕಿ',
    hi: 'उपचार खोजें'
  },
  btn_upload_photo: {
    en: 'Upload Crop Photo',
    kn: 'ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್',
    hi: 'फसल फोटो अपलोड करें'
  },
  vp_idle_title: {
    en: 'Live Camera or Image Upload',
    kn: 'ಲೈವ್ ಕ್ಯಾಮೆರಾ ಅಥವಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್',
    hi: 'लाइव कैमरा या फोटो अपलोड'
  },
  vp_idle_hint: {
    en: "Click 'Start Camera' for live scanner, or click here to upload a photo of a crop leaf",
    kn: "ಲೈವ್ ಸ್ಕ್ಯಾನರ್‌ಗಾಗಿ 'ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ, ಅಥವಾ ಬೆಳೆಯ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    hi: "लाइव स्कैनर के लिए 'कैमरा शुरू करें' पर क्लिक करें, या फसल की पत्ती का फोटो अपलोड करें"
  },
  scan_analyzing: {
    en: 'Analyzing Image with AI Agronomist...',
    kn: 'AI ಕೃಷಿ ತಜ್ಞರಿಂದ ಚಿತ್ರ ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    hi: 'AI कृषि विशेषज्ञ द्वारा चित्र का विश्लेषण किया जा रहा है...'
  },
  scan_analyzing_sub: {
    en: 'Checking for human subject or plant disease symptoms & treatments...',
    kn: 'ಮಾನವ ಅಥವಾ ಬೆಳೆ ರೋಗದ ಲಕ್ಷಣಗಳು ಮತ್ತು ಚಿಕಿತ್ಸೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    hi: 'मानव या पौधे की बीमारी के लक्षण और उपचार की जांच की जा रही है...'
  },
  tab_health: {
    en: 'Crop Health & Care',
    kn: 'ಬೆಳೆ ರೋಗ ಮತ್ತು ರಕ್ಷಣೆ',
    hi: 'फसल स्वास्थ्य व देखभाल'
  },
  res_seed_title: {
    en: 'Seed / Plant Requirement',
    kn: 'ಬೀಜ / ಸಸಿಗಳ ಅವಶ್ಯಕತೆ',
    hi: 'बीज / पौधे की आवश्यकता'
  },
  res_water_title: {
    en: 'Crop Water Requirement',
    kn: 'ಬೆಳೆ ನೀರಿನ ಅವಶ್ಯಕತೆ',
    hi: 'फसल की पानी की आवश्यकता'
  },
  res_water_badge: {
    en: 'Normal mm depth',
    kn: 'ಸಾಮಾನ್ಯ ಮಿಮೀ ಆಳ',
    hi: 'सामान्य मिमी गहराई'
  },
  res_water_formula: {
    en: 'Normal depth across crop duration',
    kn: 'ಬೆಳೆಯ ಅವಧಿಯ ಸಾಮಾನ್ಯ ನೀರಿನ ಪ್ರಮಾಣ',
    hi: 'फसल चक्र में कुल आवश्यक पानी'
  },
  res_fert_title: {
    en: 'Fertilizer Bag Requirements',
    kn: 'ರಸಗೊಬ್ಬರ ಚೀಲಗಳ ಲೆಕ್ಕಾಚಾರ',
    hi: 'उर्वरक बोरियों की आवश्यकता'
  },
  res_cost_title: {
    en: 'Itemized Cost Breakdown',
    kn: 'ವೆಚ್ಚದ ಸಮಗ್ರ ವಿವರ',
    hi: 'विस्तृत खर्च विवरण'
  },
  fert_advisory_lbl: {
    en: 'Application Advisory',
    kn: 'ಪೋಷಕಾಂಶ ಸಲಹೆ',
    hi: 'उर्वरक प्रयोग सलाह'
  },
  rm_main_title: {
    en: 'Crop Growth Stages & Step-by-Step Field Roadmap',
    kn: 'ಬೆಳೆ ಹಂತಗಳು ಮತ್ತು ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶಿ',
    hi: 'फसल विकास चरण व खेत कार्य रोडमैप'
  },
  rm_main_sub: {
    en: 'Sequential timeline from land preparation to harvest',
    kn: 'ಭೂಮಿ ಸಿದ್ಧತೆಯಿಂದ ಕೊಯ್ಲಿನವರೆಗೆ ಅನುಕ್ರಮ ಕಾಲಾವಧಿ',
    hi: 'खेत की तैयारी से कटाई तक का क्रमबद्ध समय'
  },
  rm_leg_ops: { en: 'Field Operations', kn: 'ಕೃಷಿ ಕಾರ್ಯಗಳು', hi: 'खेत के कार्य' },
  rm_leg_harv: { en: 'Harvest', kn: 'ಕೊಯ್ಲು', hi: 'कटाई' },
  mkt_press_title: {
    en: '📊 Price Pressure Outlook',
    kn: '📊 ಬೆಲೆ ಒತ್ತಡ ಮುನ್ನೋಟ',
    hi: '📊 मंडी भाव दबाव दृष्टिकोण'
  },
  mkt_trend_title: {
    en: '📈 5-Day APMC Price Trend (₹/qtl)',
    kn: '📈 ೫-ದಿನಗಳ ಎಪಿಎಂಸಿ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಧೋರಣೆ',
    hi: '📈 5-दिवसीय एपीएमसी मंडी भाव रुझान'
  },
  mkt_prob_title: {
    en: '🏷️ Market Outlook Probability (%)',
    kn: '🏷️ ಮಾರುಕಟ್ಟೆ ಸಾಧ್ಯತೆಯ ಶೇಕಡಾವಾರು',
    hi: '🏷️ बाजार रुझान की संभावना (%)'
  },
  mkt_balance_title: {
    en: '💰 Income vs Production Cost Balance',
    kn: '💰 ಆದಾಯ ಮತ್ತು ವೆಚ್ಚದ ಹೋಲಿಕೆ',
    hi: '💰 आय व उत्पादन खर्च संतुलन'
  },
  dbb_title: {
    en: 'Crop Disease Library & Treatment Advisory',
    kn: 'ಬೆಳೆ ರೋಗ ಮತ್ತು ಚಿಕಿತ್ಸಾ ಕೈಪಿಡಿ',
    hi: 'फसल रोग व उपचार संदर्शिका'
  },
  dbb_sub: {
    en: 'Browse verified diseases, symptoms, and exact treatments for your selected crop or switch to any Karnataka crop',
    kn: 'ನಿಮ್ಮ ಬೆಳೆಗೆ ಬರುವ ರೋಗಗಳು, ಲಕ್ಷಣಗಳು ಮತ್ತು ವಿಶ್ವವಿದ್ಯಾಲಯ ಪ್ರಮಾಣಿತ ಚಿಕಿತ್ಸೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ',
    hi: 'अपनी फसल के रोग, लक्षण और सटीक उपचार देखें या कर्नाटक की किसी भी फसल को चुनें'
  },
  dbb_crop_lbl: { en: 'Selected Crop:', kn: 'ಆಯ್ಕೆಮಾಡಿದ ಬೆಳೆ:', hi: 'चयनित फसल:' },
  dbb_search_ph: {
    en: '🔍 Search disease or treatment...',
    kn: '🔍 ರೋಗ ಅಥವಾ ಚಿಕಿತ್ಸೆಯನ್ನು ಹುಡುಕಿ...',
    hi: '🔍 रोग या उपचार खोजें...'
  },
  cdb_count_txt: {
    en: 'Showing verified diseases with chemical and organic treatments',
    kn: 'ರಾಸಾಯನಿಕ ಮತ್ತು ಸಾವಯವ ಚಿಕಿತ್ಸೆಗಳ ಸಮಗ್ರ ಮಾಹಿತಿ',
    hi: 'रासायनिक व जैविक उपचार के साथ रोग जानकारी'
  },
  p4_connect_h4: {
    en: 'Want to connect with other farmers?',
    kn: 'ಇತರ ಪ್ರಗತಿಪರ ರೈತರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಲು ಬಯಸುವಿರಾ?',
    hi: 'क्या आप अन्य अनुभवी किसानों से जुड़ना चाहते हैं?'
  },
  p4_connect_p: {
    en: 'Share knowledge and ask advice from experienced farmers in your district.',
    kn: 'ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಅನುಭವಿ ರೈತರಿಂದ ಸಲಹೆ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ ಪಡೆಯಿರಿ.',
    hi: 'अपने ज़िले के अनुभवी किसानों से सलाह और अनुभव साझा करें।'
  },
  p4_btn_comm: {
    en: '👥 Open Farmer Community Network →',
    kn: '👥 ರೈತ ಸಮುದಾಯ ಜಾಲಕ್ಕೆ ಭೇಟಿ ನೀಡಿ →',
    hi: '👥 किसान समुदाय नेटवर्क खोलें →'
  },

  // Page 5: Farmer Community & DBT
  p5_btn_back: {
    en: '← Back to My Plan',
    kn: '← ನನ್ನ ಯೋಜನೆಗೆ ಮರಳಿ',
    hi: '← मेरी योजना पर वापस'
  },
  p5_step_badge: {
    en: 'Karnataka Farmer Network',
    kn: 'ಕರ್ನಾಟಕ ರೈತ ಜಾಲ',
    hi: 'कर्नाटक किसान नेटवर्क'
  },
  p5_title: {
    en: 'Farmer Community Network',
    kn: 'ರೈತ ಸಮುದಾಯ ಜಾಲ',
    hi: 'किसान समुदाय नेटवर्क'
  },
  p5_sub: {
    en: "Connect and share practical farming advice with experienced growers across Karnataka's 31 districts",
    kn: 'ಕರ್ನಾಟಕದ 31 ಜಿಲ್ಲೆಗಳ ಅನುಭವಿ ಪ್ರಗತಿಪರ ರೈತರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ ಸಾಧಿಸಿ',
    hi: 'कर्नाटक के 31 ज़िलों के अनुभवी किसानों से जुड़ें और सलाह साझा करें'
  },
  pass_title: {
    en: 'KrishiPath Farmer Contact Pass',
    kn: 'ಕೃಷಿಪಥ ರೈತ ಸಂಪರ್ಕ ಪಾಸ್',
    hi: 'कृषिपथ किसान संपर्क पास'
  },
  pass_sub: {
    en: 'Protecting Karnataka farmers from spam. Phone numbers are masked for privacy.',
    kn: 'ರೈತರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಲಾಗಿದೆ. ವಂಚನೆ ತಡೆಗಟ್ಟಲು ಗೌಪ್ಯತೆ ಕಾಯ್ದುಕೊಳ್ಳಲಾಗಿದೆ.',
    hi: 'किसानों की गोपनीयता सुरक्षा हेतु मोबाइल नंबर सुरक्षित रखे गए हैं।'
  },
  pass_p1: { en: '✓ Verified progressive growers', kn: '✓ ಪ್ರಮಾಣೀಕೃತ ಪ್ರಗತಿಪರ ರೈತರು', hi: '✓ सत्यापित प्रगतिशील किसान' },
  pass_p2: { en: '✓ Direct phone calling', kn: '✓ ನೇರ ಫೋನ್ ಕರೆ ಸೌಲಭ್ಯ', hi: '✓ सीधे फोन कॉल सुविधा' },
  pass_p3: { en: '✓ WhatsApp advisory support', kn: '✓ ವಾಟ್ಸಾಪ್ ಸಲಹಾ ಬೆಂಬಲ', hi: '✓ व्हाट्सएप सलाह सहायता' },
  pass_btn_activate: {
    en: '⚡ Activate Contact Pass (Free Trial / ₹99)',
    kn: '⚡ ಸಂಪರ್ಕ ಪಾಸ್ ಸಕ್ರಿಯಗೊಳಿಸಿ (ಉಚಿತ / ₹99)',
    hi: '⚡ संपर्क पास सक्रिय करें (निःशुल्क ट्रायल / ₹99)'
  },
  pass_btn_remask: {
    en: '🔒 Re-mask Numbers',
    kn: '🔒 ಸಂಖ್ಯೆಗಳನ್ನು ಮರೆಮಾಡಿ',
    hi: '🔒 नंबर छुपाएं'
  },
  wallet_card_title: {
    en: 'Farmer Commission & Bank Payout Wallet',
    kn: 'ರೈತ ಕಮಿಷನ್ ಮತ್ತು ಬ್ಯಾಂಕ್ ಪಾವತಿ ವಾಲೆಟ್',
    hi: 'किसान कमीशन व बैंक भुगतान वॉलेट'
  },
  wallet_card_sub: {
    en: 'Earn ₹100 instant DBT grant on joining + ₹25 direct commission for every referred farmer!',
    kn: 'ಸೇರ್ಪಡೆಗೊಂಡಾಗ ನೇರ ₹100 ಬ್ಯಾಂಕ್ ಜಮೆ + ಪ್ರತಿ ರೈತ ಶಿಫಾರಸಿಗೆ ₹25 ನೇರ ಕಮಿಷನ್!',
    hi: 'जुड़ने पर पाएं ₹100 सीधा बैंक अनुदान + प्रत्येक किसान रेफरल पर ₹25 कमीशन!'
  },
  wg_lbl_wallet: { en: 'Your Wallet', kn: 'ನಿಮ್ಮ ವಾಲೆಟ್', hi: 'आपका वॉलेट' },
  wg_lbl_code: { en: 'Your Referral Code', kn: 'ನಿಮ್ಮ ರೆಫರಲ್ ಕೋಡ್', hi: 'आपका रेफरल कोड' },
  wg_lbl_rate: { en: 'Commission Rate', kn: 'ಕಮಿಷನ್ ದರ', hi: 'कमीशन दर' },
  wg_val_rate: { en: '₹25 / Referral', kn: '₹25 / ಪ್ರತಿ ರೈತರಿಗೆ', hi: '₹25 / रेफरल' },
  btn_copy_ref: {
    en: '📋 Copy Referral Code',
    kn: '📋 ರೆಫರಲ್ ಕೋಡ್ ಕಾಪಿ ಮಾಡಿ',
    hi: '📋 रेफरल कोड कॉपी करें'
  },
  lbc_status_active: { en: '✅ DBT Active', kn: '✅ ಡಿಬಿಟಿ ಸಕ್ರಿಯ', hi: '✅ डीबीटी सक्रिय' },
  btn_withdraw_txt: {
    en: '💸 Withdraw to Bank',
    kn: '💸 ಬ್ಯಾಂಕ್‌ಗೆ ವರ್ಗಾಯಿಸಿ',
    hi: '💸 बैंक में निकालें'
  },
  cf_banner_dbt: {
    en: '🎁 <strong>Instant Bank Deposit:</strong> Enter your bank details below to receive an official <strong>₹100 DBT Grant</strong> directly into your bank account!',
    kn: '🎁 <strong>ನೇರ ಬ್ಯಾಂಕ್ ಜಮೆ:</strong> ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ವಿವರ ನಮೂದಿಸಿ, ಸರ್ಕಾರಿ ಮಾದರಿಯ <strong>₹100 ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT)</strong> ಅನುದಾನವನ್ನು ತಕ್ಷಣ ನಿಮ್ಮ ಖಾತೆಗೆ ಪಡೆಯಿರಿ!',
    hi: '🎁 <strong>तत्काल बैंक ट्रांसफर:</strong> नीचे अपना बैंक विवरण दर्ज करें और सीधे अपने बैंक खाते में <strong>₹100 का डीबीटी अनुदान</strong> प्राप्त करें!'
  },
  comm_form_title: {
    en: '🌱 + Join Karnataka Farmer Network & Bank DBT',
    kn: '🌱 + ಕರ್ನಾಟಕ ರೈತ ಜಾಲ ಮತ್ತು ಡಿಬಿಟಿ ಸೇರ್ಪಡೆ',
    hi: '🌱 + कर्नाटक किसान नेटवर्क व डीबीटी में जुड़ें'
  },
  comm_form_sub: {
    en: 'List your farm experience so neighbouring farmers can exchange crop advice.',
    kn: 'ನಿಮ್ಮ ಕೃಷಿ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ, ನೆರೆಹೊರೆಯ ರೈತರಿಂದ ಸಲಹೆ ವಿನಿಮಯ ಮಾಡಿಕೊಳ್ಳಿ.',
    hi: 'अपना कृषि अनुभव जोड़ें ताकि साथी किसान आपसे सलाह ले सकें।'
  },
  cf_name_lbl: { en: 'Farmer Name *', kn: 'ರೈತರ ಹೆಸರು *', hi: 'किसान का नाम *' },
  cf_name_ph: { en: 'Your full name', kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು', hi: 'आपका पूरा नाम' },
  cf_phone_lbl: { en: 'Mobile Number *', kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ *', hi: 'मोबाइल नंबर *' },
  cf_phone_ph: { en: '10-digit mobile number', kn: '10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ', hi: '10 अंकों का मोबाइल नंबर' },
  cf_dist_lbl: { en: 'District *', kn: 'ಜಿಲ್ಲೆ *', hi: 'ज़िला *' },
  cf_crop_lbl: { en: 'Main Crop Grown *', kn: 'ಮುಖ್ಯ ಬೆಳೆ *', hi: 'मुख्य फसल *' },
  sel_crop_opt: { en: '-- Select Crop --', kn: '-- ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ --', hi: '-- फसल चुनें --' },
  cf_years_lbl: { en: 'Years of Farming Experience', kn: 'ಕೃಷಿ ಅನುಭವ (ವರ್ಷಗಳು)', hi: 'खेती का अनुभव (वर्ष)' },
  cf_bank_title: {
    en: 'Direct Benefit Transfer (DBT) Bank Account',
    kn: 'ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ',
    hi: 'प्रत्यक्ष लाभ अंतरण (DBT) बैंक खाता विवरण'
  },
  cf_bank_sub: {
    en: 'Enter your bank details to receive ₹100 instant welcome grant directly to your bank account.',
    kn: 'ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನೇರವಾಗಿ ₹100 ಸ್ವಾಗತ ಅನುದಾನ ಪಡೆಯಲು ಬ್ಯಾಂಕ್ ವಿವರ ನಮೂದಿಸಿ.',
    hi: 'सीधे अपने बैंक खाते में ₹100 स्वागत अनुदान पाने के लिए बैंक विवरण दर्ज करें।'
  },
  cf_bank_name_lbl: { en: 'Bank Name *', kn: 'ಬ್ಯಾಂಕ್ ಹೆಸರು *', hi: 'बैंक का नाम *' },
  cf_acc_lbl: { en: 'Bank Account Number *', kn: 'ಬ್ಯಾಂಕ್ ಖಾತೆ ಸಂಖ್ಯೆ *', hi: 'बैंक खाता संख्या *' },
  cf_acc_ph: { en: 'e.g. 102938475612', kn: 'ಉದಾ: 102938475612', hi: 'उदा: 102938475612' },
  cf_ifsc_lbl: { en: 'Bank IFSC Code *', kn: 'ಬ್ಯಾಂಕ್ ಐ.ಎಫ್.ಎಸ್.ಸಿ ಕೋಡ್ *', hi: 'बैंक आईएफएससी कोड *' },
  cf_ifsc_ph: { en: 'e.g. CNRB0001234 or SBIN0040123', kn: 'ಉದಾ: CNRB0001234 ಅಥವಾ SBIN0040123', hi: 'उदा: CNRB0001234 या SBIN0040123' },
  cf_upi_lbl: { en: 'UPI ID / PhonePe / GPay (Optional)', kn: 'ಯುಪಿಐ ಐಡಿ (ಐಚ್ಛಿಕ)', hi: 'यूपीआई आईडी (वैकल्पिक)' },
  cf_upi_ph: { en: 'e.g. 9845012345@upi', kn: 'ಉದಾ: 9845012345@upi', hi: 'उदा: 9845012345@upi' },
  cf_consent_txt: {
    en: 'I consent to share my name and phone with other farmers on this Karnataka portal.',
    kn: 'ಈ ಕರ್ನಾಟಕ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಇತರ ರೈತರೊಂದಿಗೆ ನನ್ನ ಹೆಸರು ಮತ್ತು ಫೋನ್ ಸಂಖ್ಯೆ ಹಂಚಿಕೊಳ್ಳಲು ಒಪ್ಪುತ್ತೇನೆ.',
    hi: 'मैं इस कर्नाटक पोर्टल पर अन्य किसानों के साथ अपना नाम व फोन साझा करने की सहमति देता हूँ।'
  },
  cf_btn_submit: {
    en: '🌾 Join Karnataka Network & Transfer ₹100 to My Bank',
    kn: '🌾 ರೈತ ಜಾಲ ಸೇರಿ ಮತ್ತು ₹100 ಅನ್ನು ನನ್ನ ಬ್ಯಾಂಕ್‌ಗೆ ಜಮೆ ಮಾಡಿ',
    hi: '🌾 किसान नेटवर्क से जुड़ें और ₹100 अपने बैंक में प्राप्त करें'
  },
  comm_dir_title: {
    en: 'Registered Progressive Farmers',
    kn: 'ನೋಂದಾಯಿತ ಪ್ರಗತಿಪರ ರೈತರು',
    hi: 'पंजीकृत प्रगतिशील किसान'
  },
  comm_dir_sub: {
    en: 'Popular progressive farmers and peers across Karnataka',
    kn: 'ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಪ್ರಗತಿಪರ ರೈತರು ಮತ್ತು ಮಾರ್ಗದರ್ಶಕರು',
    hi: 'कर्नाटक के प्रमुख प्रगतिशील किसान व मार्गदर्शक'
  },
  fl_filter_all: {
    en: 'All Karnataka Districts',
    kn: 'ಎಲ್ಲ ಕರ್ನಾಟಕ ಜಿಲ್ಲೆಗಳು',
    hi: 'कर्नाटक के सभी ज़िले'
  },
  fl_loading: {
    en: 'Loading farmer listings...',
    kn: 'ರೈತರ ಪಟ್ಟಿಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    hi: 'किसानों की सूची लोड हो रही है...'
  },

  // Modals: Subscription
  sub_modal_title: {
    en: 'Unlock Farmer Contact Pass',
    kn: 'ರೈತ ಸಂಪರ್ಕ ಪಾಸ್ ಅನ್‌ಲಾಕ್ ಮಾಡಿ',
    hi: 'किसान संपर्क पास अनलॉक करें'
  },
  sub_modal_desc: {
    en: 'Get direct phone and WhatsApp access to verified Karnataka progressive farmers, agricultural university awardees, and local mentors.',
    kn: 'ಕರ್ನಾಟಕದ ಪ್ರಗತಿಪರ ರೈತರು ಮತ್ತು ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ ಪ್ರಶಸ್ತಿ ವಿಜೇತರೊಂದಿಗೆ ನೇರ ಫೋನ್ ಮತ್ತು ವಾಟ್ಸಾಪ್ ಸಂಪರ್ಕ ಪಡೆಯಿರಿ.',
    hi: 'कर्नाटक के प्रगतिशील किसानों व कृषि विशेषज्ञों से सीधे फोन और व्हाट्सएप पर संपर्क करें।'
  },
  po_badge_popular: { en: 'Popular', kn: 'ಜನಪ್ರಿಯ', hi: 'लोकप्रिय' },
  po_title_pass: { en: 'Farmer Community Pass', kn: 'ರೈತ ಸಮುದಾಯ ಪಾಸ್', hi: 'किसान समुदाय पास' },
  po_free_tag: { en: 'Free Trial Pass', kn: 'ಉಚಿತ ಪ್ರಾಯೋಗಿಕ ಪಾಸ್', hi: 'निःशुल्क ट्रायल पास' },
  po_l1: { en: '✓ 100% Unmasked Direct Phone Numbers', kn: '✓ 100% ಮುಕ್ತ ನೇರ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಗಳು', hi: '✓ 100% पूर्ण प्रत्यक्ष मोबाइल नंबर' },
  po_l2: { en: '✓ One-tap Calling to 15+ Progressive Farmers', kn: '✓ 15+ ಪ್ರಗತಿಪರ ರೈತರಿಗೆ ಏಕ-ಸ್ಪರ್ಶ ಕರೆ', hi: '✓ 15+ प्रगतिशील किसानों को वन-टैप कॉलिंग' },
  po_l3: { en: '✓ WhatsApp Direct Agri Advisory', kn: '✓ ವಾಟ್ಸಾಪ್ ನೇರ ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ', hi: '✓ व्हाट्सएप सीधा कृषि मार्गदर्शन' },
  po_l4: { en: '✓ Karnataka Organic & High-Yield Mentors', kn: '✓ ಸಾವಯವ ಹಾಗೂ ಅಧಿಕ ಇಳುವರಿ ತಜ್ಞರು', hi: '✓ जैविक व उन्नत पैदावार मार्गदर्शक' },
  sub_modal_activate: {
    en: '🔓 Activate Contact Pass Instantly',
    kn: '🔓 ಸಂಪರ್ಕ ಪಾಸ್ ತಕ್ಷಣ ಸಕ್ರಿಯಗೊಳಿಸಿ',
    hi: '🔓 तुरंत संपर्क पास सक्रिय करें'
  },

  // Modals: DBT Receipt
  dbt_modal_title: {
    en: 'Government of Karnataka · DBT Payment Receipt',
    kn: 'ಕರ್ನಾಟಕ ಸರ್ಕಾರ · ಡಿಬಿಟಿ ಪಾವತಿ ರಶೀದಿ',
    hi: 'कर्नाटक सरकार · डीबीटी भुगतान रसीद'
  },
  dbt_modal_sub: {
    en: 'Direct Benefit Transfer Official Payment Advice',
    kn: 'ಕೃಷಿ ಇಲಾಖೆ ನೇರ ನಗದು ವರ್ಗಾವಣೆ ಅಧಿಕೃತ ರಶೀದಿ',
    hi: 'कृषि विभाग प्रत्यक्ष लाभ अंतरण आधिकारिक रसीद'
  },
  dbt_status_tag: {
    en: 'CREDITED TO BANK ACCOUNT',
    kn: 'ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗಿದೆ',
    hi: 'बैंक खाते में सफलतापूर्वक जमा'
  },
  dr_utr: { en: 'Transaction UTR Ref:', kn: 'ವಹಿವಾಟು ಯುಟಿಆರ್ ಉಲ್ಲೇಖ:', hi: 'लेन-देन यूटीआर संदर्भ:' },
  dr_holder: { en: 'Beneficiary Name:', kn: 'ಫಲಾನುಭವಿಯ ಹೆಸರು:', hi: 'लाभार्थी का नाम:' },
  dr_bank: { en: 'Bank Name:', kn: 'ಬ್ಯಾಂಕ್ ಹೆಸರು:', hi: 'बैंक का नाम:' },
  dr_acc: { en: 'Account Number:', kn: 'ಖಾತೆ ಸಂಖ್ಯೆ:', hi: 'खाता संख्या:' },
  dr_ifsc: { en: 'IFSC Code:', kn: 'ಐಎಫ್‌ಎಸ್‌ಸಿ ಕೋಡ್:', hi: 'आईएफएससी कोड:' },
  dr_time: { en: 'Transfer Timestamp:', kn: 'ವರ್ಗಾವಣೆ ಸಮಯ:', hi: 'स्थानांतरण समय:' },
  dr_scheme: { en: 'Scheme / Purpose:', kn: 'ಯೋಜನೆ / ಉದ್ದೇಶ:', hi: 'योजना / प्रयोजन:' },
  dr_scheme_val: {
    en: 'KrishiPath Progressive Farmer Community Grant',
    kn: 'ಕೃಷಿಪಥ ಪ್ರಗತಿಪರ ರೈತ ಸಮುದಾಯ ಅನುದಾನ',
    hi: 'कृषिपथ प्रगतिशील किसान समुदाय अनुदान'
  },
  dbt_note: {
    en: '💡 This amount has been credited directly to your registered bank account via RTGS/NEFT/IMPS DBT gateway. Any subsequent referral earnings (₹25/referral) can also be transferred to this bank account instantly.',
    kn: '💡 ಈ ಮೊತ್ತವನ್ನು ನಿಮ್ಮ ನೋಂದಾಯಿತ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ನೇರವಾಗಿ ಡಿಬಿಟಿ ಮೂಲಕ ಜಮೆ ಮಾಡಲಾಗಿದೆ. ಮುಂದಿನ ಯಾವುದೇ ರೆಫರಲ್ ಕಮಿಷನ್ ಮೊತ್ತವನ್ನು (₹25/ರೆಫರಲ್) ಕೂಡ ಇದೇ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆ ಮಾಡಿಕೊಳ್ಳಬಹುದು.',
    hi: '💡 यह राशि आपके पंजीकृत बैंक खाते में डीबीटी के माध्यम से सीधे जमा कर दी गई है। इसके बाद होने वाली रेफरल आय (₹25/रेफरल) भी इसी खाते में निकाली जा सकती है।'
  },
  dbt_close: { en: '✓ Done', kn: '✓ ಮುಕ್ತಾಯ', hi: '✓ संपन्न' },
  dbt_print: { en: '🖨️ Print Receipt', kn: '🖨️ ರಶೀದಿ ಮುದ್ರಿಸಿ', hi: '🖨️ रसीद प्रिंट करें' }
};

// Apply translations across all [data-k] and [data-k-placeholder] elements
function tx() {
  $$('[data-k]').forEach(el => {
    const k = el.dataset.k;
    if (STRINGS[k] && STRINGS[k][LN] !== undefined) {
      el.innerHTML = STRINGS[k][LN];
    }
  });

  $$('[data-k-placeholder]').forEach(el => {
    const k = el.dataset.kPlaceholder;
    if (STRINGS[k] && STRINGS[k][LN] !== undefined) {
      el.placeholder = STRINGS[k][LN];
    }
  });
}

// Language switcher
function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'kn' && lang !== 'hi') lang = 'en';
  LN = lang;
  localStorage.setItem('kp_lang', lang);

  // Toggle active button style
  const le = $('#le'); if (le) le.classList.toggle('on', lang === 'en');
  const lk = $('#lk'); if (lk) lk.classList.toggle('on', lang === 'kn');
  const lh = $('#lh'); if (lh) lh.classList.toggle('on', lang === 'hi');

  // Translate all marked elements
  tx();

  // Update dynamic elements
  if (CR && CR.length > 0) {
    renderCropGrid(getFilteredCrops());
    if (sel !== null && CR[sel]) {
      const crop = CR[sel];
      const info = $('#p2-selected-info');
      if (info && info.style.display !== 'none') {
        $('#p2-sel-name').textContent = getCropName(crop);
        const catLabel = CAT_LABELS[crop.cat] ? (CAT_LABELS[crop.cat][LN] || CAT_LABELS[crop.cat].en) : '';
        const daysLabel = LN === 'kn' ? 'ದಿನಗಳು' : LN === 'hi' ? 'दिन' : 'days';
        $('#p2-sel-tag').textContent = `${crop.days} ${daysLabel} · ${catLabel}`;
      }
      updateP3CropBanner(crop);
    }
  }

  // Update Plan if already generated
  if (PlanData) {
    renderPlan(PlanData);
  }

  // Update Farmer network UI
  updateSubscriptionUI();
  updateWalletUI();
}

// =====================================================================
// PAGE NAVIGATION & ACCESS CONTROL (Login Gate)
// =====================================================================
function goPage(id) {
  const user = localStorage.getItem('kp_user');
  // Access control: Non-logged in users CANNOT access pages other than login (p1)
  if (!user && id !== 'p1') {
    id = 'p1';
  }

  $$('.page').forEach(p => p.classList.remove('active'));
  const pg = $('#' + id);
  if (pg) {
    pg.classList.add('active');
    window.scrollTo(0, 0);
  }
  
  // Highlight active nav item
  $$('#main-nav a').forEach(a => a.classList.remove('active'));
  const navA = $('#nav-' + id);
  if (navA) navA.classList.add('active');

  if (id === 'p2' && CR.length === 0) loadCrops();
  if (id === 'p4' && !PlanData) goPage('p3');
  if (id === 'p5') {
    loadFarmers('');
    // prefill district and crop if available
    const savedDist = localStorage.getItem('kp_district') || (PlanData ? PlanData.district : '');
    if (savedDist && $('#cf-district')) $('#cf-district').value = savedDist;
    if (PlanData && $('#cf-crop')) {
      const cropName = (CR[PlanData.crop.id] || PlanData.crop).en;
      $('#cf-crop').value = cropName;
    }
  }
}

// =====================================================================
// PAGE 1: LOGIN & AUTH
// =====================================================================
function initLogin() {
  const user = localStorage.getItem('kp_user');
  const dist = localStorage.getItem('kp_district');
  if (user) {
    showUserInHeader(user);
    if (dist && $('#lf-district')) {
      $('#lf-district').value = dist;
    }
    goPage('p2');
  } else {
    // Hide navigation until user logs in
    const mainNav = $('#main-nav');
    if (mainNav) mainNav.style.display = 'none';
    const logoutBtn = $('#logout-btn');
    if (logoutBtn) logoutBtn.style.display = 'none';
    const userGreeting = $('#user-greeting');
    if (userGreeting) userGreeting.style.display = 'none';
    goPage('p1');
  }

  loadMeta().then(() => {
    const selEl = $('#login-district');
    if (selEl && selEl.options.length <= 1) {
      DISTRICTS.forEach(d => {
        const o = document.createElement('option');
        o.value = o.textContent = d;
        selEl.appendChild(o);
      });
    }
    if (dist && $('#login-district')) {
      $('#login-district').value = dist;
    }
  });

  const inp = $('#login-email') || $('#login-name');
  const distSel = $('#login-district');
  if (inp) {
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    inp.addEventListener('blur', async () => {
      const email = inp.value.trim().toLowerCase();
      if (!email) return;
      const accounts = JSON.parse(localStorage.getItem('kp_accounts') || '{}');
      if (accounts[email] && accounts[email].district) {
        if (distSel && (!distSel.value || distSel.value === '')) distSel.value = accounts[email].district;
      } else {
        try {
          const r = await fetch(`/api/auth/check?email=${encodeURIComponent(email)}`);
          const d = await r.json();
          if (d.exists && d.district && distSel && (!distSel.value || distSel.value === '')) {
            distSel.value = d.district;
          }
        } catch(e) {}
      }
    });
  }
  const pwdInp = $('#login-password');
  if (pwdInp) {
    pwdInp.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  }
  if (distSel) {
    distSel.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  }
}

function togglePasswordVisibility() {
  const pwd = $('#login-password');
  const btn = $('#toggle-pwd-btn');
  if (!pwd) return;
  if (pwd.type === 'password') {
    pwd.type = 'text';
    if (btn) btn.textContent = '🙈';
  } else {
    pwd.type = 'password';
    if (btn) btn.textContent = '👁️';
  }
}

async function doLogin() {
  const emailInp = $('#login-email') || $('#login-name');
  const email = (emailInp ? emailInp.value : '').trim().toLowerCase();
  const pwdInp = $('#login-password');
  const pwd = (pwdInp ? pwdInp.value : '').trim();
  const distSel = $('#login-district');
  const dist = (distSel ? distSel.value : '').trim();
  const err = $('#login-err');

  // Validate Gmail / User ID
  if (!email) {
    if (err) {
      err.style.display = 'block';
      err.textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ User ID / Gmail ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.' :
                        LN === 'hi' ? 'कृपया अपना User ID / Gmail पता दर्ज करें।' :
                        'Please enter your User ID / Gmail address.';
    }
    if (emailInp) emailInp.focus();
    return;
  }

  // Validate that the user entered a valid Gmail format (e.g. name@gmail.com)
  const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
  const isGeneralEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  if (!isGmail && !isGeneralEmail) {
    if (err) {
      err.style.display = 'block';
      err.textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ Gmail ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ (ಉದಾ: farmer@gmail.com).' :
                        LN === 'hi' ? 'कृपया एक वैध Gmail पता दर्ज करें (उदा: farmer@gmail.com)।' :
                        'Please enter a valid Gmail address (e.g. farmer@gmail.com).';
    }
    if (emailInp) emailInp.focus();
    return;
  }

  // Validate Password
  if (!pwd) {
    if (err) {
      err.style.display = 'block';
      err.textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' :
                        LN === 'hi' ? 'कृपया अपना पासवर्ड दर्ज करें।' :
                        'Please enter your password.';
    }
    if (pwdInp) pwdInp.focus();
    return;
  }

  if (pwd.length < 4) {
    if (err) {
      err.style.display = 'block';
      err.textContent = LN === 'kn' ? 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.' :
                        LN === 'hi' ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' :
                        'Password must be at least 4 characters long.';
    }
    if (pwdInp) pwdInp.focus();
    return;
  }

  // Check local cache for fixed password check
  const accounts = JSON.parse(localStorage.getItem('kp_accounts') || '{}');
  const localAccount = accounts[email];
  if (localAccount && localAccount.password && localAccount.password !== pwd) {
    if (err) {
      err.style.display = 'block';
      err.textContent = LN === 'kn' ? 'ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್. ಈ Gmail ಖಾತೆಗೆ ನಿಗದಿಪಡಿಸಿದ ಸರಿಯಾದ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' :
                        LN === 'hi' ? 'गलत पासवर्ड। कृपया इस Gmail खाते के लिए तय किया गया सही पासवर्ड दर्ज करें।' :
                        'Incorrect password. Please enter the correct password set for this Gmail account.';
    }
    if (pwdInp) pwdInp.focus();
    return;
  }

  // Validate District selection (if not already set for this account)
  const finalDistrict = dist || (localAccount ? localAccount.district : '');
  if (!finalDistrict) {
    if (err) {
      err.style.display = 'block';
      err.textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' :
                        LN === 'hi' ? 'कृपया अपना ज़िला चुनें।' :
                        'Please select your district.';
    }
    if (distSel) distSel.focus();
    return;
  }

  // Check and persist with backend SQLite DB
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd, district: finalDistrict })
    });
    const data = await res.json();
    if (!res.ok) {
      if (err) {
        err.style.display = 'block';
        if (data.error === 'INCORRECT_PASSWORD') {
          err.textContent = LN === 'kn' ? 'ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್. ಈ Gmail ಖಾತೆಗೆ ನಿಗದಿಪಡಿಸಿದ ಸರಿಯಾದ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' :
                            LN === 'hi' ? 'गलत पासवर्ड। कृपया इस Gmail खाते के लिए तय किया गया सही पासवर्ड दर्ज करें।' :
                            'Incorrect password. Please enter the correct password set for this Gmail account.';
        } else {
          err.textContent = data.error || data.message || 'Login failed.';
        }
      }
      if (pwdInp) pwdInp.focus();
      return;
    }
    // Update local accounts store
    accounts[email] = { password: pwd, district: data.district || finalDistrict };
    localStorage.setItem('kp_accounts', JSON.stringify(accounts));
  } catch(e) {
    // Fallback to local accounts storage
    if (localAccount) {
      if (localAccount.password !== pwd) {
        if (err) {
          err.style.display = 'block';
          err.textContent = LN === 'kn' ? 'ತಪ್ಪಾದ ಪಾಸ್‌ವರ್ಡ್. ಈ Gmail ಖಾತೆಗೆ ನಿಗದಿಪಡಿಸಿದ ಸರಿಯಾದ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.' :
                            LN === 'hi' ? 'गलत पासवर्ड। कृपया इस Gmail खाते के लिए तय किया गया सही पासवर्ड दर्ज करें।' :
                            'Incorrect password. Please enter the correct password set for this Gmail account.';
        }
        if (pwdInp) pwdInp.focus();
        return;
      }
    } else {
      accounts[email] = { password: pwd, district: finalDistrict };
      localStorage.setItem('kp_accounts', JSON.stringify(accounts));
    }
  }

  if (err) err.style.display = 'none';

  localStorage.setItem('kp_user', email);
  localStorage.setItem('kp_email', email);
  localStorage.setItem('kp_district', finalDistrict);
  showUserInHeader(email);
  if ($('#lf-district')) { $('#lf-district').value = finalDistrict; }
  goPage('p2');
}

function doLogout() {
  localStorage.removeItem('kp_user');
  localStorage.removeItem('kp_email');
  localStorage.removeItem('kp_district');
  const greeting = $('#user-greeting');
  if (greeting) greeting.style.display = 'none';
  const logoutBtn = $('#logout-btn');
  if (logoutBtn) logoutBtn.style.display = 'none';
  const mainNav = $('#main-nav');
  if (mainNav) mainNav.style.display = 'none';
  const emailInp = $('#login-email') || $('#login-name');
  if (emailInp) emailInp.value = '';
  const pwdInp = $('#login-password');
  if (pwdInp) pwdInp.value = '';
  const distSel = $('#login-district');
  if (distSel) distSel.value = '';
  const err = $('#login-err');
  if (err) err.style.display = 'none';
  goPage('p1');
}

function showUserInHeader(name) {
  const g = $('#user-greeting');
  if (g) {
    g.textContent = '👤 ' + name;
    g.style.display = '';
  }
  const logoutBtn = $('#logout-btn');
  if (logoutBtn) logoutBtn.style.display = '';
  const mainNav = $('#main-nav');
  if (mainNav) mainNav.style.display = 'flex';
}

// =====================================================================
// META / DISTRICTS / SOILS
// =====================================================================
async function loadMeta() {
  if (DISTRICTS.length > 0) return;
  try {
    const r = await fetch('/api/meta');
    const d = await r.json();
    DISTRICTS = d.districts || [];
    SOILS = d.soils || [];
    populateAllDropdowns();
  } catch(e) { console.warn('Meta load error', e); }
}

function populateAllDropdowns() {
  const distKannada = {
    "Bagalkote": "ಬಾಗಲಕೋಟೆ", "Ballari": "ಬಳ್ಳಾರಿ", "Belagavi": "ಬೆಳಗಾವಿ",
    "Bengaluru Rural": "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ", "Bengaluru Urban": "ಬೆಂಗಳೂರು ನಗರ",
    "Bidar": "ಬೀದರ್", "Chamarajanagar": "ಚಾಮರಾಜನಗರ", "Chikkaballapur": "ಚಿಕ್ಕಬಳ್ಳಾಪುರ",
    "Chikkamagaluru": "ಚಿಕ್ಕಮಗಳೂರು", "Chitradurga": "ಚಿತ್ರದುರ್ಗ",
    "Dakshina Kannada": "ದಕ್ಷಿಣ ಕನ್ನಡ", "Davanagere": "ದಾವಣಗೆರೆ", "Dharwad": "ಧಾರವಾಡ",
    "Gadag": "ಗದಗ", "Hassan": "ಹಾಸನ", "Haveri": "ಹಾವೇರಿ", "Kalaburagi": "ಕಲಬುರಗಿ",
    "Kodagu": "ಕೊಡಗು", "Kolar": "ಕೋಲಾರ", "Koppal": "ಕೊಪ್ಪಳ", "Mandya": "ಮಂಡ್ಯ",
    "Mysuru": "ಮೈಸೂರು", "Raichur": "ರಾಯಚೂರು", "Ramanagara": "ರಾಮನಗರ",
    "Shivamogga": "ಶಿವಮೊಗ್ಗ", "Tumakuru": "ತುಮಕೂರು", "Udupi": "ಉಡುಪಿ",
    "Uttara Kannada": "ಉತ್ತರ ಕನ್ನಡ", "Vijayapura": "ವಿಜಯಪುರ",
    "Vijayanagara": "ವಿಜಯನಗರ", "Yadgir": "ಯಾದಗಿರಿ"
  };

  ['#lf-district', '#cf-district', '#fl-filter-district', '#login-district'].forEach(selEl => {
    const el = $(selEl);
    if (!el) return;
    const curVal = el.value;
    while (el.options.length > 1) el.remove(1);
    DISTRICTS.forEach(d => {
      const o = document.createElement('option');
      o.value = d;
      const kn = distKannada[d] ? ` (${distKannada[d]})` : '';
      o.textContent = `${d}${kn}`;
      el.appendChild(o);
    });
    if (curVal) el.value = curVal;
  });

  const savedDist = localStorage.getItem('kp_district');
  if (savedDist) {
    if ($('#lf-district')) $('#lf-district').value = savedDist;
    if ($('#login-district')) $('#login-district').value = savedDist;
  }

  const soilSel = $('#lf-soil');
  if (soilSel) {
    while (soilSel.options.length > 1) soilSel.remove(1);
    SOILS.forEach(s => {
      const o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.name;
      soilSel.appendChild(o);
    });
  }
}

function showSoilInfo(soilId) {
  const box = $('#soil-info-box');
  const soil = SOILS.find(s => s.id === soilId);
  if (!soil || !soilId) {
    if (box) box.style.display = 'none';
    return;
  }
  if (box) {
    box.style.display = 'block';
    $('#sib-name').textContent = soil.name;
    $('#sib-desc').textContent = soil.desc;
    $('#sib-suitable').textContent = soil.suitable;
  }
}

// =====================================================================
// PAGE 2: CROP SELECTION
// =====================================================================
async function loadCrops() {
  try {
    const r = await fetch('/api/crops');
    CR = await r.json();
    renderCropGrid(getFilteredCrops());
    const cfCrop = $('#cf-crop');
    if (cfCrop) {
      while (cfCrop.options.length > 1) cfCrop.remove(1);
      CR.forEach(c => {
        const o = document.createElement('option');
        o.value = c.en;
        o.textContent = getCropName(c);
        cfCrop.appendChild(o);
      });
    }
  } catch(e) { console.warn('Crops load error', e); }
}

function cropIcon(c) {
  return CAT_ICONS_DETAILED[c.en] || CROP_ICONS[c.cat] || '🌱';
}

function renderCropGrid(crops) {
  const grid = $('#crop-grid-p2');
  const noRes = $('#no-crop-results');
  if (!grid) return;
  if (!crops || crops.length === 0) {
    grid.innerHTML = '';
    if (noRes) noRes.style.display = 'block';
    return;
  }
  if (noRes) noRes.style.display = 'none';

  const daysLabel = LN === 'kn' ? 'ದಿನಗಳು' : LN === 'hi' ? 'दिन' : 'days';
  const qtlLabel = LN === 'kn' ? 'ಕ್ವಿಂ' : LN === 'hi' ? 'क्विं' : 'qtl';

  grid.innerHTML = crops.map(c => {
    const cName = getCropName(c);
    const catLabel = CAT_LABELS[c.cat] ? (CAT_LABELS[c.cat][LN] || CAT_LABELS[c.cat].en) : c.cat;
    return `
      <div class="crop-card-p2 cat-${c.cat} ${sel === c.id ? 'selected' : ''}" data-id="${c.id}" onclick="selectCrop(${c.id})">
        <span class="cc-icon">${cropIcon(c)}</span>
        <div class="cc-name">${cName}</div>
        <div class="cc-meta">${c.days} ${daysLabel} · ₹${n0(c.price)}/${qtlLabel}</div>
        <span class="cc-cat-badge">${catLabel}</span>
      </div>
    `;
  }).join('');
}

function selectCrop(id) {
  sel = id;
  const crop = CR[id];
  renderCropGrid(getFilteredCrops());
  const info = $('#p2-selected-info');
  if (info) {
    info.style.display = 'flex';
    $('#p2-sel-icon').textContent = cropIcon(crop);
    $('#p2-sel-name').textContent = getCropName(crop);
    const catLabel = CAT_LABELS[crop.cat] ? (CAT_LABELS[crop.cat][LN] || CAT_LABELS[crop.cat].en) : crop.cat;
    const daysLabel = LN === 'kn' ? 'ದಿನಗಳು' : LN === 'hi' ? 'दिन' : 'days';
    $('#p2-sel-tag').textContent = `${crop.days} ${daysLabel} · ${catLabel}`;
  }
  $('#p2-next').disabled = false;
  // Reset price and yield to base when a NEW crop is selected
  if ($('#lf-price')) $('#lf-price').value = crop.price;
  const initAcres = parseFloat($('#lf-acres') && $('#lf-acres').value) || 1;
  if ($('#lf-yield')) $('#lf-yield').value = (crop.yield * initAcres).toFixed(1);
  updateP3CropBanner(crop);
  updateEstimatePreview();
}

function updateP3CropBanner(crop) {
  if (!crop) return;
  const icon = $('#p3-crop-icon');
  const name = $('#p3-crop-name');
  const meta = $('#p3-crop-meta');
  const cName = getCropName(crop);
  const catLabel = CAT_LABELS[crop.cat] ? (CAT_LABELS[crop.cat][LN] || CAT_LABELS[crop.cat].en) : crop.cat;
  const daysTxt = LN === 'kn' ? 'ದಿನಗಳ ಅವಧಿ' : LN === 'hi' ? 'दिन की अवधि' : 'days duration';
  const apmcTxt = LN === 'kn' ? 'ಮಂಡಿ ಬೆಲೆ' : LN === 'hi' ? 'मंडी भाव' : 'Base APMC';
  const qtlTxt = LN === 'kn' ? 'ಕ್ವಿಂಟಾಲ್' : LN === 'hi' ? 'क्विंटल' : 'qtl';

  if (icon) icon.textContent = cropIcon(crop);
  if (name) name.textContent = cName;
  if (meta) meta.textContent = `${crop.days} ${daysTxt} · ${catLabel} · ${apmcTxt}: ₹${n0(crop.price)}/${qtlTxt}`;
  // Only set default price if the field is empty (don't override user's custom price)
  if ($('#lf-price') && !$('#lf-price').value) $('#lf-price').value = crop.price;
  updatePriceInfo();
  updateEstimatePreview();
}

let _catFilter = 'ALL', _searchQ = '';

function getFilteredCrops() {
  return CR.filter(c => {
    const catOk = _catFilter === 'ALL' || c.cat === _catFilter;
    const q = _searchQ.toLowerCase();
    const hiName = (CROP_HI[c.en] || '').toLowerCase();
    const searchOk = !q || 
      c.en.toLowerCase().includes(q) || 
      (c.kn && c.kn.includes(q)) ||
      hiName.includes(q);
    return catOk && searchOk;
  });
}

// Category filter tabs
const catTabsEl = $('#cat-tabs');
if (catTabsEl) {
  catTabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.cat-tab');
    if (!btn) return;
    $$('.cat-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _catFilter = btn.dataset.cat;
    renderCropGrid(getFilteredCrops());
  });
}

// Search
const cropSearchEl = $('#crop-search');
if (cropSearchEl) {
  cropSearchEl.addEventListener('input', e => {
    _searchQ = e.target.value;
    renderCropGrid(getFilteredCrops());
  });
}

// =====================================================================
// PAGE 3: LAND DETAILS
// =====================================================================
function setAcre(val) {
  const inp = $('#lf-acres');
  if (inp) {
    inp.value = val;
    updateAcreInfo();
  }
  $$('.preset-pill[data-ac]').forEach(p => p.classList.toggle('active', parseFloat(p.dataset.ac) === val));
}

function updateAcreInfo() {
  const ac = parseFloat($('#lf-acres') && $('#lf-acres').value) || 0;
  const calc = $('#acre-calc');
  if (calc) {
    const guntas = Math.round(ac * 40);
    const sqm = Math.round(ac * 4047);
    const guntasLabel = LN === 'kn' ? 'ಗುಂಟೆ' : LN === 'hi' ? 'गुंठा' : 'Guntas';
    calc.textContent = `${guntas} ${guntasLabel} (~${n0(sqm)} m²)`;
  }
  updateEstimatePreview();
}

function setDateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const inp = $('#lf-sow');
  if (inp) inp.value = d.toISOString().slice(0, 10);
}

function updatePriceInfo() {
  const priceEl = $('#lf-price');
  const infoEl = $('#price-info-row');
  if (!priceEl || !infoEl || sel === null || !CR[sel]) return;
  const crop = CR[sel];
  const val = parseFloat(priceEl.value) || 0;
  const base = crop.price;
  const diff = val - base;
  const pct = base > 0 ? (diff / base * 100).toFixed(1) : 0;
  const sign = diff >= 0 ? '+' : '';

  if (LN === 'kn') {
    infoEl.textContent = `ಎಪಿಎಂಸಿ ಮೂಲ ಬೆಲೆ: ₹${n0(base)}/ಕ್ವಿಂಟಾಲ್. ನೀವು ನಮೂದಿಸಿದ ಬೆಲೆ: ${sign}${pct}%`;
  } else if (LN === 'hi') {
    infoEl.textContent = `एपीएमसी न्यूनतम भाव: ₹${n0(base)}/क्विंटल। आपका दर्ज भाव: ${sign}${pct}%`;
  } else {
    infoEl.textContent = `Base APMC MSP: ₹${n0(base)}/qtl. Your entered price is ${sign}${pct}% vs base.`;
  }
  infoEl.style.color = diff >= 0 ? 'var(--primary)' : 'var(--red)';
}

function updateEstimatePreview() {
  if (sel === null || !CR[sel]) return;
  const crop = CR[sel];
  const acres = parseFloat($('#lf-acres') && $('#lf-acres').value) || 1;
  const price = parseFloat($('#lf-price') && $('#lf-price').value) || crop.price;
  const ep = $('#estimate-preview');
  if (!ep) return;

  ep.style.display = 'flex';
  const plantsEl = $('#ep-plants');
  if (plantsEl) {
    if (String(crop.sp).includes('x')) {
      const [a, b] = String(crop.sp).split('x').map(Number);
      const plants = Math.round(acres * 4047 * 0.9 / (a * b));
      const pTxt = LN === 'kn' ? 'ಸಸಿಗಳು' : LN === 'hi' ? 'पौधे' : 'plants';
      plantsEl.textContent = n0(plants) + ' ' + pTxt;
    } else {
      const sTxt = LN === 'kn' ? 'ಕೆಜಿ ಬೀಜ' : LN === 'hi' ? 'किग्रा बीज' : 'kg seed';
      plantsEl.textContent = (parseFloat(crop.sp) * acres).toFixed(1) + ' ' + sTxt;
    }
  }

  // Water shown in mm (Standard agricultural depth)
  const waterEl = $('#ep-water');
  if (waterEl) {
    waterEl.textContent = `${crop.water_mm} mm`;
  }

  const currentYield = parseFloat($('#lf-yield') && $('#lf-yield').value) || (crop.yield * acres);
  const yInfo = $('#yield-info-row');
  if (yInfo) {
    const qtlTxt = LN === 'kn' ? 'ಕ್ವಿಂಟಾಲ್' : LN === 'hi' ? 'क्विंटल' : 'qtl';
    const acTxt = LN === 'kn' ? 'ಎಕರೆ' : LN === 'hi' ? 'एकड़' : 'acre';
    yInfo.textContent = `UAS benchmark: ${(crop.yield * acres).toFixed(1)} ${qtlTxt} (${crop.yield} ${qtlTxt}/${acTxt})`;
  }
  const incomeEl = $('#ep-income');
  if (incomeEl && price > 0) {
    incomeEl.textContent = INR(currentYield * price);
  }
}

const weatherOptsEl = $('#weather-opts');
if (weatherOptsEl) {
  weatherOptsEl.addEventListener('click', e => {
    const opt = e.target.closest('.weather-opt');
    if (!opt) return;
    $$('.weather-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    opt.querySelector('input').checked = true;
  });
}

function initDefaultDates() {
  const inp = $('#lf-sow');
  if (inp && !inp.value) setDateOffset(7);
}

async function generatePlan() {
  if (sel === null) {
    $('#p3-err').textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ಮೊದಲು ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : LN === 'hi' ? 'कृपया पहले फसल चुनें।' : 'Please select a crop first.';
    return;
  }
  const district = $('#lf-district') ? $('#lf-district').value : '';
  const soil = $('#lf-soil') ? $('#lf-soil').value : 'red_sandy_loam';
  const acres = parseFloat($('#lf-acres') ? $('#lf-acres').value : 0);
  const sow = $('#lf-sow') ? $('#lf-sow').value : '';
  const price = parseFloat($('#lf-price') ? $('#lf-price').value : 0);
  const share = parseFloat($('#lf-share') ? $('#lf-share').value : 40);
  const weatherRadio = $('input[name="weather"]:checked');
  const weather = weatherRadio ? parseInt(weatherRadio.value) : 0;

  if (!district) {
    $('#p3-err').textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.' : LN === 'hi' ? 'कृपया ज़िला चुनें।' : 'Please select your district.';
    return;
  }
  if (!soil) {
    $('#p3-err').textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ಮಣ್ಣಿನ ಪ್ರಕಾರ ಆಯ್ಕೆಮಾಡಿ.' : LN === 'hi' ? 'कृपया मिट्टी का प्रकार चुनें।' : 'Please select soil type.';
    return;
  }
  if (!acres || acres <= 0) {
    $('#p3-err').textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ಸರಿಯಾದ ವಿಸ್ತೀರ್ಣ ನಮೂದಿಸಿ.' : LN === 'hi' ? 'कृपया मान्य क्षेत्रफल दर्ज करें।' : 'Please enter a valid land area.';
    return;
  }
  if (!sow) {
    $('#p3-err').textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ಬಿತ್ತನೆ ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ.' : LN === 'hi' ? 'कृपया बुवाई की तारीख चुनें।' : 'Please select a sowing date.';
    return;
  }
  if (!price || price <= 0) {
    $('#p3-err').textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿತ ಮಂಡಿ ಬೆಲೆ ನಮೂದಿಸಿ.' : LN === 'hi' ? 'कृपया अपेक्षित मंडी भाव दर्ज करें।' : 'Please enter expected mandi price.';
    return;
  }
  $('#p3-err').textContent = '';

  goPage('p4');
  $('#p4-loading').style.display = 'block';
  $('#p4-results').style.display = 'none';
  $('#p4-error').style.display = 'none';

  try {
    const userYield = parseFloat($('#lf-yield') ? $('#lf-yield').value : 0);
    const body = {
      crop: sel, acres, sow, district, soil,
      prices: { wage: 450, urea: 270, ssp: 600, mop: 1700, price },
      yield_q: userYield,
      share, weather
    };
    const r = await fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Failed to generate plan.');
    PlanData = data;
    renderPlan(data);
  } catch(e) {
    $('#p4-loading').style.display = 'none';
    $('#p4-error').style.display = 'block';
    $('#p4-error-msg').textContent = e.message;
  }
}

// =====================================================================
// PAGE 4: RENDER PLAN
// =====================================================================
function renderPlan(d) {
  $('#p4-loading').style.display = 'none';
  $('#p4-results').style.display = 'block';

  const crop = CR[d.crop.id] || d.crop;
  const e = d.est;
  const cName = getCropName(crop);
  const catLabel = CAT_LABELS[d.crop.cat] ? (CAT_LABELS[d.crop.cat][LN] || CAT_LABELS[d.crop.cat].en) : d.crop.cat;

  // Banner
  const icon = cropIcon(crop);
  $('#rb-icon').textContent = icon;
  const guideTitle = LN === 'kn' ? `${cName} ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಯೋಜನೆ` :
                     LN === 'hi' ? `${cName} कृषि गाइड व कार्य योजना` :
                     `${cName} Farming Guide & Plan`;
  $('#p4-title').textContent = guideTitle;
  $('#rb-crop-name').textContent = `${icon} ${cName}`;
  const daysTxt = LN === 'kn' ? 'ದಿನಗಳು' : LN === 'hi' ? 'दिन' : 'days';
  const acTxt = LN === 'kn' ? 'ಎಕರೆ' : LN === 'hi' ? 'एकड़' : 'acres';
  $('#rb-meta').textContent = `${crop.days} ${daysTxt} · ${catLabel} · ${d.acres} ${acTxt}`;
  $('#rb-sow').textContent = fmt_date(d.sow);
  $('#rb-harvest').textContent = fmt_date(d.harvest);
  $('#rb-district').textContent = d.district;
  const soilInfo = SOILS.find(s => s.id === d.soil);
  $('#rb-soil').textContent = soilInfo ? soilInfo.name.split('(')[0].trim() : d.soil;

  // 4 Core Financial Cards (Cost, Selling Price, Profit, Loss)
  const rangeTxt = LN === 'kn' ? 'ಅಂದಾಜು ಶ್ರೇಣಿ:' : LN === 'hi' ? 'अनुमानित सीमा:' : 'Est. Range:';
  $('#mc-cost').textContent = INR(e.total);
  $('#mc-cost-range').textContent = `${rangeTxt} ${INR(e.total_lo)} – ${INR(e.total_hi)}`;

  const priceInput = $('#p4-selling-price-input');
  if (priceInput) {
    priceInput.value = Math.round(d.price);
  }
  const yieldInput = $('#p4-yield-input');
  if (yieldInput) {
    yieldInput.value = parseFloat(e.yield_q);
  }

  // Update Selling Price, Profit, and Loss displays
  updateProfitLossDisplay(e, d.acres, d.price, e.yield_q);

  // Render Horizontal Tabs Panels
  renderResources(d);
  renderRoadmap(d);
  renderMarket(d);
  renderHealth(d);
  populateScanCropSelect();

  // Advisory Tip
  const tipEl = $('#fert-tip-text');
  if (tipEl) {
    const cat = d.crop.cat;
    const tipsObj = FERT_TIPS[cat] || FERT_TIPS['C'];
    tipEl.textContent = tipsObj[LN] || tipsObj.en;
  }
}

// =====================================================================
// LIVE PROFIT & LOSS CALCULATION BASED ON SELLING PRICE
// =====================================================================
function updateProfitLossDisplay(e, acres, price, customYield) {
  const y = customYield !== undefined ? parseFloat(customYield) : e.yield_q;
  e.yield_q = y;
  const income = Math.round(y * price);
  e.income = income;
  const diff = income - e.total;
  e.profit = diff;
  e.profit_per_acre = acres > 0 ? Math.round(diff / acres) : diff;
  e.roi_pct = e.total > 0 ? ((diff / e.total) * 100).toFixed(1) : '0';
  e.breakeven_price = y > 0 ? Math.round(e.total / y) : 0;

  // Update Card 2 inputs
  const priceInput = $('#p4-selling-price-input');
  if (priceInput && document.activeElement !== priceInput) {
    priceInput.value = Math.round(price);
  }
  const yieldInput = $('#p4-yield-input');
  if (yieldInput && document.activeElement !== yieldInput) {
    yieldInput.value = y;
  }
  const incEl = $('#mc-income');
  if (incEl) incEl.textContent = INR(income);

  const yieldLbl = $('#mc-yield-label');
  if (yieldLbl) {
    const qtlTxt = LN === 'kn' ? 'ಕ್ವಿಂಟಾಲ್' : LN === 'hi' ? 'क्विंटल' : 'qtl';
    yieldLbl.textContent = `${y} ${qtlTxt} × ₹${n0(price)}/${qtlTxt} = ${INR(income)}`;
  }

  const acTxt = LN === 'kn' ? 'ಎಕರೆ' : LN === 'hi' ? 'एकड़' : 'acre';
  const profitEl = $('#mc-profit');
  const profitSub = $('#mc-profit-sub');
  const lossEl = $('#mc-loss');
  const lossSub = $('#mc-loss-sub');

  if (diff > 0) {
    // Profitable
    if (profitEl) {
      profitEl.textContent = '+' + INR(diff);
      profitEl.style.color = 'var(--primary)';
    }
    if (profitSub) {
      profitSub.textContent = `+${INR(e.profit_per_acre)}/${acTxt} · ROI: +${e.roi_pct}%`;
    }
    if (lossEl) {
      lossEl.textContent = '₹0';
      lossEl.style.color = 'var(--text-muted)';
    }
    if (lossSub) {
      lossSub.textContent = LN === 'kn' ? 'ಶೂನ್ಯ ನಷ್ಟ (ಸುರಕ್ಷಿತ)' : LN === 'hi' ? 'शून्य नुकसान (सुरक्षित)' : 'Zero Loss (Profitable)';
    }
  } else if (diff < 0) {
    // Loss
    const lossAmt = Math.abs(diff);
    if (profitEl) {
      profitEl.textContent = '₹0';
      profitEl.style.color = 'var(--text-muted)';
    }
    if (profitSub) {
      profitSub.textContent = LN === 'kn' ? 'ಯಾವುದೇ ಲಾಭವಿಲ್ಲ' : LN === 'hi' ? 'कोई लाभ नहीं' : 'No Profit';
    }
    if (lossEl) {
      lossEl.textContent = '−' + INR(lossAmt);
      lossEl.style.color = 'var(--red)';
    }
    if (lossSub) {
      const lossPerAc = Math.round(lossAmt / acres);
      const lossPct = e.total > 0 ? ((lossAmt / e.total) * 100).toFixed(1) : '0';
      lossSub.textContent = `−${INR(lossPerAc)}/${acTxt} · −${lossPct}% below cost`;
    }
  } else {
    // Exactly break-even
    if (profitEl) {
      profitEl.textContent = '₹0';
      profitEl.style.color = 'var(--text-muted)';
    }
    if (profitSub) {
      profitSub.textContent = LN === 'kn' ? 'ವೆಚ್ಚ ಸಮಾನ (ಬ್ರೇಕ್-ಈವನ್)' : LN === 'hi' ? 'लागत बराबर' : 'Break-even';
    }
    if (lossEl) {
      lossEl.textContent = '₹0';
      lossEl.style.color = 'var(--text-muted)';
    }
    if (lossSub) {
      lossSub.textContent = LN === 'kn' ? 'ಶೂನ್ಯ ನಷ್ಟ' : LN === 'hi' ? 'शून्य नुकसान' : 'Zero Loss';
    }
  }

  const bepPrefix = LN === 'kn' ? 'ಕನಿಷ್ಠ ವೆಚ್ಚ ಮುಟ್ಟುವ ಬೆಲೆ:' : LN === 'hi' ? 'न्यूनतम ब्रेक-ईवन भाव:' : 'Break-even price:';
  const qtlUnit = LN === 'kn' ? 'ಕ್ವಿಂಟಾಲ್' : LN === 'hi' ? 'क्विंटल' : 'qtl';
  const bepEl = $('#mc-bep');
  if (bepEl) {
    bepEl.textContent = `${bepPrefix} ₹${n0(e.breakeven_price)}/${qtlUnit}`;
  }
}

function onP4FinancialChange() {
  if (!PlanData) return;
  const priceEl = $('#p4-selling-price-input');
  const yieldEl = $('#p4-yield-input');
  const p = parseFloat(priceEl ? priceEl.value : 0) || PlanData.price;
  const y = parseFloat(yieldEl ? yieldEl.value : 0) || PlanData.est.yield_q;
  if (!p || p <= 0 || !y || y <= 0) return;
  PlanData.price = p;
  PlanData.est.yield_q = y;
  updateProfitLossDisplay(PlanData.est, PlanData.acres, p, y);
  renderMarket(PlanData);
}
window.onP4FinancialChange = onP4FinancialChange;
window.onP4PriceChange = onP4FinancialChange;
window.togglePasswordVisibility = togglePasswordVisibility;
window.doLogin = doLogin;
window.doLogout = doLogout;

// =====================================================================
// RESOURCES TAB
// =====================================================================
function renderResources(d) {
  const e = d.est;
  const crop = CR[d.crop.id] || d.crop;

  // Seed
  const seedVal = $('#res-seed-val');
  const seedFormula = $('#res-seed-formula');
  const seedNote = $('#res-seed-note');
  if (e.plants) {
    const pTxt = LN === 'kn' ? 'ಸಸಿಗಳು' : LN === 'hi' ? 'पौधे' : 'Plants';
    seedVal.textContent = n0(e.plants) + ' ' + pTxt;
    seedFormula.textContent = e.formula;
    if (seedNote) {
      seedNote.textContent = LN === 'kn' ? `ಅಂತರ: ${crop.sp} ಮೀ | 10% ನರ್ಸರಿ ಬಫರ್ ಒಳಗೊಂಡಿದೆ` :
                             LN === 'hi' ? `दूरी: ${crop.sp} मी | 10% नर्सरी बफर सहित` :
                             `Plant spacing: ${crop.sp} m | includes 10% nursery loss buffer`;
    }
  } else {
    const sTxt = LN === 'kn' ? 'ಕೆಜಿ ಬೀಜ' : LN === 'hi' ? 'किग्रा बीज' : 'kg Seed';
    seedVal.textContent = e.seed_kg + ' ' + sTxt;
    seedFormula.textContent = e.formula;
    if (seedNote) {
      seedNote.textContent = LN === 'kn' ? `ಶಿಫಾರಸು ಮಾಡಿದ ಬೀಜದ ಪ್ರಮಾಣ: ${crop.sp} ಕೆಜಿ/ಎಕರೆ` :
                             LN === 'hi' ? `अनुशंसित बीज दर: ${crop.sp} किग्रा/एकड़` :
                             `Recommended seed rate: ${crop.sp} kg/acre`;
    }
  }

  // Water - NORMAL MEASUREMENT IN MM (not confusing millions of litres)
  $('#res-water-val').textContent = `${e.water_mm} mm`;
  if (LN === 'kn') {
    $('#res-water-formula').textContent = `ಸಾಮಾನ್ಯ ವೇಳಾಪಟ್ಟಿ: ಸುಮಾರು ${e.water_cycles} ನೀರಾವರಿ ಸುತ್ತುಗಳು (ಪ್ರತಿ ${e.water_freq_days} ದಿನಗಳಿಗೊಮ್ಮೆ)`;
  } else if (LN === 'hi') {
    $('#res-water-formula').textContent = `सामान्य चक्र: ~${e.water_cycles} सिंचाई चक्र (हर ${e.water_freq_days} दिन में)`;
  } else {
    $('#res-water-formula').textContent = `Normal schedule: ~${e.water_cycles} irrigation cycles (~${e.water_depth_per_cycle} mm each, every ${e.water_freq_days} days)`;
  }

  const stagesData = [
    { 
      stage: LN === 'kn' ? 'ಭೂಮಿ ಸಿದ್ಧತೆ ಮತ್ತು ಬಿತ್ತನೆ' : LN === 'hi' ? 'खेत की तैयारी व बुवाई' : 'Land Prep & Sowing', 
      depth: Math.round(e.water_mm * 0.10), 
      note: LN === 'kn' ? '1-2 ನೀರಾವರಿ' : LN === 'hi' ? '1-2 सिंचाई' : '1-2 irrigations' 
    },
    { 
      stage: LN === 'kn' ? 'ಸಸ್ಯ ಬೆಳವಣಿಗೆ' : LN === 'hi' ? 'वानस्पतिक वृद्धि' : 'Vegetative Growth', 
      depth: Math.round(e.water_mm * 0.35), 
      note: `${Math.max(2, Math.round(e.water_cycles * 0.35))} ${LN === 'kn' ? 'ನೀರಾವರಿ' : LN === 'hi' ? 'सिंचाई' : 'irrigations'}` 
    },
    { 
      stage: LN === 'kn' ? 'ಹೂ ಬಿಡುವ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟುವ ಹಂತ' : LN === 'hi' ? 'फूल व दाना बनने की अवस्था' : 'Flowering & Grain/Fruit Set (Critical)', 
      depth: Math.round(e.water_mm * 0.35), 
      note: LN === 'kn' ? 'ತೇವಾಂಶ ಕೊರತೆಯಾಗದಂತೆ ನೋಡಿಕೊಳ್ಳಿ' : LN === 'hi' ? 'नमी की कमी न होने दें' : 'Never allow moisture stress' 
    },
    { 
      stage: LN === 'kn' ? 'ಕಾಳು ಬಲಿಯುವ ಹಂತ' : LN === 'hi' ? 'परिपक्वता व दाना भराव' : 'Maturity & Grain Filling', 
      depth: Math.round(e.water_mm * 0.20), 
      note: LN === 'kn' ? 'ಕೊಯ್ಲಿಗೆ 10 ದಿನ ಮುಂಚೆ ನೀರು ನಿಲ್ಲಿಸಿ' : LN === 'hi' ? 'कटाई से 10 दिन पूर्व पानी रोकें' : 'Withhold 10-14 days prior to harvest' 
    }
  ];

  const ws = $('#water-stages');
  if (ws) {
    ws.innerHTML = stagesData.map(s => `
      <div class="ws-item">
        <span>${s.stage}</span>
        <strong>${s.depth} mm <small style="font-weight:normal;opacity:0.8;">(${s.note})</small></strong>
      </div>
    `).join('');
  }

  // Fertilizer
  $('#res-fert-badge').textContent = `N: ${e.N.toFixed(0)} · P: ${e.P.toFixed(0)} · K: ${e.K.toFixed(0)} kg total`;
  const bagUnit = LN === 'kn' ? 'ಚೀಲಗಳು (೪೫-೫೦ ಕೆಜಿ)' : LN === 'hi' ? 'बोरियां (45-50 किग्रा)' : 'bags (45-50 kg)';
  const bagItems = [
    { name: LN === 'kn' ? 'ಯೂರಿಯಾ (Urea)' : LN === 'hi' ? 'यूरिया (Urea)' : 'Urea', icon: '🧪', bags: e.urea, unit: bagUnit, cost: e.urea * 270 },
    { name: LN === 'kn' ? 'ಎಸ್‌ಎಸ್‌ಪಿ (SSP)' : LN === 'hi' ? 'एसएसपी (SSP)' : 'SSP', icon: '⚗️', bags: e.ssp, unit: bagUnit, cost: e.ssp * 600 },
    { name: LN === 'kn' ? 'ಎಂಒಪಿ (MOP)' : LN === 'hi' ? 'एमओपी (MOP)' : 'MOP', icon: '🧫', bags: e.mop, unit: bagUnit, cost: e.mop * 1700 }
  ];
  const fbg = $('#fert-bags-grid');
  if (fbg) {
    fbg.innerHTML = bagItems.map(b => `
      <div class="fert-bag-item">
        <div class="fbi-icon">${b.icon}</div>
        <div class="fbi-bags">${b.bags.toFixed(1)}</div>
        <div class="fbi-unit">${b.unit}</div>
        <div class="fbi-name">${b.name}</div>
        <div class="fbi-cost">${INR(b.cost)}</div>
      </div>
    `).join('');
  }

  // Cost breakdown
  const costItems = [
    { 
      icon: '👷', 
      label: LN === 'kn' ? 'ಕೂಲಿ ವೆಚ್ಚ' : LN === 'hi' ? 'खेत मजदूरी' : 'Field Labour', 
      sub: `${e.labour_days.toFixed(0)} ${LN === 'kn' ? 'ದಿನದ ಕೂಲಿ' : LN === 'hi' ? 'मानव दिवस' : 'man-days'} @ ₹450`, 
      amount: e.cost_labour 
    },
    { 
      icon: '🧪', 
      label: LN === 'kn' ? 'ರಸಗೊಬ್ಬರ ಮತ್ತು ಜೈವಿಕ ಗೊಬ್ಬರ' : LN === 'hi' ? 'रासायनिक व जैविक उर्वरक' : 'Chemical & Bio Fertilizers', 
      sub: `${e.urea.toFixed(1)} Urea + ${e.ssp.toFixed(1)} SSP + ${e.mop.toFixed(1)} MOP`, 
      amount: e.cost_fert 
    },
    { 
      icon: '🌱', 
      label: LN === 'kn' ? 'ಪ್ರಮಾಣೀಕೃತ ಬೀಜ / ಸಸಿಗಳು' : LN === 'hi' ? 'प्रमाणित बीज / पौधे' : 'Certified Seeds / Saplings', 
      sub: e.plants ? `${n0(e.plants)} ${LN==='kn'?'ಸಸಿಗಳು':LN==='hi'?'पौधे':'plants'}` : `${e.seed_kg} ${LN==='kn'?'ಕೆಜಿ ಬೀಜ':LN==='hi'?'किग्रा बीज':'kg seed'}`, 
      amount: e.cost_seed 
    },
    { 
      icon: '🌿', 
      label: LN === 'kn' ? 'ಕೀಟ ಹಾಗೂ ರೋಗ ನಿರ್ವಹಣೆ' : LN === 'hi' ? 'कीट व रोग प्रबंधन' : 'Pest & Disease Management', 
      sub: LN === 'kn' ? 'ಜೈವಿಕ ಹಾಗೂ ರಕ್ಷಣಾತ್ಮಕ ಸಿಂಪಡಣೆ' : LN === 'hi' ? 'सुरक्षात्मक छिड़काव व जैविक ट्रैप' : 'Prophylactic sprays & bio-agents', 
      amount: e.cost_pest 
    },
    { 
      icon: '🚜', 
      label: LN === 'kn' ? 'ಯಂತ್ರೋಪಕರಣ ಹಾಗೂ ಉಳುಮೆ ವೆಚ್ಚ' : LN === 'hi' ? 'मशीनरी व जुताई खर्च' : 'Field Operations & Machinery', 
      sub: LN === 'kn' ? 'ಟ್ರಾಕ್ಟರ್ ಉಳುಮೆ, ಕಳೆ ಕೀಳುವುದು' : LN === 'hi' ? 'ट्रैक्टर जुताई, निराई-गुड़ाई' : 'Tractor ploughing, harrowing, weeding', 
      amount: e.cost_other 
    },
  ];
  const cbl = $('#cost-breakdown-list');
  if (cbl) {
    if (e.items && e.items.length) {
      cbl.innerHTML = e.items.map(item => {
        const label = LN === 'kn' ? (item.name_kn || item.name_en) : LN === 'hi' ? (item.name_hi || item.name_en) : item.name_en;
        const sub = LN === 'kn' ? (item.sub_kn || item.sub_en) : LN === 'hi' ? (item.sub_hi || item.sub_en) : item.sub_en;
        return `
          <div class="cb-item">
            <div class="cb-item-label">
              <span class="cb-item-icon">${item.icon}</span>
              <div>
                <div style="font-weight:600;color:var(--text);">${label}</div>
                <div style="font-size:0.75rem;color:var(--text-light);margin-top:2px;">${sub}</div>
              </div>
            </div>
            <div class="cb-item-amount" style="font-weight:700;font-size:0.95rem;color:var(--text);">${INR(item.amount)}</div>
          </div>
        `;
      }).join('');
    } else {
      cbl.innerHTML = costItems.map(item => `
        <div class="cb-item">
          <div class="cb-item-label">
            <span class="cb-item-icon">${item.icon}</span>
            <div>
              <div style="font-weight:600;color:var(--text);">${item.label}</div>
              <div style="font-size:0.74rem;color:var(--text-light);">${item.sub}</div>
            </div>
          </div>
          <div class="cb-item-amount" style="font-weight:700;color:var(--text);">${INR(item.amount)}</div>
        </div>
      `).join('');
    }
  }
  const totalRow = $('#cost-total-row');
  if (totalRow) {
    const totLabel = LN === 'kn' ? `ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ (${d.acres} ಎಕರೆ)` :
                     LN === 'hi' ? `कुल उत्पादन लागत (${d.acres} एकड़)` :
                     `Total Cultivation Cost (${d.acres} ac)`;
    totalRow.innerHTML = `<span>${totLabel}</span><span style="font-size:1.15rem;font-weight:800;">${INR(e.total)}</span>`;
  }
}

// =====================================================================
// ROADMAP TAB (Connected Steps with Clean Line from Icon)
// =====================================================================
function renderRoadmap(d) {
  const crop = CR[d.crop.id] || d.crop;
  const cName = getCropName(crop);
  const sub = $('#roadmap-subtitle');
  if (sub) {
    const durLabel = LN === 'kn' ? 'ದಿನಗಳ ಅವಧಿ' : LN === 'hi' ? 'दिन की अवधि' : 'days duration';
    const sowLabel = LN === 'kn' ? 'ಬಿತ್ತನೆ' : LN === 'hi' ? 'बुवाई' : 'Sowing';
    const harvLabel = LN === 'kn' ? 'ಕೊಯ್ಲು' : LN === 'hi' ? 'कटाई' : 'Harvest';
    sub.textContent = `${cName} · ${d.crop.days} ${durLabel} · ${sowLabel}: ${fmt_date(d.sow)} → ${harvLabel}: ${fmt_date(d.harvest)}`;
  }

  const container = $('#roadmap-container');
  if (!container || !d.roadmap) return;

  container.innerHTML = d.roadmap.map((stage, i) => {
    const isHarvest = stage.name.toLowerCase().includes('harvest');
    const dayTxt = LN === 'kn' ? 'ದಿನ' : LN === 'hi' ? 'दिन' : 'Day';
    const daysTxt = LN === 'kn' ? 'ದಿನಗಳು' : LN === 'hi' ? 'दिन' : 'Days';
    const dayRange = stage.start === stage.end ? `${dayTxt} ${stage.start}` : `${daysTxt} ${stage.start}–${stage.end}`;
    const progressPct = d.crop.days > 0 ? Math.min(100, Math.round((stage.end / d.crop.days) * 100)) : 100;
    
    // Choose stage title based on language
    let stageTitle = stage.name;
    if (LN === 'kn' && stage.name_kn) {
      stageTitle = stage.name_kn;
    }
    
    return `
      <div class="rm-stage-item">
        <div class="rm-step-indicator">
          <div class="rm-icon-circle ${isHarvest ? 'harvest' : ''}">
            ${stage.icon || '🌱'}
          </div>
          <div class="rm-step-line"></div>
        </div>
        <div class="rm-content-card">
          <div class="rm-card-top">
            <div class="rm-stage-title-wrap">
              <span class="rm-stage-name">${stageTitle}</span>
              ${(LN !== 'kn' && stage.name_kn) ? `<span class="rm-stage-kn">${stage.name_kn}</span>` : ''}
            </div>
            <span class="rm-date-badge">${dayRange} · ${fmt_date(stage.from)} – ${fmt_date(stage.to)}</span>
          </div>
          <div class="rm-desc">${stage.desc || ''}</div>
          ${stage.extra ? `<div class="rm-extra-pill">📌 ${stage.extra[0]}</div>` : ''}
          <div class="rm-progress-bar">
            <div class="rm-progress-fill" style="width:${progressPct}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// =====================================================================
// MARKET TAB
// =====================================================================
function renderMarket(d) {
  const m = d.market;
  const e = d.est;

  const ppWrap = $('#price-pressure-wrap');
  if (ppWrap && m.outlook_pct) {
    const low = m.outlook_pct.low || 0;
    const med = m.outlook_pct.medium || 0;
    const high = m.outlook_pct.high || 0;
    
    const pLowLbl = LN === 'kn' ? '🟢 ಕಡಿಮೆ ಒತ್ತಡ (ಉತ್ತಮ ದರ)' : LN === 'hi' ? '🟢 कम दबाव (अनुकूल भाव)' : '🟢 Low Pressure (Favorable)';
    const pMedLbl = LN === 'kn' ? '🟡 ಮಧ್ಯಮ' : LN === 'hi' ? '🟡 मध्यम' : '🟡 Medium';
    const pHighLbl = LN === 'kn' ? '🔴 ಅಧಿಕ ಪೂರೈಕೆ ಒತ್ತಡ' : LN === 'hi' ? '🔴 अधिक आवक दबाव' : '🔴 High Glut';
    const outlookLevelLbl = LN === 'kn' ? 'ಮಾರುಕಟ್ಟೆ ಒತ್ತಡ ಮಟ್ಟ:' : LN === 'hi' ? 'मंडी दबाव स्तर:' : 'Price Outlook Level:';
    const shareLbl = LN === 'kn' ? 'ಸ್ಥಳೀಯ ರೈತರ ಪೂರೈಕೆ ಪಾಲು:' : LN === 'hi' ? 'स्थानीय किसान आपूर्ति:' : 'Local Farmer Supply Share:';

    ppWrap.innerHTML = `
      <div class="pp-gauge">
        <div class="pp-bar-wrap">
          <div class="pp-seg-low" style="width:${low}%">${low > 12 ? low+'%' : ''}</div>
          <div class="pp-seg-med" style="width:${med}%">${med > 12 ? med+'%' : ''}</div>
          <div class="pp-seg-high" style="width:${high}%">${high > 12 ? high+'%' : ''}</div>
        </div>
        <div class="pp-labels">
          <span>${pLowLbl}</span>
          <span>${pMedLbl}</span>
          <span>${pHighLbl}</span>
        </div>
      </div>
      <div class="pp-level">${outlookLevelLbl} <span style="color:${m.level==='Low'?'#22C55E':m.level==='Medium'?'#F59E0B':'#EF4444'}">${m.level} Pressure</span></div>
      <div class="pp-explain">${shareLbl} ${m.share}% | Glut: ${(m.glut*100).toFixed(0)}%</div>
    `;
  }

  renderPriceChart(m.points);

  const outlookWrap = $('#outlook-wrap');
  if (outlookWrap && m.outlook_pct) {
    const low = m.outlook_pct.low || 0;
    const med = m.outlook_pct.medium || 0;
    const high = m.outlook_pct.high || 0;
    outlookWrap.innerHTML = `
      <div class="outlook-level">
        <div class="ol-item ol-low">
          <span class="ol-label">🟢 Low</span>
          <div class="ol-bar-bg"><div class="ol-bar-fill" style="width:${low}%"></div></div>
          <span class="ol-pct">${low}%</span>
        </div>
        <div class="ol-item ol-med">
          <span class="ol-label">🟡 Medium</span>
          <div class="ol-bar-bg"><div class="ol-bar-fill" style="width:${med}%"></div></div>
          <span class="ol-pct">${med}%</span>
        </div>
        <div class="ol-item ol-high">
          <span class="ol-label">🔴 High</span>
          <div class="ol-bar-bg"><div class="ol-bar-fill" style="width:${high}%"></div></div>
          <span class="ol-pct">${high}%</span>
        </div>
      </div>
      <div style="margin-top:14px;font-size:0.84rem;color:var(--text-muted);line-height:1.5;">
        ${m.level === 'Low' ? 
          (LN === 'kn' ? '✅ <strong>ಉತ್ತಮ ಮಾರುಕಟ್ಟೆ:</strong> ಕೊಯ್ಲಿನ ಅವಧಿಯಲ್ಲಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪೂರೈಕೆ ಒತ್ತಡ ಕಡಿಮೆ ಇದ್ದು, ಉತ್ತಮ ಬೆಲೆ ಸಿಗುವ ನಿರೀಕ್ಷೆಯಿದೆ.' :
           LN === 'hi' ? '✅ <strong>मजबूत बाजार:</strong> आपकी कटाई के समय मंडी में आवक कम रहेगी। अच्छा भाव मिलने की पूरी संभावना है।' :
           '✅ <strong>Strong Market:</strong> Low supply glut expected at your harvest window. Good price realization likely.') :
          m.level === 'Medium' ? 
          (LN === 'kn' ? '⚖️ <strong>ಸಾಮಾನ್ಯ ಮಾರುಕಟ್ಟೆ:</strong> ಸಾಮಾನ್ಯ ಋತುವಾರು ಪೂರೈಕೆ ಇರುತ್ತದೆ. ಉತ್ತಮ ಲಾಭಕ್ಕಾಗಿ ಕೃಷಿ ಉತ್ಪನ್ನವನ್ನು ಹಂತ-ಹಂತವಾಗಿ ಮಂಡಿಗೆ ತಂದು ಮಾರಾಟ ಮಾಡಿ.' :
           LN === 'hi' ? '⚖️ <strong>संतुलित बाजार:</strong> सामान्य मौसमी आवक रहेगी। उपज को किस्तों में बेचें।' :
           '⚖️ <strong>Balanced Market:</strong> Normal seasonal supply. Stagger your produce delivery to maximize profit.') :
          (LN === 'kn' ? '⚠️ <strong>ಅಧಿಕ ಪೂರೈಕೆ:</strong> ಅನೇಕ ರೈತರು ಒಂದೇ ಬಾರಿಗೆ ಕೊಯ್ಲು ಮಾಡುತ್ತಿದ್ದಾರೆ. ಧಾನ್ಯ ಸಂಸ್ಕರಣೆ ಅಥವಾ ಸಂಗ್ರಹಣೆ ಮಾಡಿ ನಂತರ ಮಾರಾಟ ಮಾಡಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.' :
           LN === 'hi' ? '⚠️ <strong>भारी आवक दबाव:</strong> कई किसान एक साथ फसल ला रहे हैं। भंडारण या सुखाकर बाद में बेचने पर विचार करें।' :
           '⚠️ <strong>High Supply Glut:</strong> Many farmers harvesting concurrently. Consider partial drying, storage, or collective FPO marketing.')}
      </div>
    `;
  }

  const iaWrap = $('#income-analysis-wrap');
  if (iaWrap) {
    const qtlTxt = LN === 'kn' ? 'ಕ್ವಿಂಟಾಲ್' : LN === 'hi' ? 'क्विंटल' : 'qtl';
    const rows = [
      { 
        label: LN === 'kn' ? `ಒಟ್ಟು ಉತ್ಪಾದನೆ (${e.yield_q} ${qtlTxt} @ ₹${n0(d.price)}/${qtlTxt})` :
               LN === 'hi' ? `कुल पैदावार (${e.yield_q} ${qtlTxt} @ ₹${n0(d.price)}/${qtlTxt})` :
               `Total Yield (${e.yield_q} qtl @ ₹${n0(d.price)}/qtl)`, 
        value: INR(e.income), 
        color: 'var(--primary)' 
      },
      { 
        label: LN === 'kn' ? 'ಒಟ್ಟು ಉತ್ಪಾದನಾ ವೆಚ್ಚ' : LN === 'hi' ? 'कुल उत्पादन खर्च' : 'Total Production Expenses', 
        value: '−' + INR(e.total), 
        color: 'var(--red)' 
      },
      { 
        label: LN === 'kn' ? 'ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ' : LN === 'hi' ? 'शुद्ध अनुमानित लाभ' : 'Estimated Net Profit', 
        value: (e.profit >= 0 ? '+' : '−') + INR(Math.abs(e.profit)), 
        color: e.profit >= 0 ? 'var(--primary)' : 'var(--red)' 
      },
      { 
        label: LN === 'kn' ? 'ಕನಿಷ್ಠ ಬ್ರೇಕ್-ಈವನ್ ಬೆಲೆ' : LN === 'hi' ? 'न्यूनतम ब्रेक-ईवन भाव' : 'Minimum Break-even Price', 
        value: `₹${n0(e.breakeven_price)} / ${qtlTxt}`, 
        color: 'var(--text-muted)' 
      }
    ];
    iaWrap.innerHTML = rows.map((r, i) => `
      <div class="ia-row" ${i === 2 ? 'style="background:var(--primary-light);border-radius:6px;padding:10px 12px;margin:4px 0;"' : ''}>
        <span class="ia-label">${r.label}</span>
        <span class="ia-value" style="color:${r.color};">${r.value}</span>
      </div>
    `).join('');
  }
}

function renderPriceChart(points) {
  const canvas = $('#price-chart');
  if (!canvas || !points || points.length < 2) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth || 600, H = 220;
  canvas.width = W; canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const prices = points.map(p => p.price);
  const lows   = points.map(p => p.lo);
  const highs  = points.map(p => p.hi);
  const allVals = [...prices, ...lows, ...highs];
  const minY = Math.min(...allVals) * 0.98;
  const maxY = Math.max(...allVals) * 1.02;
  const pad = { t: 20, b: 50, l: 70, r: 20 };
  const chartW = W - pad.l - pad.r;
  const chartH = H - pad.t - pad.b;

  const xPos = i => pad.l + (i / (points.length - 1)) * chartW;
  const yPos = v => pad.t + chartH - ((v - minY) / (maxY - minY)) * chartH;

  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (i / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    const val = maxY - (i / 4) * (maxY - minY);
    ctx.fillStyle = '#9CA3AF'; ctx.font = '11px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText('₹' + Math.round(val), pad.l - 6, y + 4);
  }

  ctx.beginPath();
  points.forEach((p, i) => { i === 0 ? ctx.moveTo(xPos(i), yPos(p.hi)) : ctx.lineTo(xPos(i), yPos(p.hi)); });
  points.slice().reverse().forEach((p, i) => ctx.lineTo(xPos(points.length - 1 - i), yPos(p.lo)));
  ctx.closePath();
  ctx.fillStyle = 'rgba(15,104,72,0.1)'; ctx.fill();

  ctx.beginPath(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#0F6848'; ctx.lineJoin = 'round';
  points.forEach((p, i) => { i === 0 ? ctx.moveTo(xPos(i), yPos(p.price)) : ctx.lineTo(xPos(i), yPos(p.price)); });
  ctx.stroke();

  points.forEach((p, i) => {
    const x = xPos(i), y = yPos(p.price);
    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#0F6848' : '#E5A100'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#6B7280'; ctx.font = '11px sans-serif'; ctx.textAlign = 'center';
    const label = i === 0 ? (LN === 'kn' ? 'ಇಂದು' : LN === 'hi' ? 'आज' : 'Today') : '+' + p.day + 'd';
    ctx.fillText(label, x, H - pad.b + 16);
    if (i === 0 || i === points.length - 1) {
      ctx.fillStyle = '#0F6848'; ctx.font = 'bold 11px sans-serif';
      ctx.fillText('₹' + p.price, x, y - 10);
    }
  });

  const leg = $('#price-chart-legend');
  if (leg) {
    leg.innerHTML = `
      <div class="pcl-item"><div class="pcl-dot" style="background:#0F6848"></div>${LN==='kn'?'ನಿರೀಕ್ಷಿತ ಮಂಡಿ ಬೆಲೆ':LN==='hi'?'अपेक्षित मंडी भाव':'Expected APMC Price'}</div>
      <div class="pcl-item"><div class="pcl-dot" style="background:rgba(15,104,72,0.25);border:1px solid #0F6848"></div>${LN==='kn'?'ದೈನಂದಿನ ಬೆಲೆ ವ್ಯಾಪ್ತಿ':LN==='hi'?'दैनिक भाव बैंड':'Daily Trading Band'}</div>
      <div class="pcl-item"><div class="pcl-dot" style="background:#E5A100"></div>${LN==='kn'?'ಮುಂಬರುವ ಮಂಡಿ ದಿನಗಳು':LN==='hi'?'आगामी मंडी दिन':'Upcoming Mandi Days'}</div>
    `;
  }
}

// =====================================================================
// =====================================================================
// TAB 4: CROP HEALTH & DISEASE ADVISORY (Strictly for Selected Crop)
// =====================================================================
let _currentDiseases = [];
let _activeCropObj = null;

async function loadCropDiseases(cropName, cropObj) {
  const grid = $('#disease-cards-grid');
  if (grid) {
    grid.innerHTML = `<p class="fl-loading">${LN==='kn'?'ಬೆಳೆ ರೋಗ ಮತ್ತು ಚಿಕಿತ್ಸಾ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...':LN==='hi'?'फसल रोग व उपचार विवरण लोड हो रहे हैं...':'Loading verified crop diseases and treatments...'}</p>`;
  }

  const crop = cropObj || (CR.find(c => c.en === cropName) || { en: cropName || 'Paddy' });
  _activeCropObj = crop;
  const targetCrop = crop.en || cropName || 'Paddy';
  const icon = cropIcon(crop);
  const cName = getCropName(crop);

  // Update Header Icon & Badge
  const iconEl = $('#dbb-crop-icon');
  if (iconEl) iconEl.textContent = icon;
  const badge = $('#cdb-badge');
  if (badge) badge.textContent = `${icon} ${cName}`;

  try {
    const r = await fetch(`/api/diseases?crop=${encodeURIComponent(targetCrop)}`);
    const data = await r.json();

    _currentDiseases = data.diseases || [];
    const countEl = $('#cdb-count');
    if (countEl) {
      countEl.textContent = LN === 'kn' ? `${cName} ಬೆಳೆಗೆ ಸಂಬಂಧಿಸಿದ ${_currentDiseases.length} ಪ್ರಮಾಣೀಕೃತ ರೋಗಗಳು ಮತ್ತು ಚಿಕಿತ್ಸೆಗಳು` :
                            LN === 'hi' ? `${cName} फसल के ${_currentDiseases.length} प्रमाणित रोग व सटीक उपचार` :
                            `Showing ${_currentDiseases.length} verified diseases & university-approved treatments for ${cName}`;
    }

    renderDiseaseCards(_currentDiseases, crop);
  } catch(e) {
    if (grid) grid.innerHTML = `<p class="fl-empty">Failed to load diseases: ${e.message}</p>`;
  }
}

function renderDiseaseCards(diseases, crop) {
  const grid = $('#disease-cards-grid');
  if (!grid) return;

  if (!diseases || !diseases.length) {
    grid.innerHTML = `<p class="fl-empty">${LN==='kn'?'ಯಾವುದೇ ರೋಗ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ.':LN==='hi'?'कोई रोग जानकारी नहीं मिली।':'No diseases found matching your search.'}</p>`;
    return;
  }

  const fallbackImg = '/diseases/paddy_1.jpg';

  grid.innerHTML = diseases.map(d => {
    const sev = (d.severity || 'Moderate').toLowerCase();
    const sevClass = sev.includes('severe') ? 'dc-sev-severe' : sev.includes('manageable') ? 'dc-sev-manageable' : 'dc-sev-moderate';
    const sevText = sev.includes('severe') ? 
      (LN === 'kn' ? 'ತೀವ್ರ ಹಾನಿ (Severe)' : LN === 'hi' ? 'गंभीर प्रभाव (Severe)' : 'Severe Impact') : 
      (LN === 'kn' ? 'ಮಧ್ಯಮ (Moderate)' : LN === 'hi' ? 'मध्यम (Moderate)' : 'Moderate Impact');

    let primaryTitle = d.name;
    let secondaryTitle = d.name_kn || '';
    if (LN === 'kn') {
      primaryTitle = d.name_kn || d.name;
      secondaryTitle = d.name;
    } else if (LN === 'hi') {
      primaryTitle = d.name_hi || d.name;
      secondaryTitle = d.name;
    }

    const sympLbl = LN === 'kn' ? '🔍 ರೋಗದ ಪ್ರಮುಖ ಲಕ್ಷಣ (Symptom)' : LN === 'hi' ? '🔍 रोग के मुख्य लक्षण (Symptom)' : '🔍 Key Symptoms';
    const chemLbl = LN === 'kn' ? '🧪 ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ (Chemical Dosage)' : LN === 'hi' ? '🧪 रासायनिक नियंत्रण व मात्रा (Chemical)' : '🧪 Chemical Control & Dosage';
    const orgLbl  = LN === 'kn' ? '🌿 ಸಾವಯವ ಪರಿಹಾರ (Organic Remedy)' : LN === 'hi' ? '🌿 जैविक / प्राकृतिक उपचार (Organic)' : '🌿 Organic / Bio Solution';

    return `
      <div class="disease-card">
        <div class="dc-media">
          <img src="${d.image}" alt="${d.name}" class="dc-img" loading="lazy" onerror="this.onerror=null; this.src='${fallbackImg}';">
          <span class="dc-severity-tag ${sevClass}">● ${sevText}</span>
        </div>
        <div class="dc-content">
          <div class="dc-header">
            <h4 class="dc-title-en">${primaryTitle}</h4>
            ${secondaryTitle ? `<div class="dc-title-kn">${secondaryTitle}</div>` : ''}
          </div>

          <div class="dc-symptoms-box">
            <div class="dc-section-label" style="color:#B45309;">${sympLbl}</div>
            <div>${d.symptoms || 'Characteristic spots, lesions, or wilting on foliage.'}</div>
          </div>

          <div class="dc-treatments">
            <div class="dc-treat-box dc-treat-chem">
              <div class="dc-section-label">${chemLbl}</div>
              <div>${d.treatment_chemical || 'Apply recommended university fungicide spray at initial onset.'}</div>
            </div>

            <div class="dc-treat-box dc-treat-org">
              <div class="dc-section-label">${orgLbl}</div>
              <div>${d.treatment_organic || 'Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Pseudomonas fluorescens.'}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterDiseases(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    renderDiseaseCards(_currentDiseases, _activeCropObj);
    return;
  }
  const filtered = _currentDiseases.filter(d => {
    return (d.name && d.name.toLowerCase().includes(q)) ||
           (d.name_kn && d.name_kn.toLowerCase().includes(q)) ||
           (d.name_hi && d.name_hi.toLowerCase().includes(q)) ||
           (d.pathogen && d.pathogen.toLowerCase().includes(q)) ||
           (d.symptoms && d.symptoms.toLowerCase().includes(q)) ||
           (d.treatment_chemical && d.treatment_chemical.toLowerCase().includes(q)) ||
           (d.treatment_organic && d.treatment_organic.toLowerCase().includes(q));
  });
  renderDiseaseCards(filtered, _activeCropObj);
}

function renderHealth(d) {
  if (!$('#tab-health') || !d || !d.crop) return;
  const cropObj = (CR && CR[d.crop.id]) ? CR[d.crop.id] : d.crop;
  const cropName = cropObj.en || d.crop.en || (typeof d.crop === 'string' ? d.crop : 'Paddy');
  loadCropDiseases(cropName, cropObj);
}

// =====================================================================
// =====================================================================
// TAB 5: AI DISEASE PREDICTION — CAMERA & FILE UPLOAD
// =====================================================================
let _camStream = null;
let _camFacingMode = 'environment'; // default: rear camera

function populateScanCropSelect() {
  const sel = $('#scan-crop-select');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = `<option value="auto">✨ ${LN === 'kn' ? 'ಸ್ವಯಂಚಾಲಿತ ಪತ್ತೆ (Auto-Detect Foliage)' : LN === 'hi' ? 'स्वचालित पहचान (Auto-Detect)' : 'Auto-Detect Foliage / ಸ್ವಯಂಚಾಲಿತ ಪತ್ತೆ'}</option>`;
  if (Array.isArray(CR)) {
    CR.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.en;
      const knLabel = c.kn ? ` (${c.kn})` : '';
      opt.textContent = `${cropIcon(c)} ${c.en}${knLabel}`;
      sel.appendChild(opt);
    });
  }
  if (PlanData && PlanData.crop && PlanData.crop.en) {
    sel.value = PlanData.crop.en;
  } else if (_activeCropObj && _activeCropObj.en) {
    sel.value = _activeCropObj.en;
  } else if (currentVal && currentVal !== 'auto') {
    sel.value = currentVal;
  }
}

function startCamera() {
  const constraints = {
    video: {
      facingMode: _camFacingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  };

  navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      _camStream = stream;
      const video = $('#scan-video');
      video.srcObject = stream;
      const placeholder = $('#camera-idle-placeholder');
    if (placeholder) placeholder.style.display = 'none';
      $('#camera-view-wrap').style.display = 'block';
      $('#btn-start-camera').style.display = 'none';
      $('#btn-stop-camera').style.display = 'inline-flex';
      $('#btn-flip-camera').style.display = 'inline-flex';
      $('#btn-snap-camera').style.display = 'inline-flex';
      
      const prevImg = $('#scan-preview-img');
      if (prevImg) prevImg.style.display = 'none';
    })
    .catch(err => {
      alert((LN === 'kn' ? 'ಕ್ಯಾಮೆರಾ ಪ್ರವೇಶಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ: ' : 'Cannot open camera: ') + err.message + '\n' + 
            (LN === 'kn' ? 'ದಯವಿಟ್ಟು ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಬಟನ್ ಬಳಸಿ.' : 'Please use the Upload Crop Photo button instead.'));
    });
}

function stopCamera() {
  if (_camStream) {
    _camStream.getTracks().forEach(t => t.stop());
    _camStream = null;
  }
  const video = $('#scan-video');
  if (video) video.srcObject = null;
  $('#camera-view-wrap').style.display = 'none';
  $('#camera-idle-placeholder').style.display = 'flex';
  $('#btn-stop-camera').style.display = 'none';
  $('#btn-flip-camera').style.display = 'none';
  $('#btn-snap-camera').style.display = 'none';
  $('#btn-start-camera').style.display = 'inline-flex';
}

function switchCameraFacing() {
  _camFacingMode = _camFacingMode === 'environment' ? 'user' : 'environment';
  if (_camStream) {
    stopCamera();
    setTimeout(startCamera, 300);
  }
}

function captureSnapshot() {
  const video = $('#scan-video');
  const canvas = $('#scan-canvas');
  if (!video || !canvas) return;

  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

  const prevImg = $('#scan-preview-img');
  if (prevImg) {
    prevImg.src = dataUrl;
    prevImg.style.display = 'block';
  }

  runDiseaseAnalysis(dataUrl);
}

function onFileUpload(event) {
  const inputEl = event.target;
  const file = inputEl && inputEl.files && inputEl.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const dataUrl = e.target.result;
    const prevImg = $('#scan-preview-img');
    if (prevImg) {
      prevImg.src = dataUrl;
      prevImg.style.display = 'block';
    }
    const placeholder = $('#camera-idle-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    if (_camStream) {
      stopCamera();
    }
    runDiseaseAnalysis(dataUrl);
  };
  reader.onerror = () => {
    alert('Failed to read file. Please try again.');
  };
  reader.readAsDataURL(file);
  if (inputEl) inputEl.value = '';
}


// Resize large images before sending to server (max 1200px, quality 0.85)
function resizeImageDataUrl(dataUrl, maxDim, quality) {
  maxDim = maxDim || 1200;
  quality = quality || 0.85;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w <= maxDim && h <= maxDim) {
        resolve(dataUrl); // Already small enough
        return;
      }
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback to original
    img.src = dataUrl;
  });
}

async function runDiseaseAnalysis(dataUrl) {
  const loading = $('#scan-loading');
  const container = $('#scan-result-container');
  if (loading) loading.style.display = 'block';
  if (container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }

  const sel = $('#scan-crop-select');
  let cropName = sel ? sel.value : 'auto';
  if (!cropName || cropName === 'auto') {
    if (PlanData && PlanData.crop && PlanData.crop.en) {
      cropName = PlanData.crop.en;
    } else if (_activeCropObj && _activeCropObj.en) {
      cropName = _activeCropObj.en;
    } else {
      cropName = 'auto';
    }
  }

  try {
    // Resize image to prevent payload too large errors
    const resizedUrl = await resizeImageDataUrl(dataUrl, 1200, 0.85);
    const res = await fetch('/api/crop-health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_b64: resizedUrl.split(',')[1] || resizedUrl,
        crop_name: cropName
      })
    });
    const data = await res.json();
    if (loading) loading.style.display = 'none';
    renderScanResult(data, cropName);
  } catch (err) {
    if (loading) loading.style.display = 'none';
    if (container) {
      container.style.display = 'block';
      container.innerHTML = `<div style="text-align:center; color:var(--red); padding:20px; font-weight:700;">Diagnosis request failed: ${err.message}</div>`;
    }
  }
}

function renderScanResult(data, cropName) {
  const container = $('#scan-result-container');
  if (!container) return;
  container.style.display = 'block';
  setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);

  if (!data.success) {
    container.innerHTML = `<div style="color:var(--red); text-align:center; padding:20px; font-weight:700;">Error: ${data.error || 'Diagnosis failed'}</div>`;
    return;
  }

  // 1. Human Detected Response
  if (data.is_human) {
    container.innerHTML = `
      <div class="human-detected-card">
        <div class="hdc-icon">🧑⚠️</div>
        <div class="hdc-title">${LN === 'kn' ? 'ಮಾನವ ಪತ್ತೆಯಾಗಿದೆ / Human Detected' : 'Human Detected / ಮಾನವ ಪತ್ತೆಯಾಗಿದೆ'}</div>
        <div class="hdc-sub">${data.message || 'Please point camera at crop leaf or affected plant part.'}</div>
        <div class="hdc-sub" style="margin-top:8px; font-weight:700; color:#92400E;">${data.message_kn || 'ಕ್ಯಾಮೆರಾ ಮುಂದೆ ಮಾನವ ಪತ್ತೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಕ್ಯಾಮೆರಾವನ್ನು ಬೆಳೆಯ ಎಲೆ ಅಥವಾ ರೋಗಪೀಡಿತ ಭಾಗದತ್ತ ತಿರುಗಿಸಿ.'}</div>
      </div>
    `;
    return;
  }

  // 2. Crop Disease / Health Result
  const a = data.analysis || {};
  const isHealthy = (a.disease || '').toLowerCase().includes('healthy');
  const sev = (a.severity || 'moderate').toLowerCase();
  const sevClass = sev === 'mild' ? 'mild' : sev === 'severe' ? 'severe' : 'moderate';
  const cropDisplay = data.crop || cropName;

  const diseaseTitle = (LN === 'kn' && a.disease_kn) ? a.disease_kn : (a.disease || 'Plant Foliar Issue');
  const secondaryTitle = (LN === 'kn' && a.disease_kn && a.disease) ? a.disease : (a.disease_kn || '');
  const stats = a.visual_stats || null;

  container.innerHTML = `
    <div class="disease-result-card">
      <div class="drc-header">
        <div class="drc-icon">${isHealthy ? '🌿✅' : '🔬⚠️'}</div>
        <div style="flex:1;">
          <div class="drc-crop">${LN === 'kn' ? 'ಗುರುತಿಸಲಾದ ಬೆಳೆ' : 'Detected Crop'}: <strong>${cropDisplay}</strong></div>
          <div class="drc-disease">${diseaseTitle}</div>
          ${secondaryTitle ? `<div style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">${secondaryTitle}</div>` : ''}
          ${isHealthy ? '<span class="drc-severity mild">Healthy Plant</span>' : `<span class="drc-severity ${sevClass}">${a.severity || 'Moderate Severity'}</span>`}
          ${a.confidence ? `<span class="drc-severity" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #93C5FD;margin-left:6px;">✨ ${a.confidence}% Visual Match</span>` : ''}
        </div>
      </div>

      ${a.reference_image ? `
        <div class="drc-reference-box" style="display:flex;align-items:center;gap:12px;margin:10px 0 16px;padding:10px 14px;background:#F1F5F9;border-radius:10px;border:1px solid #CBD5E1;">
          <img src="${a.reference_image}" style="width:70px;height:55px;object-fit:cover;border-radius:6px;border:1.5px solid #94A3B8;flex-shrink:0;" alt="${a.disease}">
          <div>
            <div style="font-size:0.74rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">UAS / ICAR Verified Reference</div>
            <div style="font-size:0.88rem;font-weight:700;color:var(--text-main);">${a.disease}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Compare verified reference photo with your crop snapshot</div>
          </div>
        </div>
      ` : ''}

      ${stats ? `
        <div class="drc-stats-strip">
          <span class="drc-stat-pill">🌿 ${LN === 'kn' ? 'ಹಸಿರು ಎಲೆಯ ಭಾಗ' : 'Green Foliage'}: <strong>${stats.green_pct}%</strong></span>
          ${stats.yellow_pct > 5 ? `<span class="drc-stat-pill">🟡 ${LN === 'kn' ? 'ಹಳದಿ/ಕ್ಲೋರೋಸಿಸ್' : 'Chlorosis'}: <strong>${stats.yellow_pct}%</strong></span>` : ''}
          ${stats.necrotic_pct > 3 ? `<span class="drc-stat-pill">🟤 ${LN === 'kn' ? 'ಕಂದು ರೋಗದ ಮಚ್ಚೆಗಳು' : 'Necrotic Lesions'}: <strong>${stats.necrotic_pct}%</strong></span>` : ''}
          ${stats.spot_count > 0 ? `<span class="drc-stat-pill">🔍 ${LN === 'kn' ? 'ಪತ್ತೆಯಾದ ಚುಕ್ಕೆಗಳು' : 'Spots'}: <strong>${stats.spot_count}</strong></span>` : ''}
        </div>
      ` : ''}

      ${a.symptoms ? `
        <div class="drc-section">
          <div class="drc-section-label">🔍 ${LN === 'kn' ? 'ರೋಗ ಲಕ್ಷಣಗಳು (Symptoms)' : 'Observable Symptoms'}</div>
          <div class="drc-section-text">${a.symptoms}</div>
        </div>
      ` : ''}

      ${a.treatment_chemical ? `
        <div class="drc-section">
          <div class="drc-section-label">🧪 ${LN === 'kn' ? 'ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ ಮತ್ತು ಪ್ರಮಾಣ (Chemical Treatment)' : 'Chemical Control & Dosage'}</div>
          <div class="drc-section-text chemical">${a.treatment_chemical}</div>
        </div>
      ` : ''}

      ${a.treatment_organic ? `
        <div class="drc-section">
          <div class="drc-section-label">🌿 ${LN === 'kn' ? 'ಸಾವಯವ ಪರಿಹಾರ (Organic Solution)' : 'Organic / Bio Remedy'}</div>
          <div class="drc-section-text organic">${a.treatment_organic}</div>
        </div>
      ` : ''}

      ${a.treatment_cultural ? `
        <div class="drc-section">
          <div class="drc-section-label">🌾 ${LN === 'kn' ? 'ಕೃಷಿ ಪದ್ಧತಿಗಳು (Cultural Practices)' : 'Field & Cultural Management'}</div>
          <div class="drc-section-text">${a.treatment_cultural}</div>
        </div>
      ` : ''}

      ${a.prevention ? `
        <div class="drc-section">
          <div class="drc-section-label">🛡️ ${LN === 'kn' ? 'ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳು (Prevention)' : 'Preventive Measures'}</div>
          <div class="drc-section-text">${a.prevention}</div>
        </div>
      ` : ''}

      <div style="margin-top:14px; padding:10px 14px; background:var(--surface-alt); border-radius:8px; font-size:0.78rem; color:var(--text-muted); border-left:3px solid var(--primary);">
        ✅ ${LN === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ (UAS) ಮತ್ತು ICAR ಅಧಿಕೃತ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಚಿಕಿತ್ಸಾ ಮಾರ್ಗಸೂಚಿಗಳು.' : 'Official UAS Bangalore/Dharwad & ICAR verified treatment guidelines for Karnataka.'}
      </div>
    </div>
  `;
}


// Search target crop diseases, chemical control & dosage, and organic remedies
async function searchTargetCropTreatments() {
  const sel = $('#scan-crop-select');
  let cropName = sel ? sel.value : 'auto';
  if (!cropName || cropName === 'auto') {
    if (PlanData && PlanData.crop && PlanData.crop.en) {
      cropName = PlanData.crop.en;
      if (sel) sel.value = cropName;
    } else if (_activeCropObj && _activeCropObj.en) {
      cropName = _activeCropObj.en;
      if (sel) sel.value = cropName;
    } else {
      cropName = 'Tomato';
      if (sel) sel.value = cropName;
    }
  }

  const container = $('#scan-result-container');
  const loading = $('#scan-loading');
  if (loading) loading.style.display = 'block';
  if (container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }

  try {
    const res = await fetch(`/api/diseases?crop=${encodeURIComponent(cropName)}`);
    const data = await res.json();
    if (loading) loading.style.display = 'none';
    if (!data.diseases || data.diseases.length === 0) {
      if (container) {
        container.style.display = 'block';
        container.innerHTML = `<div style="text-align:center;padding:24px;color:#000000;font-weight:700;">No disease data found for ${cropName}</div>`;
      }
      return;
    }
    renderCropTreatmentsSearchResult(cropName, data.diseases);
  } catch(err) {
    if (loading) loading.style.display = 'none';
    if (container) {
      container.style.display = 'block';
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--red);font-weight:700;">Search failed: ${err.message}</div>`;
    }
  }
}

function renderCropTreatmentsSearchResult(cropName, diseases) {
  const container = $('#scan-result-container');
  if (!container) return;
  container.style.display = 'block';
  setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);

  const headerTitle = LN === 'kn' ? `${cropName} ರೋಗ ನಿರ್ವಹಣೆ ಮತ್ತು ಅಧಿಕೃತ ಚಿಕಿತ್ಸಾ ಮಾಹಿತಿ` :
                      LN === 'hi' ? `${cropName} रोग प्रबंधन एवं उपचार विवरण` :
                      `${cropName} Disease Management & Verified Treatments`;

  let html = `
    <div style="background:#ffffff;border:2px solid #3B82F6;border-radius:12px;padding:20px;box-shadow:var(--shadow-md);margin-bottom:20px;animation:fadeIn 0.3s ease-out;">
      <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #E2E8F0;padding-bottom:12px;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:2rem;line-height:1;">🌱</span>
          <div>
            <h3 style="margin:0 0 4px;font-size:1.25rem;font-weight:800;color:#000000;">${headerTitle}</h3>
            <span style="font-size:0.8rem;font-weight:700;color:#1D4ED8;background:#EFF6FF;padding:2px 8px;border-radius:12px;border:1px solid #BFDBFE;">UAS Bangalore & Dharwad / ICAR Verified Package</span>
          </div>
        </div>
        <span style="font-size:0.82rem;font-weight:700;color:#000000;">${diseases.length} ${LN === 'kn' ? 'ಪ್ರಮುಖ ರೋಗಗಳು' : 'Major Diseases'}</span>
      </div>
  `;

  diseases.forEach((dis, idx) => {
    const sev = (dis.severity || 'Moderate').toLowerCase();
    const sevClass = sev === 'mild' ? 'mild' : sev === 'severe' ? 'severe' : 'moderate';
    const disTitle = (LN === 'kn' && dis.name_kn) ? dis.name_kn : dis.name;
    const disSecondary = (LN === 'kn' && dis.name_kn) ? dis.name : (dis.name_kn || '');

    html += `
      <div style="background:#F8FAFC;border:1.5px solid #CBD5E1;border-radius:10px;padding:16px;margin-bottom:18px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;border-bottom:1px solid #E2E8F0;padding-bottom:10px;flex-wrap:wrap;">
          <div>
            <div style="font-size:1.1rem;font-weight:800;color:#000000;">${idx+1}. ${disTitle}</div>
            ${disSecondary ? `<div style="font-size:0.85rem;font-weight:700;color:#475569;">${disSecondary}</div>` : ''}
          </div>
          <span class="drc-severity ${sevClass}">${dis.severity || 'Moderate'}</span>
        </div>

        ${dis.image ? `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:8px 12px;background:#ffffff;border-radius:8px;border:1px solid #E2E8F0;">
            <img src="${dis.image}" style="width:75px;height:60px;object-fit:cover;border-radius:6px;border:1.5px solid #94A3B8;flex-shrink:0;" alt="${dis.name}">
            <div>
              <div style="font-size:0.75rem;font-weight:800;color:#000000;text-transform:uppercase;">Verified Field Photo</div>
              <div style="font-size:0.78rem;font-weight:600;color:#000000;">Compare with your crop leaf for diagnostic match</div>
            </div>
          </div>
        ` : ''}

        ${dis.symptoms ? `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.8rem;font-weight:800;color:#000000;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:5px;">
              <span>🔍</span> ${LN === 'kn' ? 'ರೋಗ ಲಕ್ಷಣಗಳು (Symptoms)' : 'Observable Symptoms'}
            </div>
            <div style="font-size:0.92rem;font-weight:600;color:#000000 !important;line-height:1.6;background:#ffffff;padding:10px 14px;border-radius:8px;border-left:4px solid #F59E0B;border:1px solid #E2E8F0;border-left:4px solid #F59E0B;">
              ${dis.symptoms}
            </div>
          </div>
        ` : ''}

        ${dis.treatment_chemical ? `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.8rem;font-weight:800;color:#000000;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:5px;">
              <span>🧪</span> ${LN === 'kn' ? 'ರಾಸಾಯನಿಕ ನಿಯಂತ್ರಣ ಮತ್ತು ಪ್ರಮಾಣ (Chemical Control & Dosage)' : 'Chemical Control & Dosage'}
            </div>
            <div style="font-size:0.92rem;font-weight:600;color:#000000 !important;line-height:1.6;background:#EFF6FF;padding:10px 14px;border-radius:8px;border-left:4px solid #2563EB;border:1px solid #BFDBFE;border-left:4px solid #2563EB;">
              ${dis.treatment_chemical}
            </div>
          </div>
        ` : ''}

        ${dis.treatment_organic ? `
          <div style="margin-bottom:12px;">
            <div style="font-size:0.8rem;font-weight:800;color:#000000;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:5px;">
              <span>🌿</span> ${LN === 'kn' ? 'ಸಾವಯವ ಪರಿಹಾರ (Organic / Bio Remedy)' : 'Organic / Bio Remedy'}
            </div>
            <div style="font-size:0.92rem;font-weight:600;color:#000000 !important;line-height:1.6;background:#F0FDF4;padding:10px 14px;border-radius:8px;border-left:4px solid #16A34A;border:1px solid #BBF7D0;border-left:4px solid #16A34A;">
              ${dis.treatment_organic}
            </div>
          </div>
        ` : ''}

        ${dis.treatment_cultural ? `
          <div style="margin-bottom:6px;">
            <div style="font-size:0.8rem;font-weight:800;color:#000000;text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:5px;">
              <span>🌾</span> ${LN === 'kn' ? 'ಕೃಷಿ ನಿರ್ವಹಣೆ ಮತ್ತು ಮುನ್ನೆಚ್ಚರಿಕೆ (Cultural & Prevention)' : 'Cultural Management & Prevention'}
            </div>
            <div style="font-size:0.92rem;font-weight:600;color:#000000 !important;line-height:1.6;background:#ffffff;padding:10px 14px;border-radius:8px;border:1px solid #E2E8F0;border-left:4px solid #9333EA;">
              ${dis.treatment_cultural}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `
      <div style="margin-top:10px;padding:10px 14px;background:#F1F5F9;border-radius:8px;font-size:0.8rem;font-weight:700;color:#000000;display:flex;align-items:center;gap:8px;">
        <span>✅</span> ${LN === 'kn' ? 'ಕರ್ನಾಟಕ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯ (UASB/UASD) ಮತ್ತು ICAR ಅಧಿಕೃತ ಪ್ಯಾಕೇಜ್ ಆಫ್ ಪ್ರಾಕ್ಟೀಸಸ್ ಚಿಕಿತ್ಸಾ ಶಿಫಾರಸುಗಳು.' : 'Official UAS Bangalore/Dharwad & ICAR verified chemical dosage & bio-remedies for Karnataka.'}
      </div>
    </div>
  `;

  container.innerHTML = html;
}

window.searchTargetCropTreatments = searchTargetCropTreatments;

// Expose camera & file functions to global window scope for inline onclick handlers
window.startCamera = startCamera;
window.stopCamera = stopCamera;
window.switchCameraFacing = switchCameraFacing;
window.captureSnapshot = captureSnapshot;
window.onFileUpload = onFileUpload;
window.populateScanCropSelect = populateScanCropSelect;


// PAGE 5: FARMER COMMUNITY & DBT (Direct Benefit Transfer)
// =====================================================================
function isFarmerSubscribed() {
  return localStorage.getItem('kp_subscribed') === 'true';
}

function openSubscriptionModal() {
  const m = $('#subscription-modal');
  if (m) m.style.display = 'flex';
}

function closeSubscriptionModal() {
  const m = $('#subscription-modal');
  if (m) m.style.display = 'none';
}

function activateSubscription() {
  localStorage.setItem('kp_subscribed', 'true');
  closeSubscriptionModal();
  updateSubscriptionUI();
  const dist = $('#fl-filter-district') ? $('#fl-filter-district').value : '';
  loadFarmers(dist);
  const successMsg = LN === 'kn' ? '🎉 ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಕೃಷಿಪಥ ಸಂಪರ್ಕ ಪಾಸ್ ಸಕ್ರಿಯವಾಗಿದೆ. ಕರ್ನಾಟಕದ ಪ್ರಗತಿಪರ ರೈತರ ನೇರ ಫೋನ್ ಸಂಖ್ಯೆಗಳನ್ನು ಈಗ ವೀಕ್ಷಿಸಬಹುದು!' :
                     LN === 'hi' ? '🎉 बधाई! आपका कृषिपथ किसान संपर्क पास सक्रिय हो चुका है। अब सभी प्रगतिशील किसानों के मोबाइल नंबर अनलॉक हैं!' :
                     '🎉 Congratulations! Your KrishiPath Contact Pass is active. Direct contact numbers for all Karnataka progressive farmers are now unlocked!';
  alert(successMsg);
}

function toggleSubscriptionState() {
  const current = isFarmerSubscribed();
  localStorage.setItem('kp_subscribed', current ? 'false' : 'true');
  updateSubscriptionUI();
  const dist = $('#fl-filter-district') ? $('#fl-filter-district').value : '';
  loadFarmers(dist);
}

function updateSubscriptionUI() {
  const sub = isFarmerSubscribed();
  const pill = $('#sub-status-pill');
  const actionBtn = $('#sub-action-btn');
  const toggleBtn = $('#sub-toggle-btn');

  if (sub) {
    if (pill) {
      pill.textContent = LN === 'kn' ? '⭐ ಪ್ರೀಮಿಯಂ ಪಾಸ್ ಸಕ್ರಿಯ (ಅನ್‌ಲಾಕ್)' : LN === 'hi' ? '⭐ प्रीमियम पास सक्रिय (अनलॉक)' : '⭐ Premium Pass Active (Unlocked)';
      pill.classList.add('active');
    }
    if (actionBtn) actionBtn.style.display = 'none';
    if (toggleBtn) toggleBtn.style.display = 'inline-flex';
  } else {
    if (pill) {
      pill.textContent = LN === 'kn' ? '🔒 ಉಚಿತ ಆವೃತ್ತಿ (ಸಂಖ್ಯೆ ಮರೆಮಾಡಲಾಗಿದೆ)' : LN === 'hi' ? '🔒 निःशुल्क (नंबर सुरक्षित)' : '🔒 Free Tier (Numbers Masked)';
      pill.classList.remove('active');
    }
    if (actionBtn) {
      actionBtn.style.display = 'inline-flex';
      actionBtn.textContent = LN === 'kn' ? '⚡ ಸಂಪರ್ಕ ಪಾಸ್ ಸಕ್ರಿಯಗೊಳಿಸಿ (ಉಚಿತ / ₹99)' : LN === 'hi' ? '⚡ संपर्क पास सक्रिय करें (ट्रायल / ₹99)' : '⚡ Activate Contact Pass (Free Trial / ₹99)';
    }
    if (toggleBtn) toggleBtn.style.display = 'none';
  }
}

function updateWalletUI() {
  const wallet = localStorage.getItem('kp_wallet') || '0';
  const refCode = localStorage.getItem('kp_ref_code') || '';
  const bankInfoStr = localStorage.getItem('kp_bank_info');

  const badge = $('#wallet-balance-badge');
  const val = $('#wg-wallet-val');
  const code = $('#wg-ref-code');
  const copyBtn = $('#copy-ref-btn');
  const bankCard = $('#linked-bank-card');

  const num = parseFloat(wallet) || 0;
  if (badge) badge.textContent = `₹${num.toFixed(2)} Balance`;
  if (val) val.textContent = `₹${num.toFixed(2)}`;

  if (refCode) {
    if (code) code.textContent = refCode;
    if (copyBtn) copyBtn.style.display = 'block';
  } else {
    if (code) code.textContent = LN === 'kn' ? 'ಕೆಳಗೆ ನೋಂದಾಯಿಸಿ' : LN === 'hi' ? 'नीचे पंजीकरण करें' : 'Register Below';
    if (copyBtn) copyBtn.style.display = 'none';
  }

  // Linked Bank Card
  if (bankCard) {
    if (bankInfoStr) {
      const bi = JSON.parse(bankInfoStr);
      bankCard.style.display = 'flex';
      const bName = $('#lbc-bank-name');
      const bAcc = $('#lbc-acc');
      if (bName) bName.textContent = bi.bank_name || 'Canara Bank';
      if (bAcc) bAcc.textContent = `A/C: ${bi.acc_masked || '•••• 1234'}`;
    } else {
      bankCard.style.display = 'none';
    }
  }
}

function copyReferralCode() {
  const refCode = localStorage.getItem('kp_ref_code') || '';
  if (!refCode) {
    alert(LN === 'kn' ? 'ದಯವಿಟ್ಟು ರೆಫರಲ್ ಕೋಡ್ ಪಡೆಯಲು ಕೆಳಗೆ ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್ ನೋಂದಾಯಿಸಿ.' :
          LN === 'hi' ? 'रेफरल कोड पाने के लिए कृपया नीचे अपना किसान प्रोफाइल दर्ज करें।' :
          'Please register your farm profile below to generate your referral code and earn commissions.');
    return;
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(refCode).then(() => {
      alert(LN === 'kn' ? `📋 ರೆಫರಲ್ ಕೋಡ್ [ ${refCode} ] ಕಾಪಿ ಮಾಡಲಾಗಿದೆ! ಇತರ ರೈತರೊಂದಿಗೆ ಹಂಚಿಕೊಂಡು ಪ್ರತಿ ರೆಫರಲ್‌ಗೆ ₹25 ಕಮಿಷನ್ ಪಡೆಯಿರಿ.` :
            LN === 'hi' ? `📋 रेफरल कोड [ ${refCode} ] कॉपी हो गया! साथी किसानों को भेजकर प्रति रेफरल ₹25 कमीशन अर्जित करें।` :
            `📋 Referral code [ ${refCode} ] copied to clipboard! Share it with neighbouring farmers to earn ₹25 per referral.`);
    });
  } else {
    alert(`Your referral code is: ${refCode}`);
  }
}

async function loadFarmers(district) {
  const list = $('#farmer-list');
  const countEl = $('#farmers-count');
  if (!list) return;
  list.innerHTML = `<p class="fl-loading">${LN==='kn'?'ರೈತರ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...':LN==='hi'?'किसान सूची लोड हो रही है...':'Loading farmer listings...'}</p>`;

  updateSubscriptionUI();
  updateWalletUI();

  try {
    const url = district ? `/api/farmers?district=${encodeURIComponent(district)}` : '/api/farmers';
    const r = await fetch(url);
    const data = await r.json();

    if (countEl) countEl.textContent = data.length || 0;

    if (!data.length) {
      list.innerHTML = `<p class="fl-empty">${LN==='kn'?'ಈ ಜಿಲ್ಲೆಯಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ರೈತರು ನೋಂದಾಯಿಸಿಲ್ಲ. ಮೊದಲಿಗೆ ನೋಂದಾಯಿಸಿ ₹100 ಡಿಬಿಟಿ ಅನುದಾನ ಪಡೆಯಿರಿ!':LN==='hi'?'इस ज़िले में अभी कोई किसान पंजीकृत नहीं है। पहले पंजीकरण कर ₹100 डीबीटी प्राप्त करें!':'No farmers listed yet in this district. Be the first to register and receive ₹100 DBT grant!'}</p>`;
      return;
    }

    const isSubscribed = isFarmerSubscribed();
    const expTxt = LN === 'kn' ? 'ವರ್ಷಗಳ ಅನುಭವ' : LN === 'hi' ? 'वर्ष का अनुभव' : 'yrs exp';
    const unlockTxt = LN === 'kn' ? '🔒 ಸಂಖ್ಯೆ ಅನ್‌ಲಾಕ್ ಮಾಡಿ' : LN === 'hi' ? '🔒 नंबर अनलॉक करें' : '🔒 Unlock Number';
    const callTxt = LN === 'kn' ? '📞 ಕರೆ ಮಾಡಿ' : LN === 'hi' ? '📞 कॉल करें' : '📞 Call';
    const waTxt = LN === 'kn' ? '💬 ವಾಟ್ಸಾಪ್' : LN === 'hi' ? '💬 व्हाट्सएप' : '💬 WhatsApp';

    list.innerHTML = data.map(f => {
      const phoneClean = String(f.phone || '').trim();
      const maskedPhone = phoneClean.length >= 10 ? `+91 ${phoneClean.slice(0, 5)} •••••` : '+91 94481 •••••';
      const fullPhone = `+91 ${phoneClean}`;

      return `
        <div class="fl-item">
          <div class="fl-avatar">${f.name ? f.name[0].toUpperCase() : 'F'}</div>
          <div style="flex:1;">
            <div class="fl-info-name">${f.name}</div>
            <div class="fl-info-meta">
              <span>📍 ${f.district}</span>
              <span class="fl-badge-crop">🌱 ${f.crop}</span>
              <span>⌛ ${f.years} ${expTxt}</span>
            </div>
          </div>
          <div class="fl-phone-box">
            ${isSubscribed ? `
              <span class="fl-masked" style="border-style:solid; color:var(--text-main); font-weight:700;">${fullPhone}</span>
              <a href="tel:${phoneClean}" class="btn-call-farmer">${callTxt}</a>
              <a href="https://wa.me/91${phoneClean}" target="_blank" rel="noopener" class="btn-wa-farmer">${waTxt}</a>
            ` : `
              <span class="fl-masked">${maskedPhone}</span>
              <button class="btn-unlock-phone" onclick="openSubscriptionModal()">${unlockTxt}</button>
            `}
          </div>
        </div>
      `;
    }).join('');
  } catch(e) {
    list.innerHTML = '<p class="fl-empty">Could not load farmers list.</p>';
  }
}

async function submitFarmer() {
  const name  = $('#cf-name') ? $('#cf-name').value.trim() : '';
  const phone = $('#cf-phone') ? $('#cf-phone').value.trim() : '';
  const dist  = $('#cf-district') ? $('#cf-district').value : '';
  const crop  = $('#cf-crop') ? $('#cf-crop').value : '';
  const years = $('#cf-years') ? parseInt($('#cf-years').value) || 0 : 0;
  const bank_name = $('#cf-bank-name') ? $('#cf-bank-name').value : 'Canara Bank (ಕೆನರಾ ಬ್ಯಾಂಕ್)';
  const account_no = $('#cf-acc-num') ? $('#cf-acc-num').value.trim() : '';
  const ifsc = $('#cf-ifsc') ? $('#cf-ifsc').value.trim().toUpperCase() : '';
  const upi_id = $('#cf-upi') ? $('#cf-upi').value.trim() : '';
  const consent = $('#cf-consent') ? $('#cf-consent').checked : false;
  const msg   = $('#cf-msg');

  if (!name || !phone || !dist || !crop || !account_no || !ifsc || !consent) {
    if (msg) {
      msg.textContent = LN === 'kn' ? 'ದಯವಿಟ್ಟು ಹೆಸರು, ಫೋನ್, ಜಿಲ್ಲೆ, ಬೆಳೆ ಮತ್ತು ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರಗಳನ್ನು ಪೂರ್ಣವಾಗಿ ಭರ್ತಿ ಮಾಡಿ.' :
                        LN === 'hi' ? 'कृपया नाम, फोन, ज़िला, फसल और बैंक खाता विवरण पूर्ण रूप से भरें।' :
                        'Please fill all required fields including Bank Account & IFSC code.';
      msg.className = 'cf-msg error';
    }
    return;
  }

  try {
    const r = await fetch('/api/farmers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, district: dist, crop, years, consent: true, bank_name, account_no, ifsc, upi_id })
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);

    // Save linked bank info
    const bankData = {
      bank_name: bank_name,
      acc_masked: '•••• •••• ' + account_no.slice(-4),
      ifsc: ifsc,
      beneficiary: name
    };
    localStorage.setItem('kp_bank_info', JSON.stringify(bankData));

    // Update Wallet & Referral
    const currentWallet = parseFloat(localStorage.getItem('kp_wallet') || '0');
    const newWallet = currentWallet + (data.commission_bonus || 50);
    localStorage.setItem('kp_wallet', newWallet.toString());
    if (data.referral_code) {
      localStorage.setItem('kp_ref_code', data.referral_code);
    }

    // Populate and open DBT receipt modal
    const payout = data.payout || {
      amount: 100,
      utr: 'DBT-KA-' + Math.floor(10000000 + Math.random() * 90000000),
      bank_name: bank_name,
      account_masked: '•••• •••• ' + account_no.slice(-4),
      ifsc: ifsc,
      timestamp: new Date().toLocaleString(),
      beneficiary: name
    };

    $('#dbt-amt-display').textContent = '₹' + payout.amount + '.00';
    $('#dbt-utr').textContent = payout.utr;
    $('#dbt-name').textContent = payout.beneficiary || name;
    $('#dbt-bank').textContent = payout.bank_name || bank_name;
    $('#dbt-acc').textContent = payout.account_masked;
    $('#dbt-ifsc').textContent = payout.ifsc || ifsc;
    $('#dbt-time').textContent = payout.timestamp || 'Just now';

    const dbtModal = $('#dbt-receipt-modal');
    if (dbtModal) dbtModal.style.display = 'flex';

    if (msg) {
      msg.innerHTML = `🎉 <strong>${LN === 'kn' ? 'ಯಶಸ್ವಿ ನೋಂದಣಿ!' : LN === 'hi' ? 'सफल पंजीकरण!' : 'Registration Successful!'}</strong> ₹100 DBT Grant credited to your bank account.<br>Referral Code: <strong>${data.referral_code}</strong>`;
      msg.className = 'cf-msg success';
    }

    $('#cf-name').value = '';
    $('#cf-phone').value = '';
    $('#cf-acc-num').value = '';
    $('#cf-ifsc').value = '';
    $('#cf-upi').value = '';

    updateWalletUI();
    loadFarmers('');
  } catch(e) {
    if (msg) {
      msg.textContent = '❌ ' + e.message;
      msg.className = 'cf-msg error';
    }
  }
}

function closeDbtModal() {
  const m = $('#dbt-receipt-modal');
  if (m) m.style.display = 'none';
}

async function withdrawEarningsToBank() {
  const currentWallet = parseFloat(localStorage.getItem('kp_wallet') || '0');
  if (currentWallet <= 0) {
    alert(LN === 'kn' ? 'ನಿಮ್ಮ ವಾಲೆಟ್‌ನಲ್ಲಿ ವರ್ಗಾವಣೆಗೆ ಯಾವುದೇ ಮೊತ್ತವಿಲ್ಲ.' :
          LN === 'hi' ? 'आपके वॉलेट में निकालने हेतु पर्याप्त राशि नहीं है।' :
          'Your wallet balance is ₹0.00. Refer more farmers to earn commissions.');
    return;
  }
  const bankInfoStr = localStorage.getItem('kp_bank_info');
  const bankInfo = bankInfoStr ? JSON.parse(bankInfoStr) : null;
  const bankName = bankInfo ? bankInfo.bank_name : 'Canara Bank';
  const accMasked = bankInfo ? bankInfo.acc_masked : '•••• •••• 4512';

  try {
    const r = await fetch('/api/payout/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: currentWallet, bank_name: bankName, account_no: accMasked })
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error);

    localStorage.setItem('kp_wallet', '0');
    updateWalletUI();

    // Show DBT receipt modal for withdrawal
    $('#dbt-amt-display').textContent = '₹' + currentWallet.toFixed(2);
    $('#dbt-utr').textContent = d.payout ? d.payout.utr : ('DBT-WDR-' + Math.floor(10000000 + Math.random() * 90000000));
    $('#dbt-name').textContent = localStorage.getItem('kp_user') || 'Farmer';
    $('#dbt-bank').textContent = bankName;
    $('#dbt-acc').textContent = accMasked;
    $('#dbt-ifsc').textContent = bankInfo ? bankInfo.ifsc : 'CNRB0001234';
    $('#dbt-time').textContent = 'Just now';

    const dbtModal = $('#dbt-receipt-modal');
    if (dbtModal) dbtModal.style.display = 'flex';
  } catch(e) {
    alert('Withdrawal error: ' + e.message);
  }
}

// =====================================================================
// HORIZONTAL TAB SWITCHING (Page 4)
// =====================================================================
const resultTabsEl = $('#result-tabs');
if (resultTabsEl) {
  resultTabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.rtab');
    if (!btn) return;
    $$('.rtab').forEach(b => b.classList.remove('active'));
    $$('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = $('#tab-' + btn.dataset.tab);
    if (panel) panel.classList.add('active');
    if (btn.dataset.tab === 'market' && PlanData) {
      setTimeout(() => renderPriceChart(PlanData.market.points), 50);
    }
  });
}

// =====================================================================
// INIT
// =====================================================================
async function init() {
  await loadMeta();
  initDefaultDates();
  setLanguage(LN);
  initLogin();
  populateScanCropSelect();
  updateSubscriptionUI();
  updateWalletUI();
  loadFarmers('');
}

init();
