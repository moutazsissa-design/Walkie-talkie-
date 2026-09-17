const CACHE='private-line-v6-shell-1';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(LOCAL)).catch(()=>{}));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const u=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(u.origin===self.location.origin){
    event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(req,copy));return r})));
  }
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const c of list){if('focus'in c)return c.focus();}
    return clients.openWindow('./');
  }));
});
self.addEventListener('push',event=>{
  let data={title:'Private Line',body:'New encrypted activity'};
  try{data={...data,...event.data.json()}}catch(e){try{data.body=event.data.text()}catch(_){} }
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icon.png',badge:'./icon.png',tag:data.tag||'private-line'}));
});
