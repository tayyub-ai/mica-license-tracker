export const revalidate = 86400

export async function GET(req: Request) {
  const base = new URL(req.url).origin

  const js = `(function(){
  var ID = 'mica-tracker-widget';
  function mount(){
    var el = document.getElementById(ID);
    if(!el){
      // Fall back to inserting after the current script tag.
      var scripts = document.getElementsByTagName('script');
      var self = scripts[scripts.length-1];
      el = document.createElement('div');
      el.id = ID;
      self.parentNode.insertBefore(el, self.nextSibling);
    }
    var iframe = document.createElement('iframe');
    iframe.src = '${base}/widget';
    iframe.style.width = '100%';
    iframe.style.maxWidth = '360px';
    iframe.style.height = '210px';
    iframe.style.border = '0';
    iframe.style.colorScheme = 'normal';
    iframe.setAttribute('title', 'MiCA License Tracker');
    iframe.setAttribute('loading', 'lazy');
    el.innerHTML = '';
    el.appendChild(iframe);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  } else { mount(); }
})();`

  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, s-maxage=86400',
    },
  })
}
