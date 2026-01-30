import{g as ye,s as ge,t as pe,q as ve,a as Te,b as xe,_ as c,c as lt,d as pt,e as be,at as X,l as st,k as we,j as _e,z as De,u as Se}from"./diagramElement-CRI4AcTZ.js";import{h as Dt,g as St}from"./iframe-CTziTsqO.js";import{t as Me,m as Ce,a as Ee,i as Ie,b as Gt,c as Xt,d as Ae,e as Ye,f as $e,g as Fe,h as Le,j as We,k as Oe,l as qt,n as Ut,o as Zt,s as Qt,p as Kt}from"./time-B7RnGP9R.js";import{l as Ve}from"./linear-DxbJQP_V.js";import"./property-SleeCrad.js";import"./state-Bbzafc3I.js";import"./preload-helper-C1FmrZbK.js";import"./timer-CU8_kBSc.js";import"./settings-BQP9c3yA.js";import"./loading-WKv1zxOp.js";import"./class-map-usWIp98a.js";import"./directive-CJw_OlP2.js";import"./carbon-element-DvT6Hso_.js";import"./loading-icon-BQQvUNie.js";import"./unsafe-html-szFMVhB1.js";import"./init-Dmth1JHB.js";import"./defaultLocale-CzDG__Ur.js";function Pe(t){return t}var Tt=1,Ct=2,It=3,vt=4,Jt=1e-6;function ze(t){return"translate("+t+",0)"}function Ne(t){return"translate(0,"+t+")"}function He(t){return i=>+t(i)}function Re(t,i){return i=Math.max(0,t.bandwidth()-i*2)/2,t.round()&&(i=Math.round(i)),s=>+t(s)+i}function Be(){return!this.__axis}function ie(t,i){var s=[],n=null,a=null,m=6,h=6,b=3,E=typeof window<"u"&&window.devicePixelRatio>1?0:.5,Y=t===Tt||t===vt?-1:1,x=t===vt||t===Ct?"x":"y",L=t===Tt||t===It?ze:Ne;function M(D){var N=n??(i.ticks?i.ticks.apply(i,s):i.domain()),I=a??(i.tickFormat?i.tickFormat.apply(i,s):Pe),S=Math.max(m,0)+b,C=i.range(),O=+C[0]+E,F=+C[C.length-1]+E,H=(i.bandwidth?Re:He)(i.copy(),E),R=D.selection?D.selection():D,A=R.selectAll(".domain").data([null]),p=R.selectAll(".tick").data(N,i).order(),d=p.exit(),u=p.enter().append("g").attr("class","tick"),T=p.select("line"),v=p.select("text");A=A.merge(A.enter().insert("path",".tick").attr("class","domain").attr("stroke","currentColor")),p=p.merge(u),T=T.merge(u.append("line").attr("stroke","currentColor").attr(x+"2",Y*m)),v=v.merge(u.append("text").attr("fill","currentColor").attr(x,Y*S).attr("dy",t===Tt?"0em":t===It?"0.71em":"0.32em")),D!==R&&(A=A.transition(D),p=p.transition(D),T=T.transition(D),v=v.transition(D),d=d.transition(D).attr("opacity",Jt).attr("transform",function(k){return isFinite(k=H(k))?L(k+E):this.getAttribute("transform")}),u.attr("opacity",Jt).attr("transform",function(k){var f=this.parentNode.__axis;return L((f&&isFinite(f=f(k))?f:H(k))+E)})),d.remove(),A.attr("d",t===vt||t===Ct?h?"M"+Y*h+","+O+"H"+E+"V"+F+"H"+Y*h:"M"+E+","+O+"V"+F:h?"M"+O+","+Y*h+"V"+E+"H"+F+"V"+Y*h:"M"+O+","+E+"H"+F),p.attr("opacity",1).attr("transform",function(k){return L(H(k)+E)}),T.attr(x+"2",Y*m),v.attr(x,Y*S).text(I),R.filter(Be).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===Ct?"start":t===vt?"end":"middle"),R.each(function(){this.__axis=H})}return M.scale=function(D){return arguments.length?(i=D,M):i},M.ticks=function(){return s=Array.from(arguments),M},M.tickArguments=function(D){return arguments.length?(s=D==null?[]:Array.from(D),M):s.slice()},M.tickValues=function(D){return arguments.length?(n=D==null?null:Array.from(D),M):n&&n.slice()},M.tickFormat=function(D){return arguments.length?(a=D,M):a},M.tickSize=function(D){return arguments.length?(m=h=+D,M):m},M.tickSizeInner=function(D){return arguments.length?(m=+D,M):m},M.tickSizeOuter=function(D){return arguments.length?(h=+D,M):h},M.tickPadding=function(D){return arguments.length?(b=+D,M):b},M.offset=function(D){return arguments.length?(E=+D,M):E},M}function je(t){return ie(Tt,t)}function Ge(t){return ie(It,t)}var ne={exports:{}};(function(t,i){(function(s,n){t.exports=n()})(Dt,function(){var s="day";return function(n,a,m){var h=function(Y){return Y.add(4-Y.isoWeekday(),s)},b=a.prototype;b.isoWeekYear=function(){return h(this).year()},b.isoWeek=function(Y){if(!this.$utils().u(Y))return this.add(7*(Y-this.isoWeek()),s);var x,L,M,D,N=h(this),I=(x=this.isoWeekYear(),L=this.$u,M=(L?m.utc:m)().year(x).startOf("year"),D=4-M.isoWeekday(),M.isoWeekday()>4&&(D+=7),M.add(D,s));return N.diff(I,"week")+1},b.isoWeekday=function(Y){return this.$utils().u(Y)?this.day()||7:this.day(this.day()%7?Y:Y-7)};var E=b.startOf;b.startOf=function(Y,x){var L=this.$utils(),M=!!L.u(x)||x;return L.p(Y)==="isoweek"?M?this.date(this.date()-(this.isoWeekday()-1)).startOf("day"):this.date(this.date()-1-(this.isoWeekday()-1)+7).endOf("day"):E.bind(this)(Y,x)}}})})(ne);var Xe=ne.exports;const qe=St(Xe);var se={exports:{}};(function(t,i){(function(s,n){t.exports=n()})(Dt,function(){var s={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},n=/(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,a=/\d/,m=/\d\d/,h=/\d\d?/,b=/\d*[^-_:/,()\s\d]+/,E={},Y=function(S){return(S=+S)+(S>68?1900:2e3)},x=function(S){return function(C){this[S]=+C}},L=[/[+-]\d\d:?(\d\d)?|Z/,function(S){(this.zone||(this.zone={})).offset=function(C){if(!C||C==="Z")return 0;var O=C.match(/([+-]|\d\d)/g),F=60*O[1]+(+O[2]||0);return F===0?0:O[0]==="+"?-F:F}(S)}],M=function(S){var C=E[S];return C&&(C.indexOf?C:C.s.concat(C.f))},D=function(S,C){var O,F=E.meridiem;if(F){for(var H=1;H<=24;H+=1)if(S.indexOf(F(H,0,C))>-1){O=H>12;break}}else O=S===(C?"pm":"PM");return O},N={A:[b,function(S){this.afternoon=D(S,!1)}],a:[b,function(S){this.afternoon=D(S,!0)}],Q:[a,function(S){this.month=3*(S-1)+1}],S:[a,function(S){this.milliseconds=100*+S}],SS:[m,function(S){this.milliseconds=10*+S}],SSS:[/\d{3}/,function(S){this.milliseconds=+S}],s:[h,x("seconds")],ss:[h,x("seconds")],m:[h,x("minutes")],mm:[h,x("minutes")],H:[h,x("hours")],h:[h,x("hours")],HH:[h,x("hours")],hh:[h,x("hours")],D:[h,x("day")],DD:[m,x("day")],Do:[b,function(S){var C=E.ordinal,O=S.match(/\d+/);if(this.day=O[0],C)for(var F=1;F<=31;F+=1)C(F).replace(/\[|\]/g,"")===S&&(this.day=F)}],w:[h,x("week")],ww:[m,x("week")],M:[h,x("month")],MM:[m,x("month")],MMM:[b,function(S){var C=M("months"),O=(M("monthsShort")||C.map(function(F){return F.slice(0,3)})).indexOf(S)+1;if(O<1)throw new Error;this.month=O%12||O}],MMMM:[b,function(S){var C=M("months").indexOf(S)+1;if(C<1)throw new Error;this.month=C%12||C}],Y:[/[+-]?\d+/,x("year")],YY:[m,function(S){this.year=Y(S)}],YYYY:[/\d{4}/,x("year")],Z:L,ZZ:L};function I(S){var C,O;C=S,O=E&&E.formats;for(var F=(S=C.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,function(T,v,k){var f=k&&k.toUpperCase();return v||O[k]||s[k]||O[f].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,function(o,l,y){return l||y.slice(1)})})).match(n),H=F.length,R=0;R<H;R+=1){var A=F[R],p=N[A],d=p&&p[0],u=p&&p[1];F[R]=u?{regex:d,parser:u}:A.replace(/^\[|\]$/g,"")}return function(T){for(var v={},k=0,f=0;k<H;k+=1){var o=F[k];if(typeof o=="string")f+=o.length;else{var l=o.regex,y=o.parser,g=T.slice(f),w=l.exec(g)[0];y.call(v,w),T=T.replace(w,"")}}return function(r){var z=r.afternoon;if(z!==void 0){var e=r.hours;z?e<12&&(r.hours+=12):e===12&&(r.hours=0),delete r.afternoon}}(v),v}}return function(S,C,O){O.p.customParseFormat=!0,S&&S.parseTwoDigitYear&&(Y=S.parseTwoDigitYear);var F=C.prototype,H=F.parse;F.parse=function(R){var A=R.date,p=R.utc,d=R.args;this.$u=p;var u=d[1];if(typeof u=="string"){var T=d[2]===!0,v=d[3]===!0,k=T||v,f=d[2];v&&(f=d[2]),E=this.$locale(),!T&&f&&(E=O.Ls[f]),this.$d=function(g,w,r,z){try{if(["x","X"].indexOf(w)>-1)return new Date((w==="X"?1e3:1)*g);var e=I(w)(g),_=e.year,P=e.month,V=e.day,W=e.hours,G=e.minutes,$=e.seconds,Q=e.milliseconds,rt=e.zone,ot=e.week,ft=new Date,ht=V||(_||P?1:ft.getDate()),ct=_||ft.getFullYear(),B=0;_&&!P||(B=P>0?P-1:ft.getMonth());var Z,q=W||0,nt=G||0,K=$||0,it=Q||0;return rt?new Date(Date.UTC(ct,B,ht,q,nt,K,it+60*rt.offset*1e3)):r?new Date(Date.UTC(ct,B,ht,q,nt,K,it)):(Z=new Date(ct,B,ht,q,nt,K,it),ot&&(Z=z(Z).week(ot).toDate()),Z)}catch{return new Date("")}}(A,u,p,O),this.init(),f&&f!==!0&&(this.$L=this.locale(f).$L),k&&A!=this.format(u)&&(this.$d=new Date("")),E={}}else if(u instanceof Array)for(var o=u.length,l=1;l<=o;l+=1){d[1]=u[l-1];var y=O.apply(this,d);if(y.isValid()){this.$d=y.$d,this.$L=y.$L,this.init();break}l===o&&(this.$d=new Date(""))}else H.call(this,R)}}})})(se);var Ue=se.exports;const Ze=St(Ue);var ae={exports:{}};(function(t,i){(function(s,n){t.exports=n()})(Dt,function(){return function(s,n){var a=n.prototype,m=a.format;a.format=function(h){var b=this,E=this.$locale();if(!this.isValid())return m.bind(this)(h);var Y=this.$utils(),x=(h||"YYYY-MM-DDTHH:mm:ssZ").replace(/\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|Do|X|x|k{1,2}|S/g,function(L){switch(L){case"Q":return Math.ceil((b.$M+1)/3);case"Do":return E.ordinal(b.$D);case"gggg":return b.weekYear();case"GGGG":return b.isoWeekYear();case"wo":return E.ordinal(b.week(),"W");case"w":case"ww":return Y.s(b.week(),L==="w"?1:2,"0");case"W":case"WW":return Y.s(b.isoWeek(),L==="W"?1:2,"0");case"k":case"kk":return Y.s(String(b.$H===0?24:b.$H),L==="k"?1:2,"0");case"X":return Math.floor(b.$d.getTime()/1e3);case"x":return b.$d.getTime();case"z":return"["+b.offsetName()+"]";case"zzz":return"["+b.offsetName("long")+"]";default:return L}});return m.bind(this)(x)}}})})(ae);var Qe=ae.exports;const Ke=St(Qe);var oe={exports:{}};(function(t,i){(function(s,n){t.exports=n()})(Dt,function(){var s,n,a=1e3,m=6e4,h=36e5,b=864e5,E=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,Y=31536e6,x=2628e6,L=/^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,M={years:Y,months:x,days:b,hours:h,minutes:m,seconds:a,milliseconds:1,weeks:6048e5},D=function(A){return A instanceof H},N=function(A,p,d){return new H(A,d,p.$l)},I=function(A){return n.p(A)+"s"},S=function(A){return A<0},C=function(A){return S(A)?Math.ceil(A):Math.floor(A)},O=function(A){return Math.abs(A)},F=function(A,p){return A?S(A)?{negative:!0,format:""+O(A)+p}:{negative:!1,format:""+A+p}:{negative:!1,format:""}},H=function(){function A(d,u,T){var v=this;if(this.$d={},this.$l=T,d===void 0&&(this.$ms=0,this.parseFromMilliseconds()),u)return N(d*M[I(u)],this);if(typeof d=="number")return this.$ms=d,this.parseFromMilliseconds(),this;if(typeof d=="object")return Object.keys(d).forEach(function(o){v.$d[I(o)]=d[o]}),this.calMilliseconds(),this;if(typeof d=="string"){var k=d.match(L);if(k){var f=k.slice(2).map(function(o){return o!=null?Number(o):0});return this.$d.years=f[0],this.$d.months=f[1],this.$d.weeks=f[2],this.$d.days=f[3],this.$d.hours=f[4],this.$d.minutes=f[5],this.$d.seconds=f[6],this.calMilliseconds(),this}}return this}var p=A.prototype;return p.calMilliseconds=function(){var d=this;this.$ms=Object.keys(this.$d).reduce(function(u,T){return u+(d.$d[T]||0)*M[T]},0)},p.parseFromMilliseconds=function(){var d=this.$ms;this.$d.years=C(d/Y),d%=Y,this.$d.months=C(d/x),d%=x,this.$d.days=C(d/b),d%=b,this.$d.hours=C(d/h),d%=h,this.$d.minutes=C(d/m),d%=m,this.$d.seconds=C(d/a),d%=a,this.$d.milliseconds=d},p.toISOString=function(){var d=F(this.$d.years,"Y"),u=F(this.$d.months,"M"),T=+this.$d.days||0;this.$d.weeks&&(T+=7*this.$d.weeks);var v=F(T,"D"),k=F(this.$d.hours,"H"),f=F(this.$d.minutes,"M"),o=this.$d.seconds||0;this.$d.milliseconds&&(o+=this.$d.milliseconds/1e3,o=Math.round(1e3*o)/1e3);var l=F(o,"S"),y=d.negative||u.negative||v.negative||k.negative||f.negative||l.negative,g=k.format||f.format||l.format?"T":"",w=(y?"-":"")+"P"+d.format+u.format+v.format+g+k.format+f.format+l.format;return w==="P"||w==="-P"?"P0D":w},p.toJSON=function(){return this.toISOString()},p.format=function(d){var u=d||"YYYY-MM-DDTHH:mm:ss",T={Y:this.$d.years,YY:n.s(this.$d.years,2,"0"),YYYY:n.s(this.$d.years,4,"0"),M:this.$d.months,MM:n.s(this.$d.months,2,"0"),D:this.$d.days,DD:n.s(this.$d.days,2,"0"),H:this.$d.hours,HH:n.s(this.$d.hours,2,"0"),m:this.$d.minutes,mm:n.s(this.$d.minutes,2,"0"),s:this.$d.seconds,ss:n.s(this.$d.seconds,2,"0"),SSS:n.s(this.$d.milliseconds,3,"0")};return u.replace(E,function(v,k){return k||String(T[v])})},p.as=function(d){return this.$ms/M[I(d)]},p.get=function(d){var u=this.$ms,T=I(d);return T==="milliseconds"?u%=1e3:u=T==="weeks"?C(u/M[T]):this.$d[T],u||0},p.add=function(d,u,T){var v;return v=u?d*M[I(u)]:D(d)?d.$ms:N(d,this).$ms,N(this.$ms+v*(T?-1:1),this)},p.subtract=function(d,u){return this.add(d,u,!0)},p.locale=function(d){var u=this.clone();return u.$l=d,u},p.clone=function(){return N(this.$ms,this)},p.humanize=function(d){return s().add(this.$ms,"ms").locale(this.$l).fromNow(!d)},p.valueOf=function(){return this.asMilliseconds()},p.milliseconds=function(){return this.get("milliseconds")},p.asMilliseconds=function(){return this.as("milliseconds")},p.seconds=function(){return this.get("seconds")},p.asSeconds=function(){return this.as("seconds")},p.minutes=function(){return this.get("minutes")},p.asMinutes=function(){return this.as("minutes")},p.hours=function(){return this.get("hours")},p.asHours=function(){return this.as("hours")},p.days=function(){return this.get("days")},p.asDays=function(){return this.as("days")},p.weeks=function(){return this.get("weeks")},p.asWeeks=function(){return this.as("weeks")},p.months=function(){return this.get("months")},p.asMonths=function(){return this.as("months")},p.years=function(){return this.get("years")},p.asYears=function(){return this.as("years")},A}(),R=function(A,p,d){return A.add(p.years()*d,"y").add(p.months()*d,"M").add(p.days()*d,"d").add(p.hours()*d,"h").add(p.minutes()*d,"m").add(p.seconds()*d,"s").add(p.milliseconds()*d,"ms")};return function(A,p,d){s=d,n=d().$utils(),d.duration=function(v,k){var f=d.locale();return N(v,{$l:f},k)},d.isDuration=D;var u=p.prototype.add,T=p.prototype.subtract;p.prototype.add=function(v,k){return D(v)?R(this,v,1):u.bind(this)(v,k)},p.prototype.subtract=function(v,k){return D(v)?R(this,v,-1):T.bind(this)(v,k)}}})})(oe);var Je=oe.exports;const tr=St(Je);var At=function(){var t=c(function(f,o,l,y){for(l=l||{},y=f.length;y--;l[f[y]]=o);return l},"o"),i=[6,8,10,12,13,14,15,16,17,18,20,21,22,23,24,25,26,27,28,29,30,31,33,35,36,38,40],s=[1,26],n=[1,27],a=[1,28],m=[1,29],h=[1,30],b=[1,31],E=[1,32],Y=[1,33],x=[1,34],L=[1,9],M=[1,10],D=[1,11],N=[1,12],I=[1,13],S=[1,14],C=[1,15],O=[1,16],F=[1,19],H=[1,20],R=[1,21],A=[1,22],p=[1,23],d=[1,25],u=[1,35],T={trace:c(function(){},"trace"),yy:{},symbols_:{error:2,start:3,gantt:4,document:5,EOF:6,line:7,SPACE:8,statement:9,NL:10,weekday:11,weekday_monday:12,weekday_tuesday:13,weekday_wednesday:14,weekday_thursday:15,weekday_friday:16,weekday_saturday:17,weekday_sunday:18,weekend:19,weekend_friday:20,weekend_saturday:21,dateFormat:22,inclusiveEndDates:23,topAxis:24,axisFormat:25,tickInterval:26,excludes:27,includes:28,todayMarker:29,title:30,acc_title:31,acc_title_value:32,acc_descr:33,acc_descr_value:34,acc_descr_multiline_value:35,section:36,clickStatement:37,taskTxt:38,taskData:39,click:40,callbackname:41,callbackargs:42,href:43,clickStatementDebug:44,$accept:0,$end:1},terminals_:{2:"error",4:"gantt",6:"EOF",8:"SPACE",10:"NL",12:"weekday_monday",13:"weekday_tuesday",14:"weekday_wednesday",15:"weekday_thursday",16:"weekday_friday",17:"weekday_saturday",18:"weekday_sunday",20:"weekend_friday",21:"weekend_saturday",22:"dateFormat",23:"inclusiveEndDates",24:"topAxis",25:"axisFormat",26:"tickInterval",27:"excludes",28:"includes",29:"todayMarker",30:"title",31:"acc_title",32:"acc_title_value",33:"acc_descr",34:"acc_descr_value",35:"acc_descr_multiline_value",36:"section",38:"taskTxt",39:"taskData",40:"click",41:"callbackname",42:"callbackargs",43:"href"},productions_:[0,[3,3],[5,0],[5,2],[7,2],[7,1],[7,1],[7,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[11,1],[19,1],[19,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,2],[9,1],[9,1],[9,1],[9,2],[37,2],[37,3],[37,3],[37,4],[37,3],[37,4],[37,2],[44,2],[44,3],[44,3],[44,4],[44,3],[44,4],[44,2]],performAction:c(function(o,l,y,g,w,r,z){var e=r.length-1;switch(w){case 1:return r[e-1];case 2:this.$=[];break;case 3:r[e-1].push(r[e]),this.$=r[e-1];break;case 4:case 5:this.$=r[e];break;case 6:case 7:this.$=[];break;case 8:g.setWeekday("monday");break;case 9:g.setWeekday("tuesday");break;case 10:g.setWeekday("wednesday");break;case 11:g.setWeekday("thursday");break;case 12:g.setWeekday("friday");break;case 13:g.setWeekday("saturday");break;case 14:g.setWeekday("sunday");break;case 15:g.setWeekend("friday");break;case 16:g.setWeekend("saturday");break;case 17:g.setDateFormat(r[e].substr(11)),this.$=r[e].substr(11);break;case 18:g.enableInclusiveEndDates(),this.$=r[e].substr(18);break;case 19:g.TopAxis(),this.$=r[e].substr(8);break;case 20:g.setAxisFormat(r[e].substr(11)),this.$=r[e].substr(11);break;case 21:g.setTickInterval(r[e].substr(13)),this.$=r[e].substr(13);break;case 22:g.setExcludes(r[e].substr(9)),this.$=r[e].substr(9);break;case 23:g.setIncludes(r[e].substr(9)),this.$=r[e].substr(9);break;case 24:g.setTodayMarker(r[e].substr(12)),this.$=r[e].substr(12);break;case 27:g.setDiagramTitle(r[e].substr(6)),this.$=r[e].substr(6);break;case 28:this.$=r[e].trim(),g.setAccTitle(this.$);break;case 29:case 30:this.$=r[e].trim(),g.setAccDescription(this.$);break;case 31:g.addSection(r[e].substr(8)),this.$=r[e].substr(8);break;case 33:g.addTask(r[e-1],r[e]),this.$="task";break;case 34:this.$=r[e-1],g.setClickEvent(r[e-1],r[e],null);break;case 35:this.$=r[e-2],g.setClickEvent(r[e-2],r[e-1],r[e]);break;case 36:this.$=r[e-2],g.setClickEvent(r[e-2],r[e-1],null),g.setLink(r[e-2],r[e]);break;case 37:this.$=r[e-3],g.setClickEvent(r[e-3],r[e-2],r[e-1]),g.setLink(r[e-3],r[e]);break;case 38:this.$=r[e-2],g.setClickEvent(r[e-2],r[e],null),g.setLink(r[e-2],r[e-1]);break;case 39:this.$=r[e-3],g.setClickEvent(r[e-3],r[e-1],r[e]),g.setLink(r[e-3],r[e-2]);break;case 40:this.$=r[e-1],g.setLink(r[e-1],r[e]);break;case 41:case 47:this.$=r[e-1]+" "+r[e];break;case 42:case 43:case 45:this.$=r[e-2]+" "+r[e-1]+" "+r[e];break;case 44:case 46:this.$=r[e-3]+" "+r[e-2]+" "+r[e-1]+" "+r[e];break}},"anonymous"),table:[{3:1,4:[1,2]},{1:[3]},t(i,[2,2],{5:3}),{6:[1,4],7:5,8:[1,6],9:7,10:[1,8],11:17,12:s,13:n,14:a,15:m,16:h,17:b,18:E,19:18,20:Y,21:x,22:L,23:M,24:D,25:N,26:I,27:S,28:C,29:O,30:F,31:H,33:R,35:A,36:p,37:24,38:d,40:u},t(i,[2,7],{1:[2,1]}),t(i,[2,3]),{9:36,11:17,12:s,13:n,14:a,15:m,16:h,17:b,18:E,19:18,20:Y,21:x,22:L,23:M,24:D,25:N,26:I,27:S,28:C,29:O,30:F,31:H,33:R,35:A,36:p,37:24,38:d,40:u},t(i,[2,5]),t(i,[2,6]),t(i,[2,17]),t(i,[2,18]),t(i,[2,19]),t(i,[2,20]),t(i,[2,21]),t(i,[2,22]),t(i,[2,23]),t(i,[2,24]),t(i,[2,25]),t(i,[2,26]),t(i,[2,27]),{32:[1,37]},{34:[1,38]},t(i,[2,30]),t(i,[2,31]),t(i,[2,32]),{39:[1,39]},t(i,[2,8]),t(i,[2,9]),t(i,[2,10]),t(i,[2,11]),t(i,[2,12]),t(i,[2,13]),t(i,[2,14]),t(i,[2,15]),t(i,[2,16]),{41:[1,40],43:[1,41]},t(i,[2,4]),t(i,[2,28]),t(i,[2,29]),t(i,[2,33]),t(i,[2,34],{42:[1,42],43:[1,43]}),t(i,[2,40],{41:[1,44]}),t(i,[2,35],{43:[1,45]}),t(i,[2,36]),t(i,[2,38],{42:[1,46]}),t(i,[2,37]),t(i,[2,39])],defaultActions:{},parseError:c(function(o,l){if(l.recoverable)this.trace(o);else{var y=new Error(o);throw y.hash=l,y}},"parseError"),parse:c(function(o){var l=this,y=[0],g=[],w=[null],r=[],z=this.table,e="",_=0,P=0,V=2,W=1,G=r.slice.call(arguments,1),$=Object.create(this.lexer),Q={yy:{}};for(var rt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,rt)&&(Q.yy[rt]=this.yy[rt]);$.setInput(o,Q.yy),Q.yy.lexer=$,Q.yy.parser=this,typeof $.yylloc>"u"&&($.yylloc={});var ot=$.yylloc;r.push(ot);var ft=$.options&&$.options.ranges;typeof Q.yy.parseError=="function"?this.parseError=Q.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function ht(U){y.length=y.length-2*U,w.length=w.length-U,r.length=r.length-U}c(ht,"popStack");function ct(){var U;return U=g.pop()||$.lex()||W,typeof U!="number"&&(U instanceof Array&&(g=U,U=g.pop()),U=l.symbols_[U]||U),U}c(ct,"lex");for(var B,Z,q,nt,K={},it,J,jt,gt;;){if(Z=y[y.length-1],this.defaultActions[Z]?q=this.defaultActions[Z]:((B===null||typeof B>"u")&&(B=ct()),q=z[Z]&&z[Z][B]),typeof q>"u"||!q.length||!q[0]){var Mt="";gt=[];for(it in z[Z])this.terminals_[it]&&it>V&&gt.push("'"+this.terminals_[it]+"'");$.showPosition?Mt="Parse error on line "+(_+1)+`:
`+$.showPosition()+`
Expecting `+gt.join(", ")+", got '"+(this.terminals_[B]||B)+"'":Mt="Parse error on line "+(_+1)+": Unexpected "+(B==W?"end of input":"'"+(this.terminals_[B]||B)+"'"),this.parseError(Mt,{text:$.match,token:this.terminals_[B]||B,line:$.yylineno,loc:ot,expected:gt})}if(q[0]instanceof Array&&q.length>1)throw new Error("Parse Error: multiple actions possible at state: "+Z+", token: "+B);switch(q[0]){case 1:y.push(B),w.push($.yytext),r.push($.yylloc),y.push(q[1]),B=null,P=$.yyleng,e=$.yytext,_=$.yylineno,ot=$.yylloc;break;case 2:if(J=this.productions_[q[1]][1],K.$=w[w.length-J],K._$={first_line:r[r.length-(J||1)].first_line,last_line:r[r.length-1].last_line,first_column:r[r.length-(J||1)].first_column,last_column:r[r.length-1].last_column},ft&&(K._$.range=[r[r.length-(J||1)].range[0],r[r.length-1].range[1]]),nt=this.performAction.apply(K,[e,P,_,Q.yy,q[1],w,r].concat(G)),typeof nt<"u")return nt;J&&(y=y.slice(0,-1*J*2),w=w.slice(0,-1*J),r=r.slice(0,-1*J)),y.push(this.productions_[q[1]][0]),w.push(K.$),r.push(K._$),jt=z[y[y.length-2]][y[y.length-1]],y.push(jt);break;case 3:return!0}}return!0},"parse")},v=function(){var f={EOF:1,parseError:c(function(l,y){if(this.yy.parser)this.yy.parser.parseError(l,y);else throw new Error(l)},"parseError"),setInput:c(function(o,l){return this.yy=l||this.yy||{},this._input=o,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:c(function(){var o=this._input[0];this.yytext+=o,this.yyleng++,this.offset++,this.match+=o,this.matched+=o;var l=o.match(/(?:\r\n?|\n).*/g);return l?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),o},"input"),unput:c(function(o){var l=o.length,y=o.split(/(?:\r\n?|\n)/g);this._input=o+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-l),this.offset-=l;var g=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),y.length-1&&(this.yylineno-=y.length-1);var w=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:y?(y.length===g.length?this.yylloc.first_column:0)+g[g.length-y.length].length-y[0].length:this.yylloc.first_column-l},this.options.ranges&&(this.yylloc.range=[w[0],w[0]+this.yyleng-l]),this.yyleng=this.yytext.length,this},"unput"),more:c(function(){return this._more=!0,this},"more"),reject:c(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:c(function(o){this.unput(this.match.slice(o))},"less"),pastInput:c(function(){var o=this.matched.substr(0,this.matched.length-this.match.length);return(o.length>20?"...":"")+o.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:c(function(){var o=this.match;return o.length<20&&(o+=this._input.substr(0,20-o.length)),(o.substr(0,20)+(o.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:c(function(){var o=this.pastInput(),l=new Array(o.length+1).join("-");return o+this.upcomingInput()+`
`+l+"^"},"showPosition"),test_match:c(function(o,l){var y,g,w;if(this.options.backtrack_lexer&&(w={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(w.yylloc.range=this.yylloc.range.slice(0))),g=o[0].match(/(?:\r\n?|\n).*/g),g&&(this.yylineno+=g.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:g?g[g.length-1].length-g[g.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+o[0].length},this.yytext+=o[0],this.match+=o[0],this.matches=o,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(o[0].length),this.matched+=o[0],y=this.performAction.call(this,this.yy,this,l,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),y)return y;if(this._backtrack){for(var r in w)this[r]=w[r];return!1}return!1},"test_match"),next:c(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var o,l,y,g;this._more||(this.yytext="",this.match="");for(var w=this._currentRules(),r=0;r<w.length;r++)if(y=this._input.match(this.rules[w[r]]),y&&(!l||y[0].length>l[0].length)){if(l=y,g=r,this.options.backtrack_lexer){if(o=this.test_match(y,w[r]),o!==!1)return o;if(this._backtrack){l=!1;continue}else return!1}else if(!this.options.flex)break}return l?(o=this.test_match(l,w[g]),o!==!1?o:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:c(function(){var l=this.next();return l||this.lex()},"lex"),begin:c(function(l){this.conditionStack.push(l)},"begin"),popState:c(function(){var l=this.conditionStack.length-1;return l>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:c(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:c(function(l){return l=this.conditionStack.length-1-Math.abs(l||0),l>=0?this.conditionStack[l]:"INITIAL"},"topState"),pushState:c(function(l){this.begin(l)},"pushState"),stateStackSize:c(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:c(function(l,y,g,w){switch(g){case 0:return this.begin("open_directive"),"open_directive";case 1:return this.begin("acc_title"),31;case 2:return this.popState(),"acc_title_value";case 3:return this.begin("acc_descr"),33;case 4:return this.popState(),"acc_descr_value";case 5:this.begin("acc_descr_multiline");break;case 6:this.popState();break;case 7:return"acc_descr_multiline_value";case 8:break;case 9:break;case 10:break;case 11:return 10;case 12:break;case 13:break;case 14:this.begin("href");break;case 15:this.popState();break;case 16:return 43;case 17:this.begin("callbackname");break;case 18:this.popState();break;case 19:this.popState(),this.begin("callbackargs");break;case 20:return 41;case 21:this.popState();break;case 22:return 42;case 23:this.begin("click");break;case 24:this.popState();break;case 25:return 40;case 26:return 4;case 27:return 22;case 28:return 23;case 29:return 24;case 30:return 25;case 31:return 26;case 32:return 28;case 33:return 27;case 34:return 29;case 35:return 12;case 36:return 13;case 37:return 14;case 38:return 15;case 39:return 16;case 40:return 17;case 41:return 18;case 42:return 20;case 43:return 21;case 44:return"date";case 45:return 30;case 46:return"accDescription";case 47:return 36;case 48:return 38;case 49:return 39;case 50:return":";case 51:return 6;case 52:return"INVALID"}},"anonymous"),rules:[/^(?:%%\{)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:%%(?!\{)*[^\n]*)/i,/^(?:[^\}]%%*[^\n]*)/i,/^(?:%%*[^\n]*[\n]*)/i,/^(?:[\n]+)/i,/^(?:\s+)/i,/^(?:%[^\n]*)/i,/^(?:href[\s]+["])/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:call[\s]+)/i,/^(?:\([\s]*\))/i,/^(?:\()/i,/^(?:[^(]*)/i,/^(?:\))/i,/^(?:[^)]*)/i,/^(?:click[\s]+)/i,/^(?:[\s\n])/i,/^(?:[^\s\n]*)/i,/^(?:gantt\b)/i,/^(?:dateFormat\s[^#\n;]+)/i,/^(?:inclusiveEndDates\b)/i,/^(?:topAxis\b)/i,/^(?:axisFormat\s[^#\n;]+)/i,/^(?:tickInterval\s[^#\n;]+)/i,/^(?:includes\s[^#\n;]+)/i,/^(?:excludes\s[^#\n;]+)/i,/^(?:todayMarker\s[^\n;]+)/i,/^(?:weekday\s+monday\b)/i,/^(?:weekday\s+tuesday\b)/i,/^(?:weekday\s+wednesday\b)/i,/^(?:weekday\s+thursday\b)/i,/^(?:weekday\s+friday\b)/i,/^(?:weekday\s+saturday\b)/i,/^(?:weekday\s+sunday\b)/i,/^(?:weekend\s+friday\b)/i,/^(?:weekend\s+saturday\b)/i,/^(?:\d\d\d\d-\d\d-\d\d\b)/i,/^(?:title\s[^\n]+)/i,/^(?:accDescription\s[^#\n;]+)/i,/^(?:section\s[^\n]+)/i,/^(?:[^:\n]+)/i,/^(?::[^#\n;]+)/i,/^(?::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{acc_descr_multiline:{rules:[6,7],inclusive:!1},acc_descr:{rules:[4],inclusive:!1},acc_title:{rules:[2],inclusive:!1},callbackargs:{rules:[21,22],inclusive:!1},callbackname:{rules:[18,19,20],inclusive:!1},href:{rules:[15,16],inclusive:!1},click:{rules:[24,25],inclusive:!1},INITIAL:{rules:[0,1,3,5,8,9,10,11,12,13,14,17,23,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52],inclusive:!0}}};return f}();T.lexer=v;function k(){this.yy={}}return c(k,"Parser"),k.prototype=T,T.Parser=k,new k}();At.parser=At;var er=At;X.extend(qe);X.extend(Ze);X.extend(Ke);var te={friday:5,saturday:6},tt="",Lt="",Wt=void 0,Ot="",mt=[],kt=[],Vt=new Map,Pt=[],wt=[],dt="",zt="",ce=["active","done","crit","milestone","vert"],Nt=[],yt=!1,Ht=!1,Rt="sunday",_t="saturday",Yt=0,rr=c(function(){Pt=[],wt=[],dt="",Nt=[],xt=0,Ft=void 0,bt=void 0,j=[],tt="",Lt="",zt="",Wt=void 0,Ot="",mt=[],kt=[],yt=!1,Ht=!1,Yt=0,Vt=new Map,De(),Rt="sunday",_t="saturday"},"clear"),ir=c(function(t){Lt=t},"setAxisFormat"),nr=c(function(){return Lt},"getAxisFormat"),sr=c(function(t){Wt=t},"setTickInterval"),ar=c(function(){return Wt},"getTickInterval"),or=c(function(t){Ot=t},"setTodayMarker"),cr=c(function(){return Ot},"getTodayMarker"),lr=c(function(t){tt=t},"setDateFormat"),ur=c(function(){yt=!0},"enableInclusiveEndDates"),dr=c(function(){return yt},"endDatesAreInclusive"),fr=c(function(){Ht=!0},"enableTopAxis"),hr=c(function(){return Ht},"topAxisEnabled"),mr=c(function(t){zt=t},"setDisplayMode"),kr=c(function(){return zt},"getDisplayMode"),yr=c(function(){return tt},"getDateFormat"),gr=c(function(t){mt=t.toLowerCase().split(/[\s,]+/)},"setIncludes"),pr=c(function(){return mt},"getIncludes"),vr=c(function(t){kt=t.toLowerCase().split(/[\s,]+/)},"setExcludes"),Tr=c(function(){return kt},"getExcludes"),xr=c(function(){return Vt},"getLinks"),br=c(function(t){dt=t,Pt.push(t)},"addSection"),wr=c(function(){return Pt},"getSections"),_r=c(function(){let t=ee();const i=10;let s=0;for(;!t&&s<i;)t=ee(),s++;return wt=j,wt},"getTasks"),le=c(function(t,i,s,n){const a=t.format(i.trim()),m=t.format("YYYY-MM-DD");return n.includes(a)||n.includes(m)?!1:s.includes("weekends")&&(t.isoWeekday()===te[_t]||t.isoWeekday()===te[_t]+1)||s.includes(t.format("dddd").toLowerCase())?!0:s.includes(a)||s.includes(m)},"isInvalidDate"),Dr=c(function(t){Rt=t},"setWeekday"),Sr=c(function(){return Rt},"getWeekday"),Mr=c(function(t){_t=t},"setWeekend"),ue=c(function(t,i,s,n){if(!s.length||t.manualEndTime)return;let a;t.startTime instanceof Date?a=X(t.startTime):a=X(t.startTime,i,!0),a=a.add(1,"d");let m;t.endTime instanceof Date?m=X(t.endTime):m=X(t.endTime,i,!0);const[h,b]=Cr(a,m,i,s,n);t.endTime=h.toDate(),t.renderEndTime=b},"checkTaskDates"),Cr=c(function(t,i,s,n,a){let m=!1,h=null;for(;t<=i;)m||(h=i.toDate()),m=le(t,s,n,a),m&&(i=i.add(1,"d")),t=t.add(1,"d");return[i,h]},"fixTaskDates"),$t=c(function(t,i,s){if(s=s.trim(),c(b=>{const E=b.trim();return E==="x"||E==="X"},"isTimestampFormat")(i)&&/^\d+$/.test(s))return new Date(Number(s));const m=/^after\s+(?<ids>[\d\w- ]+)/.exec(s);if(m!==null){let b=null;for(const Y of m.groups.ids.split(" ")){let x=at(Y);x!==void 0&&(!b||x.endTime>b.endTime)&&(b=x)}if(b)return b.endTime;const E=new Date;return E.setHours(0,0,0,0),E}let h=X(s,i.trim(),!0);if(h.isValid())return h.toDate();{st.debug("Invalid date:"+s),st.debug("With date format:"+i.trim());const b=new Date(s);if(b===void 0||isNaN(b.getTime())||b.getFullYear()<-1e4||b.getFullYear()>1e4)throw new Error("Invalid date:"+s);return b}},"getStartDate"),de=c(function(t){const i=/^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());return i!==null?[Number.parseFloat(i[1]),i[2]]:[NaN,"ms"]},"parseDuration"),fe=c(function(t,i,s,n=!1){s=s.trim();const m=/^until\s+(?<ids>[\d\w- ]+)/.exec(s);if(m!==null){let x=null;for(const M of m.groups.ids.split(" ")){let D=at(M);D!==void 0&&(!x||D.startTime<x.startTime)&&(x=D)}if(x)return x.startTime;const L=new Date;return L.setHours(0,0,0,0),L}let h=X(s,i.trim(),!0);if(h.isValid())return n&&(h=h.add(1,"d")),h.toDate();let b=X(t);const[E,Y]=de(s);if(!Number.isNaN(E)){const x=b.add(E,Y);x.isValid()&&(b=x)}return b.toDate()},"getEndDate"),xt=0,ut=c(function(t){return t===void 0?(xt=xt+1,"task"+xt):t},"parseId"),Er=c(function(t,i){let s;i.substr(0,1)===":"?s=i.substr(1,i.length):s=i;const n=s.split(","),a={};Bt(n,a,ce);for(let h=0;h<n.length;h++)n[h]=n[h].trim();let m="";switch(n.length){case 1:a.id=ut(),a.startTime=t.endTime,m=n[0];break;case 2:a.id=ut(),a.startTime=$t(void 0,tt,n[0]),m=n[1];break;case 3:a.id=ut(n[0]),a.startTime=$t(void 0,tt,n[1]),m=n[2];break}return m&&(a.endTime=fe(a.startTime,tt,m,yt),a.manualEndTime=X(m,"YYYY-MM-DD",!0).isValid(),ue(a,tt,kt,mt)),a},"compileData"),Ir=c(function(t,i){let s;i.substr(0,1)===":"?s=i.substr(1,i.length):s=i;const n=s.split(","),a={};Bt(n,a,ce);for(let m=0;m<n.length;m++)n[m]=n[m].trim();switch(n.length){case 1:a.id=ut(),a.startTime={type:"prevTaskEnd",id:t},a.endTime={data:n[0]};break;case 2:a.id=ut(),a.startTime={type:"getStartDate",startData:n[0]},a.endTime={data:n[1]};break;case 3:a.id=ut(n[0]),a.startTime={type:"getStartDate",startData:n[1]},a.endTime={data:n[2]};break}return a},"parseData"),Ft,bt,j=[],he={},Ar=c(function(t,i){const s={section:dt,type:dt,processed:!1,manualEndTime:!1,renderEndTime:null,raw:{data:i},task:t,classes:[]},n=Ir(bt,i);s.raw.startTime=n.startTime,s.raw.endTime=n.endTime,s.id=n.id,s.prevTaskId=bt,s.active=n.active,s.done=n.done,s.crit=n.crit,s.milestone=n.milestone,s.vert=n.vert,s.order=Yt,Yt++;const a=j.push(s);bt=s.id,he[s.id]=a-1},"addTask"),at=c(function(t){const i=he[t];return j[i]},"findTaskById"),Yr=c(function(t,i){const s={section:dt,type:dt,description:t,task:t,classes:[]},n=Er(Ft,i);s.startTime=n.startTime,s.endTime=n.endTime,s.id=n.id,s.active=n.active,s.done=n.done,s.crit=n.crit,s.milestone=n.milestone,s.vert=n.vert,Ft=s,wt.push(s)},"addTaskOrg"),ee=c(function(){const t=c(function(s){const n=j[s];let a="";switch(j[s].raw.startTime.type){case"prevTaskEnd":{const m=at(n.prevTaskId);n.startTime=m.endTime;break}case"getStartDate":a=$t(void 0,tt,j[s].raw.startTime.startData),a&&(j[s].startTime=a);break}return j[s].startTime&&(j[s].endTime=fe(j[s].startTime,tt,j[s].raw.endTime.data,yt),j[s].endTime&&(j[s].processed=!0,j[s].manualEndTime=X(j[s].raw.endTime.data,"YYYY-MM-DD",!0).isValid(),ue(j[s],tt,kt,mt))),j[s].processed},"compileTask");let i=!0;for(const[s,n]of j.entries())t(s),i=i&&n.processed;return i},"compileTasks"),$r=c(function(t,i){let s=i;lt().securityLevel!=="loose"&&(s=_e(i)),t.split(",").forEach(function(n){at(n)!==void 0&&(ke(n,()=>{window.open(s,"_self")}),Vt.set(n,s))}),me(t,"clickable")},"setLink"),me=c(function(t,i){t.split(",").forEach(function(s){let n=at(s);n!==void 0&&n.classes.push(i)})},"setClass"),Fr=c(function(t,i,s){if(lt().securityLevel!=="loose"||i===void 0)return;let n=[];if(typeof s=="string"){n=s.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);for(let m=0;m<n.length;m++){let h=n[m].trim();h.startsWith('"')&&h.endsWith('"')&&(h=h.substr(1,h.length-2)),n[m]=h}}n.length===0&&n.push(t),at(t)!==void 0&&ke(t,()=>{Se.runFunc(i,...n)})},"setClickFun"),ke=c(function(t,i){Nt.push(function(){const s=document.querySelector(`[id="${t}"]`);s!==null&&s.addEventListener("click",function(){i()})},function(){const s=document.querySelector(`[id="${t}-text"]`);s!==null&&s.addEventListener("click",function(){i()})})},"pushFun"),Lr=c(function(t,i,s){t.split(",").forEach(function(n){Fr(n,i,s)}),me(t,"clickable")},"setClickEvent"),Wr=c(function(t){Nt.forEach(function(i){i(t)})},"bindFunctions"),Or={getConfig:c(()=>lt().gantt,"getConfig"),clear:rr,setDateFormat:lr,getDateFormat:yr,enableInclusiveEndDates:ur,endDatesAreInclusive:dr,enableTopAxis:fr,topAxisEnabled:hr,setAxisFormat:ir,getAxisFormat:nr,setTickInterval:sr,getTickInterval:ar,setTodayMarker:or,getTodayMarker:cr,setAccTitle:xe,getAccTitle:Te,setDiagramTitle:ve,getDiagramTitle:pe,setDisplayMode:mr,getDisplayMode:kr,setAccDescription:ge,getAccDescription:ye,addSection:br,getSections:wr,getTasks:_r,addTask:Ar,findTaskById:at,addTaskOrg:Yr,setIncludes:gr,getIncludes:pr,setExcludes:vr,getExcludes:Tr,setClickEvent:Lr,setLink:$r,getLinks:xr,bindFunctions:Wr,parseDuration:de,isInvalidDate:le,setWeekday:Dr,getWeekday:Sr,setWeekend:Mr};function Bt(t,i,s){let n=!0;for(;n;)n=!1,s.forEach(function(a){const m="^\\s*"+a+"\\s*$",h=new RegExp(m);t[0].match(h)&&(i[a]=!0,t.shift(1),n=!0)})}c(Bt,"getTaskTags");X.extend(tr);var Vr=c(function(){st.debug("Something is calling, setConf, remove the call")},"setConf"),re={monday:Oe,tuesday:We,wednesday:Le,thursday:Fe,friday:$e,saturday:Ye,sunday:Ae},Pr=c((t,i)=>{let s=[...t].map(()=>-1/0),n=[...t].sort((m,h)=>m.startTime-h.startTime||m.order-h.order),a=0;for(const m of n)for(let h=0;h<s.length;h++)if(m.startTime>=s[h]){s[h]=m.endTime,m.order=h+i,h>a&&(a=h);break}return a},"getMaxIntersections"),et,Et=1e4,zr=c(function(t,i,s,n){const a=lt().gantt,m=lt().securityLevel;let h;m==="sandbox"&&(h=pt("#i"+i));const b=m==="sandbox"?pt(h.nodes()[0].contentDocument.body):pt("body"),E=m==="sandbox"?h.nodes()[0].contentDocument:document,Y=E.getElementById(i);et=Y.parentElement.offsetWidth,et===void 0&&(et=1200),a.useWidth!==void 0&&(et=a.useWidth);const x=n.db.getTasks();let L=[];for(const u of x)L.push(u.type);L=d(L);const M={};let D=2*a.topPadding;if(n.db.getDisplayMode()==="compact"||a.displayMode==="compact"){const u={};for(const v of x)u[v.section]===void 0?u[v.section]=[v]:u[v.section].push(v);let T=0;for(const v of Object.keys(u)){const k=Pr(u[v],T)+1;T+=k,D+=k*(a.barHeight+a.barGap),M[v]=k}}else{D+=x.length*(a.barHeight+a.barGap);for(const u of L)M[u]=x.filter(T=>T.type===u).length}Y.setAttribute("viewBox","0 0 "+et+" "+D);const N=b.select(`[id="${i}"]`),I=Me().domain([Ce(x,function(u){return u.startTime}),Ee(x,function(u){return u.endTime})]).rangeRound([0,et-a.leftPadding-a.rightPadding]);function S(u,T){const v=u.startTime,k=T.startTime;let f=0;return v>k?f=1:v<k&&(f=-1),f}c(S,"taskCompare"),x.sort(S),C(x,et,D),be(N,D,et,a.useMaxWidth),N.append("text").text(n.db.getDiagramTitle()).attr("x",et/2).attr("y",a.titleTopMargin).attr("class","titleText");function C(u,T,v){const k=a.barHeight,f=k+a.barGap,o=a.topPadding,l=a.leftPadding,y=Ve().domain([0,L.length]).range(["#00B9FA","#F95002"]).interpolate(Ie);F(f,o,l,T,v,u,n.db.getExcludes(),n.db.getIncludes()),R(l,o,T,v),O(u,f,o,l,k,y,T),A(f,o),p(l,o,T,v)}c(C,"makeGantt");function O(u,T,v,k,f,o,l){u.sort((e,_)=>e.vert===_.vert?0:e.vert?1:-1);const g=[...new Set(u.map(e=>e.order))].map(e=>u.find(_=>_.order===e));N.append("g").selectAll("rect").data(g).enter().append("rect").attr("x",0).attr("y",function(e,_){return _=e.order,_*T+v-2}).attr("width",function(){return l-a.rightPadding/2}).attr("height",T).attr("class",function(e){for(const[_,P]of L.entries())if(e.type===P)return"section section"+_%a.numberSectionStyles;return"section section0"}).enter();const w=N.append("g").selectAll("rect").data(u).enter(),r=n.db.getLinks();if(w.append("rect").attr("id",function(e){return e.id}).attr("rx",3).attr("ry",3).attr("x",function(e){return e.milestone?I(e.startTime)+k+.5*(I(e.endTime)-I(e.startTime))-.5*f:I(e.startTime)+k}).attr("y",function(e,_){return _=e.order,e.vert?a.gridLineStartPadding:_*T+v}).attr("width",function(e){return e.milestone?f:e.vert?.08*f:I(e.renderEndTime||e.endTime)-I(e.startTime)}).attr("height",function(e){return e.vert?x.length*(a.barHeight+a.barGap)+a.barHeight*2:f}).attr("transform-origin",function(e,_){return _=e.order,(I(e.startTime)+k+.5*(I(e.endTime)-I(e.startTime))).toString()+"px "+(_*T+v+.5*f).toString()+"px"}).attr("class",function(e){const _="task";let P="";e.classes.length>0&&(P=e.classes.join(" "));let V=0;for(const[G,$]of L.entries())e.type===$&&(V=G%a.numberSectionStyles);let W="";return e.active?e.crit?W+=" activeCrit":W=" active":e.done?e.crit?W=" doneCrit":W=" done":e.crit&&(W+=" crit"),W.length===0&&(W=" task"),e.milestone&&(W=" milestone "+W),e.vert&&(W=" vert "+W),W+=V,W+=" "+P,_+W}),w.append("text").attr("id",function(e){return e.id+"-text"}).text(function(e){return e.task}).attr("font-size",a.fontSize).attr("x",function(e){let _=I(e.startTime),P=I(e.renderEndTime||e.endTime);if(e.milestone&&(_+=.5*(I(e.endTime)-I(e.startTime))-.5*f,P=_+f),e.vert)return I(e.startTime)+k;const V=this.getBBox().width;return V>P-_?P+V+1.5*a.leftPadding>l?_+k-5:P+k+5:(P-_)/2+_+k}).attr("y",function(e,_){return e.vert?a.gridLineStartPadding+x.length*(a.barHeight+a.barGap)+60:(_=e.order,_*T+a.barHeight/2+(a.fontSize/2-2)+v)}).attr("text-height",f).attr("class",function(e){const _=I(e.startTime);let P=I(e.endTime);e.milestone&&(P=_+f);const V=this.getBBox().width;let W="";e.classes.length>0&&(W=e.classes.join(" "));let G=0;for(const[Q,rt]of L.entries())e.type===rt&&(G=Q%a.numberSectionStyles);let $="";return e.active&&(e.crit?$="activeCritText"+G:$="activeText"+G),e.done?e.crit?$=$+" doneCritText"+G:$=$+" doneText"+G:e.crit&&($=$+" critText"+G),e.milestone&&($+=" milestoneText"),e.vert&&($+=" vertText"),V>P-_?P+V+1.5*a.leftPadding>l?W+" taskTextOutsideLeft taskTextOutside"+G+" "+$:W+" taskTextOutsideRight taskTextOutside"+G+" "+$+" width-"+V:W+" taskText taskText"+G+" "+$+" width-"+V}),lt().securityLevel==="sandbox"){let e;e=pt("#i"+i);const _=e.nodes()[0].contentDocument;w.filter(function(P){return r.has(P.id)}).each(function(P){var V=_.querySelector("#"+P.id),W=_.querySelector("#"+P.id+"-text");const G=V.parentNode;var $=_.createElement("a");$.setAttribute("xlink:href",r.get(P.id)),$.setAttribute("target","_top"),G.appendChild($),$.appendChild(V),$.appendChild(W)})}}c(O,"drawRects");function F(u,T,v,k,f,o,l,y){if(l.length===0&&y.length===0)return;let g,w;for(const{startTime:V,endTime:W}of o)(g===void 0||V<g)&&(g=V),(w===void 0||W>w)&&(w=W);if(!g||!w)return;if(X(w).diff(X(g),"year")>5){st.warn("The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.");return}const r=n.db.getDateFormat(),z=[];let e=null,_=X(g);for(;_.valueOf()<=w;)n.db.isInvalidDate(_,r,l,y)?e?e.end=_:e={start:_,end:_}:e&&(z.push(e),e=null),_=_.add(1,"d");N.append("g").selectAll("rect").data(z).enter().append("rect").attr("id",V=>"exclude-"+V.start.format("YYYY-MM-DD")).attr("x",V=>I(V.start.startOf("day"))+v).attr("y",a.gridLineStartPadding).attr("width",V=>I(V.end.endOf("day"))-I(V.start.startOf("day"))).attr("height",f-T-a.gridLineStartPadding).attr("transform-origin",function(V,W){return(I(V.start)+v+.5*(I(V.end)-I(V.start))).toString()+"px "+(W*u+.5*f).toString()+"px"}).attr("class","exclude-range")}c(F,"drawExcludeDays");function H(u,T,v,k){if(v<=0||u>T)return 1/0;const f=T-u,o=X.duration({[k??"day"]:v}).asMilliseconds();return o<=0?1/0:Math.ceil(f/o)}c(H,"getEstimatedTickCount");function R(u,T,v,k){const f=n.db.getDateFormat(),o=n.db.getAxisFormat();let l;o?l=o:f==="D"?l="%d":l=a.axisFormat??"%Y-%m-%d";let y=Ge(I).tickSize(-k+T+a.gridLineStartPadding).tickFormat(Gt(l));const w=/^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(n.db.getTickInterval()||a.tickInterval);if(w!==null){const r=parseInt(w[1],10);if(isNaN(r)||r<=0)st.warn(`Invalid tick interval value: "${w[1]}". Skipping custom tick interval.`);else{const z=w[2],e=n.db.getWeekday()||a.weekday,_=I.domain(),P=_[0],V=_[1],W=H(P,V,r,z);if(W>Et)st.warn(`The tick interval "${r}${z}" would generate ${W} ticks, which exceeds the maximum allowed (${Et}). This may indicate an invalid date or time range. Skipping custom tick interval.`);else switch(z){case"millisecond":y.ticks(Kt.every(r));break;case"second":y.ticks(Qt.every(r));break;case"minute":y.ticks(Zt.every(r));break;case"hour":y.ticks(Ut.every(r));break;case"day":y.ticks(qt.every(r));break;case"week":y.ticks(re[e].every(r));break;case"month":y.ticks(Xt.every(r));break}}}if(N.append("g").attr("class","grid").attr("transform","translate("+u+", "+(k-50)+")").call(y).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10).attr("dy","1em"),n.db.topAxisEnabled()||a.topAxis){let r=je(I).tickSize(-k+T+a.gridLineStartPadding).tickFormat(Gt(l));if(w!==null){const z=parseInt(w[1],10);if(isNaN(z)||z<=0)st.warn(`Invalid tick interval value: "${w[1]}". Skipping custom tick interval.`);else{const e=w[2],_=n.db.getWeekday()||a.weekday,P=I.domain(),V=P[0],W=P[1];if(H(V,W,z,e)<=Et)switch(e){case"millisecond":r.ticks(Kt.every(z));break;case"second":r.ticks(Qt.every(z));break;case"minute":r.ticks(Zt.every(z));break;case"hour":r.ticks(Ut.every(z));break;case"day":r.ticks(qt.every(z));break;case"week":r.ticks(re[_].every(z));break;case"month":r.ticks(Xt.every(z));break}}}N.append("g").attr("class","grid").attr("transform","translate("+u+", "+T+")").call(r).selectAll("text").style("text-anchor","middle").attr("fill","#000").attr("stroke","none").attr("font-size",10)}}c(R,"makeGrid");function A(u,T){let v=0;const k=Object.keys(M).map(f=>[f,M[f]]);N.append("g").selectAll("text").data(k).enter().append(function(f){const o=f[0].split(we.lineBreakRegex),l=-(o.length-1)/2,y=E.createElementNS("http://www.w3.org/2000/svg","text");y.setAttribute("dy",l+"em");for(const[g,w]of o.entries()){const r=E.createElementNS("http://www.w3.org/2000/svg","tspan");r.setAttribute("alignment-baseline","central"),r.setAttribute("x","10"),g>0&&r.setAttribute("dy","1em"),r.textContent=w,y.appendChild(r)}return y}).attr("x",10).attr("y",function(f,o){if(o>0)for(let l=0;l<o;l++)return v+=k[o-1][1],f[1]*u/2+v*u+T;else return f[1]*u/2+T}).attr("font-size",a.sectionFontSize).attr("class",function(f){for(const[o,l]of L.entries())if(f[0]===l)return"sectionTitle sectionTitle"+o%a.numberSectionStyles;return"sectionTitle"})}c(A,"vertLabels");function p(u,T,v,k){const f=n.db.getTodayMarker();if(f==="off")return;const o=N.append("g").attr("class","today"),l=new Date,y=o.append("line");y.attr("x1",I(l)+u).attr("x2",I(l)+u).attr("y1",a.titleTopMargin).attr("y2",k-a.titleTopMargin).attr("class","today"),f!==""&&y.attr("style",f.replace(/,/g,";"))}c(p,"drawToday");function d(u){const T={},v=[];for(let k=0,f=u.length;k<f;++k)Object.prototype.hasOwnProperty.call(T,u[k])||(T[u[k]]=!0,v.push(u[k]));return v}c(d,"checkUnique")},"draw"),Nr={setConf:Vr,draw:zr},Hr=c(t=>`
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .vert {
    stroke: ${t.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${t.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor||t.textColor};
    font-family: ${t.fontFamily};
  }
`,"getStyles"),Rr=Hr,oi={parser:er,db:Or,renderer:Nr,styles:Rr};export{oi as diagram};
