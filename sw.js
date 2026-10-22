// 한 번 열면 인터넷 없이도 열리도록 앱 파일을 저장해 둬요.
const CACHE='class-board-v11';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    // 앱 파일: 새 버전을 먼저 받아 보고, 인터넷이 없으면 저장본 사용
    // 오류 응답(로그인 화면 등)은 저장하지 않고, 저장본이 있으면 그걸 보여 줘요
    const saved=()=>caches.match(e.request).then(r=>r||(e.request.mode==='navigate'?caches.match('index.html'):null));
    e.respondWith(fetch(e.request).then(r=>{
      if(!r.ok) return saved().then(c=>c||r);
      const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;
    }).catch(()=>saved().then(c=>c||Response.error())));
  } else if(url.host.includes('fonts.g')){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(!res.ok&&res.type!=='opaque') return res; const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return res})));
  }
});
