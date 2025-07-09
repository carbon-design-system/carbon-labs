import{p as U}from"./chunk-BAOP5US2-EGQnOdES.js";import{D as j,q,r as Z,s as H,g as J,c as K,b as Q,_ as u,l as F,x as X,d as Y,E as tt,I as et,P as rt,k as at}from"./diagramElement-B9m21l-C.js";import{p as nt}from"./mermaid-parser.core-CddnMAs-.js";import{d as N}from"./arc-a95QNxEB.js";import{o as it}from"./ordinal-BeghXfj9.js";import{a as x,t as z,n as ot}from"./timer-CN_v9RCa.js";import"./property-DRkoNOFH.js";import"./lit-element-CKvUdWNz.js";import"./settings-BQP9c3yA.js";import"./state-BaIcuqWU.js";import"./iframe-Du2PFTHn.js";import"../sb-preview/runtime.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-DrFu-skq.js";import"./loading-CnlMKYWX.js";import"./class-map-BqTUllwo.js";import"./directive-CF8sV3Lr.js";import"./carbon-element-CIUZhCzP.js";import"./unsafe-html-DEKExhFX.js";import"./_baseUniq-85a_rf9A.js";import"./_basePickBy-ClQHjcWr.js";import"./clone-Bh4Fb0o3.js";import"./init-Dmth1JHB.js";function st(t,r){return r<t?-1:r>t?1:r>=t?0:NaN}function lt(t){return t}function ct(){var t=lt,r=st,m=null,s=x(0),g=x(z),y=x(0);function i(e){var a,l=(e=ot(e)).length,c,A,h=0,p=new Array(l),n=new Array(l),v=+s.apply(this,arguments),w=Math.min(z,Math.max(-z,g.apply(this,arguments)-v)),f,T=Math.min(Math.abs(w)/l,y.apply(this,arguments)),$=T*(w<0?-1:1),d;for(a=0;a<l;++a)(d=n[p[a]=a]=+t(e[a],a,e))>0&&(h+=d);for(r!=null?p.sort(function(S,D){return r(n[S],n[D])}):m!=null&&p.sort(function(S,D){return m(e[S],e[D])}),a=0,A=h?(w-l*$)/h:0;a<l;++a,v=f)c=p[a],d=n[c],f=v+(d>0?d*A:0)+$,n[c]={data:e[c],index:a,value:d,startAngle:v,endAngle:f,padAngle:T};return n}return i.value=function(e){return arguments.length?(t=typeof e=="function"?e:x(+e),i):t},i.sortValues=function(e){return arguments.length?(r=e,m=null,i):r},i.sort=function(e){return arguments.length?(m=e,r=null,i):m},i.startAngle=function(e){return arguments.length?(s=typeof e=="function"?e:x(+e),i):s},i.endAngle=function(e){return arguments.length?(g=typeof e=="function"?e:x(+e),i):g},i.padAngle=function(e){return arguments.length?(y=typeof e=="function"?e:x(+e),i):y},i}var O=j.pie,G={sections:new Map,showData:!1,config:O},b=G.sections,P=G.showData,pt=structuredClone(O),ut=u(()=>structuredClone(pt),"getConfig"),gt=u(()=>{b=new Map,P=G.showData,X()},"clear"),dt=u(({label:t,value:r})=>{b.has(t)||(b.set(t,r),F.debug(`added new section: ${t}, with value: ${r}`))},"addSection"),ft=u(()=>b,"getSections"),mt=u(t=>{P=t},"setShowData"),ht=u(()=>P,"getShowData"),R={getConfig:ut,clear:gt,setDiagramTitle:q,getDiagramTitle:Z,setAccTitle:H,getAccTitle:J,setAccDescription:K,getAccDescription:Q,addSection:dt,getSections:ft,setShowData:mt,getShowData:ht},vt=u((t,r)=>{U(t,r),r.setShowData(t.showData),t.sections.map(r.addSection)},"populateDb"),St={parse:u(async t=>{const r=await nt("pie",t);F.debug(r),vt(r,R)},"parse")},xt=u(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),yt=xt,At=u(t=>{const r=[...t.entries()].map(s=>({label:s[0],value:s[1]})).sort((s,g)=>g.value-s.value);return ct().value(s=>s.value)(r)},"createPieArcs"),wt=u((t,r,m,s)=>{F.debug(`rendering pie chart
`+t);const g=s.db,y=Y(),i=tt(g.getConfig(),y.pie),e=40,a=18,l=4,c=450,A=c,h=et(r),p=h.append("g");p.attr("transform","translate("+A/2+","+c/2+")");const{themeVariables:n}=y;let[v]=rt(n.pieOuterStrokeWidth);v??(v=2);const w=i.textPosition,f=Math.min(A,c)/2-e,T=N().innerRadius(0).outerRadius(f),$=N().innerRadius(f*w).outerRadius(f*w);p.append("circle").attr("cx",0).attr("cy",0).attr("r",f+v/2).attr("class","pieOuterCircle");const d=g.getSections(),S=At(d),D=[n.pie1,n.pie2,n.pie3,n.pie4,n.pie5,n.pie6,n.pie7,n.pie8,n.pie9,n.pie10,n.pie11,n.pie12],C=it(D);p.selectAll("mySlices").data(S).enter().append("path").attr("d",T).attr("fill",o=>C(o.data.label)).attr("class","pieCircle");let W=0;d.forEach(o=>{W+=o}),p.selectAll("mySlices").data(S).enter().append("text").text(o=>(o.data.value/W*100).toFixed(0)+"%").attr("transform",o=>"translate("+$.centroid(o)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(g.getDiagramTitle()).attr("x",0).attr("y",-(c-50)/2).attr("class","pieTitleText");const M=p.selectAll(".legend").data(C.domain()).enter().append("g").attr("class","legend").attr("transform",(o,k)=>{const E=a+l,_=E*C.domain().length/2,B=12*a,V=k*E-_;return"translate("+B+","+V+")"});M.append("rect").attr("width",a).attr("height",a).style("fill",C).style("stroke",C),M.data(S).append("text").attr("x",a+l).attr("y",a-l).text(o=>{const{label:k,value:E}=o.data;return g.getShowData()?`${k} [${E}]`:k});const L=Math.max(...M.selectAll("text").nodes().map(o=>(o==null?void 0:o.getBoundingClientRect().width)??0)),I=A+e+a+l+L;h.attr("viewBox",`0 0 ${I} ${c}`),at(h,c,I,i.useMaxWidth)},"draw"),Dt={draw:wt},Zt={parser:St,db:R,renderer:Dt,styles:yt};export{Zt as diagram};
