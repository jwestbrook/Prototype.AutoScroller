/**
 * AutoScroller est une class utilisant prototype.js http://prototypejs.org/api/
 * en dÃ©clarant new Scroller(id_duParent), votre Ã©lÃ©ment se trouvera dans un
 * environnement de scroll automatique au survol de la souris !!
 *
 * @copyright	Se script est libre de droit, sous rÃ©serve que vous n'oubliez pas de conserver ses lignes !
 * @author		Nours312 <debug[at]nours312.com> http://nours312.com
				3acWeb Studios nours312[at]3acweb.com
 * @filesource	http://4code.fr/4codeJSScroller.js
 * @version		1.0
 * @exemple		http://4code.fr/JS:post/view:Scroll_automatique_pour_vision_panoramique.html
 *
 */
/*
 * Dans la balise <head> </head> vous devez placer le code suivant :
    <script src="js/prototype.js" type="text/javascript"></script>  
    <script src="js/4codeJSScroller.js" type="text/javascript"></script>  
    <script type="text/javascript">  
    document.observe('dom:loaded', function(){  
        new AutoScroller($('scrollMe'));   // scrollMe Ã©tant l'id de votre Ã©lÃ©ment Ã  scroller !!
    });  
    </script>   
 */
/*
 * Votre conteneur et son Ã©lÃ©ment se prÃ©sentent de la faÃ§on suivante dans votre page HTML :
    <div style="margin: auto; overflow: hidden; width: 100px; height: 100px;">  
    <div id="scrollMe"><img title="Survolez moi ^^" src="../imgs/diablotin_Nours312.png" alt="Nours312" width="262" height="250" /></div>  
    </div>  
 */

