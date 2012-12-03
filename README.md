Prototype.AutoScroller
======================

Mirrored from http://4code.fr/JS:post/view:Scroll_automatique_pour_vision_panoramique.html

Still to be translated - anyone that knows French will help


====================

Vous avez toujours rêvé de ce petit effet très agréable, et mis à part en pompant un pseudo Flash, vous pensiez que c'était impossible !? Ben voilà, tout en Js ;)

Donc, le principe de base est que nous avons une div de hauteur et largeur fixe dans laquelle se trouve une autre, elle aussi de hauteur et largeur fixe.

La class AutoScroller va récupérer toutes ses données, et va faire en sorte que Si la souris de l'utilisateur se trouve au dans la zone de 0% à 35% ou de 65% à 100% il déclenche le scroll en modifiant l'attribut css "margin" de notre élément.

Pour utiliser cette classe, vous devez utiliser prototypes. et appeler votre objet en lui donnant en paramètre l'identifiant de notre élément à scroller !! :


```html
 <script src="js/prototype.js" type="text/javascript"></script>
 <script src="js/autoScroller.js" type="text/javascript"></script>
 <script type="text/javascript">
 document.observe('dom:loaded', function(){
     new AutoScroller($('scrollMe'));
 });
 </script>
```

Placer le script ci-dessus dans la balise <head> ... </head> de votre page HTML, et définissez votre Elément et son parent de cette façon : 

```html
 <div style="margin: auto; overflow: hidden; width: 100px; height: 100px;">
 <div id="scrollMe"><img title="Survolez moi ^^" src="../imgs/diablotin_Nours312.png" alt="Nours312" width="262" height="250" /></div>
 </div>
 ```

 Notre élément est bien la div dont l'id est "scrollMe". il est important de mettre l'attribut CSS overflow:hidden, sion, ça pert tout son charme ^^.

Maintenant, voyons plus en détail notre Objet AutoScroller(), pour ceux qui connaissent déjà prototype, vous comprendrez vite le raisonnement, mais pour les autres, Prototype contient une class nommée Class avec une méthode create() qui permet de monter une classe très rapidement, et de façon très agréable ! de plus lors de son appel, la method "initialize()" est automatiquement appelée avec les attributs passés en paramètres lors de l'appel !

Donc nous créons notre Class et déclarons les attributs :

```javascript
 var AutoScroller = Class.create({
     scrollerDim : {}, //dimensions de notre élément
     scrollerPos : {}, // position de notre élément
     containerDim: {}, //dimensions de notre container
     container : null, // notre élément ... j'aurais pu changer son nom ^^
     timer : {
         vertical : false,
         horizontal : false
     }, // nos compteurs
     pasScroll : {
         vertical : null,
         horizontal : null
     }, // nos pasScroll valeurs utilisées pour les déplacements de l'élément
     queueScroll : {
         vertical : false,
         horizontal : false
     }, // information sur la capacité d'effectuer des scroll
     autoScroll : false, // attribut définissant le lancement automatique de notre effet de scroll
 
     initialize : function(c){ //lancée automatiquement par prototype lors de l'appel de la class.
         this.container = c;
         this.loadInterface();
         this.loadEvent();
     },
 
 
      ...
 }
 ```

 Notre méthode initialize() va initialiser les attributs en appelant la method loadInterface() et initialiser les Events en appelant la méthode loadEvent() ... je sais, ce n'est pas original !... :D

 ```javascript
      loadInterface : function(){ // initialisation des attributs
         this.scrollerDim = this.container.ancestors()[0].getDimensions();
         this.scrollerPos = this.container.ancestors()[0].viewportOffset();
         this.containerDim = this.container.getDimensions();
     },
     loadEvent : function(){ // initialisation des effets
         this.container.ancestors()[0].observe('mousemove', this.useScroll.bindAsEventListener(this)); // déplacement de la souris sur le conteneur
         var mouseScroller = this[((this.containerDim.height>this.scrollerDim.height) ? 'scrollVMouse' : ((this.containerDim.width>this.scrollerDim.width) ? 'scrollHMouse' : 'emptyFunction' ))].bindAsEventListener(this); // définition de la methode à employer lors du déplacement de la molette de la souris
         this.container.ancestors()[0].observe('DOMMouseScroll', mouseScroller); // Event pour FireFox
         this.container.ancestors()[0].observe('mousewheel', mouseScroller); // Event pour IE, Safari et Opéra
         this.container.ancestors()[0].observe('mouseout', this.outScroll.bindAsEventListener(this)); // si nous sortons de la surface du conteneur, nous réinitialisons les attributs.
 
     }
``` 
 
 Donc, nous avons placé 3 Events pour 2 fonctions !...

