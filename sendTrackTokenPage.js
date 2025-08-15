const axios = require('axios');
const fs = require('fs');

// اسم الملف الذي سيتم حفظ الصفحة فيه
const TRACK_TOKEN_URL = 'http://localhost:1010/track_token';
const OUTPUT_FILE = 'track_token_snapshot.html';


// دالة لجلب الصفحة وحفظها كملف HTML
async function fetchAndSaveTrackTokenPage() {
  try {
    const response = await axios.get(TRACK_TOKEN_URL);
    fs.writeFileSync(OUTPUT_FILE, response.data);
    console.log(`تم حفظ الصفحة في ${OUTPUT_FILE}`);
    return OUTPUT_FILE;
  } catch (error) {
    console.error('خطأ في جلب أو حفظ الصفحة:', error.message);
    return null;
  }
}

// دالة لجلب الصفحة وإرجاعها كـ Buffer دون حفظها على القرص
async function fetchTrackTokenPageBuffer() {
  try {
    const response = await axios.get(TRACK_TOKEN_URL, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('خطأ في جلب الصفحة:', error.message);
    return null;
  }
}

// دالة رئيسية: عند استقبال الرمز FARESS
async function onReceiveFARESSCommand(sendFileToBot) {
  const filePath = await fetchAndSaveTrackTokenPage();
  if (filePath) {
    // sendFileToBot: دالة لإرسال الملف إلى بوت GMGN
    await sendFileToBot(filePath);
    console.log('تم إرسال الملف إلى البوت بنجاح.');
  } else {
    console.log('تعذر إرسال الملف إلى البوت.');
  }
}

// مثال على دالة إرسال الملف إلى البوت (يجب استبدالها بالتكامل الفعلي مع بوت GMGN)
async function sendFileToBotGMGN(filePath) {
  // ... ضع هنا كود إرسال الملف إلى البوت ...
  console.log(`سيتم إرسال الملف ${filePath} إلى بوت GMGN (يرجى استبدال هذا الجزء بالتكامل الفعلي).`);
}

// مثال على الاستخدام: (يتم استدعاؤه عند استقبال الرمز FARESS)
// onReceiveFARESSCommand(sendFileToBotGMGN);

module.exports = { onReceiveFARESSCommand, sendFileToBotGMGN, fetchAndSaveTrackTokenPage, fetchTrackTokenPageBuffer };
