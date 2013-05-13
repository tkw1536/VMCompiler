/*
	VMCompiler Main Code
*/
var VMCompiler = (function(){
	/*
		@param code Code to compile
		@returns compiles some labeled VM Code into unlabeled VM Code. 
	*/
	var CompileLabels = function(code){
		try{
			var res = VMC(code);
			if(res[0] == true){
				return res[1];		
			} else {
				throw res[1];
			}
		} catch(f){
			alert("Error compiling code: \n"+f.message);
			throw f; 
		}
		
	}
	
	return function( ids ){
		
		var PC 			= 0; //Program Counter
		var PCArray		= []; //Array of previous program counters
		
		var cInstr		= null; //Instruction counter
		var breakPoint	= 500;
		
		var runProc		= false; //are we running proc?
		var ret 		= -1;
		var framepointer	= -1; //frame pointer(s) (we need to store all the old ones also)
		var FPArray		= [];
		var restore = false;
		
		
		
		var cls = {
			codeToken		: 'SSE-code-token',
			currentToken	: 'SSE-current-token'
		}
		
		//init com namespace
		var com = {
			self: this,
			stack: new Stack(),
			textarea: $("#"+ids.textarea),
			stackEvolution: $("#"+ids.stackEvolution),
			timeout: null,
			sse: {
				main : $("#"+ids.overlay),
				code : $("#"+ids.sseCode),
				stack : $("#"+ids.sseStack),
				evolution : $("#"+ids.sseEvolution)
			}
		}
		
		//init stack
		var cStack = com.stack.editable( [0] );
		
		$("#"+ids.stackHolder).append(cStack);

		//stack reset button
		$("#"+ids.resetStack ).click(function(){
			cStack.remove();
			cStack=com.stack.editable([0]);
			$("#"+ids.stackHolder).append( cStack );
		});

		//start button
		$("#"+ids.startButton).click(function(){
			com.self.compile();
		});
		
		//compile button
		$("#"+ids.compileButton).click(function(){ 
			if(typeof restore == 'string'){
				com.textarea.val(restore);
				restore = false;
				$("#"+ids.compileButton).val("Compile (delabelize)");
				com.textarea.removeAttr("readOnly"); 
			} else {
				restore = com.textarea.val();
				try{
					com.textarea.val(CompileLabels(restore));
					$("#"+ids.compileButton ).val("Restore (relabelize)");
					com.textarea.attr("readOnly", "readOnly"); 
				} catch(e){
					restore = false;
					throw e;
				}
			}
		});
		
		//step by step execution button
		$("#"+ids.sseButton).click(function(){com.self.compile(true);});
		
		//close the step by step stuff
		$("#"+ids.sseClose).click(function(){ 
			//stop the timeout if it exists
			if(com.timeout) {
				clearTimeout(com.timeout);
				com.timeout = null;
			}
			com.sse.main.hide(); 
			com.sse.main.css("zIndex", -1);
			$("#"+ids.stackHolder).append(cStack);
		});
		
		//evaluate some code
		this.evaluate = function(code){
			code = code ? code : CompileLabels(com.textarea.val());
			code = code.replace(/\s+/gi, ' ').replace(/^\s|\s$/g, '').toLowerCase();
			return code;
		}
		//get code array
		this.getArray = function(code){
			var a = this.evaluate(code).split(' ');
			for(var i in a) if( /^[\-]?[0-9]+$/.test(a[i]) ) a[i] = Number( a[i] );
			return a;
		}
		
		//compile & run
		this.compile = function( stepByStep ){
			
			//get instruction count
			var a = this.getArray();
			cInstr = a;
			
			//framepointer
			framepointer = -1;
			FPArray = [];

			//are we in a procedure
			runProc	= false;
			ret = -1; //return adress

			//program counter
			PC 			= 0;
			PCArray		= [];
			
			//break point
			breakPoint	= Number($("#"+ids.optMaxInstructions).val());
			breakPoint	= isNaN( breakPoint ) ? 1000 : breakPoint;
			
			//reset html
			com.stackEvolution.html('');
			com.sse.evolution.html('');
			
			if(stepByStep){ //are we running step by step ? 
			
				/*
					runs the next command
				*/
				function next(){
					//check for end
					if( PC < 0 || PC >= tokens.length ) {
						if(com.timeout){
							clearTimeout(com.timeout);
						}
						return;
					}
					
					//update the current PC
					if(PCArray.length > 0){
						$(tokens[PCArray[PCArray.length-1]]).removeClass(cls.currentToken);
					}
					
					$(tokens[PC]).addClass(cls.currentToken);
					
					
					//update the state for reversibility
					PCArray.push( PC );
					FPArray.push ( framepointer );
					
					
					//did we do a valid jump? 
					if(typeof com.self[a[PC]] != 'function'){
						alert("Runtime error: Attempted to jump to numerical token. ");
						return false;
					}
					
					//execute command
					if( !com.self[a[PC]](a[PC+1], a[PC+2], a) ) {
					   //halted
					   return false;
					}
					
					//redraw stuff
					com.sse.evolution.append(
						com.stack.print(com.stack.getValues(), framepointer)
					);
					
					//update the displays
					$("#"+ids.ssePosition).text(PC);
					$("#"+ids.FPPosition).text(framepointer);
					
					return true;
				}
				
				/*
					undos the last command
				*/
				function prev(){
					//check for beginning
					if(PCArray.length <= 1) {
						if(com.timeout){
							clearTimeout(com.timeout);
						}
						return false;
					}
					
					
					//restore the values
					
					if(com.sse.evolution.children().last().length == 0){
						if(com.timeout){
							clearTimeout(com.timeout);
						}
						return false;
					}
									
					com.sse.evolution.children().last().remove();
					
					//get the previous values or set them to []
					
					var values = com.sse.evolution.children().last().data("values");
					values = (typeof values != 'undefined')?values:[];

					com.sse.stack.html("");
					
					//redraw old values
					cStack = com.stack.editable( values );
					com.sse.stack.append(cStack);
					
					
					
					//restore program counter
					PC = PCArray.pop();
					$(tokens[ PC ]).removeClass(cls.currentToken); //todo: make tokens jQuery
					
					if(PCArray.length > 0 ){
						$(tokens[PCArray[PCArray.length-1]]).addClass(cls.currentToken);
					}
					
					$("#"+ids.ssePosition ).text(PC);


					//restore framepointer
					framepointer = FPArray.pop();
					$("#"+ids.FPPosition ).text(framepointer);
					
					return true;
				}
				
				/*
					iterate automatically
				*/
				function autoIterate(){
				
					//get delay
					var delay = Number($("#"+ids.sseTimeout).val());
					delay = isNaN( delay ) ? 500 : delay * 1000;
					
					//clear old timeout
					if(com.timeout){
						clearTimeout(com.timeout);
					}
					
					//result variable
					var res;
					
					//iterate
					if( $("#"+ids.sseBackward ).is(":checked")){
						res = prev();
					} else {
						res = next();
					}
					
					if( PC >= 0 && PC <= tokens.length && res){
						//set new timeout
						com.timeout = setTimeout(autoIterate, delay);
					} else {
						//remove old timeout
						clearTimeout(com.timeout);
						com.timeout = null;
						$("#"+ids.sseStartTimer).val('Start');
					}
				}
				
				var str = CompileLabels(com.textarea.val()); //get the text
				var arr = str.split("\n");

				//create a code div
				var code = $("<div>");
				
				var c = 0;
				var tokens = [];

				//create the tokenised code
				for(var i=0;i<arr.length; i++){
					var t = arr[i].split(" ");
					
					for(var j=0;j<t.length;j++) {
					
						tokens.push(
							$("<span>")
							.addClass(cls.codeToken)
							.attr("id", 'token_'+c)
							.html(t[j])
							.appendTo(code)
						);
						
						c++;
					}
					code.append("<br />");
				}
				
				//Setup the html
				
				com.sse.code.html("");
				com.sse.code.append(code);
				com.sse.stack.append(cStack);
				
				//show the main window
				com.sse.main.show().css("zIndex", 100);
				
				//add button click handlers				
				$("#"+ids.sseNext).off("click").click(next);
				$("#"+ids.ssePrev).off("click").click(prev);
				
				$("#"+ids.sseStartTimer).off("click").click(function(){ 
					//add a timeout or remove it}),
					if(com.timeout) {
						$(this).val('Start');
						clearTimeout(com.timeout);
						com.timeout = null;
					} else {
						$(this).val('Stop');
						autoIterate(); 
					}
				});
				
			} else {
				//running the code
				
				var i = 0;
				
				//while we have stuff to do
				while( PC < a.length && PC >= 0 ){
					//valid jump?
					if(typeof this[a[PC]] != 'function'){
						alert("Runtime error: Attempted to jump to numerical token. ");
						break;
					}
					
					//execute command
					if( !this[a[PC]](a[PC+1], a[PC+2], a) ) {
					   break;
					}
					
					//print the new stack
					com.stackEvolution.append(com.stack.print( com.stack.getValues(), framepointer));
					
					
					//break point
					if( ++i >= breakPoint ) {
						alert("Runtime error: Too many instructions... maybe infinite loop. Exceeded: "+breakPoint+" instructions. ");
						break;
					}
				}
				
			}
		}
		
		//Stack Functions
		
		
		//gets the integer value of an editable stack cell
		function val( obj, set ){
			obj = $(obj).children().children().eq(0); //TODO: Remove jQuery if safe
			if(typeof set  != "undefined"){
				$(obj).val(set);
			} else {
				return Number(obj.val());
			}
		}
		
		//get a specefied stack element
		function get( index ){
			index = (typeof index != "undefined")? index : cStack.find("tr").length - 1;
			return cStack.find("tr").eq(cStack.find("tr").length - 1 - index);
		}

		//push an element to the stack
		function push( n, index ){
			n = n ? n : 0;
			index = (typeof index != "undefined")? index : cStack.find("tr").length - 1;
			if(index == -1){
				cStack.append(com.stack.newItem(n));
			} else {
				com.stack.newItem(n).insertBefore(get(index));
			}
			
		}
		
		//pop an element from the stack and return it
		function pop( n ){
			n = (typeof n != "undefined") ? n : cStack.find("tr").length - 1;
			if( n >= cStack.find("tr").length ){
				alert("Runtime error: Index out of bounds. ");
				return null;
			}
			var obj = get(n);
			var v = val(obj);
			obj.remove();
			return v;
		}
				
		//VM Procedures
		
		
		//peek: get the nth element
		this.peek = function(n){ //TODO: Let this work properly within functions
			if( n >= cStack.find("tr").length){
				alert("Runtime error: Index out of bounds. ");
				return null;
			}
			push( val(get(n)) );
			
			PC += 2;
			return this;
		}
		
		
		//poke: replace the nth element
		this.poke = function(n){ //TODO: Let this work properly within functions
			val( get(n), pop());
			
			PC += 2;
			return this;
		}
		
		//add a constant
		this.con = function(n){
			push(n);
			
			PC += 2;
			return this;
		}
		
		//add the two top most elements
		this.add = function(){
			if( cStack.find("tr").length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				return null;
			}
			var x = pop();
			var y = pop();
			push( x+y );
			
			PC += 1;
			return this;
		}
		
		//subtract the two top most elements
		this.sub = function(){
			if( cStack.find("tr").length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				return null;
			}
			var x = pop();
			var y = pop();
			push( x-y );
			
			PC += 1;
			return this;
		}
		
		//multiply the two top most elements
		this.mul = function(){
			if( cStack.children.length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				return null;
			}
			var x = pop();
			var y = pop();
			push( x*y );
			
			PC += 1;
			return this;
		}
		
		//less or equal
		this.leq = function(){
			if( cStack.find("tr").length < 2 ){
				alert("Runtime error: Not enough elements in stack. ");
				return null;
			}
			push( pop()<=pop() ? 1 : 0 );
			
			PC += 1;
			return this;
		}
		
		//jump
		this.jp = function(n){
			if(PC + n < 0 || PC + n >= cInstr.length){
				alert("Runtime error: Jump index out of bounds. ");
				return null;
			}
			
			PC += n;
			return this;
		}
		
		//jump if zero
		this.cjp = function(n){
			if( pop() == 0 ) return this.jp(n);

			PC += 2;
			return this;
		}
		
		//halt
		this.halt = function(){
			PC = -1;
		}

		//procedures

		//proc
		this.proc = function( a, b ){
			a = Number( a );
			b = Number( b );
			if( isNaN(b) || b < 4 ){
				alert("Runtime error: The function can't have less than 4 tokens. ");
			}
			if( runProc ) {
				if(cStack.find("tr").length < a){
					alert("Runtime error: Not enough elements on stack for function call. ");
					return null;
				}
				push(a); //argument number
				push(framepointer); //old framepointer
				push(ret); //return adress
				
				framepointer = cStack.find("tr").length - 1; //framepointer
				PC += 3; //jump to function body
				runProc = false;
			} else {
				this.jp(b); //jump over function body
			}
			return this;
		}

		//call a procedure
		this.call = function(a, b, pgr){
			ret = PC+2; //Return adress
			PC = a;
			runProc = true;//Ok we jumped to the function
			return this.proc(pgr[PC+1], pgr[PC+2], pgr); //run the procedure
		}


		//return
		this["return"] = function(){ //TODO: Make this have only one return value
			
			var fp = framepointer; //get the frampointer
			PC = pop(fp--); //jump back
			if(isNaN(PC)){
				alert("Runtime Error: Frame has been destroyed. ");
				return null;		
			}
			framepointer = pop(fp--); //old framepointer
			var l = pop(fp--); //length
			for(var i=0;i<l;i++){
				pop(fp--);
			}
			
			
			return this;
		}

		//arg: Get the ith argument
		this.arg = function(a){
			var count = val(get(framepointer-2));
			if(a <= 0 || a > count){
				alert("Runtime error: Invalid argument number. ");
				return null;
			}
			push(val(get(framepointer-2-a))); //get the specefied argument
			PC += 2;
			return this;
		}

	};
	
})();

