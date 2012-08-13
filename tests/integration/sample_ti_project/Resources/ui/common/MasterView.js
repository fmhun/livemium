//Master View Component Constructor
function MasterView() {
	//create object instance, parasitic subclass of Observable
	var self = Ti.UI.createView({
		backgroundColor:'white',
		className: 'MasterView'
	});
	
	var view = Ti.UI.createView({
		className: 'View'
	});
	
	var view2 = Ti.UI.createView({
		className: 'View2'
	});
	
	var label = Ti.UI.createLabel({
		className: 'Label'
	});
	
	view.add(label);
	self.add(view);
	self.add(view2);
	
	/*
	var table = Ti.UI.createTableView({
		className: 'TableView'
	});
	
	var tableData = [];
	
	for (var i = 0; i <= 5; i++) {
		var row = Ti.UI.createTableViewRow({
		  touchEnabled: true,
			className: 'TableViewRow',
		});
		tableData.push(row);
	}
	
	table.setData(tableData);
	self.add(table);
	
	//add behavior
	table.addEventListener('click', function(e) {
//		self.fireEvent('itemSelected', {
//			name:e.rowData.title,
//			price:e.rowData.price
//		});
	});
	*/
	return self;
};

module.exports = MasterView;