import{t as e}from"./mermaid-parser.core-AS37ABCd.js";import{$t as t,Ct as n,Dt as r,N as i,Ot as a,R as o,Rt as s,Tt as c,Vt as l,en as u,mt as d,vt as f,wt as p,xt as m,zt as h}from"./diagramElement-ZJBqNStL.js";import{n as g}from"./ordinal-Bo9NMnSB.js";import{I as _,L as v,S as y}from"./step-F1q79gtL.js";import{t as b}from"./arc-VXrKx_ag.js";import{t as x}from"./chunk-4BX2VUAB-yCSPCwam.js";function S(e,t){return t<e?-1:t>e?1:t>=e?0:NaN}function C(e){return e}function w(){var e=C,t=S,n=null,r=v(0),i=v(_),a=v(0);function o(o){var s,c=(o=y(o)).length,l,u,d=0,f=Array(c),p=Array(c),m=+r.apply(this,arguments),h=Math.min(_,Math.max(-_,i.apply(this,arguments)-m)),g,v=Math.min(Math.abs(h)/c,a.apply(this,arguments)),b=v*(h<0?-1:1),x;for(s=0;s<c;++s)(x=p[f[s]=s]=+e(o[s],s,o))>0&&(d+=x);for(t==null?n!=null&&f.sort(function(e,t){return n(o[e],o[t])}):f.sort(function(e,n){return t(p[e],p[n])}),s=0,u=d?(h-c*b)/d:0;s<c;++s,m=g)l=f[s],x=p[l],g=m+(x>0?x*u:0)+b,p[l]={data:o[l],index:s,value:x,startAngle:m,endAngle:g,padAngle:v};return p}return o.value=function(t){return arguments.length?(e=typeof t==`function`?t:v(+t),o):e},o.sortValues=function(e){return arguments.length?(t=e,n=null,o):t},o.sort=function(e){return arguments.length?(n=e,t=null,o):n},o.startAngle=function(e){return arguments.length?(r=typeof e==`function`?e:v(+e),o):r},o.endAngle=function(e){return arguments.length?(i=typeof e==`function`?e:v(+e),o):i},o.padAngle=function(e){return arguments.length?(a=typeof e==`function`?e:v(+e),o):a},o}var T=n.pie,E={sections:new Map,showData:!1,config:T},D=E.sections,O=E.showData,k=structuredClone(T),A={getConfig:t(()=>structuredClone(k),`getConfig`),clear:t(()=>{D=new Map,O=E.showData,f()},`clear`),setDiagramTitle:l,getDiagramTitle:a,setAccTitle:h,getAccTitle:c,setAccDescription:s,getAccDescription:p,addSection:t(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);D.has(e)||(D.set(e,t),u.debug(`added new section: ${e}, with value: ${t}`))},`addSection`),getSections:t(()=>D,`getSections`),setShowData:t(e=>{O=e},`setShowData`),getShowData:t(()=>O,`getShowData`)},j=t((e,t)=>{x(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},`populateDb`),M={parse:t(async t=>{let n=await e(`pie`,t);u.debug(n),j(n,A)},`parse`)},N=t(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
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
`,`getStyles`),P=t(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),n=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return w().value(e=>e.value).sort(null)(n)},`createPieArcs`),F={parser:M,db:A,renderer:{draw:t((e,t,n,a)=>{u.debug(`rendering pie chart
`+e);let s=a.db,c=r(),l=i(s.getConfig(),c.pie),f=d(t),p=f.append(`g`);p.attr(`transform`,`translate(225,225)`);let{themeVariables:h}=c,[_]=o(h.pieOuterStrokeWidth);_??=2;let v=l.textPosition,y=b().innerRadius(0).outerRadius(185),x=b().innerRadius(185*v).outerRadius(185*v);p.append(`circle`).attr(`cx`,0).attr(`cy`,0).attr(`r`,185+_/2).attr(`class`,`pieOuterCircle`);let S=s.getSections(),C=P(S),w=[h.pie1,h.pie2,h.pie3,h.pie4,h.pie5,h.pie6,h.pie7,h.pie8,h.pie9,h.pie10,h.pie11,h.pie12],T=0;S.forEach(e=>{T+=e});let E=C.filter(e=>(e.data.value/T*100).toFixed(0)!==`0`),D=g(w).domain([...S.keys()]);p.selectAll(`mySlices`).data(E).enter().append(`path`).attr(`d`,y).attr(`fill`,e=>D(e.data.label)).attr(`class`,`pieCircle`),p.selectAll(`mySlices`).data(E).enter().append(`text`).text(e=>(e.data.value/T*100).toFixed(0)+`%`).attr(`transform`,e=>`translate(`+x.centroid(e)+`)`).style(`text-anchor`,`middle`).attr(`class`,`slice`);let O=p.append(`text`).text(s.getDiagramTitle()).attr(`x`,0).attr(`y`,-400/2).attr(`class`,`pieTitleText`),k=[...S.entries()].map(([e,t])=>({label:e,value:t})),A=p.selectAll(`.legend`).data(k).enter().append(`g`).attr(`class`,`legend`).attr(`transform`,(e,t)=>{let n=22*k.length/2;return`translate(216,`+(t*22-n)+`)`});A.append(`rect`).attr(`width`,18).attr(`height`,18).style(`fill`,e=>D(e.label)).style(`stroke`,e=>D(e.label)),A.append(`text`).attr(`x`,22).attr(`y`,14).text(e=>s.getShowData()?`${e.label} [${e.value}]`:e.label);let j=512+Math.max(...A.selectAll(`text`).nodes().map(e=>e?.getBoundingClientRect().width??0)),M=O.node()?.getBoundingClientRect().width??0,N=450/2-M/2,F=450/2+M/2,I=Math.min(0,N),L=Math.max(j,F)-I;f.attr(`viewBox`,`${I} 0 ${L} 450`),m(f,450,L,l.useMaxWidth)},`draw`)},styles:N};export{F as diagram};