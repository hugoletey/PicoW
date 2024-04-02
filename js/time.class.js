class MyTime {
  #lang;
  #LesJours;
  #LesMois;
  #TheDay;
  #TheMonth;
  #demiseconde;
  #heurelocale;
  #datemaj;

 constructor(lang) {
  this.#LesJours = new Array("Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi");
  this.#LesMois = new Array("janvier","f&eacute;vrier","mars","avril","mai","juin","juillet","ao&ucirc;t","septembre","octobre","novembre","d&eacute;cembre");
  this.#TheDay = new Array("Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday");
  this.#TheMonth = new Array("January","February","March","April","May","June","July","August","September","October"," November","December");
  this.#heurelocale=document.getElementById('heurelocale');
  this.#datemaj=document.getElementById('datemaj');
  this.#lang=lang;
  this.displayHour();
  var me=this;
  setInterval(function() { me.displayHour(); },500);
 }

 displayHour() {
  var lD = new Date() ;
  var h = lD.getHours();
  var m = lD.getMinutes();
  if(m<10) m = "0"+m;
  if(h<10) h = "0"+h;
  if (this.#demiseconde) this.#demiseconde=false; else this.#demiseconde=true;
  var horloge = h + (this.#demiseconde?':':'&nbsp;') + m;
  if (this.#lang.getlang() =='fr') this.#heurelocale.innerHTML = this.#LesJours[lD.getDay()]+" "+lD.getDate()+" "+this.#LesMois[lD.getMonth()]+" &nbsp; "+horloge+" &nbsp; " ;
  if (this.#lang.getlang() =='gb') this.#heurelocale.innerHTML = this.#TheDay[lD.getDay()]+" "+lD.getDate()+" "+this.#TheMonth[lD.getMonth()]+" &nbsp; "+horloge+" &nbsp; " ;
 }

 displayUpdate(d) {
  var msg;
  if (d==undefined) {
    if (this.#lang.getlang() =='fr') msg='erreur de chargement';
    if (this.#lang.getlang() =='gb') msg='loading error';
  } else {
  var h = d.getHours();
  var m = d.getMinutes();
  if (m<10) { m = "0"+m; }
  if (h<10) { h = "0"+h; }
  if (this.#lang.getlang() =='fr') msg=d.getDate()+' '+this.#LesMois[d.getMonth()]+' '+d.getFullYear()+' à '+h+':'+m;
  if (this.#lang.getlang() =='gb') msg=d.getDate()+' '+this.#TheMonth[d.getMonth()]+' '+d.getFullYear()+' at '+h+':'+m;
  }
  this.#datemaj.innerHTML=msg;
 }
}
