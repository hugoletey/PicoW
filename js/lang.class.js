class MyLang {
 #lang;

 constructor() {
  this.setlang((window.navigator.language=='en')?'gb':'fr')
 }

 setlang(lang) {
  this.#lang=lang;
  var list=document.body.getElementsByClassName('lang');
  for(var i=0;i<list.length;i++) list[i].style.display='none';
  list=document.body.getElementsByClassName(lang);
  for(var i=0;i<list.length;i++) list[i].style.display='';
 }

 getlang() { return this.#lang; }

 translate(el) { 
  var r='';
  var t = el.getElementsByTagName('P');
  for (var i = t.length - 1; i >= 0; i--) if (t[i].getAttributeNode('lang').value == this.#lang) r=t[i].innerHTML;
  return(r);
 }
}
