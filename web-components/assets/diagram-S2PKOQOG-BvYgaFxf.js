import{_ as m,F as u,K as B,e as C,l as w,b as S,a as D,q as T,t as z,g as F,s as P,G as E,H as A,z as W}from"./diagramElement-CRI4AcTZ.js";import{p as _}from"./chunk-4BX2VUAB-N0FugxPd.js";import{p as N}from"./treemap-KMMF4GRG-P773orzg.js";import"./property-SleeCrad.js";import"./iframe-CTziTsqO.js";import"./preload-helper-C1FmrZbK.js";import"./state-Bbzafc3I.js";import"./timer-CU8_kBSc.js";import"./settings-BQP9c3yA.js";import"./loading-WKv1zxOp.js";import"./class-map-usWIp98a.js";import"./directive-CJw_OlP2.js";import"./carbon-element-DvT6Hso_.js";import"./loading-icon-BQQvUNie.js";import"./unsafe-html-szFMVhB1.js";import"./min-CfJFRU5_.js";import"./_baseUniq-CY_jlhw2.js";var L=E.packet,b,v=(b=class{constructor(){this.packet=[],this.setAccTitle=S,this.getAccTitle=D,this.setDiagramTitle=T,this.getDiagramTitle=z,this.getAccDescription=F,this.setAccDescription=P}getConfig(){const t=u({...L,...A().packet});return t.showBits&&(t.paddingY+=10),t}getPacket(){return this.packet}pushWord(t){t.length>0&&this.packet.push(t)}clear(){W(),this.packet=[]}},m(b,"PacketDB"),b),M=1e4,Y=m((e,t)=>{_(e,t);let o=-1,r=[],n=1;const{bitsPerRow:l}=t.getConfig();for(let{start:a,end:s,bits:d,label:c}of e.blocks){if(a!==void 0&&s!==void 0&&s<a)throw new Error(`Packet block ${a} - ${s} is invalid. End must be greater than start.`);if(a??(a=o+1),a!==o+1)throw new Error(`Packet block ${a} - ${s??a} is not contiguous. It should start from ${o+1}.`);if(d===0)throw new Error(`Packet block ${a} is invalid. Cannot have a zero bit field.`);for(s??(s=a+(d??1)-1),d??(d=s-a+1),o=s,w.debug(`Packet block ${a} - ${o} with label ${c}`);r.length<=l+1&&t.getPacket().length<M;){const[p,i]=G({start:a,end:s,bits:d,label:c},n,l);if(r.push(p),p.end+1===n*l&&(t.pushWord(r),r=[],n++),!i)break;({start:a,end:s,bits:d,label:c}=i)}}t.pushWord(r)},"populate"),G=m((e,t,o)=>{if(e.start===void 0)throw new Error("start should have been set during first phase");if(e.end===void 0)throw new Error("end should have been set during first phase");if(e.start>e.end)throw new Error(`Block start ${e.start} is greater than block end ${e.end}.`);if(e.end+1<=t*o)return[e,void 0];const r=t*o-1,n=t*o;return[{start:e.start,end:r,label:e.label,bits:r-e.start},{start:n,end:e.end,label:e.label,bits:e.end-n}]},"getNextFittingBlock"),x={parser:{yy:void 0},parse:m(async e=>{var r;const t=await N("packet",e),o=(r=x.parser)==null?void 0:r.yy;if(!(o instanceof v))throw new Error("parser.parser?.yy was not a PacketDB. This is due to a bug within Mermaid, please report this issue at https://github.com/mermaid-js/mermaid/issues.");w.debug(t),Y(t,o)},"parse")},H=m((e,t,o,r)=>{const n=r.db,l=n.getConfig(),{rowHeight:a,paddingY:s,bitWidth:d,bitsPerRow:c}=l,p=n.getPacket(),i=n.getDiagramTitle(),h=a+s,g=h*(p.length+1)-(i?0:a),k=d*c+2,f=B(t);f.attr("viewbox",`0 0 ${k} ${g}`),C(f,g,k,l.useMaxWidth);for(const[y,$]of p.entries())I(f,$,y,l);f.append("text").text(i).attr("x",k/2).attr("y",g-h/2).attr("dominant-baseline","middle").attr("text-anchor","middle").attr("class","packetTitle")},"draw"),I=m((e,t,o,{rowHeight:r,paddingX:n,paddingY:l,bitWidth:a,bitsPerRow:s,showBits:d})=>{const c=e.append("g"),p=o*(r+l)+l;for(const i of t){const h=i.start%s*a+1,g=(i.end-i.start+1)*a-n;if(c.append("rect").attr("x",h).attr("y",p).attr("width",g).attr("height",r).attr("class","packetBlock"),c.append("text").attr("x",h+g/2).attr("y",p+r/2).attr("class","packetLabel").attr("dominant-baseline","middle").attr("text-anchor","middle").text(i.label),!d)continue;const k=i.end===i.start,f=p-2;c.append("text").attr("x",h+(k?g/2:0)).attr("y",f).attr("class","packetByte start").attr("dominant-baseline","auto").attr("text-anchor",k?"middle":"start").text(i.start),k||c.append("text").attr("x",h+g).attr("y",f).attr("class","packetByte end").attr("dominant-baseline","auto").attr("text-anchor","end").text(i.end)}},"drawWord"),K={draw:H},O={byteFontSize:"10px",startByteColor:"black",endByteColor:"black",labelColor:"black",labelFontSize:"12px",titleColor:"black",titleFontSize:"14px",blockStrokeColor:"black",blockStrokeWidth:"1",blockFillColor:"#efefef"},j=m(({packet:e}={})=>{const t=u(O,e);return`
	.packetByte {
		font-size: ${t.byteFontSize};
	}
	.packetByte.start {
		fill: ${t.startByteColor};
	}
	.packetByte.end {
		fill: ${t.endByteColor};
	}
	.packetLabel {
		fill: ${t.labelColor};
		font-size: ${t.labelFontSize};
	}
	.packetTitle {
		fill: ${t.titleColor};
		font-size: ${t.titleFontSize};
	}
	.packetBlock {
		stroke: ${t.blockStrokeColor};
		stroke-width: ${t.blockStrokeWidth};
		fill: ${t.blockFillColor};
	}
	`},"styles"),ct={parser:x,get db(){return new v},renderer:K,styles:j};export{ct as diagram};
