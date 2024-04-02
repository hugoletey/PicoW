class MyBuilding {
	#template;
	#consigne;
	#href;
	#table;
	#oldtable;
	#child;
	#ic;
	#cible;
	#filter;

	constructor(template, cible, consigne, href, filter) {
		this.#template=document.getElementById(template).firstElementChild;
		this.#consigne=consigne;
		this.#href=href;
		this.#filter=filter;
		this.#oldtable=this.#table=new Array();
		this.selected=new Array();
		this.#child=new Array();
		if (typeof(cible)=='string') {
			this.#cible=document.getElementById(cible);
			var xhttp = new XMLHttpRequest();
			var mb=this;
			xhttp.open("GET",href, true);
			xhttp.addEventListener('readystatechange', function() {
				if (xhttp.readyState === XMLHttpRequest.DONE) {
					if (xhttp.status === 200) { 
						var json=xhttp.responseText;
						if (json!='') {
							mb.do(JSON.parse(json));
						}
					}
					document.body.style.cursor='';
				}
			});
			xhttp.send(null);
			document.body.style.cursor='wait';
		}
		else this.#cible=cible;
	}

	filterChange(element) {
		var value=element.parentNode.children[0].value;
		this.selected=this.selected.filter(function(v) { return(v!=value)});
		if(element.checked) this.selected.push(value);
		this.do(this.#oldtable);
	}

	do(table) {
		this.#ic=0;
		this.#oldtable=table;
		if (typeof(this.#filter)=='function') table=this.#oldtable.filter(this.#filter);
		var m=this.#table.length;
		var i=0;
		for (;i<table.length;i++) {
			if (i<m) {
				this.#builder(this.#cible.children[i],table[i]);
			} else {
				this.#cible.appendChild(this.#template.cloneNode(true));
				this.#builder(this.#cible.children[i],table[i]);
			}
		}
		for (var j=i;j<m;j++)
			this.#cible.removeChild(this.#cible.children[i]);
		this.#table=table;
	}

	#remplacer(at,elc,elt,val) {
		switch(at) {
			case undefined:
				elc.innerHTML=elt.innerHTML+val;							
				break;
			case 'checked':
				elc.checked=val;
				break;
			case 'selected':
				elc.selected=val;
				break;
			default:
				elc.setAttribute(at,elt.getAttribute(at)+val);
		}
  	}

	#builder(el,st) {
		var m=this.#consigne.length;
		for (var i=0;i<m;i++) 
			if (Array.isArray(this.#consigne[i])) {
				for (var j=0; j<this.#consigne[i].length;j++)
					if (this.#consigne[i][j].cl==undefined)
						this.#remplacer(this.#consigne[i][j].at,el,this.#template,st[i]);
					else {
						var t1=Array.from(el.getElementsByClassName(this.#consigne[i][j].cl));
						var t2=Array.from(this.#template.getElementsByClassName(this.#consigne[i][j].cl));
						for (var k=0;k<t1.length;k++)
							this.#remplacer(this.#consigne[i][j].at,t1[k],t2[k],st[i]);
					}
			} else {
				var cible=el.getElementsByClassName(this.#consigne[i].ci)[0];
				if (this.#ic>=this.#child.length)
					this.#child[this.#ic]=new MyBuilding(this.#consigne[i].te,cible,this.#consigne[i].di,this.#href);
				this.#child[this.#ic].do(st[i]);
				this.#ic++;
			}
	}

	change(el, args) {
		var xhttp = new XMLHttpRequest();
		var mb=this;
		xhttp.open("POST",this.#href, true);
		var form = new FormData();
		args.forEach(function(s) {
    		for(var pr=el.parentNode; pr!=document; pr=pr.parentNode) {
    			var tmp=pr.getElementsByClassName(s.tag);
    			if (tmp.length>0){
    				form.append(s.name,tmp[0].value);
    				break;
    			}
    		}
    	});
		form.append(el.name,el.type=='checkbox'?(el.checked?'1':'0'):el.value);
		xhttp.addEventListener('readystatechange', function() {
			if (xhttp.readyState === XMLHttpRequest.DONE) {
				if (xhttp.status === 200) { 
					var json=xhttp.responseText;
					if (json!='') {
						mb.do(JSON.parse(json));
					}
				}
				document.body.style.cursor='';
			}
		});
		xhttp.send(form);
		document.body.style.cursor='wait';
	}

	action(el, args, param) {
		var xhttp = new XMLHttpRequest();
		var mb=this;
		xhttp.open("POST",this.#href+'?'+param, true);
		var form = new FormData();
	    args.forEach(function(s) {
    		for(var pr=el.parentNode; pr!=document; pr=pr.parentNode) {
	    		var tmp=pr.getElementsByClassName(s.tag);
    			if (tmp.length>0){
	    			form.append(s.name,tmp[0].value);
    				break;
    			}
    		}
    	});
		xhttp.addEventListener('readystatechange', function() {
			if (xhttp.readyState === XMLHttpRequest.DONE) {
				if (xhttp.status === 200) { 
					var json=xhttp.responseText;
					if (json!='') {
						mb.do(JSON.parse(json));
					}
				}
				document.body.style.cursor='';
			}
		});
		xhttp.send(form);
		document.body.style.cursor='wait';
	}
}
