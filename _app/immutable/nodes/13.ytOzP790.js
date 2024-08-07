import{s as K,e as k,a as E,c as y,b as O,g as j,f as h,o as L,i as m,h as p,n as M,y as Q,q as N,u as J,v as W,t as g,d as v,j as P,w as X,m as T,x as C,p as R,r as Y}from"../chunks/scheduler.BMtnYv-_.js";import{e as I}from"../chunks/each.6n_LW1XX.js";import{S as Z,i as $}from"../chunks/index.c0ssxf6t.js";function U(o,n,e){const l=o.slice();return l[7]=n[e][0],l[8]=n[e][1],l}function z(o,n,e){const l=o.slice();return l[11]=n[e],l}function A(o){let n,e=I(Object.entries(o[1].facets)),l=[];for(let t=0;t<e.length;t+=1)l[t]=H(U(o,e,t));return{c(){for(let t=0;t<l.length;t+=1)l[t].c();n=N()},l(t){for(let r=0;r<l.length;r+=1)l[r].l(t);n=N()},m(t,r){for(let i=0;i<l.length;i+=1)l[i]&&l[i].m(t,r);m(t,n,r)},p(t,r){if(r&7){e=I(Object.entries(t[1].facets));let i;for(i=0;i<e.length;i+=1){const f=U(t,e,i);l[i]?l[i].p(f,r):(l[i]=H(f),l[i].c(),l[i].m(n.parentNode,n))}for(;i<l.length;i+=1)l[i].d(1);l.length=e.length}},d(t){t&&h(n),J(l,t)}}}function F(o){let n,e=o[7]+"",l,t,r,i,f,_=I(o[8]),s=[];for(let a=0;a<_.length;a+=1)s[a]=G(z(o,_,a));return{c(){n=k("b"),l=g(e),t=E(),r=k("br"),i=E();for(let a=0;a<s.length;a+=1)s[a].c();f=N()},l(a){n=y(a,"B",{});var c=O(n);l=v(c,e),c.forEach(h),t=j(a),r=y(a,"BR",{}),i=j(a);for(let u=0;u<s.length;u+=1)s[u].l(a);f=N()},m(a,c){m(a,n,c),p(n,l),m(a,t,c),m(a,r,c),m(a,i,c);for(let u=0;u<s.length;u+=1)s[u]&&s[u].m(a,c);m(a,f,c)},p(a,c){if(c&2&&e!==(e=a[7]+"")&&P(l,e),c&7){_=I(a[8]);let u;for(u=0;u<_.length;u+=1){const w=z(a,_,u);s[u]?s[u].p(w,c):(s[u]=G(w),s[u].c(),s[u].m(f.parentNode,f))}for(;u<s.length;u+=1)s[u].d(1);s.length=_.length}},d(a){a&&(h(n),h(t),h(r),h(i),h(f)),J(s,a)}}}function G(o){let n,e,l,t=!1,r,i=o[11].name+"",f,_,s,a,c=o[11].count+"",u,w,D,V,B,S;return V=X(o[4][0]),{c(){n=k("div"),e=k("input"),r=g(`
							  `),f=g(i),_=E(),s=k("em"),a=g("("),u=g(c),w=g(")"),D=E(),this.h()},l(b){n=y(b,"DIV",{class:!0});var d=O(n);e=y(d,"INPUT",{type:!0}),r=v(d,`
							  `),f=v(d,i),_=j(d),s=y(d,"EM",{});var q=O(s);a=v(q,"("),u=v(q,c),w=v(q,")"),q.forEach(h),D=j(d),d.forEach(h),this.h()},h(){T(e,"type","checkbox"),e.__value=l=o[7]+"%"+o[11].name,C(e,e.__value),T(n,"class","pl-4"),V.p(e)},m(b,d){m(b,n,d),p(n,e),e.checked=~(o[0]||[]).indexOf(e.__value),p(n,r),p(n,f),p(n,_),p(n,s),p(s,a),p(s,u),p(s,w),p(n,D),B||(S=[R(e,"change",o[3]),R(e,"change",o[2])],B=!0)},p(b,d){d&2&&l!==(l=b[7]+"%"+b[11].name)&&(e.__value=l,C(e,e.__value),t=!0),(t||d&3)&&(e.checked=~(b[0]||[]).indexOf(e.__value)),d&2&&i!==(i=b[11].name+"")&&P(f,i),d&2&&c!==(c=b[11].count+"")&&P(u,c)},d(b){b&&h(n),V.r(),B=!1,Y(S)}}}function H(o){let n,e=o[7]!="file_id"&&o[7]!="title"&&o[7]!="variable_abbr"&&F(o);return{c(){e&&e.c(),n=N()},l(l){e&&e.l(l),n=N()},m(l,t){e&&e.m(l,t),m(l,n,t)},p(l,t){l[7]!="file_id"&&l[7]!="title"&&l[7]!="variable_abbr"?e?e.p(l,t):(e=F(l),e.c(),e.m(n.parentNode,n)):e&&(e.d(1),e=null)},d(l){l&&h(n),e&&e.d(l)}}}function x(o){let n;return{c(){n=g("No datasets found")},l(e){n=v(e,"No datasets found")},m(e,l){m(e,n,l)},p:M,d(e){e&&h(n)}}}function ee(o){let n,e=o[1].hits.length+"",l;return{c(){n=g("Number of found datasets: "),l=g(e)},l(t){n=v(t,"Number of found datasets: "),l=v(t,e)},m(t,r){m(t,n,r),m(t,l,r)},p(t,r){r&2&&e!==(e=t[1].hits.length+"")&&P(l,e)},d(t){t&&(h(n),h(l))}}}function te(o){let n,e,l,t=o[1].facets&&A(o);function r(_,s){return _[1].hits&&_[1].hits.length>0?ee:x}let i=r(o),f=i(o);return{c(){n=k("div"),e=k("div"),t&&t.c(),l=E(),f.c(),this.h()},l(_){n=y(_,"DIV",{style:!0});var s=O(n);e=y(s,"DIV",{});var a=O(e);t&&t.l(a),l=j(a),f.l(a),a.forEach(h),s.forEach(h),this.h()},h(){L(n,"display","flex")},m(_,s){m(_,n,s),p(n,e),t&&t.m(e,null),p(e,l),f.m(e,null)},p(_,[s]){_[1].facets?t?t.p(_,s):(t=A(_),t.c(),t.m(e,l)):t&&(t.d(1),t=null),i===(i=r(_))&&f?f.p(_,s):(f.d(1),f=i(_),f&&(f.c(),f.m(e,null)))},i:M,o:M,d(_){_&&h(n),t&&t.d(),f.d()}}}function le(o,n,e){let l=[],t=[],r="",i="";Q(async()=>{i="https://leutra.geogr.uni-jena.de/backend_geoportal/climate/search_collection?",f()});async function f(){r="";for(let a=0;a<l.length;a++)r=r+"&"+l[a].replace("%","=");try{const a=await fetch(i+r);console.log(a);let c=[];if(!a.ok)throw new Error(`${a.status} ${a.statusText}`);return c=await a.json(),console.log("result",c),c.hasOwnProperty("hits")&&e(1,t.hits=c.hits,t),c.hasOwnProperty("facets")&&e(1,t.facets=c.facets,t),c.hasOwnProperty("facets_ordered")&&e(1,t.facets_ordered=c.facets_ordered,t),e(1,t),console.log("geo_data",t),c}catch(a){return console.log(a),[]}}const _=[[]];function s(){l=W(_[0],this.__value,this.checked),e(0,l)}return[l,t,f,s,_]}class se extends Z{constructor(n){super(),$(this,n,le,te,K,{})}}export{se as component};