Le premier à pour objet de charger la method useScroll() à chaque mouvement de la souris sur l'interface.
Le second à pour objet de charger la méthod
scrollVMouse() si la hauteur de l'élément est supérieur à la hauteur de son conteneur
sinon, scrollHMouse() si la largeur de l'élément est supérieur à la largeur de son parent
sinon, emptyFunction()
Le troisième est identique au second mais est le nom utilisé par l'ensemble des navigateur (hors FF). Ces events interviennent en cas de scroll effectué à l'aide du bouton de la souris (la mollette) ...
Le quatrième sert à stopper les scrolls automatique lors que nous sortons de la surface du conteneur.
Tous ses évents sont placé sur le conteneur pour qu'ils ne se déclenchent que si nous sommes positionnés au dessus.

```javascript
     emptyFunction : function(){ // fonction vide
         return;
     },
     scrollVMouse : function(e){ // scroll vertical à la souris
         this.pasScroll.vertical = (e.detail > 0 || e.wheelDelta <0) ? 160 : -160;
         this.scrollVertical();
         this.outScroll();
     },
     scrollHMouse : function(e){ // scroll horizontal grâce à la mollette de la souris
         this.pasScroll.horizontal = (e.detail > 0 || e.wheelDelta <0) ? 160 : -160;
         this.scrollHorizontal();
         this.outScroll();
     },
 ```

 Nous constatons donc que emptyFunction est une fonction qui ne va effectuer aucune action. scrollVMouse et scrollHMouse ont le meme comportement, elles définissent un pas pour le scroll en vérifiant si le scroll est "vers le haut" ou "vers le bas". Puis elles appellent la methode scrollVertical ou scrollHorizontal (qui vont effectuer le scroll) et appelent la methode outScroll qui aura pour effet de stoper un éventuel scroll au survol et réinitialiser les effets.

 ```javascript
      outScroll : function(){ // réinitialisation des attribut de notre classe
         this.queueScroll = { vertical : false, horizontal : false};
         this.autoScroll = false;
         window.clearTimeout(this.timer.vertical);
         window.clearTimeout(this.timer.horizontal);
     },
 ```
Notre premier Event va lui charger la method useScroll(), fonction en charge de lancer les déplacement de l'élément en fonction de la position de la souris sur le conteneur, puis lancer la method overScroll() avec en parametre le pourcentage de la position de la souris par rapport au conteneur.

