class MyQuiz {
 #lang;
 #loader;
 #main;

 #quiz;
 #title
 #xml;
 #date;
 #localStorage;
 #s;

 constructor(loader,lang,main) {
  this.#loader=loader;
  this.#lang=lang;
  this.#main=main;
 }

 setParamBuild(quiz,title) {
  this.#quiz=quiz;
  this.#title=title;
 }

 build(xml,date) {
  this.#xml=xml;
  this.#date=date;
  this.#localStorage=localStorage.getItem(location.pathname+this.#main.getdir()+'/QUIZ/'+this.#quiz);
  if (this.#localStorage!=null) this.#localStorage=JSON.parse(this.#localStorage);
  else this.#localStorage={"e":0,"d":date,"s":null,"r":null,"m":""};
  if (date!=this.#localStorage.d) {
   localStorage.removeItem(location.pathname+'QUIZ/'+this.#quiz);
   this.#localStorage={"e":0,"d":date,"s":null,"r":null,"m":""};
  }
  var article=document.getElementsByTagName('article')[0];
  
  article.innerHTML=document.getElementById('template_quiz3').innerHTML;
  article.getElementsByClassName('tquiz')[0].innerHTML=this.#title;
  var div=article.getElementsByClassName('quiz')[0];
  var l1=xml.children[0].children;
  for (var i=0;i<l1.length;i++) {
   switch (l1[i].localName) {
    case 'QUEST':
     div.insertAdjacentElement('beforeEnd',this.#build_QUEST(l1[i],i));
     break;
    case 'TAT':
     div.insertAdjacentElement('beforeEnd',this.#build_TAT(l1[i],i));
     break;
   }
  }
  article.getElementsByClassName('result')[0].innerHTML=this.#localStorage.m;
 }

 #build_QUEST(el,i) {
  var tplqst=document.getElementById('template_quiz1');
  var tplrep=document.getElementById('template_quiz2');
  var cur1=tplqst.cloneNode(true);
  cur1.removeAttribute('id');
  cur1.getElementsByClassName('QuestText')[0].innerHTML=el.children[0].innerHTML;
  var l2=el.children;
  for (var j=1;j<l2.length;j++) {
   var cur2=tplrep.cloneNode(true);
   cur2.removeAttribute('id');
   cur2.getElementsByClassName('ReplyContent')[0].innerHTML=l2[j].innerHTML;
   if ((this.#localStorage.s!=null) && (this.#localStorage.s[i][j-1]))
    cur2.getElementsByClassName('ReplyCheckBox')[0].setAttribute('checked', 'checked');
   cur1.getElementsByClassName('ReplyCible')[0].insertAdjacentElement('beforeEnd',cur2);
  }
  if (this.#localStorage.r!=null) cur1.className=(this.#localStorage.r[i]?'good':'bad');
  return(cur1);
 }

 #build_TAT(el,i) {
  var tpltat=document.getElementById('template_quiz4');
  var tplins=document.getElementById('template_quiz5');
  var cur1=tpltat.cloneNode(true);
  cur1.removeAttribute('id');
  cur1.getElementsByClassName('QuestText')[0].innerHTML=el.children[0].innerHTML;
  var sug=cur1.getElementsByClassName('SUG')[0];
  if (el.children[3]) sug.innerHTML=el.children[3].innerHTML;
  var sug_id=sug.id='SUG'+i;
  var tmp=tplins.innerHTML;
  tmp=tmp.replaceAll('_SUG_',sug_id);
  cur1.getElementsByClassName('QAT')[0].innerHTML=el.children[1].innerHTML.replaceAll('<INST/>',tmp);

  if (this.#localStorage.s!=null) {
   var l2=cur1.getElementsByClassName('ReplyText');
   var g=true;
   for (var j=0;j<l2.length;j++) {
    l2[j].className='ReplyText '+(this.#localStorage.r[i][j]?'good':'bad');
    l2[j].value=this.#localStorage.s[i][j];
    g&=this.#localStorage.r[i][j];
   }
   cur1.className=(g?'good':'bad');
  }
  return(cur1);
 }

 submit() {
  if (this.#xml==null) return;
  var article=document.getElementsByTagName('article')[0];
  var div=article.getElementsByClassName('quiz')[0];
  var l3=div.getElementsByClassName('ReplyCheckBox');
  var l4=div.getElementsByClassName('ReplyText');
  var l3k=0;
  var l4k=0;
  this.#s=new Array();
  var l1=this.#xml.children[0].children;
  var grpl=true;
  for (var i=0;i<l1.length;i++) {
   this.#s[i]=new Array();
   switch (l1[i].localName) {
    case 'QUEST':
     var rpl=false;
     var l2=l1[i].children;
     for (var j=1;j<l2.length;j++) {
      rpl|=this.#s[i][j-1]=l3[l3k].checked;
      l3k++;
     }
     grpl&=rpl;
     break;
    case 'TAT':
     var rpl=true;
     var l2=l1[i].children[2].children;
     for (var j=0;j<l2.length;j++) if (l4[l4k]!=undefined){
      this.#s[i][j]=l4[l4k].value;
      rpl&=(l4[l4k].value!='');
      l4k++;
     }
     grpl&=rpl;
     break;
   }
  }
  if (grpl==false) {
   alert("Vous n'avez rien coché pour certaines questions !\nIl doit y avoir au moins une réponse de cocher pour chaque question !");
   return;
  }
  var me=this;
  var form = new FormData();
  form.append('date',this.#date);
  form.append('json',JSON.stringify(this.#s));
  this.#loader.load(this.#main.getdir()+'/quiz/verif-quiz.php?quiz='+this.#quiz,function(xhr){ me.callback(xhr); },false,form);
 }

 callback(xhr) {
  if (xhr.status!==200) return;
  var result=JSON.parse(xhr.responseText);
  var article=document.getElementsByTagName('article')[0];
  var div=article.getElementsByClassName('quiz')[0];
  if (result==false) {
   div.innerHTML="Ce quiz a été modifié sur le serveur et ne peut plus, en conséquence, être corrigé !<br/> Sélectionnez un autre quiz SVP !";
   article.getElementsByClassName('result')[0].innerHTML="";
   localStorage.removeItem(location.pathname+this.#main.getdir()+'/QUIZ/'+this.#quiz);
   return;
  }
  var total=0;
  var note=0;
  var l3=this.#xml.children[0].children;
  var l1=div.children;
  for (var i=0; i<result.length;i++) {
   var point=parseInt(l3[i].getAttribute('point'));
   total+=point;
   if (Array.isArray(result[i])) {
    var g=true;
    var l2=l1[i].getElementsByClassName('ReplyText');
    for (var j=0; j<l2.length;j++) {
     l2[j].className='ReplyText '+(result[i][j]?'good':'bad');
     g&=result[i][j];
    }
    l1[i].className=g?'good':'bad';
    if (g) note+=point;
   } else {
    l1[i].className=result[i]?"good":"bad";
    if (result[i]) note+=point;
   }
  }
  this.#localStorage.e++;
  this.#localStorage.s=this.#s;
  this.#localStorage.r=result;
  this.#localStorage.m="note = "+note+" / "+total+" (après "+this.#localStorage.e+" essai"+((this.#localStorage.e<2)?"":"s")+")";
  article.getElementsByClassName('result')[0].innerHTML=this.#localStorage.m;
  localStorage.setItem(location.pathname+'QUIZ/'+this.#quiz,JSON.stringify(this.#localStorage));
 }
}
