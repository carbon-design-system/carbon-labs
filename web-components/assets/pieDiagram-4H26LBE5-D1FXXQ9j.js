import{g as Q,s as Y,a as tt,b as et,t as at,q as rt,_ as u,l as W,c as nt,H as it,L as ot,P as st,e as lt,A as ct,I as pt}from"./diagramElement-DXREGh8S.js";import{p as ut}from"./chunk-4BX2VUAB-BTY-3Fug.js";import{p as gt}from"./wardley-L42UT6IY-zG09RQQV.js";import{d as _}from"./arc-QuZ17Qmt.js";import{o as dt}from"./ordinal-BeghXfj9.js";import{a as S,t as R,n as ft}from"./timer-dpfxeKe8.js";import"./property-DNgrKkTE.js";import"./iframe-ibysnotI.js";import"./preload-helper-Dp1pzeXC.js";import"./state-d2gvJALR.js";import"./settings-BQP9c3yA.js";import"./loading-DdXI-hRY.js";import"./class-map-C6lbSIXX.js";import"./directive-CJw_OlP2.js";import"./carbon-element-BCBjgn0k.js";import"./loading-icon-Dhco00Cp.js";import"./unsafe-html-UUBYu7hL.js";import"./init-Dmth1JHB.js";function mt(t,a){return a<t?-1:a>t?1:a>=t?0:NaN}function ht(t){return t}function vt(){var t=ht,a=mt,f=null,y=S(0),o=S(R),g=S(0);function s(e){var n,l=(e=ft(e)).length,d,m,v=0,c=new Array(l),i=new Array(l),x=+y.apply(this,arguments),w=Math.min(R,Math.max(-R,o.apply(this,arguments)-x)),h,D=Math.min(Math.abs(w)/l,g.apply(this,arguments)),$=D*(w<0?-1:1),p;for(n=0;n<l;++n)(p=i[c[n]=n]=+t(e[n],n,e))>0&&(v+=p);for(a!=null?c.sort(function(A,C){return a(i[A],i[C])}):f!=null&&c.sort(function(A,C){return f(e[A],e[C])}),n=0,m=v?(w-l*$)/v:0;n<l;++n,x=h)d=c[n],p=i[d],h=x+(p>0?p*m:0)+$,i[d]={data:e[d],index:n,value:p,startAngle:x,endAngle:h,padAngle:D};return i}return s.value=function(e){return arguments.length?(t=typeof e=="function"?e:S(+e),s):t},s.sortValues=function(e){return arguments.length?(a=e,f=null,s):a},s.sort=function(e){return arguments.length?(f=e,a=null,s):f},s.startAngle=function(e){return arguments.length?(y=typeof e=="function"?e:S(+e),s):y},s.endAngle=function(e){return arguments.length?(o=typeof e=="function"?e:S(+e),s):o},s.padAngle=function(e){return arguments.length?(g=typeof e=="function"?e:S(+e),s):g},s}var xt=pt.pie,z={sections:new Map,showData:!1},T=z.sections,F=z.showData,St=structuredClone(xt),yt=u(()=>structuredClone(St),"getConfig"),wt=u(()=>{T=new Map,F=z.showData,ct()},"clear"),At=u(({label:t,value:a})=>{if(a<0)throw new Error(`"${t}" has invalid value: ${a}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);T.has(t)||(T.set(t,a),W.debug(`added new section: ${t}, with value: ${a}`))},"addSection"),Ct=u(()=>T,"getSections"),Dt=u(t=>{F=t},"setShowData"),$t=u(()=>F,"getShowData"),V={getConfig:yt,clear:wt,setDiagramTitle:rt,getDiagramTitle:at,setAccTitle:et,getAccTitle:tt,setAccDescription:Y,getAccDescription:Q,addSection:At,getSections:Ct,setShowData:Dt,getShowData:$t},Tt=u((t,a)=>{ut(t,a),a.setShowData(t.showData),t.sections.map(a.addSection)},"populateDb"),bt={parse:u(async t=>{const a=await gt("pie",t);W.debug(a),Tt(a,V)},"parse")},kt=u(t=>`
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
`,"getStyles"),Et=kt,Mt=u(t=>{const a=[...t.values()].reduce((o,g)=>o+g,0),f=[...t.entries()].map(([o,g])=>({label:o,value:g})).filter(o=>o.value/a*100>=1);return vt().value(o=>o.value).sort(null)(f)},"createPieArcs"),Rt=u((t,a,f,y)=>{var I;W.debug(`rendering pie chart
`+t);const o=y.db,g=nt(),s=it(o.getConfig(),g.pie),e=40,n=18,l=4,d=450,m=d,v=ot(a),c=v.append("g");c.attr("transform","translate("+m/2+","+d/2+")");const{themeVariables:i}=g;let[x]=st(i.pieOuterStrokeWidth);x??(x=2);const w=s.textPosition,h=Math.min(m,d)/2-e,D=_().innerRadius(0).outerRadius(h),$=_().innerRadius(h*w).outerRadius(h*w);c.append("circle").attr("cx",0).attr("cy",0).attr("r",h+x/2).attr("class","pieOuterCircle");const p=o.getSections(),A=Mt(p),C=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let b=0;p.forEach(r=>{b+=r});const L=A.filter(r=>(r.data.value/b*100).toFixed(0)!=="0"),k=dt(C).domain([...p.keys()]);c.selectAll("mySlices").data(L).enter().append("path").attr("d",D).attr("fill",r=>k(r.data.label)).attr("class","pieCircle"),c.selectAll("mySlices").data(L).enter().append("text").text(r=>(r.data.value/b*100).toFixed(0)+"%").attr("transform",r=>"translate("+$.centroid(r)+")").style("text-anchor","middle").attr("class","slice");const U=c.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),G=[...p.entries()].map(([r,M])=>({label:r,value:M})),E=c.selectAll(".legend").data(G).enter().append("g").attr("class","legend").attr("transform",(r,M)=>{const O=n+l,Z=O*G.length/2,J=12*n,K=M*O-Z;return"translate("+J+","+K+")"});E.append("rect").attr("width",n).attr("height",n).style("fill",r=>k(r.label)).style("stroke",r=>k(r.label)),E.append("text").attr("x",n+l).attr("y",n-l).text(r=>o.getShowData()?`${r.label} [${r.value}]`:r.label);const j=Math.max(...E.selectAll("text").nodes().map(r=>(r==null?void 0:r.getBoundingClientRect().width)??0)),q=m+e+n+l+j,N=((I=U.node())==null?void 0:I.getBoundingClientRect().width)??0,H=m/2-N/2,X=m/2+N/2,P=Math.min(0,H),B=Math.max(q,X)-P;v.attr("viewBox",`${P} 0 ${B} ${d}`),lt(v,d,B,s.useMaxWidth)},"draw"),Wt={draw:Rt},Qt={parser:bt,db:V,renderer:Wt,styles:Et};export{Qt as diagram};
