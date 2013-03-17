var VMCompiler = (function(){


	var CompileLabels = function(code){
		code = code.split(",").join(""); //ignore commas
		try{
			return VMC(code);
		} catch(e){
			if(e.hasOwnProperty("line")){
				alert("Error compiling code: \n"+e.message+ "\n(Line "+e.line.toString()+", Column "+e.offset.toString()+")");
			} else {
				alert("Error compiling code: \n"+e.message);
			}
			throw e;		
		}
	}
	
	return function( ids ){
		
		var PC 			= 0;
		var PCArray		= [];
		var cInstr		= null;
		var breakPoint	= 500;
		var runProc		= false; //are we running proc?
		var ret 		= -1;
		var framepointer	= -1; //frame pointer(s) (we need to store all the old ones also)
		var restore = false;
		
		
		
		var cls = {
			codeToken		: 'SSE-code-token',
			currentToken	: 'SSE-current-token'
		}
		
		var com = {
			self				: this,
			stack			 	: new Stack(),
			textarea			: getEl( ids.textarea ),
			stackEvolution	: getEl( ids.stackEvolution ),
			timeout			: null,
			sse 				: {
				main			: getEl( ids.overlay ),
				code 			: getEl( ids.sseCode ),
				stack 		: getEl( ids.sseStack ),
				evolution	: getEl( ids.sseEvolution )
			}
		}
		
		var cStack = com.stack.editable( [0] );
		
		getEl( ids.stackHolder ).appendChild( cStack );
		getEl( ids.startButton ).onclick = function(){ com.self.compile( ); };
		getEl( ids.compileButton ).onclick = function(){ 
			if(typeof restore == 'string'){
				com.textarea.value = restore;
				restore = false;
				getEl( ids.compileButton ).value = "Compile (delabelize)";
				com.textarea.readOnly = false;
			} else {
				restore = com.textarea.value;
				try{
					com.textarea.value = CompileLabels( restore );
					getEl( ids.compileButton ).value = "Restore (relabelize)";
					com.textarea.readOnly = true;
				} catch(e){
					restore = false;
					throw e;
				}
				
			}
		};
		getEl( ids.sseButton ).onclick = function(){ com.self.compile( true ); };
		getEl( ids.sseClose ).onclick = function(){ 
			com.sse.main.style.display = 'none'; 
			com.sse.main.zIndex = -1;
			getEl( ids.stackHolder ).appendChild( cStack );
		};
		

		this.evaluate = function( code ){
			code = code ? code : CompileLabels(com.textarea.value);
			code = code.replace(/\s+/gi, ' ').replace(/^\s|\s$/g, '').toLowerCase();
			return code;
		}
		
		this.getArray = function( code ){
			var a = this.evaluate(code).split(' ');
			for(var i in a) if( /^[\-]?[0-9]+$/.test(a[i]) ) a[i] = Number( a[i] );
			return a;
		}
		
		this.compile = function( stepByStep ){
			var a		= this.getArray();
			cInstr 	= a;
			

			framepointer		= -1;
			runProc			= false;
			ret 			= -1;

			PC 			= 0;
			PCArray		= [];
			breakPoint	= Number(getEl( ids.optMaxInstructions ).value);
			breakPoint	= isNaN( breakPoint ) ? 1000 : breakPoint;
			com.stackEvolution.innerHTML 	= '';
			com.sse.evolution.innerHTML 	= '';
			
			if( stepByStep ){
				
				/** Helper functions **/
				
				function hasClass( ele,cls ) { return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')); }
				
				function addClass( ele,cls ) { if (!hasClass(ele,cls)) ele.className += " "+cls; }
				 
				function removeClass( ele,cls ) {
					if (hasClass(ele,cls)) {
						var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
						ele.className=ele.className.replace(reg,' ');
					}
				}
				
				function next(){
					if( PC < 0 || PC >= tokens.length ) {
						if( com.timeout ) clearTimeout( com.timeout );
						return;
					}
					 
					if( PCArray.length > 0 ) removeClass( tokens[ PCArray[PCArray.length-1] ], cls.currentToken );
					addClass( tokens[ PC ], cls.currentToken );
					PCArray.push( PC );
					if( !com.self[a[PC]](a[PC+1], a[PC+2], a) ) {
					   M('Program halted due to errors!', 'warn');
					   return;
					}
					com.sse.evolution.appendChild( com.stack.print( com.stack.getValues() ) );
					getEl( ids.ssePosition ).innerHTML = PC;
				}
				
				function prev(){
					if( PCArray.length <= 1 ) {
						if( com.timeout ) clearTimeout( com.timeout );
						return;
					}
					
					var ind = com.sse.evolution.children.length-1;
					com.ssframepointere.evolution.removeChild( com.sse.evolution.children[ ind ] );
					var values = eval( com.sse.evolution.children[ ind-1 ].getAttribute( 'values' ) );

					com.sse.stack.innerHTML = '';
					cStack 						= com.stack.editable( values );
					com.sse.stack.appendChild( cStack );
					
					var tmp = PCArray.pop();
					removeClass( tokens[ tmp ], cls.currentToken );
					PC = tmp;
					if( PCArray.length > 0 ) addClass( tokens[ PCArray[PCArray.length-1] ], cls.currentToken );
					getEl( ids.ssePosition ).innerHTML = PC;
				}
				
				function autoIterate(){
					var delay	= Number( getEl( ids.sseTimeout ).value );
					delay			= isNaN( delay ) ? 500 : delay * 1000;
					
					if( com.timeout ) clearTimeout( com.timeout );
					
					if( getEl( ids.sseBackward ).checked ) prev();
						else next();

					if( PC >= 0 && PC <= tokens.length ) com.timeout = setTimeout(function(){ autoIterate(); }, delay);
						else {
							clearTimeout( com.timeout );
							com.timeout = null;
							getEl( ids.sseStartTimer ).value = 'Start';
						}
				}
				
				/** -End Helper Functions- **/
				
				var str = CompileLabels(com.textarea.value);
				/* DONE by CompileLabels			
				str = str.replace( /\s\s+/g, ' ' )
							.replace( /([a-zA-Z]+)\s+(\-?[0-9]+)/g, "$1 $2\n" )
							.replace( /([a-zA-Z]+)\s+([a-zA-Z])/g, "$1\n$2" )
							.replace( /[ ]+([a-zA-Z]+)/g, "$1" )
							.replace( /(\s)\s+/g, "$1")
							.replace( /^\s+|\s+$/g, '');
				*/
				var code 	= element('div');
				var arr 		= str.split("\n");
				var c 		= 0;
				var tokens	= [];

				for(var i in arr){
					var t = arr[i].split(' ');
					for(var j in t) {
						var tmp = element('span', {'className':cls.codeToken, 'id':'token_'+c}, t[j]);
						tokens.push( tmp );
						code.appendChild( tmp );
						++c;
					}
					code.appendChild( element('br') );
				}
				
				/** Bulk setup **/
				
				com.sse.code.innerHTML = '';
				com.sse.code.appendChild( code );
				
				com.sse.stack.appendChild( cStack );
				com.sse.main.style.display	   = 'block';
				com.sse.main.style.zIndex		= 100;
				
				/** Button Events **/
				
				getEl( ids.sseNext ).onclick = function(){ next(); };
				
				getEl( ids.ssePrev ).onclick = function(){ prev(); };
				
				getEl( ids.sseStartTimer ).onclick = function(){ 
					if( com.timeout ) {
						this.value 	= 'Start';
						clearTimeout( com.timeout );
						com.timeout = null;
					} else {
						this.value = 'Stop';
						autoIterate(); 
					}
				};
				
			} else {
			
				var i = 0;
				while( PC < a.length && PC >= 0 ){
					if( !this[a[PC]](a[PC+1], a[PC+2], a) ) {
					   M('Program halted due to errors!', 'warn');
					   break;
					}
					com.stackEvolution.appendChild( com.stack.print( com.stack.getValues() ) );
					PCArray.push( PC );
					if( ++i >= breakPoint ) {
						alert("Runtime error: Too many instructions... maybe infinite loop. Exceeded: "+breakPoint+" instructions. ");
						M('Too many instructions... maybe infinite loop. Exceeded: '+breakPoint+' instructions', 'error');
						break;
					}
				}
				
			}
			
		}
		
		/** STACK VM MANIPULATING FUNCTIONS **/
		
		/** Private helper functions **/
			function val( obj, set ){
				obj = obj.children[0].children[0];
				if( set !== undefined ) obj.value = set;
					else return Number(obj.value);
			}
			
			function get( index ){
				index = index !== undefined ? index : cStack.children.length - 1;
				return cStack.children[ cStack.children.length - index - 1 ];
			}
	
			function push( n, index ){
				n = n ? n : 0;
				index = index !== undefined ? index : cStack.children.length - 1;
				cStack.insertBefore( com.stack.newItem(n), get(index) );
			}
	
			function pop( n ){
				n = n !== undefined ? n : cStack.children.length - 1;
				if( n > cStack.children.length-1 ){
					alert("Runtime error: Index out of bounds. ");
					M('Index out of bounds', 'warn');
					return null;
				}
				var obj 	= get(n);
				var v		= val( obj );
				cStack.removeChild( obj );
				return v;
			}
		/****/
		
		/** VM Procedures **/
		this.peek = function(n){
			if( n > cStack.children.length-1 ){
				alert("Runtime error: Index out of bounds. ");
				M('Index out of bounds', 'warn');
				return null;
			}
			push( val(get(n)) );
			
			PC += 2;
			return this;
		}
		
		this.poke = function(n){
			val( get(n), pop());
			
			PC += 2;
			return this;
		}
		
		this.con = function(n){
			push(n);
			
			PC += 2;
			return this;
		}
		
		this.add = function(){
			if( cStack.children.length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				M('Not enough elements in stack', 'warn');
				return null;
			}
			var x = pop();
			var y = pop();
			push( x+y );
			
			PC += 1;
			return this;
		}
		
		this.sub = function(){
			if( cStack.children.length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				M('Not enough elements in stack', 'warn');
				return null;
			}
			var x = pop();
			var y = pop();
			push( x-y );
			
			PC += 1;
			return this;
		}
		
		this.mul = function(){
			if( cStack.children.length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				M('Not enough elements in stack', 'warn');
				return null;
			}
			var x = pop();
			var y = pop();
			push( x*y );
			
			PC += 1;
			return this;
		}
		
		this.leq = function(){
			if( cStack.children.length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				M('Not enough elements in stack', 'warn');
				return null;
			}
			push( pop()<=pop() ? 1 : 0 );
			
			PC += 1;
			return this;
		}
		
		this.jp = function(n){
			if(PC + n < 0 || PC + n >= cInstr.length){
				alert("Runtime error: Jump index out of bounds. ");
				M('Jump index out of bounds', 'warn');
				return null;
			}
			
			PC += n;
			return this;
		}
		
		this.cjp = function(n){
			if( pop() == 0 ) return this.jp(n);

			PC += 2;
			return this;
		}
		
		this.halt = function(){
			PC = -1;
		}

		//procedures


		this.proc = function( a, b ){
			a = Number( a );
			b = Number( b );
			if( isNaN(b) || b < 4 ){
				alert("Runtime error: The function can't have less than 4 tokens. ");
				M('The function can\'t have less than 4 tokens', 'warn');
			}
			if( runProc ) {
				if(cStack.length < a){
					alert("Runtime error: Not enough elements on stack. ");
					return null;
				}
				push(a); //argument number
				push(framepointer); //old framepointer
				push(ret); //return adress
				
				framepointer = cStack.children.length - 1; //framepointer
				PC += 3; //jump to function body
				runProc = false;
			} else {
				this.jp(b); //jump over function body
			}
			return this;
		}

		this.call = function(a, b, pgr){
			ret = PC+2; //Return adress
			PC = a;
			runProc = true;//Ok we jumped to the function
			return this.proc(pgr[PC+1], pgr[PC+2], pgr); //run the procedure
		}

		this["return"] = function(){
			
			var fp = framepointer; //get the frampointer
			PC = pop(fp--); //jump back
			if(isNaN(PC)){
				alert("Runtime Error: Frame has been destroyed. ");
				M('Frame has been destroyed', 'warn');
				return null;		
			}
			framepointer = pop(fp--); //old framepointer
			var l = pop(fp--); //length
			for(var i=0;i<l;i++){
				pop(fp--);
			}
			
			
			return this;
		}

		this.arg = function(a){
			var count = val(get(framepointer-2));
			if(a <= 0 || a > count){
				alert("Runtime error: Invalid argument number. ");
				M('Invalid argument number', 'warn');
				return null;
			}
			push(val(get(framepointer-2-a))); //get the specefied argument
			//TODO: Check for size
			PC += 2;
			return this;
		}

	};
	
})();


var Stack = (function(){
	
	var cls = {
		main			: 'stack',
		item			: 'stackItem',
		input 		: 'input',
		actions		: 'actions',
		printMain	: 'stackPrint'
	}
	
	var UID					= 0;
	var printedStacks		= [];
	var editableStacks	= [];
	
	return function( values ){
		
		var cStack	= null;
		var acc 		= [];
		
		/** Private methods **/
		
		function newItem( val ){
			
			function del(){
				var s = this.parentNode.parentNode;
				s.parentNode.removeChild( s );
			}
			
			function add(){
				var s = this.parentNode.parentNode;
				s.parentNode.insertBefore( newItem(0), s );
			}
			
			val = val ? val : 0;
			
			var wrapper	= element( 'tr' );
			var obj		= element( 'td', { 'className':cls.item } );
			var actions	= element( 'td', { 'className':cls.actions } );
			
			obj.appendChild( element( 'input', {'type':'text', 'value':val, 'className':cls.input} ) );
			
			actions.appendChild( element('a', { 'className':'action', 'href':'javascript:void(0)', 'onclick':add }, '+') );
			actions.appendChild( element('a', { 'className':'action', 'href':'javascript:void(0)', 'onclick':del }, '-') );
			
			wrapper.appendChild( obj );
			wrapper.appendChild( actions );
			
			return wrapper
		}
		
		/** Public methods **/
		
		this.newItem = function( val ){ return newItem( val ); }
		
		this.getValues	= function(){
			var inputs = cStack.getElementsByTagName('input');

			var a = [];
			for( var i=0; i<inputs.length; ++i ) 
				if( inputs[0].className.indexOf( cls.input ) > -1 )
					a.push(inputs[i].value);

			a.reverse();
			return a;
		}
		
		this.print = function( values ) {
			
			values = values.reverse();
			
			var s = element('span', { 'className':cls.printMain });
			for( var i in values )
				s.appendChild( element('div', {'className':cls.item}, values[i]) );
				
			s.setAttribute('values', '['+values.join(',')+']');
			
			return s;
		}
		
		this.editable = function( values ){
//			if( cStack ) return cStack;
			
			var s = element( 'table', { 'className':cls.main, 'id':'stack_'+UID, 'cellSpacing':0, 'cellPadding':0 } );
			
			for( var i in values )
				s.appendChild( newItem(values[i]) );
			
			editableStacks.push( s );
			
			cStack = s;
			
			return s;
		}
		
	}
	
})();

function element( type, options, html ) {
	
	var obj = document.createElement( type );
	
	if( options )
		for( var i in options )
			obj[i] = options[i];
			
	if( html ) obj.innerHTML = html;
	
	return obj;
	
}

function getEl( id, context ){
	context = context ? context : document;	
	 
	return context.getElementById( id ) 
}

/**
 * A Message function. checks to see if firebug is enabled
 * @param obj the object to output. If firebut is disable, will only work for: string, int, float
 * @param type log, info, err
**/
function M(obj, type){
	type = type ? type : "log";
	if(typeof console != 'undefined' && console != null){
		switch(type){
			case "log"	: console.log( obj ); break;
			case "info"	: console.info( obj ); break;
			case "warn"	: console.warn( obj ); break;
			case "err"	: console.err( obj ); break;
		}
	}
}
