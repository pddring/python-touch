// todo: save files as images?! http://www.peter-eigenschink.at/projects/steganographyjs/

var tp = {
	fontSize:11,
	
	resetDebug: function() {
		$('#output').text('');
		$('#debug_variables_table').html('');
		$('#debug_status').html('Press "Run all lines" to start the program');
		tp.debug = tp.startDebug;
		//tp.editor.gotoLine(1);
	},
	
	debug: function() {
		tp.startDebug();
	},
	
	startDebug: function() {
		$('#output').text('');
		
		tp.handlers["Sk.debug"] = function(susp) {
				try {				
					var lineNumber = susp.child.lineno;
					var lineText = tp.editor.session.getLine(lineNumber - 1);
					
					//setTimeout(function() {
					tp.editor.gotoLine(lineNumber);
					//	}, 500);
					

					
					var vars = '<table id="vars"><tr><th>Name</th><th>Type</th><th>Value</th></tr>';
					var varsList = [];
					// show locals
					for(variable in susp.child.$gbl) {
						v = susp.child.$gbl[variable];
						// check for built in types
						if(v.__class__) {
							switch(v.__class__.tp$name) {
								case 'str':
								v.skType = "string"
								break;
							}
						}
						
						// check for objects
						if(v.instance) {
							v.skType = v.instance.constructor.name;
						}
						
						if(v.v === undefined) {
							v.v = "";
						}
						
						// add variable to table
						if(v.skType) {
							
							vars += '<tr><td><span class="var_name" id="var_name_' + variable + '">' + variable + '</span></td><td>' + v.skType + '</td><td>' + v.v + '</td></tr>';
							varsList[variable] = v;
						}
						

					}
					vars += '</table>';
					
					// replace all references to variables in source code with links to debug table
					for(v in varsList) {
						regex = new RegExp("\\b" + v + "\\b", "g");
						lineText = lineText.replace(regex, '<span class="var_name_link">' + v + '</span>');
					}
					
					$("#debug_status").html('<span class="code"><span class="line_number"><input type="button" value="line ' + lineNumber + '" id="btn_goto_line_' + lineNumber + '" data-inline="true" data-mini="true"></span> ' + lineText  + '</span>');
					$('#debug_variables_table').html(vars);
					$('#btn_goto_line_' + lineNumber).button().click(function() {
						$.mobile.navigate("#code");						
					});
					
					$('.var_name_link').click(function(e) {
						var html = '';
						var varName = e.currentTarget.innerHTML;
						var selectedVar = varsList[varName];
						$("#var_name_" + varName).each(function() {
							$('#debug_variables').collapsible('option', 'collapsed', false);
							var target = $(this);
							$('html, body').animate({
								scrollTop: target.offset().top
							}, 1000);
							target.css({
								"background-color": '#6FF'
							});
							setTimeout(function() {
								target.css({
									"background-color": 'transparent'
								});
							}, 1000);
						});
					})
					
					
					var p = new Promise(function(resolve,reject){
						
						tp.debug = function() {
							resolve(susp.resume());
						};
						
					});
					
					return p;
				} catch(e) {
					return Promise.reject(e);
				}
			};
	},
	
	run: function(step) {
		tp.handlers = {};
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
			tp.debug();
		
			
			
		} else {
			$('#output').text('');
		
			// show canvas if using turtle module, otherwise hide it
			if(code.indexOf("turtle") > 0) {
				$('#canvas_holder').collapsible();
				$('#canvas_holder').collapsible('option', 'collapsed', false);
			} else {
				$('#canvas_holder').collapsible();
				$('#canvas_holder').collapsible('option', 'collapsed', true);
			}
			$('#debug_status').html('Running program...');
			tp.handlers["Sk.debug"] = function(susp) {
				try {
				} catch(e) {
					Promise.reject(e);
				}
			}
		}
		
		Sk.misceval.callsimAsync(tp.handlers, function() {
			return Sk.importMainWithBody("python_touch",false,code,true);
		}).then(function(module){
			$('#debug_status').html("Program finished running");
		}, function(e){
			$('#debug_status').html("Program interrupted: " + e.toString());
		});
	},
	
	// code has changed
	onChangeText: function() {
		tp.resetDebug();
		/*if(btoa) {
			console.log(btoa(tp.editor.getValue()));
		}*/
		
	},
	
	onChangeSelection: function() {
		if(tp.selectionTimeout) {
			clearTimeout(tp.selectionTimeout);
			tp.selectionTimeout = null;
		} 
		tp.selectionTimeout = 
		setTimeout(function() {
			pos = $(".ace_cursor").position();			
			ed = $("#editor");
			xOffset = (pos.left < ed.width() / 2)? 100: 0-$('#floating_shortcut').width();
			yOffset = (pos.top< ed.height() / 2)? 20: -40;
			$("#floating_shortcut").stop().animate({"left": pos.left + xOffset, "top": pos.top + yOffset});
		}, 1000);
	},
	
	save: function() {
		var code = tp.editor.getValue();
		var ls = window.localStorage;
		if(ls !== "undefined") {
			ls.setItem("code", code);
		}
	},
	
	load: function() {
		var ls = window.localStorage;
		if(ls !== "undefined") {
			tp.editor.setValue(ls.getItem("code"));
		}
	},
	
	onClick: function onClick(e){
		var id = e;
		try {
			id = e.currentTarget.id;
		} catch(ex) {
			id = e;
		}
		id = id.replace(/^fsc_/, "");
		switch(id) {
			case 'btn_shortcuts':
			break;
			case 'btn_save':
				tp.save();
			break;
			
			case 'btn_saveAs':
				var code = tp.editor.getValue();
				var a = document.createElement('a');
				var blob = new Blob([code], {'type':'application\/octet-stream'});
				a.href=window.URL.createObjectURL(blob);
				a.download = "python.py";
				a.click();
				
			break;
			
			case 'btn_load':
				tp.load();
			break;
			
			case 'btn_LargerText':
				tp.setFontSize(tp.fontSize + 1);
			break;
			
			case 'btn_SmallerText':
				tp.setFontSize(tp.fontSize - 1);
			break;
			
			case 'btn_Run':
				tp.run(false);
			break;
			
			case 'btn_dbgStep':
			case 'btn_DebugStep':
				tp.run(true);
			break;
			
			case 'btn_dbgReset':
			case 'btn_DebugReset':
				tp.resetDebug();
			break
			
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
			
			case 'btn_saveAsImage':
				$.mobile.navigate("#saveImage");
			break;
			
			case 'btn_loadFromImage':
				$.mobile.navigate("#loadImage");
			break;
			
			default:
				switch(e.currentTarget.text) {
					case 'Home':
					case 'Code':
					case 'Settings':
					break;
					default:
						console.log(e.currentTarget, e.currentTarget.text);
						tp.editor.insert(e.currentTarget.text);
						break
				}
	
			break;
		}
		if(e != id) tp.onCancelTapHold(e);
		tp.editor.focus();
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
	tp.editor.on("change", tp.onChangeText);
	
	
	
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
	$('#chk_embed_output').on('change', function(e) {
		var outputHolder = $(e.currentTarget).is(":checked")? $('#code_output_parent') : outputHolder = $('#output_holder');
		if(outputHolder) {
			outputHolder[0].appendChild($('#output_sections')[0]);
			outputHolder.trigger('create');
		}
	});
	
	var updateChkShortcut = function(jqo) {
		// remove links
		var linkCallback = function(index, object) {
			$('#fsc_' + object.id).remove();
		}
		if(jqo.is(":checked")) {
			// add links
			linkCallback = function(index, object) {
				var text = $(object).text();
				if(text.length > 1)
					text = "&nbsp;";
				var html = '<a class="fsc ' + $(object).attr('class') + '" id="fsc_' + object.id + '">' + text + '</a>';
				$('#floating_shortcut div.ui-controlgroup-controls').append(html);
			}
		} 
		jqo.parent().parent().siblings("a").each(linkCallback);
		$('a.fsc').unbind().click(tp.onClick);
	};
	
	$('.chk_shortcut input[type=checkbox]').change(function(e) {
		updateChkShortcut($(e.currentTarget));
	});
	var jqo = $('#chk_shortcut_arrow_keys').attr("checked", true);	
	setTimeout(function(){
		updateChkShortcut(jqo);
	}, 1000);
	
	// load image
	$('#imgLoad').change(function() {
		var file = $("#imgLoad")[0].files[0];
		alert("loading");
		if (typeof FileReader !== "undefined") {
			var img = $('#img_data_load')[0];
			var reader;
			reader = new FileReader();
			reader.onload = (function (theImg) {
				return function (evt) {
					theImg.src = evt.target.result;
					
					var code = steg.decode(theImg);

					tp.editor.setValue(code);
					$('#img_load_status').html(code.length + ' bytes read from image: <a href="#code">Click here to see the code</a>');
					
				};
			}(img));
			reader.readAsDataURL(file);
		} else {
			alert("Could not load file");
		}
	});
	
	// upload image handler
	$('#imgSaveAs').change(function() {
		var file = $("#imgSaveAs")[0].files[0];
		if (typeof FileReader !== "undefined") {
			var img = $('#img_data_load')[0];
			var reader;
			alert("Saving");
			reader = new FileReader();
			reader.onload = (function (theImg) {
				return function (evt) {
					theImg.src = evt.target.result;
					
										
					
					var output = steg.decode(theImg);
				};
			}(img));
			reader.onerror = function(e) {
				alert("Could not load file" + e);
			}
			reader.readAsDataURL(file);
		} else {
			alert("Could not load file");
		}
	});
});
