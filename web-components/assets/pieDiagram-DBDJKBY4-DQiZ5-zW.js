import{p as K}from"./chunk-ANTBXLJU-BkqI2Igp.js";import{E as Z,o as q,p as H,s as J,g as Q,c as X,b as Y,_ as g,l as z,v as tt,d as et,F as at,K as rt,R as nt,k as it}from"./diagramElement-DsVx6DC4.js";import{p as st}from"./treemap-75Q7IDZK-B67uQTY5.js";import{d as I}from"./arc-BAjbVkAl.js";import{o as ot}from"./ordinal-BeghXfj9.js";import{a as S,t as F,n as lt}from"./timer-BiIQGaYd.js";import"./property-N1Hh-u8i.js";import"./iframe-xVYxK4EZ.js";import"./preload-helper-C1FmrZbK.js";import"./settings-BQP9c3yA.js";import"./state-CnV0Df53.js";import"./loading-Cz_7BIMW.js";import"./carbon-element-D9JabK0g.js";import"./directive-CF8sV3Lr.js";import"./unsafe-html-Cc1_vGUd.js";import"./_baseUniq-DUlse97o.js";import"./_basePickBy-v996YsXq.js";import"./clone-qBFZa-0y.js";import"./init-Dmth1JHB.js";function ct(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function pt(t){return t}function ut(){var t=pt,a=ct,f=null,x=S(0),s=S(F),l=S(0);function o(e){var n,c=(e=lt(e)).length,p,y,h=0,u=new Array(c),i=new Array(c),v=+x.apply(this,arguments),w=Math.min(F,Math.max(-F,s.apply(this,arguments)-v)),m,C=Math.min(Math.abs(w)/c,l.apply(this,arguments)),$=C*(w<0?-1:1),d;for(n=0;n<c;++n)(d=i[u[n]=n]=+t(e[n],n,e))>0&&(h+=d);for(a!=null?u.sort(function(A,D){return a(i[A],i[D])}):f!=null&&u.sort(function(A,D){return f(e[A],e[D])}),n=0,y=h?(w-c*$)/h:0;n<c;++n,v=m)p=u[n],d=i[p],m=v+(d>0?d*y:0)+$,i[p]={data:e[p],index:n,value:d,startAngle:v,endAngle:m,padAngle:C};return i}return o.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),o):t},o.sortValues=function(e){return arguments.length?(a=e,f=null,o):a},o.sort=function(e){return arguments.length?(f=e,a=null,o):f},o.startAngle=function(e){return arguments.length?(x=typeof e=="function"?e:S(+e),o):x},o.endAngle=function(e){return arguments.length?(s=typeof e=="function"?e:S(+e),o):s},o.padAngle=function(e){return arguments.length?(l=typeof e=="function"?e:S(+e),o):l},o}var L=Z.pie,G={sections:new Map,showData:!1,config:L},T=G.sections,N=G.showData,gt=structuredClone(L),dt=g(()=>structuredClone(gt),"getConfig"),ft=g(()=>{T=new Map,N=G.showData,tt()},"clear"),mt=g(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),z.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ht=g(()=>T,"getSections"),vt=g(t=>{N=t},"setShowData"),St=g(()=>N,"getShowData"),_={getConfig:dt,clear:ft,setDiagramTitle:q,getDiagramTitle:H,setAccTitle:J,getAccTitle:Q,setAccDescription:X,getAccDescription:Y,addSection:mt,getSections:ht,setShowData:vt,getShowData:St},xt=g((t,a)=>{K(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),yt={parse:g(async t=>{const a=await st("pie",t);z.debug(a),xt(a,_)},"parse")},wt=g(t=>`
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
`,"getStyles"),At=wt,Dt=g(t=>{const a=[...t.values()].reduce((s,l)=>s+l,0),f=[...t.entries()].map(([s,l])=>({label:s,value:l})).filter(s=>s.value/a*100>=1).sort((s,l)=>l.value-s.value);return ut().value(s=>s.value)(f)},"createPieArcs"),Ct=g((t,a,f,x)=>{z.debug(`rendering pie chart
`+t);const s=x.db,l=et(),o=at(s.getConfig(),l.pie),e=40,n=18,c=4,p=450,y=p,h=rt(a),u=h.append("g");u.attr("transform","translate("+y/2+","+p/2+")");const{themeVariables:i}=l;let[v]=nt(i.pieOuterStrokeWidth);v??(v=2);const w=o.textPosition,m=Math.min(y,p)/2-e,C=I().innerRadius(0).outerRadius(m),$=I().innerRadius(m*w).outerRadius(m*w);u.append("circle").attr("cx",0).attr("cy",0).attr("r",m+v/2).attr("class","pieOuterCircle");const d=s.getSections(),A=Dt(d),D=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let E=0;d.forEach(r=>{E+=r});const R=A.filter(r=>(r.data.value/E*100).toFixed(0)!=="0"),b=ot(D);u.selectAll("mySlices").data(R).enter().append("path").attr("d",C).attr("fill",r=>b(r.data.label)).attr("class","pieCircle"),u.selectAll("mySlices").data(R).enter().append("text").text(r=>(r.data.value/E*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice"),u.append("text").text(s.getDiagramTitle()).attr("x",0).attr("y",-(p-50)/2).attr("class","pieTitleText");const W=[...d.entries()].map(([r,M])=>({label:r,value:M})),k=u.selectAll(".legend").data(W).enter().append("g").attr("class","legend").attr("transform",(r,M)=>{const P=n+c,V=P*W.length/2,U=12*n,j=M*P-V;return"translate("+U+","+j+")"});k.append("rect").attr("width",n).attr("height",n).style("fill",r=>b(r.label)).style("stroke",r=>b(r.label)),k.append("text").attr("x",n+c).attr("y",n-c).text(r=>s.getShowData()?`${r.label} [${r.value}]`:r.label);const B=Math.max(...k.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0)),O=y+e+n+c+B;h.attr("viewBox",`0 0 ${O} ${p}`),it(h,p,O,o.useMaxWidth)},"draw"),$t={draw:Ct},jt={parser:yt,db:_,renderer:$t,styles:At};export{jt as diagram};
