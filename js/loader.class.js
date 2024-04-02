class MyLoader{
 #list;
 #endcallback;

 constructor() {
  this.#list=new Array();
 }

 setendcallback(callback) { this.#endcallback=callback; }

 load(url,callback,xml,form) {
  var obj=new Object();
  obj.url=url;
  obj.callback=callback;
  obj.xhr=new XMLHttpRequest();
  var mc=this;
  if (form==undefined) obj.xhr.open("GET",url, true);
  else obj.xhr.open("POST",url, true);
  if (xml==true) { 
   obj.xhr.responseType = 'document';
   obj.xhr.overrideMimeType('text/xml');
  }
  obj.xhr.setRequestHeader("Cache-Control","no-cache")
  obj.xhr.addEventListener('readystatechange', function() { mc.callback(obj.xhr); });
  this.#list.push(obj);
  document.body.style.cursor='wait';
  obj.xhr.send(form);
 }

 callback(xhr) {
  if (xhr.readyState !== XMLHttpRequest.DONE) return;
  var newlist=new Array();
  for (var i=0; i<this.#list.length; i++) {
   if (xhr.responseURL.indexOf(this.#list[i].url)!=-1) {
    if (this.#list[i].callback!=undefined) this.#list[i].callback(xhr);
   } else newlist.push(this.#list[i]);
  }
  this.#list=newlist;
  if (this.#list.length==0) {
   document.body.style.cursor='';
   if (this.#endcallback!=undefined) this.#endcallback();
   this.#endcallback=undefined;
  }
 }
}
