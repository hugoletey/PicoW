class MyAuth {
 #loader;

 #yes;
 #no;
 #email;
 #password;
 #name;

 constructor(loader) {
  this.#loader=loader;
  this.#yes=document.getElementById('yes');
  this.#no=document.getElementById('no');
  this.#no.checked=true;
  this.#email=document.getElementById('loginform').email;
  this.#password=document.getElementById('loginform').password;
  this.#name=document.getElementById('name');
  var me=this;
  this.#loader.load('php/login.php',function(xhr){ me.callback(xhr); },false);
 }

 callback(xhr) {
  if (xhr.status!==200) return;
  if (xhr.responseText=='') return;
  this.#name.innerText=xhr.responseText;
  this.#yes.checked=true;
 }

 login() {
  var form = new FormData();
  form.append('email',this.#email.value);
  form.append('password',this.#password.value);
  var me=this;
  this.#loader.load('php/login.php',function(xhr){ me.callback(xhr); },false,form);
 }

 logout() {
  this.#no.checked=true;
  this.#loader.load('php/logout.php',function(xhr){ },false);
 }
}
