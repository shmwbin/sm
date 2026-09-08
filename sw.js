const CACHE_NAME = 'wifi-test-cache-v2'; // ভার্সন আপডেট করা হয়েছে

self.addEventListener('install', (event) => {
  // নতুন ভার্সন আসা মাত্রই যেন চালু হয়
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // পুরোনো ক্যাশ ডিলিট করে দেওয়া
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-First Strategy: আগে ইন্টারনেট থেকে নতুন কোড আনবে, ইন্টারনেট না থাকলে ক্যাশ থেকে নিবে
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // নতুন ফাইল পেলে ক্যাশে আপডেট করে রাখবে
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // অফলাইনে ক্যাশ থেকে চালাবে
  );
});
