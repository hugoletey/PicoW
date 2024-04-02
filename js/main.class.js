class MyMain {
 #loader;
 #lang;
 #sections;
 #dir;
 #cours;

 #te;
 #tc;
 #ci;
 #en;
 #co;

 constructor(loader,lang) {
  this.#loader=loader;
  this.#lang=lang;
  this.#te=document.getElementById('template_entry');
  this.#tc=document.getElementById('template_cours');
  this.#ci=document.getElementById('cible_entry');
  this.#en=document.getElementById('entry');
  this.#co=document.getElementById('content');
  var me=this;
  this.#loader.load('courses.xml',function(xhr) { me.callback(xhr)} ,true);
 }

 setdir(dir) { this.#dir=dir; }

 getdir() {
  if (this.#dir==undefined) {
   if (history.state==null) {
    this.#dir=null;
   } else {
    this.#dir=history.state[0];
   }
  }
  return this.#dir;
 }

 callback(xhr) {
  if (xhr.status !== 200 || xhr.responseXML === null) {
   history.go(-1);
   return;
  }
  this.#sections=xhr.responseXML.children[0];
  const courses=this.#sections.getElementsByTagName('COURS');
  if (courses.length==0) {
   history.go(-1);
   return;
  }
  if (courses.length==1) {
   this.setdir('content/'+courses[0].getAttribute('src'));
  }
  if (this.getdir()==null) this.display();
 }

 #forAllTag(el,tag,doing) {
  Array.from(el.getElementsByClassName(tag)).forEach(doing);
 }
 #appendChildren(cible,docker) {
  Array.from(docker.children).forEach(e => cible.appendChild(e));
 }

 #build() {
  if (this.#sections==undefined) return;
  const sections=this.#sections.getElementsByTagName('SECTION');
  const lang=this.#lang.getlang();
  this.#ci.innerHTML='';
  for(var i=0; i<sections.length; i++) {
   const section=sections[i];
   var els=this.#te.cloneNode(true);
   var title='';
   Array.from(section.getElementsByTagName('TITLE')).filter(e => e.getAttribute('lang')==lang).forEach(e => title=e.innerHTML);
   this.#forAllTag(els,'tag_titre',e => e.innerText=title);
   var courses=section.getElementsByTagName('COURS');
   for(var j=0; j<courses.length; j++) {
    const cours=courses[j];
    const src='content/'+cours.getAttribute('src');
    var elc=this.#tc.cloneNode(true);
    this.#forAllTag(elc,'tag_a',e => e.href=src);
    this.#forAllTag(elc,'tag_img',e => e.src=src+'/logo.png');
    var item=Array.from(cours.getElementsByTagName('LANG')).filter(e => e.getAttribute('lang')==lang)[0];
    if (item!==undefined) {
     item=Array.from(item.getElementsByTagName('P'));
     this.#forAllTag(elc,'tag_lg1',e => e.innerText=item[0].innerHTML);
     this.#forAllTag(elc,'tag_lg2',e => e.innerText=item[1].innerHTML);
     this.#forAllTag(els,'tag_courses',e => this.#appendChildren(e,elc));
    }
   }
   this.#appendChildren(this.#ci,els);
  }
 }

  showTitle() {
  const lang=this.#lang.getlang();
  if (this.#cours!=undefined && this.#dir!=undefined) {
   var title=Array.from(this.#cours.getElementsByTagName('LANG')).filter(e => e.getAttribute('lang')==lang)[0];
   document.title=title.children[0].innerHTML+' '+title.children[1].innerHTML;
  } else {
   if (lang=='fr') document.title='JUNIA - Cours en ligne';
   else document.title='JUNIA - Online courses';
  }
  document.getElementById('title').innerHTML=document.title; 
 }

 display() {
  this.#build();
  this.#en.checked=true;
  document.getElementById('langue').style.visibility='';
  this.showTitle();
 }

 chooseCours() {
  var dir=this.#dir.substring('content/'.length);
  this.#cours=Array.from(this.#sections.getElementsByTagName('COURS')).filter(e => e.getAttribute('src')==dir)[0];
  this.#co.checked=true;
  if (this.#cours.children.length==1) document.getElementById('langue').style.visibility='hidden';
  this.showTitle();
 }
}