var AutoScroller = Class.create({
	scrollerDim : {}, //dimensions de notre Ã©lÃ©ment  
	scrollerPos : {}, // position de notre Ã©lÃ©ment
	containerDim: {}, //dimensions de notre container
	container : null, // notre Ã©lÃ©ment ... j'aurais pu changer son nom ^^
	timer : {
		vertical : false,
		horizontal : false
	}, // nos compteurs
	pasScroll : {
		vertical : null,
		horizontal : null
	}, // nos pasScroll valeurs utilisÃ©es pour les dÃ©placements de l'Ã©lÃ©ment
	queueScroll : {
		vertical : false,
		horizontal : false
	}, // information sur la capacitÃ© d'effectuer des scroll  
	autoScroll : false,
	initialize : function(c){ //lancÃ©e automatiquement par prototype lors de l'appel de la class.
		this.container = c;
		this.loadInterface();
		this.loadEvent();
	},
	loadInterface : function(){
		this.scrollerDim = this.container.ancestors()[0].getDimensions();
		this.scrollerPos = this.container.ancestors()[0].viewportOffset();
		this.containerDim = this.container.getDimensions();
	},
	loadEvent : function(){
		this.container.ancestors()[0].observe('mousemove', this.useScroll.bindAsEventListener(this));
		var mouseScroller = this[((this.containerDim.height>this.scrollerDim.height) ? 'scrollVMouse' : ((this.containerDim.width>this.scrollerDim.width) ? 'scrollHMouse' : 'emptyFunction' ))].bindAsEventListener(this);
		this.container.ancestors()[0].observe('DOMMouseScroll', mouseScroller);
		this.container.ancestors()[0].observe('mousewheel', mouseScroller);
		this.container.ancestors()[0].observe('mouseout', this.outScroll.bindAsEventListener(this));
	},
	emptyFunction : function(){// fonction vide
		return;
	},
	scrollVMouse : function(e){ // scroll vertical Ã  la souris
		this.pasScroll.vertical = (e.detail > 0 || e.wheelDelta <0) ? 160 : -160;
		this.scrollVertical();
		this.outScroll();
	},
	scrollHMouse : function(e){ // scroll horizontal grÃ¢ce Ã  la mollette de la souris
		this.pasScroll.horizontal = (e.detail > 0 || e.wheelDelta <0) ? 160 : -160;
		this.scrollHorizontal();
		this.outScroll();
	},
	outScroll : function(){ // rÃ©initialisation des attribut de notre classe
		this.queueScroll = { vertical : false, horizontal : false};
		this.autoScroll = false;
		window.clearTimeout(this.timer.vertical);
		window.clearTimeout(this.timer.horizontal);
	},
	useScroll : function(e){ // lancÃ© au survol du conteneur
		if(e.clientX > this.scrollerPos.left && e.clientX < (this.scrollerPos.left+this.scrollerDim.width) &&
				e.clientY > this.scrollerPos.top && e.clientY < (this.scrollerPos.top+this.scrollerDim.height)){
			this.overScroll([((e.clientX-this.scrollerPos.left)/this.scrollerDim.width)*100, ((e.clientY-this.scrollerPos.top)/this.scrollerDim.height)*100]);
		} else
			this.outScroll(); // sinon, rÃ©initilisation des attributs
	},
	overScroll : function(p){ // p est un array() contenant les pourcentages de l'emplacement de la souris sur le conteneur en partant du coin Haut Gauche
		this.autoScroll = true; // dÃ©finition de la propriÃ©tÃ© de rechargement automatique de cette fonction.

		if(p[0]<35 || p[0]>65 || p[1]<35 || p[1]>65){
			if(p[0]<35 || p[0]>65){ // si notre souris se trouve dans les zones rÃ©actives pour un scroll horizontal

				this.pasScroll.horizontal = p[0]-50;
				this.pasScroll.horizontal += (this.pasScroll.horizontal > 0) ? -15 : 15;

				if(!this.queueScroll.horizontal)
					this.scrollHorizontal();

			}

			if(p[1]<35 || p[1]>65){ // si notre souris se trouve dans une zone rÃ©active pour un scroll vertical

				this.pasScroll.vertical = p[1]-50;
				this.pasScroll.vertical += (this.pasScroll.vertical > 0) ? -15 : 15; // initialisation du pasScroll

				if(!this.queueScroll.vertical) // si nous ne sommes pas dÃ©ja en scrollAutomatique.
					this.scrollVertical();

			}
		} else
			this.outScroll(); // si notre souris n'est pas dans une zone rÃ©active, nous rÃ©initialisons les attributs
	},
	scrollVertical : function(){
		window.clearTimeout(this.timer.vertical); // rÃ©initialisation du timer
		var pas = parseInt(this.pasScroll.vertical/3); // application du cef sur le pasScroll
		var mT = parseFloat(this.container.getStyle('marginTop')); // rÃ©cupÃ©ration de la position de notre Ã©lÃ©ment
		var m = mT - pas; // calcul de la nouvelle position souhaitÃ©e
		var d = this.containerDim.height-this.scrollerDim.height+20// calcul de la longueur maximum du dÃ©placement de notre Ã©lÃ©ment.

		if(this.containerDim.height<this.scrollerDim.height) // si notre Ã©lÃ©ment est plus petit que son conteneur
			this.queueScroll.vertical = false;
		else if(m <= -d){ // si la nouvelle position est plus important que la position max acceptÃ©e, nous attribuons la position max.
			this.container.setStyle({marginTop : -d+'px'});
			this.queueScroll.vertical = false;
		} else if (m>=0){ // si notre nouvelle position place notre Ã©lÃ©ment au delÃ  du minimum requis
			this.container.setStyle({marginTop : 0+'px'});
			this.queueScroll.vertical = false;
		} else {// si tout se passe bien :D
			this.container.setStyle({marginTop : m+'px'});// attribution de la nouvelle valeur Ã  l'attribut margin de notre Ã©lÃ©ment.
			this.queueScroll.vertical = true;// Prise en main du rechargement automatique sur la mÃ©thode overScroll()
			if(this.autoScroll) // si le rechargement automatique Ã  Ã©tÃ© demandÃ©
				this.timer.vertical = window.setTimeout(this.scrollVertical.bind(this), 10);
		}
	},
	scrollHorizontal : function(){ // meme fonctionnement ;)  
		window.clearTimeout(this.timer.horizontal);
		var pas = parseInt(this.pasScroll.horizontal/3);
		var mT = parseFloat(this.container.getStyle('marginLeft'));
		var m = mT - pas;
		var d = this.containerDim.width-this.scrollerDim.width+20;

		if(this.containerDim.width<this.scrollerDim.width)
			this.queueScroll.horizontal = false;
		else if(m <= -d){
			this.container.setStyle({marginLeft : -d+'px'});
			this.queueScroll.horizontal = false;
		} else if (m>=0){
			this.container.setStyle({marginLeft : 0+'px'});
			this.queueScroll.horizontal = false;
		} else {
			this.container.setStyle({marginLeft : m+'px'});
			this.queueScroll.horizontal = true;
			if(this.autoScroll)
				this.timer.horizontal = window.setTimeout(this.scrollHorizontal.bind(this), 10);
		}
	}
});