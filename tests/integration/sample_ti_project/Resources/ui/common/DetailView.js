function DetailView() {
	var self = Ti.UI.createView();
	
	var lbl = Ti.UI.createLabel({
		text:'Please select an item',
		className: 'Label',
		color:'#000'
	});
	self.add(lbl);
	
	self.addEventListener('itemSelected', function(e) {
		lbl.text = e.name+': $'+e.price;
	});
	
	return self;
};

module.exports = DetailView;
