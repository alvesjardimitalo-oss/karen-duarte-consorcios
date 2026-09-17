const CACHE='karen-martins-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch{data={body:event.data?.text()}}
  const title=data.title||'Karen Martins Cosméticos';
  const options={
    body:data.body||'Você tem uma nova atualização.',
    tag:data.tag||'karen-martins',
    renotify:true,
    data:{url:data.url||'/portal/parcelas'},
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=event.notification.data?.url||'/portal/parcelas';
  event.waitUntil((async()=>{
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of windows){
      if('focus'in client){await client.navigate(url);return client.focus();}
    }
    return self.clients.openWindow(url);
  })());
});
