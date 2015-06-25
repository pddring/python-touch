var tp = {
	fontSize:11,
	
	run: function(step) {
		
		
		$('#output').text('');
		
		var code = tp.editor.getValue();
		
		// show canvas if using turtle module, otherwise hide it
		if(code.indexOf("turtle") > 0) {
			$('#canvas_holder').collapsible();
			$('#canvas_holder').collapsible('option', 'collapsed', false);
		} else {
			$('#canvas_holder').collapsible();
			$('#canvas_holder').collapsible('option', 'collapsed', true);
		}
		
		if(step) {
		
		
			var handlers = {};
			handlers["Sk.debug"] = function(susp) {
				try {				
					var lineNumber = susp.child.lineno;
					var lineText = tp.editor.session.getLine(lineNumber - 1);
					

					
					var vars = '<table id="vars"><tr><th>Name</th><th>Type</th><th>Value</th></tr>';
					
					// show locals
					for(variable in susp.child.$gbl) {
						v = susp.child.$gbl[variable];
						
						if(v.__class__) {
							switch(v.__class__.tp$name) {
								case 'str':
								v.skType = "string"
								break;
							}
						}
						if(v.v) {
							
							vars += '<tr><td>' + variable + '</td><td>' + v.skType + '</td><td>' + v.v + '</td></tr>';
						}

					}
					vars += '</table>';
					
					$("#debug_status").html('<span class="line_number">line ' + lineNumber + '</span> <span class="code">' + lineText  + '</span>');
					$('#debug_variables_table').html(vars);
					
					
					var p = new Promise(function(resolve,reject){
						$('#btn_DebugStep').unbind().click(function() {
							resolve(susp.resume());
						});
						
						$('#btn_DebugReset').unbind().click(function() {
							$('#output').text('');
							reject("Project reset");
						})
					});
					
					return p;
				} catch(e) {
					return Promise.reject(e);
				}
			};
		}
		
		Sk.misceval.callsimAsync(handlers, function() {
			return Sk.importMainWithBody("python_touch",false,code,true);
		}).then(function(module){
			$('#debug_status').html("Program finished running");
			$('#btn_DebugStep').unbind().click(tp.onClick);
		}, function(e){
			$('#debug_status').html("Program interrupted: " + e.toString());
			$('#btn_DebugStep').unbind().click(tp.onClick);
		});
	},
	
	onChangeSelection: function() {
		pos = $(".ace_cursor").position();
		ed = $("#editor");
		xOffset = (pos.left < ed.width() / 2)? 100: -100;
		yOffset = (pos.top< ed.height() / 2)? 20: -40;
		$("#floating_shortcut").stop().animate({"left": pos.left + xOffset, "top": pos.top + yOffset});
	},
	
	onClick: function onClick(e){
		var id = e;
		try {
			id = e.currentTarget.id;
		} catch(ex) {
			id = e;
		}
		switch(id) {
			
			case 'btn_LargerText':
				tp.setFontSize(tp.fontSize + 1);
			break;
			
			case 'btn_SmallerText':
				tp.setFontSize(tp.fontSize - 1);
			break;
			
			case 'btn_Run':
				tp.run(false);
			break;
			
			case 'btn_DebugStep':
				tp.run(true);
			break;
			
			case 'btn_Undo':
				tp.editor.undo();
			break;
			
			case 'btn_Redo':
				tp.editor.redo();
			break;
			
			case 'btn_Delete':
				if(tp.editor.getCopyText() == "") {
					tp.editor.selection.selectRight();
				}
				tp.editor.session.replace(tp.editor.selection.getRange(), "");
				
			break;
			
			case 'btn_Backspace':
				if(tp.editor.getCopyText() == "") {
					tp.editor.selection.selectLeft();
				}
				tp.editor.session.replace(tp.editor.selection.getRange(), "");
			break;
			
			case 'btn_Copy':
				tp.clipboard = tp.editor.getCopyText();
			break;
			
			case 'btn_Cut':
				tp.clipboard = tp.editor.getCopyText();
				tp.editor.session.replace(tp.editor.selection.getRange(), "");
			break;
			
			case 'btn_Paste':
				tp.editor.insert(tp.clipboard);
			break;
			
			case 'btn_UpArrow':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorUp();
			break;
			
			case 'btn_DownArrow':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorDown();
			break;
			
			case 'btn_LeftArrow':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorLeft();
			break;
			
			case 'btn_RightArrow':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorRight();
			break;
			
			case 'btn_LeftArrowWord':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorWordLeft();
			break;
			
			case 'btn_RightArrowWord':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorWordRight();
			break;
			
			case 'btn_LeftArrowLine':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorLineStart();
			break;
			
			case 'btn_RightArrowLine':
				tp.editor.selection.clearSelection();
				tp.editor.selection.moveCursorLineEnd();
			break;
			
			case 'btn_UpSelect':
				tp.editor.selection.selectUp();
			break;
			
			case 'btn_DownSelect':
				tp.editor.selection.selectDown();
			break;
			
			case 'btn_LeftSelect':
				tp.editor.selection.selectLeft();
			break;
			
			case 'btn_RightSelect':
				tp.editor.selection.selectRight();
			break;
			
			case 'btn_LeftSelectWord':
				tp.editor.selection.selectWordLeft();
			break;
			
			case 'btn_RightSelectWord':
				tp.editor.selection.selectWordRight();
			break;
			
			case 'btn_LeftSelectLine':
				tp.editor.selection.clearSelection();
				tp.editor.selection.selectLineStart();
			break;
			
			case 'btn_RightSelectLine':
				tp.editor.selection.clearSelection();
				tp.editor.selection.selectLineEnd();
			break;
			
			case 'btn_RightIndent':
				tp.editor.selection.moveCursorLineStart();
				tp.editor.indent()
			break;
			
			case 'btn_LeftIndent':
				tp.editor.selection.moveCursorLineStart();
				tp.editor.blockOutdent()
			break;
			
			default:
				switch(e.currentTarget.text) {
					case 'Home':
					case 'Code':
					case 'Settings':
					break;
					default:
						tp.editor.insert(e.currentTarget.text);
						break
				}
	
			break;
		}
		if(e != id) tp.onCancelTapHold(e);
	},
	
	clipboard: "",
	
	// set editor text size
	setFontSize: function(size) {
		tp.fontSize = size;
		$('#editor').css('font-size', size + "pt");
	},
	
	// Skulpt output for print function
	printLine: function(text) {
		$("#output").append(text);
	},
	
	// Skulpt read from frile
	readFile: function(x) {
		if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
	    return Sk.builtinFiles["files"][x];
	},
	
	// on resize handler
	onResize: function() {
		$("#editor").height($.mobile.getScreenHeight() - 90);
		canvas = $('#canvas');
		canvas[0].height = 400;
		canvas[0].width = $("body").width()
	},
	
	// on tap and hold handler for repeated cursor movement
	onTapHold: function(e) {
		tp.repeatingBtnId = e.currentTarget.id;
		tp.tapTimeout(100);
	},
	
	// repeated when a button is held down
	tapTimeout: function(e) {
		if(tp.repeatingBtnId) {
			tp.onClick(tp.repeatingBtnId);
			setTimeout(tp.tapTimeout, 100);
		}
	},
	
	// cancels a button being held down to repeat
	onCancelTapHold: function(e) {
		tp.repeatingBtnId = null;
	},
	
	// stores which button is being held down
	repeatingBtnId: null,
}

