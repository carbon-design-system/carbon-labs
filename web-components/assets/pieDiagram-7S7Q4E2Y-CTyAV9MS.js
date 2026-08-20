import{n as e}from"./mermaid-parser.core-CmwhbemX.js";import{At as t,Dt as n,Et as r,Ht as i,N as a,Ot as o,R as s,Vt as c,Wt as l,_t as u,in as d,jt as f,tn as p,wt as m,xt as h}from"./diagramElement-YOCFhV__.js";import{n as g}from"./ordinal-rBgelkZS.js";import{I as _,L as v,S as y}from"./step-B0xN2KX4.js";import{t as b}from"./arc-Ba12QG7g.js";import{t as x}from"./chunk-JWPE2WC7-DLFRcRYM.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,r=v(0),i=v(_),a=v(0);function o(o){var s,c=(o=y(o)).length,l,u,d=0,f=Array(c),p=Array(c),m=+r.apply(this,arguments),h=Math.min(_,Math.max(-_,i.apply(this,arguments)-m)),g,v=Math.min(Math.abs(h)/c,a.apply(this,arguments)),b=v*(h<0?-1:1),x;for(s=0;s<c;++s)(x=p[f[s]=s]=+e(o[s],s,o))>0&&(d+=x);for(t==null?n!=null&&f.sort(function(e,t){return n(o[e],o[t])}):f.sort(function(e,n){return t(p[e],p[n])}),s=0,u=d?(h-c*b)/d:0;s<c;++s,m=g)l=f[s],x=p[l],g=m+(x>0?x*u:0)+b,p[l]={data:o[l],index:s,value:x,startAngle:m,endAngle:g,padAngle:v};return p}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:v(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:v(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:v(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:v(+e),o):a},o}var T=r.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:d(()=>structuredClone(k),`getConfig`),clear:d(()=>{D=new Map,O=E.showData,h()},`clear`),setDiagramTitle:l,getDiagramTitle:f,setAccTitle:i,getAccTitle:o,setAccDescription:c,getAccDescription:n,addSection:d(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),p.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:d(()=>D,`getSections`),setShowData:d(e=>{O=e},`setShowData`),getShowData:d(()=>O,`getShowData`)},j=d((e,t)=>{x(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:d(async t=>{let n=await e(`pie`,t);p.debug(n),j(n,A)},`parse`)},N=d(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,`getStyles`),P=d(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return w().value(e=>e.value).sort(null)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:d((e,n,r,i)=>{p.debug(`rendering pie chart
`+e);let o=i.db,c=t(),l=a(o.getConfig(),c.pie),d=u(n),f=d.append(`g`);f.attr(`transform`,`translate(225,225)`);let{themeVariables:h}=c,[_]=s(h.pieOuterStrokeWidth);_??=2;let v=l.legendPosition,y=l.textPosition,x=l.donutHole>0&&l.donutHole<=.9?l.donutHole:0,S=b().innerRadius(x*185).outerRadius(185),C=b().innerRadius(185*y).outerRadius(185*y),w=f.append(`g`);w.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+_/2).attr(`class`,`pieOuterCircle`);let T=o.getSections(),E=P(T),D=[h.pie1,h.pie2,h.pie3,h.pie4,h.pie5,h.pie6,h.pie7,h.pie8,h.pie9,h.pie10,h.pie11,h.pie12],O=0;T.forEach(e=>{O+=e});let k=E.filter(e=>(e.data.value/O*100).toFixed(0)!==`0`),A=g(D).domain([...T.keys()]);w.selectAll(`mySlices`).data(k).enter().append(`path`).attr(`d`,S).attr(`fill`,e=>A(e.data.label)).attr(`class`,e=>{let t=`pieCircle`;return l.highlightSlice===`hover`?t+=` highlightedOnHover`:l.highlightSlice===e.data.label&&(t+=` highlighted`),t}),w.selectAll(`mySlices`).data(k).enter().append(`text`).text(e=>(e.data.value/O*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+C.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let j=f.append(`text`).text(o.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`),M=[...T.entries()].map(([e,t])=>({label:e,value:t})),N=f.selectAll(`.legend`).data(M).enter().append(`g`).attr(`class`,`legend`);N.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>A(e.label)).style(`stroke`,e=>A(e.label)),N.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let F=Math.max(...N.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),I=450,L=490,R=M.length*22;switch(v){case`center`:N.attr(`transform`,(e,t)=>{let n=22*M.length/2,r=-F/2-22,i=t*22-n;return`translate(`+r+`,`+i+`)`});break;case`top`:I+=R,N.attr(`transform`,(e,t)=>`translate(${-F/2-22}, ${t*22-185})`),w.attr(`transform`,()=>`translate(0, ${R+22})`);break;case`bottom`:I+=R,N.attr(`transform`,(e,t)=>{let n=-F/2-22,r=t*22- -207;return`translate(`+n+`,`+r+`)`});break;case`left`:L+=22+F,N.attr(`transform`,(e,t)=>{let n=22*M.length/2;return`translate(-207,`+(t*22-n)+`)`}),w.attr(`transform`,()=>`translate(${F+18+4}, 0)`);break;default:L+=22+F,N.attr(`transform`,(e,t)=>{let n=22*M.length/2;return`translate(216,`+(t*22-n)+`)`});break}let z=j.node()?.getBoundingClientRect().width??0,B=450/2-z/2,V=450/2+z/2,H=Math.min(0,B),U=Math.max(L,V)-H;d.attr(`viewBox`,`${H} 0 ${U} ${I}`),m(d,I,U,l.useMaxWidth)},`draw`)},styles:N};export{F as diagram};