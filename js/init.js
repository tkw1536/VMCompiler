$(function(){    
	var VMC = new VMCompiler({//Ids for all the stuff
		textarea             : 'VMC_textarea', 
		stackHolder          : 'VMC_stackHolder', 
		compileButton        : 'VMC_Compile',
		startButton          : 'VMC_Start',
		sseButton            : 'VMC_SSE',
		stackEvolution       : 'VMC_stackEvolution',
		overlay              : 'overlay',
		optMaxInstructions   : 'opt_maxInstructions',
		sseCode              : 'SSE_code',
		sseStack             : 'SSE_stack',
		sseEvolution         : 'SSE_evolution',
		sseNext              : 'SSE_next',
		ssePrev              : 'SSE_prev',
		sseStartTimer        : 'SSE_startTimer',
		sseTimeout           : 'SSE_timeout',
		sseForward           : 'SSE_timer_forward',
		sseBackward          : 'SSE_timer_backward',
		ssePosition          : 'SSE_position',
		sseClose             : 'SSE_close',
		FPPosition           : 'FP_position',
		resetStack           : 'opt_resetstack'
	});

	var menu        = $('#menu');
	var links       = menu.find('.link');
	var containers  = menu.find('.container');
	var selected    = false;


	//For the tabs
	links.each(function(i){
		$(this)
		.data("menuIndex", i)
		.click(function(){
			var $this = $(this);
			if($this.is(selected)){
				deselect($this);
				selected = false;
			} else {
				select($this);
			}
		});
	});

	menu.find('table tr').each(function(i){//beautify the tables
		$(this).addClass((i % 2 == 0)? 'even': 'odd');
	});


	var select = function (elem){
		if(selected instanceof jQuery){
			deselect(selected);		
		}

		containers.eq(elem.data("menuIndex")).show();
		elem.addClass("selected");

		selected = elem;
	};

	var deselect = function(elem){
		elem.removeClass("selected");
		containers.eq(elem.data("menuIndex")).hide();
	}
	

	select($(links.eq(0))); //Init tabs
});
