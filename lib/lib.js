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
	
	// add button handlers
	$("a.ui-btn").click(onClick);
});

function onClick(e){
	console.log(e.currentTarget.id);
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
	}
}