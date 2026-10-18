'use client';

import { useEffect } from 'react';

export default function AppUpdateManager(){
 useEffect(()=>{
  if(!('serviceWorker' in navigator))return undefined;
  let registration=null;
  let reloading=false;

  const activateWaitingWorker=worker=>worker?.postMessage({type:'SKIP_WAITING'});
  const checkForUpdate=()=>registration?.update().catch(()=>{});
  const onControllerChange=()=>{
   if(reloading)return;
   reloading=true;
   window.location.reload();
  };
  const onVisibilityChange=()=>{if(!document.hidden)checkForUpdate()};

  navigator.serviceWorker.addEventListener('controllerchange',onControllerChange);
  document.addEventListener('visibilitychange',onVisibilityChange);
  window.addEventListener('focus',checkForUpdate);

  navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(reg=>{
   registration=reg;
   activateWaitingWorker(reg.waiting);
   reg.addEventListener('updatefound',()=>{
    const worker=reg.installing;
    worker?.addEventListener('statechange',()=>{
     if(worker.state==='installed'&&navigator.serviceWorker.controller)activateWaitingWorker(worker);
    });
   });
   return reg.update();
  }).catch(()=>{});

  return()=>{
   navigator.serviceWorker.removeEventListener('controllerchange',onControllerChange);
   document.removeEventListener('visibilitychange',onVisibilityChange);
   window.removeEventListener('focus',checkForUpdate);
  };
 },[]);
 return null;
}
