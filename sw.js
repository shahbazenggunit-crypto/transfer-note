var V="tn-v1";
var CDN=["https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js","https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js","https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js","https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap"];
var LOCAL=["./","index.html","app.html","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(V).then(function(c){
    return Promise.all(LOCAL.map(function(u){return c.add(u).catch(function(){});}).concat(CDN.map(function(u){return fetch(u,{mode:"no-cors"}).then(function(r){return c.put(u,r);}).catch(function(){});})));
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V&&k!=="tn-html";}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
function ok(r){return r&&(r.ok||r.type==="opaque");}
self.addEventListener("fetch",function(e){
  var r=e.request; if(r.method!=="GET") return;
  var u=new URL(r.url), same=u.origin===self.location.origin;
  var cdn=/(^|\.)cdnjs\.cloudflare\.com$|^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(!same&&!cdn) return;
  e.respondWith(caches.open(V).then(function(c){
    return c.match(r,{ignoreSearch:same}).then(function(hit){
      var net=fetch(r).then(function(res){ if(ok(res)) c.put(same?new Request(u.origin+u.pathname):r,res.clone()); return res; }).catch(function(){return null;});
      if(hit){ e.waitUntil(net); return hit; }
      return net.then(function(res){ return res||(r.mode==="navigate"?c.match("index.html"):Response.error()); });
    });
  }));
});