$(function() {
	// setup editor
	tp.editor = ace.edit("editor");
    tp.editor.setTheme("ace/theme/eclipse");
    tp.editor.getSession().setMode("ace/mode/python");
	tp.editor.on("changeSelection", tp.onChangeSelection);
	
	
	
	// setup skulpt
	Sk.pre = "output";
	Sk.canvas = "canvas";
	(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'canvas';
	Sk.externalLibraries = {
		pi2go: {
			path:'lib/skulpt/pi2go/__init__.js',
			dependencies: []
		}
		};
	Sk.configure({breakpoints:function(filename, line_number, offset, s) {
		return true;
	}, debugging:true,output:tp.printLine, read:tp.readFile});
	Sk.inputfun = function(prompt) {
		var p = new Promise(function(resolve, reject) {
			tp.printLine('<div id="raw_input_holder"><label for="raw_input">' + prompt + '</label><input type="text" name="raw_input" id="raw_input" value=""/><button class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-check" id="raw_input_accept">OK</button><button class="ui-btn ui-btn-inline ui-btn-icon-left ui-icon-delete" id="raw_input_cancel">Cancel</button></div>');
			$('#raw_input_accept').click(function() {
				var val = $('#raw_input').val();
				$('#raw_input_holder').remove();
				tp.printLine(prompt + ' <span class="console_input">' + val + "</span>\n");
				resolve(val);
			});
			$('#raw_input_cancel').click(function() {
				$('#raw_input_holder').remove();
				tp.printLine(prompt + ' <span class="console_input">USER CANCELLED PROGRAM</span>\n');
				reject('user cancelled program');
			});
			$('#raw_input_holder').trigger("create");
			$('#raw_input').focus();
		});
		return p;
	}
	// set defaults
	tp.setFontSize(tp.fontSize);
	
	// set height
	tp.onResize(null);
	$(window).resize(tp.onResize);
	
	// add button handlers
	$("a.ui-btn, input.btn").click(tp.onClick);
	$("#btn_UpArrow,#btn_DownArrow,#btn_LeftArrowWord,#btn_RightArrowWord,#btn_LeftArrow,#btn_RightArrow,   #btn_UpSelect,#btn_DownSelect,#btn_LeftSelectWord,#btn_RightSelectWord,#btn_LeftSelect,#btn_RightSelect").on("taphold", tp.onTapHold);
});
