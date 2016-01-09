var $builtinmodule = function (name) {
    var csv = {};
	
	csv.reader = Sk.misceval.buildClass(csv, function($gbl, $loc) {
		$loc.__init__ = new Sk.builtin.func(function(self, file) {
			self.file = file;
			var rows = file.data$.split("\n");
			var data = [];
			for(var i = 0; i < rows.length; i++) {
				if(rows[i].length > 0) {
					var r = rows[i].split(",");
					for(var j = 0; j < r.length; j++) {
						r[j] = new Sk.builtin.str(r[j]);
					}
				
					data.push(new Sk.builtin.list(r));
				}
			}
			self.data = Sk.builtin.list(data);
		});
		
		$loc.__iter__ = new Sk.builtin.func(function(self) {
			return self.data.list_iter_();
		});
		
		
	});
	
	csv.writer = Sk.misceval.buildClass(csv, function($gbl, $loc) {
		$loc.__init__ = new Sk.builtin.func(function(self, file) {
			self.file = file;
		});
		
		var writerow = function(self, data) {
			var s = "";
			for(var i = 0; i < data.v.length; i++) {
				s += Sk.builtin.str(data.v[i]).v;
				s += (i < data.v.length - 1)?',' : '\n';
			}
			tp.writeFile(self.file, s);
		}
		
		$loc.writerows = new Sk.builtin.func(function(self, data) {
			for(var i = 0; i < data.v.length; i++) {
				writerow(self, data.v[i]);
			}
		});
		
		$loc.writerow = new Sk.builtin.func(writerow);
	});
    return csv;
};