```javascript
     useScroll : function(e){ // lancé au survol du conteneur
         if(e.clientX > this.scrollerPos.left && e.clientX < (this.scrollerPos.left+this.scrollerDim.width) &&
                 e.clientY > this.scrollerPos.top && e.clientY < (this.scrollerPos.top+this.scrollerDim.height)){
             this.overScroll([((e.clientX-this.scrollerPos.left)/this.scrollerDim.width)*100, ((e.clientY-this.scrollerPos.top)/this.scrollerDim.height)*100]);
         } else
             this.outScroll(); // sinon, réinitilisation des attributs
     },
     overScroll : function(p){ // p est un array() contenant les pourcentages de l'emplacement de la souris sur le conteneur en partant du coin Haut Gauche
         this.autoScroll = true; // définition de la propriété de rechargement automatique de cette fonction.
 
         if(p[0]<35 || p[0]>65 || p[1]<35 || p[1]>65){ 
             if(p[0]<35 || p[0]>65){ // si notre souris se trouve dans les zones réactives pour un scroll horizontal
 
                 this.pasScroll.horizontal = p[0]-50;
                 this.pasScroll.horizontal += (this.pasScroll.horizontal > 0) ? -15 : 15;
 
                 if(!this.queueScroll.horizontal)
                     this.scrollHorizontal();
 
             }
 
             if(p[1]<35 || p[1]>65){ // si notre souris se trouve dans une zone réactive pour un scroll vertical
 
                 this.pasScroll.vertical = p[1]-50;
                 this.pasScroll.vertical += (this.pasScroll.vertical > 0) ? -15 : 15; // initialisation du pasScroll
 
                 if(!this.queueScroll.vertical) // si nous ne sommes pas déja en scrollAutomatique.
                     this.scrollVertical();
 
             }
         } else
             this.outScroll(); // si notre souris n'est pas dans une zone réactive, nous réinitialisons les attributs
     },
 
 ```
 Cette fonction va calculer la position de la souris au dessus du container, l'utiliser pour mettre à jour l'attribut this.pasScroll et lance les méthodes scrollVertical() et scrollHorizontal(), si celles ci ne sont pas déja en cours de fonctionnement (rechargement automatique windows.setTimeout() ).

Les Méthodes scrollVertical() et scrollHorizontal() vont :

Initialiser le compteur,
Récupérer la position de notre élément,
Vérifier ses possibilités de mouvement,
applique un coefficient modérateur sur le pasScroll définit,
effectue le déplacement, si c'est possible,
Et mettre à jour l'attribut this.queueScroll avec une information lui indicant si le scroll peux continuer ou pas ! (utilisé dans useScroll().

```javascript
     scrollVertical : function(){
         window.clearTimeout(this.timer.vertical); // réinitialisation du timer
         var pas = parseInt(this.pasScroll.vertical/3); // application du cef sur le pasScroll
         var mT = parseFloat(this.container.getStyle('marginTop')); // récupération de la position de notre élément
         var m = mT - pas; // calcul de la nouvelle position souhaitée
         var d = this.containerDim.height-this.scrollerDim.height+20 // calcul de la longueur maximum du déplacement de notre élément.
 
         if(this.containerDim.height<this.scrollerDim.height) // si notre élément est plus petit que son conteneur
             this.queueScroll.vertical = false;
         else if(m <= -d){ // si la nouvelle position est plus important que la position max acceptée, nous attribuons la position max.
             this.container.setStyle({marginTop : -d+'px'});
             this.queueScroll.vertical = false;
         } else if (m>=0){ // si notre nouvelle position place notre élément au delà du minimum requis
             this.container.setStyle({marginTop : 0+'px'});
             this.queueScroll.vertical = false;
         } else { // si tout se passe bien :D
             this.container.setStyle({marginTop : m+'px'}); // attribution de la nouvelle valeur à l'attribut margin de notre élément.
             this.queueScroll.vertical = true; // Prise en main du rechargement automatique sur la méthode overScroll()
             if(this.autoScroll) // si le rechargement automatique à été demandé
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
     },
 ```

 Si le scroll peux continuer et que l'attribut autoScroll (définit par useScroll=> lors du survol du container) se vérifie (true), alors, nous lançons un compteur rechargeant cette méthode tous les 10 millièmes de secondes ...

Vous pouvez télécharger ce script ici !

Voilà !... en espérant vous avoir apporter un support suffisamment détaillé, je vous souhaite une bonne utilisation, et vous prie de m'informer de toutes modifications apporter à ce script, je me ferais une joie de les partager en indiquant vos pseudos et liens en tant que contributeur !...

Je vous dis à bientôt !