//represents a stack
var Stack = (function(){
	
	var cls = {
		main: 'stack',
		item: 'stackItem',
		input: 'input',
		actions: 'actions',
		printMain: 'stackPrint'
	}
		
	return function( values ){
		var cStack	= null;
		var acc = [];
		
		/** Private methods **/
		
		//Create a new item with value val
		function newItem( val ){
			
			val = val ? val : 0;
			
			//Create the cell
			var wrapper	= $('<tr>');
			
			var obj	= $("<td>").addClass(cls.item).appendTo(wrapper)
			.append(
				$("<input type='text'>").val(val).addClass(cls.input)
			);
			
			$("<td>").addClass(cls.actions).appendTo(wrapper).append(
				$("<a>").addClass("action").attr("href", "javascript:void(0); ").text("+").click(function(){
					$(this).parent().parent().before(newItem(0));
				}),
				$("<a>").addClass("action").attr("href", "javascript:void(0); ").text("-").click(function(){
					$(this).parent().parent().remove(); 
				})
			);
			
			return wrapper;
		}
		
		//public wrapper for newItem
		this.newItem = newItem;
		
		//get the values of the stack
		this.getValues	= function(){
			var values = [];
			
			cStack.find("input."+cls.input).each(function(i, e){
				values.push(parseInt($(e).val())); //TODO: Check if invalid
			});
			
			values.reverse();
			return values;
		}
		
		//print the stack		
		this.print = function( values, framepointer) {
			
			values = values.reverse();
			
			var s = $('<span>').addClass(cls.printMain);
			
			//No framepointer
			if(framepointer != -1){
				var start = values.length-framepointer-1;
				var end = start+values[values.length-framepointer+1]+3;
			}
			//Framepointer
			for(var i=0;i<values.length;i++){
				if(framepointer != -1 && i < end && i >= start){
					s.append($('<div>').addClass(cls.item+" frame").text(values[i]));
				} else {
					s.append($('<div>').addClass(cls.item).text(values[i]));
				}
			}

			return s.data("values", values);
		}
		
		//Create an editable stack
		this.editable = function( values ){			
			var s = $("<table>")
			.addClass(cls.main)
			.css({
				"cellSpacing":0, 
				"cellPadding":0
			});
			
			for(var i=0;i<values.length;i++){
				s.append(newItem(values[i]));
			}
			
			cStack = s;
			
			return s;
		}
		
	}
	
})();