var tp = {
	fontSize:11,
	
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
	}
}

$(function() {
	// setup editor
	tp.editor = ace.edit("editor");
    tp.editor.setTheme("ace/theme/eclipse");
    tp.editor.getSession().setMode("ace/mode/python");
	
	// setup skulpt
	Sk.pre = "output";
	Sk.canvas = "canvas";
	Sk.configure({output:tp.printLine, read:tp.readFile});
	
	
	// set defaults
	tp.setFontSize(tp.fontSize);
	
	// set height
	$("#editor").height($.mobile.getScreenHeight() - 150);
	canvas = $('#canvas');
	canvas[0].height = 400;
	canvas[0].width = $("body").width()
	
	// add button handlers
	$("a.ui-btn").click(onClick);
});

function onClick(e){
	switch(e.currentTarget.id) {
		
		case 'btn_LargerText':
			tp.setFontSize(tp.fontSize + 1);
		break;
		
		case 'btn_SmallerText':
			tp.setFontSize(tp.fontSize - 1);
		break;
		
		case 'btn_Run':
			$('#output').text('');
			try {
			  eval(Sk.importMainWithBody("<stdin>",false,tp.editor.getValue())); 
			}
			catch(e) {
			   alert(e.toString())
			}
		break;
		
		case 'btn_UpArrow':
			tp.editor.selection.moveCursorUp();
		break;
		
		case 'btn_DownArrow':
			tp.editor.selection.moveCursorDown();
		break;
		
		case 'btn_LeftArrow':
			tp.editor.selection.moveCursorLeft();
		break;
		
		case 'btn_RightArrow':
			tp.editor.selection.moveCursorRight();
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
}