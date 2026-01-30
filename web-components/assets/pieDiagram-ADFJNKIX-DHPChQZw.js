import{g as j,s as q,a as K,b as Z,t as H,q as J,_ as u,l as F,c as Q,F as X,K as Y,P as tt,e as et,z as at,G as rt}from"./diagramElement-CRI4AcTZ.js";import{p as nt}from"./chunk-4BX2VUAB-N0FugxPd.js";import{p as it}from"./treemap-KMMF4GRG-P773orzg.js";import{d as I}from"./arc-DbOvePLb.js";import{o as st}from"./ordinal-BeghXfj9.js";import{a as S,t as z,n as ot}from"./timer-CU8_kBSc.js";import"./property-SleeCrad.js";import"./iframe-CTziTsqO.js";import"./preload-helper-C1FmrZbK.js";import"./state-Bbzafc3I.js";import"./settings-BQP9c3yA.js";import"./loading-WKv1zxOp.js";import"./class-map-usWIp98a.js";import"./directive-CJw_OlP2.js";import"./carbon-element-DvT6Hso_.js";import"./loading-icon-BQQvUNie.js";import"./unsafe-html-szFMVhB1.js";import"./min-CfJFRU5_.js";import"./_baseUniq-CY_jlhw2.js";import"./init-Dmth1JHB.js";function lt(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function ct(t){return t}function pt(){var t=ct,a=lt,f=null,x=S(0),s=S(z),l=S(0);function o(e){var n,c=(e=ot(e)).length,g,y,h=0,p=new Array(c),i=new Array(c),v=+x.apply(this,arguments),w=Math.min(z,Math.max(-z,s.apply(this,arguments)-v)),m,C=Math.min(Math.abs(w)/c,l.apply(this,arguments)),$=C*(w<0?-1:1),d;for(n=0;n<c;++n)(d=i[p[n]=n]=+t(e[n],n,e))>0&&(h+=d);for(a!=null?p.sort(function(A,D){return a(i[A],i[D])}):f!=null&&p.sort(function(A,D){return f(e[A],e[D])}),n=0,y=h?(w-c*$)/h:0;n<c;++n,v=m)g=p[n],d=i[g],m=v+(d>0?d*y:0)+$,i[g]={data:e[g],index:n,value:d,startAngle:v,endAngle:m,padAngle:C};return i}return o.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),o):t},o.sortValues=function(e){return arguments.length?(a=e,f=null,o):a},o.sort=function(e){return arguments.length?(f=e,a=null,o):f},o.startAngle=function(e){return arguments.length?(x=typeof e=="function"?e:S(+e),o):x},o.endAngle=function(e){return arguments.length?(s=typeof e=="function"?e:S(+e),o):s},o.padAngle=function(e){return arguments.length?(l=typeof e=="function"?e:S(+e),o):l},o}var ut=rt.pie,G={sections:new Map,showData:!1},T=G.sections,N=G.showData,gt=structuredClone(ut),dt=u(()=>structuredClone(gt),"getConfig"),ft=u(()=>{T=new Map,N=G.showData,at()},"clear"),mt=u(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),F.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),ht=u(()=>T,"getSections"),vt=u(t=>{N=t},"setShowData"),St=u(()=>N,"getShowData"),L={getConfig:dt,clear:ft,setDiagramTitle:J,getDiagramTitle:H,setAccTitle:Z,getAccTitle:K,setAccDescription:q,getAccDescription:j,addSection:mt,getSections:ht,setShowData:vt,getShowData:St},xt=u((t,a)=>{nt(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),yt={parse:u(async t=>{const a=await it("pie",t);F.debug(a),xt(a,L)},"parse")},wt=u(t=>`
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
`,"getStyles"),At=wt,Dt=u(t=>{const a=[...t.values()].reduce((s,l)=>s+l,0),f=[...t.entries()].map(([s,l])=>({label:s,value:l})).filter(s=>s.value/a*100>=1).sort((s,l)=>l.value-s.value);return pt().value(s=>s.value)(f)},"createPieArcs"),Ct=u((t,a,f,x)=>{F.debug(`rendering pie chart
`+t);const s=x.db,l=Q(),o=X(s.getConfig(),l.pie),e=40,n=18,c=4,g=450,y=g,h=Y(a),p=h.append("g");p.attr("transform","translate("+y/2+","+g/2+")");const{themeVariables:i}=l;let[v]=tt(i.pieOuterStrokeWidth);v??(v=2);const w=o.textPosition,m=Math.min(y,g)/2-e,C=I().innerRadius(0).outerRadius(m),$=I().innerRadius(m*w).outerRadius(m*w);p.append("circle").attr("cx",0).attr("cy",0).attr("r",m+v/2).attr("class","pieOuterCircle");const d=s.getSections(),A=Dt(d),D=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let b=0;d.forEach(r=>{b+=r});const P=A.filter(r=>(r.data.value/b*100).toFixed(0)!=="0"),E=st(D);p.selectAll("mySlices").data(P).enter().append("path").attr("d",C).attr("fill",r=>E(r.data.label)).attr("class","pieCircle"),p.selectAll("mySlices").data(P).enter().append("text").text(r=>(r.data.value/b*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice"),p.append("text").text(s.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText");const W=[...d.entries()].map(([r,M])=>({label:r,value:M})),k=p.selectAll(".legend").data(W).enter().append("g").attr("class","legend").attr("transform",(r,M)=>{const R=n+c,B=R*W.length/2,V=12*n,U=M*R-B;return"translate("+V+","+U+")"});k.append("rect").attr("width",n).attr("height",n).style("fill",r=>E(r.label)).style("stroke",r=>E(r.label)),k.append("text").attr("x",n+c).attr("y",n-c).text(r=>s.getShowData()?`${r.label} [${r.value}]`:r.label);const _=Math.max(...k.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0)),O=y+e+n+c+_;h.attr("viewBox",`0 0 ${O} ${g}`),et(h,g,O,o.useMaxWidth)},"draw"),$t={draw:Ct},qt={parser:yt,db:L,renderer:$t,styles:At};export{qt as diagram};
