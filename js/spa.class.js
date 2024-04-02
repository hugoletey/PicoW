class MySPA {
 #lang;
 #time;
 #loader;
 #auth;
 #main;
 #cours;
 #quiz;

 #pushState;

 /* ********************************************************** *
  * Le contructeur de la classe                                *
  * ********************************************************** */

 constructor() {
  this.#lang=new MyLang();  
  this.#time=new MyTime(this.#lang);
  this.#loader=new MyLoader();
  this.#auth=new MyAuth(this.#loader);
  var me=this;
  this.#loader.setendcallback(function(){ me.endloading(); });
  this.#main=new MyMain(this.#loader,this.#lang);
  this.#quiz=new MyQuiz(this.#loader,this.#lang,this.#main);
  this.#cours=new MyCours(this.#loader,this.#lang,this.#time,this.#quiz);
  window.onpopstate=function(event){ me.onpopstate(event.state); };
  WinkVideo.prototype.elements=new Array();
  window.onresize=function(){
   for(var i=0; i<WinkVideo.prototype.elements.length; i++) WinkVideo.prototype.elements[i].resize();
  };
 }

 /* ********************************************************** *
  *  gestion de la langue                                      *
  * ********************************************************** */

 setlang(lang) { 
  this.#lang.setlang(lang);
  if (this.#main.getdir()==null) this.#main.display();
  else {
   this.#main.showTitle();
   this.#cours.change_nav();
   this.#cours.change_aside();
  }
 }

 /* ********************************************************** *
  *  Gestion de l'history                                      *
  * ********************************************************** */

 setpushState(flag) { this.#pushState=(flag==true); }

 dopushState() {
  if (this.#pushState==true) { 
   var nbMenu=this.#cours.getnbMenu();
   var nbArticle=this.#cours.getnbArticle();
   history.pushState(Array(this.#main.getdir(),nbMenu,nbArticle,this.#lang.getlang()),'','#'+this.#main.getdir()+'_'+nbMenu+'_'+nbArticle);
  }
  this.#pushState=false;
 }

 onpopstate(state) {
  if (state!=null) {
   this.#lang.setlang(state[3]);
   var dir=state[0];
   this.#main.setdir(dir);
   this.#cours.setdir(dir);
   if (dir!=null) { 
    this.#cours.setnbMenu(state[1]);
    this.#cours.setnbArticle(state[2]);
    this.#cours.change_nav();
    this.#main.chooseCours();
    return
   }
  } else {
   var dir=location.hash.substring(1,location.hash.indexOf('_'));
   var tmp=location.hash.substring(location.hash.indexOf('_')+1);
   var nbMenu=parseInt(tmp.substring(0,tmp.indexOf('_')));
   var nbArticle=parseInt(tmp.substring(tmp.indexOf('_')+1));
   if (dir=='') {
    this.#main.setdir();
    this.#cours.setdir();
   } else {
    this.#main.setdir(dir);
    this.#cours.setdir(dir);
    this.#cours.setnbMenu(nbMenu);
    this.#cours.setnbArticle(nbArticle);
    this.#cours.change_nav();
    this.#main.chooseCours();
    return
   }
  }
  this.#main.display();
  this.#cours.setnbMenu(undefined);
  this.#cours.setnbArticle(undefined);
 }

 /* ********************************************************** *
  *                                                            *
  * ********************************************************** */
 login() { this.#auth.login(); }

 logout() { this.#auth.logout(); }

 /* ********************************************************** *
  *                                                            *
  * ********************************************************** */

 endloading() {
  if (this.#cours.getdir()!=undefined) {
   this.dopushState();
   this.#main.chooseCours();
  } else this.onpopstate(history.state);
 }

 chooseCours(dir) {
  dir=dir.substring(dir.indexOf('/content/')+1);
  var me=this;
  this.#loader.setendcallback(function(){ me.endloading(); });
  this.#main.setdir(dir);
  this.#cours.setdir(dir);
  this.setpushState(true);
 }

 /* ********************************************************** *
  *                                                            *
  * ********************************************************** */

 change_nav(p1) {
  this.#cours.setnbMenu(p1);
  this.#cours.setnbArticle();
  this.setpushState(true);
  this.#cours.change_nav();
  this.#cours.change_aside();
  this.dopushState();
 }
 change_aside(p1,p2) {
  this.#cours.setnbMenu(p1);
  this.#cours.setnbArticle(p2);
  this.setpushState(true);
  this.#cours.change_aside();
  this.dopushState();
 }

 submit_QUIZ() {
  this.#quiz.submit();
 }
}
