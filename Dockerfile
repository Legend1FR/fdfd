# Use official Node.js LTS image
FROM node:22-slim

# تثبيت المتطلبات الأساسية وتحديث النظام
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    software-properties-common \
    fonts-liberation \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    --no-install-recommends

# تثبيت Chrome بالطريقة الموصى بها للـ Docker
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# إنشاء مستخدم غير root
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads /home/pptruser/.cache/puppeteer \
    && chown -R pptruser:pptruser /home/pptruser

# تعيين متغيرات البيئة لـ Puppeteer
ENV PUPPETEER_CACHE_DIR=/home/pptruser/.cache/puppeteer \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    NODE_ENV=production \
    PORT=10000

WORKDIR /usr/src/app

# نسخ ملفات package.json أولاً لتحسين الكاش
COPY package*.json ./

# تثبيت التبعيات كـ root أولاً
RUN npm ci --only=production \
    && npm cache clean --force

# نسخ بقية الملفات
COPY . .

# تغيير ملكية جميع الملفات للمستخدم الجديد
RUN chown -R pptruser:pptruser /usr/src/app

# التبديل للمستخدم الجديد
USER pptruser

# تحميل Chrome لـ Puppeteer كمستخدم عادي
RUN npx puppeteer browsers install chrome || echo "Chrome install failed, will use system Chrome"

EXPOSE 10000
CMD [ "node", "server.js" ]
