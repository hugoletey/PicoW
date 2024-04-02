class MyCours {
 #loader;
 #lang;
 #time;
 #quiz;

 #dir;
 #menus;
 #nbMenu;
 #nbArticle;

 constructor(loader,lang,time,quiz) {
  this.#loader=loader;
  this.#lang=lang;
  this.#time=time;
  this.#quiz=quiz;
 }

 setdir(dir) {
  this.#dir=dir;
  if (dir!=null) {
   var me=this;
   this.#loader.load(dir+'/menu.xml',function(xhr){ me.callback_menu(xhr); } ,true);
  } else {
   this.nbMenu=undefined;
   this.nbArticle=undefined;
  }
 }

 getdir() { return this.#dir; }

 setnbMenu(num) { 
  this.#nbMenu=num;
 }

 getnbMenu() {
  if (this.#nbMenu===undefined) {
   this.#nbMenu=this.#menus.getElementsByTagName('TITLE').length-1;
  }
  return this.#nbMenu;
 }

 setnbArticle(num) { this.#nbArticle=num; }

 getnbArticle() {
  if (this.#nbArticle===undefined) this.#nbArticle=0;
  return this.#nbArticle;
 }

 callback_menu(xhr) {
  if (xhr.status !== 200 || xhr.responseXML === null) {
   this.#dir=this.#menus=undefined;
   return;
  }
  this.#menus=xhr.responseXML.children[0];
  document.getElementById('content').checked=true;
  this.change_nav();
  this.change_aside();
 }

 change_aside() {
  WinkVideo.prototype.elements=new Array();
  var selected_menu=this.getnbMenu();
  var selected_article=this.getnbArticle();
  var tab=this.#menus.children[selected_menu].children;
  var chapdir=this.#menus.children[selected_menu].getAttributeNode('dir').value;
  var aside='';
  var j=1,index=0;
  for (var i=1;i<tab.length;i++) {
   switch(tab[i].localName) {
    case 'RUBRIQUE':
     aside+="<h3>"+this.#lang.translate(tab[i])+"</h3>";
     break;
    case 'ITEM':
    case 'QUIZ':
    case 'VIDEO':
     if (j==selected_article) {
      aside+='<a class="lienencours" ';
      index=i;
     } else aside+='<a ';
     aside+='href="#" onclick="spa.change_aside('+selected_menu+','+j+'); return(false);">'+this.#lang.translate(tab[i])+"</a>";
     j++;
     break;
   }
  }
  document.getElementsByTagName('aside')[0].innerHTML=aside;
  if (selected_article==0) document.getElementById('prev_chap').style.visibility='hidden';
  else {
   document.getElementById('prev_chap').style.visibility='';
   document.getElementById('prev_chap').href='javascript:spa.change_aside('+selected_menu+','+(selected_article-1)+')';
  }
  if ((selected_article+1)>=j) document.getElementById('next_chap').style.visibility='hidden';
  else {
   document.getElementById('next_chap').style.visibility='';
   document.getElementById('next_chap').href='javascript:spa.change_aside('+selected_menu+','+(selected_article+1)+')';
  }

  document.getElementsByTagName('article')[0].innerHTML='';
  this.#time.displayUpdate();
  var dir=this.getdir();
  var me=this;
  switch (tab[index].localName) {
   case 'TITLE':
    this.#loader.load(dir+'/articles/'+chapdir+'.'+this.#lang.getlang()+'/intro.html',function(xhr){ me.callback_article(xhr); } ,false);
    break;
   case 'ITEM':
    this.#loader.load(dir+'/articles/'+chapdir+'.'+this.#lang.getlang()+'/'+tab[index].getAttributeNode('file').value,function(xhr){ me.callback_article(xhr); } ,false);
    break;
   case 'VIDEO':
    var cible=document.getElementsByTagName('article')[0];
    cible.appendChild(document.getElementById('template_winkVideo').cloneNode(true));
    cible.getElementsByTagName('source')[0].src=dir+'/video/'+tab[index].getAttributeNode('video').value;
    this.#loader.load(dir+'/video/'+tab[index].getAttributeNode('json').value, function(xhr){ me.callback_video(xhr); },false);
    break;
   case 'QUIZ':
    var quiz=tab[index].getAttributeNode('quiz').value;
    this.#quiz.setParamBuild(quiz,this.#lang.translate(tab[index]));
    this.#loader.load(dir+"/quiz/get-quiz.php?quiz="+quiz,function(xhr){ me.callback_quiz(xhr); },true);
    break;
  }
 }

 callback_quiz(xhr) {
  if (xhr.status!==200) return;
  var date=xhr.getResponseHeader("Last-Modified")
  this.#quiz.build(xhr.responseXML,date);
  this.#time.displayUpdate(new Date(date));
 }

 #remap(html) {
  var dir=this.getdir();
  html=html.replaceAll(' src="img/',' src="'+dir+'/img/').replaceAll(" src='img/"," src='"+dir+"/img/");
  html=html.replaceAll(' href="img/',' href="'+dir+'/img/').replaceAll(" href='img/"," href='"+dir+"/img/");
  html=html.replaceAll(' src="video/',' src="'+dir+'/video/').replaceAll(" src='video/"," src='"+dir+"/video/");
  html=html.replaceAll(' href="video/',' href="'+dir+'/video/').replaceAll(" href='video/"," href='"+dir+"/video/");
  return(html);
 }

 callback_article(xhr) {
  if (xhr.status!==200) return;
  document.getElementsByTagName('article')[0].innerHTML=this.#remap(xhr.responseText);
  this.#time.displayUpdate(new Date(xhr.getResponseHeader("Last-Modified")));
  Array.from(document.getElementsByClassName('code')).forEach(function(el){ SyntaxHighlighter.highlight(el); });
 }

 callback_video(xhr) {
  if (xhr.status!==200) return;
  var winkVideoData=JSON.parse(xhr.responseText);
  var videoElement=document.getElementsByTagName('article')[0].getElementsByClassName('winkVideoClass')[0];
  videoElement.addEventListener('loadeddata', function(){
   if(videoElement.readyState >= 2) {
    WinkVideo.prototype.elements.push(new WinkVideo(videoElement,winkVideoData));
   }
  });
  this.#time.displayUpdate(new Date(xhr.getResponseHeader("Last-Modified")));
 }

 change_nav() {
  if (this.#menus!=undefined) this.change_nav2(this.#menus.getElementsByTagName('TITLE'),this.getnbMenu());
 }

 change_nav2(tab,sel_menu) {
  var nav='<ul>';
  for (var i=0;i<tab.length;i++) {
   if (i==sel_menu) nav+='<li class="active">';
   else nav+='<li>';
   nav+='<a onclick="spa.change_nav('+i+');">'+this.#lang.translate(tab[i])+'</a></li>';
  }
  nav+='</ul>';
  document.getElementsByTagName('nav')[0].innerHTML=nav;
 }
}
