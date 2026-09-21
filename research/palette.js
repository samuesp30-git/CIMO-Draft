function h2r(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16));}
function lum([r,g,b]){const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b);}
function ratio(a,b){const l1=lum(h2r(a)),l2=lum(h2r(b));const[x,y]=l1>l2?[l1,l2]:[l2,l1];return (x+0.05)/(y+0.05);}
function hsl2hex(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12;const a=s*Math.min(l,1-l);
 const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
 return '#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('');}

const H=200;
const steps=[[50,55,97],[100,58,92],[200,58,82],[300,60,65],[400,58,55],[500,62,44],[600,66,35],[700,70,27],[800,72,20],[900,68,15],[950,60,10]];
const white='#FFFFFF', ink='#1A2B33', paper='#F7FAFC';
console.log('name    hex       vs #FFF   vs #F7FAFC  vs #1A2B33');
for(const [n,s,l] of steps){
  const hex=hsl2hex(H,s,l).toUpperCase();
  console.log(String(n).padEnd(7), hex, ' ', ratio(hex,white).toFixed(2).padStart(5), '   ', ratio(hex,paper).toFixed(2).padStart(5), '     ', ratio(hex,ink).toFixed(2).padStart(5));
}
console.log('\n-- medidos en el logo/highlights --');
for(const c of ['#6EB8DD','#78B8D8','#70B8E0','#4898C8','#50A0D0','#384850']){
  console.log(c, 'vs blanco:', ratio(c,white).toFixed(2), '| vs tinta #1A2B33:', ratio(c,ink).toFixed(2));
}
console.log('\n-- neutros propuestos --');
for(const c of ['#1A2B33','#3D5560','#6B8894','#E3EAEE','#F7FAFC']){
  console.log(c, 'vs blanco:', ratio(c,white).toFixed(2), '| vs #F7FAFC:', ratio(c,paper).toFixed(2));
}
console.log('\n-- acento cálido (CTA/WhatsApp) --');
for(const c of ['#E8B84B','#C9922A','#1FA855','#128C7E']){
  console.log(c, 'vs blanco:', ratio(c,white).toFixed(2), '| vs tinta:', ratio(c,ink).toFixed(2));
}
