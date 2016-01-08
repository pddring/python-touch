

var tp = {
	fontSize:11,
	
	files:{"python_touch.py":"", "sample.py":"", "data.txt":"test1\ntest2"},
	
	manageFiles: function() {
		alert("Managing files");
	},
	
	Base64: {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=tp.Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=tp.Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}},
	
	updateFileList:function() {
		var html = '';
		for(var key in tp.files) {
			html += '<option>' + key + '</option>';
		}
		html += 'Manage files';
		
		$('#filename').html(html);
	},
	
	showFile: function(filename) {
		var code = tp.files[filename];
		$('#filename').val(filename).selectmenu("refresh", true);
		tp.editor.setValue(code);
	},
	
	share: function() {
		var filename = $("#filename").val();
		var value = tp.editor.getValue();
		tp.files[filename] = value;
		tp.files['.currentfile'] = filename;
		var data = JSON.stringify(tp.files);
		delete tp.files['.currentfile'];
		
		return tp.Base64.encode(data);
		
	},
	
	loadShare:function(b64files) {
		var files = JSON.parse(tp.Base64.decode(b64files));
		var filename = files['.currentfile'];
		delete files['.currentfile'];
		tp.files = files;
		tp.showFile(filename);
	},
	
	setStatus: function(message, error) {
		// change colour depending on if it's an error message or not
		if(tp.animateStep && !error) {
			$('.debug_status').html(message);		
		} else {
			$('.debug_status').css({'background-color':error?'rgba(255,0,0,0.5)':'rgba(0,255,0,0.5'}).html(message);		
		}
		
	},
	
	resetDebug: function() {
		$('#output').text('');
		$('#debug_variables_table').html('');
		tp.setStatus('Press "Run all lines" to start the program', false);
		$("#canvas").html("");
		tp.debug = tp.startDebug;
		//tp.editor.gotoLine(1);
	},
	
	debug: function() {
		return tp.startDebug();
	},
	
	startDebug: function() {
		$('#output').text('');
		tp.handlers = {};
		tp.ignoreFirstLine = 0;
		tp.handlers["Sk.debug"] = function(susp) {
				try {				
					var lineNumber = susp.child.lineno;
					var lineText = tp.editor.session.getLine(lineNumber - 1);
					firstTime = false;
					if(tp.ignoreFirstLine == 0) {
						tp.ignoreFirstLine = lineNumber;
						firstTime = true;
					}
					
					
					
					if(tp.ignoreFirstLine != lineNumber || firstTime == true) {
						// block unwanted suspensions from making editor jump to old / random lines
						//if(tp.nextLineStepTimeout)
							//clearTimeout(tp.nextLineStepTimeout);
						//alert("starting " + lineNumber);	
						//tp.nextLineStepTimeout = setTimeout(function() {
							tp.editor.gotoLine(lineNumber);
						//}, 500);
					}
					

					
					var vars = '<table id="vars"><tr><th>Name</th><th>Type</th><th>Value</th></tr>';
					var varsList = [];
					
					skToString = function(v) {
						if(!v) return "";
						var typeName = undefined;
						typeName = v.tp$name;
						
						
						if(typeName) {
							switch(typeName) {
								case 'string':
								return '"' + v.v + '"';
								break;
								
								case 'str':
								case 'bool':
								case 'number':
								return v.v;
								break;
								
								case 'list':
								{
									var contents = "[";
									for(var i = 0; i < v.v.length; i++) {
										contents += skToString(v.v[i]);
										if(i < v.v.length-1)
											contents += ", ";
									}
									contents += "]";
									return contents;
								}
								break;
								
								case 'dict':
								Sk.dict = v;
								return v.$r().v;
								break;
							}
						} 
						
						return "not implemented yet: " + v.tp$name;
					}
					
					// show locals
					for(variable in susp.child.$gbl) {
						v = susp.child.$gbl[variable];
						
						if(!v.skType) {
							
							// check for objects
							if(v.instance) {
								v.skType = v.instance.constructor.name;
							} else {
								if(v.tp$name) {
									v.skType = v.tp$name;
								}
							}
							
							// check for built in types
							if(v.__class__) {
								switch(v.__class__.tp$name) {
									case 'str':
									v.skType = "string"
									break;
									
									case 'list':
									v.skType = "list";
									break;
									
									case 'dict':
									v.skType = "dictionary";
									break;
								}
							}
							
						}
						if(v.v === undefined) {
							v.v = "";
						}
						
						v.v = skToString(v);
						
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
					
					tp.setStatus('<span class="code"><span class="line_number"><input type="button" value="line ' + lineNumber + '" class="btn_goto_line_' + lineNumber + '" data-inline="true" data-mini="true"></span> ' + lineText  + '</span>', false);
					$('#debug_variables_table').html(vars);
					$('.btn_goto_line_' + lineNumber).button().click(function() {
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
							return resolve(susp.resume());
						};
						
					});
					return p;
					
				} catch(e) {
					return Promise.reject(e);
				}
			};
	},
	
	run: function(step) {
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
			tp.setStatus('Running program...', false);
			tp.handlers = [];
			tp.handlers["Sk.debug"] = function(susp) {
				/*try {
					if(tp.cancel) {
						console.log("Cancelled")
						Promise.reject("Cancelled");
					}
				} catch(e) {
					Promise.reject(e);
				}*/
			}
		}
		
		Sk.misceval.callsimAsync(tp.handlers, function() {
			return Sk.importMainWithBody("python_touch",false,code,true);
		}).then(function(module){
			tp.setStatus("Program finished running", false);
		}, function(e){
			tp.setStatus("Program interrupted: " + e.toString(), true);
		});
	},
	
	// code has changed
	onChangeText: function() {
		tp.resetDebug();
		var filename = $("#filename").val();
		var value = tp.editor.getValue();
		tp.files[filename] = value;
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
			yOffset = (pos.top< ed.height() / 2)? 50: -90;
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
						//console.log(e.currentTarget, e.currentTarget.text);
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
		var e = $("#output").append(text)[0];
		e.scrollTop = e.scrollHeight;
	},
	
	// Skulpt read from frile
	read: function(x) {
		if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
            throw "File not found: '" + x + "'";
	    return Sk.builtinFiles["files"][x];
	},
	
	createFile: function(filename) {
		tp.files[filename] = "";
		tp.updateFileList();
	},
	
	writeFile: function(file, str) {
		if(file.closed) 
			throw new Sk.builtin.ValueError("I/O operation on closed file");
		
		if(file.mode.v !== "w")		
			throw new Sk.builtin.IOError("File not open for writing");

		if(tp.files[file.name.v]) {
			tp.files[file.name.v] += str;
		} else {
			tp.files[file.name.v] = str;
		}
		tp.updateFileList();
	},
	
	readFile: function(x) {
		// check to see if file exists
		if(tp.files[x] !== undefined)
			return tp.files[x];
		
		throw "File not found: '" + x + "'";
	},
	
	// on resize handler
	onResize: function() {
		$("#editor").height($.mobile.getScreenHeight() - 170);
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
	
	tp.updateFileList();
	
	// add change handler for filename selector
	$("#filename").change(function(e){
		var selectedFile = $(this).val();
		if(selectedFile == "Manage files") {
			tp.manageFiles();
		} else {
			tp.showFile(selectedFile);
		}
	});
	
	
	
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
	}, debugging:true,output:tp.printLine, read:tp.read, readFile:tp.readFile, write:tp.writeFile, createFile:tp.createFile});
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
		if($(e.currentTarget).is(":checked")) {
			$('#quick_run_options').css({'display':'block'});
			$('#btn_RunPanel').attr({href:''}).click(function() {
				
				var animRun = function(interval) {
					$('#quick_run_options').css({'display':'none'});
					$('#btn_RunPanel').text("Stop").click(function() {
						$('#btn_RunPanel').text("Run");
						$('#quick_run_options').css({'display':'block'});
						if(tp.animateStep)
							clearInterval(tp.animateStep);
					});
					if(tp.animateStep)
							clearInterval(tp.animateStep);

					var toggleValue = true;	
					var dbg = $('.debug_status');
					dbg.css({'transition': 'all ' + interval + 'ms;'});	
					var step = function() {
						tp.run(true);
						dbg.css({'background':'linear-gradient(to right, ' + (!toggleValue?'rgba(0,255,0,0.5)':'rgba(255,255,255,0.5)') + ' , ' + (toggleValue?'rgba(0,255,0,0.5)':'rgba(255,255,255,0.5)') +');'});		
						toggleValue = !toggleValue;
					}
					tp.animateStep = setInterval(function() {
						step();
					}, interval);
					step();
				}
				
				switch($('#quick_run_action').val()) {
					case 'run_all':
						tp.run(false);
					break;
					
					case 'run_step':
						tp.run(true);
					break;
					
					case 'run_animate_1':
						animRun(5000);
					break;
					
					case 'run_animate_2':
						animRun(2000);
					break;
					
					case 'run_animate_3':
						animRun(500);
					break;
					
					case 'run_reset':
						if(tp.animateStep)
							clearInterval(tp.animateStep);
						tp.resetDebug();
					break;
				}
			});
		} else {
			$('#quick_run_options').css({'display':'none'})
			$('#btn_RunPanel').unbind().attr({href:'#run'});
		}
		
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
			var img = $('#img_data_src')[0];
			var reader;
			reader = new FileReader();
			reader.onload = (function (theImg) {
				return function (evt) {
					theImg.src = evt.target.result;
					
					var output = steg.encode(tp.editor.getValue(), theImg);
					$('#img_data_dest')[0].src = output;
				};
			}(img));
			reader.onerror = function(e) {
				alert("Could not load file");
			}
			reader.readAsDataURL(file);
		} else {
			alert("Could not load file");
		}
	});
	
	// load sample
	$('.btn_sample').click(function(e) {
		var id = e.currentTarget.id.replace(/^sample_/, "");
		
		var code = $('#code_sample_' + id).text();
		tp.editor.setValue(code);
		$.mobile.navigate("#code");
		$('#filename').val('sample.py').selectmenu('refresh');
		tp.editor.gotoLine(1);
		//console.log(code);
	});
});
