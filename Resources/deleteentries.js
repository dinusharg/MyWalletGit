exports.deleteentries = function(subTitle) {
	
	var activeAccountId = null;

	function deleteExpenceData(tableID) {
		var db = Ti.Database.open('mywallet');
		db.execute('DELETE FROM tbl_expence WHERE id=' + tableID);
		db.close();
		return true;
	}

	function paidInvoiceCountData(InvID) {
		var recInvoiceNo = db.execute('SELECT * FROM tbl_invoice WHERE id=' + InvID);
		//console.log('total_amount ' + recInvoiceNo.fieldByName('invoice_no'));

		var getInvoiceData = db.execute('SELECT count(id) as invoicecount FROM tbl_income WHERE invoice_no="' + recInvoiceNo.fieldByName('invoice_no') + '"');
		var paidInvoiceCount = getInvoiceData.fieldByName('invoicecount');
		return paidInvoiceCount;
	}

	function deleteInvoiceData(tableID) {
		var db = Ti.Database.open('mywallet');
		//db.execute('DELETE FROM tbl_invoice WHERE id=' + tableID); // commented to avoid deleting invoices
		db.execute('UPDATE tbl_invoice SET isDeleted=1, net_amount=0.0, total_amount=0.0, vat=0.0, vat_presentage=0.0 WHERE id=' + tableID); //this not sets the isDeleteed arrtibute to true	
		db.close();
		return true;
	}

	function deleteIncomeData(tableID) {
		var db = Ti.Database.open('mywallet');
		db.execute('DELETE FROM tbl_income WHERE id=' + tableID);
		db.close();
		return true;
	}

	// get invoice due amount by invoice number
	var getInvoiceDuebyInvoiceNumber = function(invId) {
		var db = Ti.Database.open('mywallet');
		var invoiceResultSet = db.execute('select * FROM tbl_invoice WHERE invoice_no = "' + invId + '"');
		var invoiceTotal = invoiceResultSet.fieldByName('total_amount');
		var invNumber = invoiceResultSet.fieldByName('invoice_no');
		var invoiceTotalResultSet = db.execute('SELECT SUM(total_amount) AS invoicepayment  FROM tbl_income WHERE invoice_no = "' + invNumber + '"');
		var invoiceTotalPayments = invoiceTotalResultSet.fieldByName('invoicepayment');
		console.log('invoiceTotal ' + invoiceTotal + ' ' + 'invoiceTotalPayments ' + invoiceTotalPayments);
		var invoiceDue = invoiceTotal - invoiceTotalPayments;
		db.close();
		return invoiceDue;
	};

	function updateInvoiceWithPaidStatus(invoice_no) {
		var db = Ti.Database.open('mywallet');
		console.log('PaidStatus');
		db.execute('UPDATE tbl_invoice SET paid=1 WHERE invoice_no=?', invoice_no);
		db.close();
	}

	function updateInvoiceWithUnPaidStatus(invoice_no) {
		var db = Ti.Database.open('mywallet');
		console.log('UnPaidStatus');
		db.execute('UPDATE tbl_invoice SET paid=0 WHERE invoice_no=?', invoice_no);
		db.close();
	}

	var deleteentriespopupcontainerView = Ti.UI.createView({// Set height appropriately
		//layout : 'vertical',
		visible : false,
		width : '100%',
		height : '100%',
		backgroundColor : '#ffffff',
	});

	var view_deleteentriespopuptitle = Ti.UI.createView({
		height : deviceHeight * 0.075,
		top : 0,
		backgroundColor : '#2980B9',
	});

	var lbldeleteentriespopuptitle = Ti.UI.createLabel({
		text : 'Delete Entries',
		color : '#FFFFFF',
		font : {
			fontSize : stylefontsize + 2,
			fontFamily : customFont2,
		},
	});
	
	if(subTitle){
		var appendingSubTitle;
		if (subTitle == 1){
			appendingSubTitle = 'Expenses';
		} else if (subTitle == 2){
			appendingSubTitle = 'Income';
		} else if (subTitle == 3){
			appendingSubTitle = 'Invoices';
		}
		lbldeleteentriespopuptitle.text = lbldeleteentriespopuptitle.text + ' - ' + appendingSubTitle;
	}

	var imgdeleteentriespopupclose = Ti.UI.createImageView({
		image : '/images/backbtn.png',
		backgroundSelectedColor : '#999999',
		width : '13%',
		left : '0%',
	});

	view_deleteentriespopuptitle.add(lbldeleteentriespopuptitle);
	view_deleteentriespopuptitle.add(imgdeleteentriespopupclose);
	deleteentriespopupcontainerView.add(view_deleteentriespopuptitle);

	/*var editdeleteentriespopupinputview = Titanium.UI.createScrollView({
	height : deviceHeight * 0.925,
	top : deviceHeight * 0.150,
	showVerticalScrollIndicator : true,
	//backgroundColor : 'red',
	});*/

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//# account filter view
	
	var accountSelectView = Ti.UI.createView({
		height : deviceHeight * 0.075,
		top : deviceHeight * 0.075,
		backgroundColor : '#E3E3E3',
	});
	
	var accountSelectView_lblview = Ti.UI.createView({
		height : '100%',
		width : '50%',
		left : 0,
	});
	var accountSelectView_selectView = Ti.UI.createView({
		height : '100%',
		width : '50%',
		right : 0,
		backgroundColor : settingsbtnfontcolor,
	});

	var accountSelect_label = Ti.UI.createLabel({
		text : 'Select Account',
		left : stylemargine,
		font : {
			fontFamily : customFont1,
			fontSize : stylefontsize,
		},
		color : settingsbtnfontcolor,
		//top : '15%',
	});

	// Create a Picker.
	var accountSelectView_picker = Ti.UI.createPicker({
		right : 0,
		width : '100%',

		font : {
			fontFamily : customFont1,
			fontSize : stylefontsize - 2,
		},
		color : '#111111',
		height : '100%',
		
	});
	
	var accountSelectData = [];
	
	loadAccountList();
	
	function loadAccountList(){
		
		activeAccountId = null;
		
		accountSelectData[0] = Ti.UI.createPickerRow({
			title : 'All',
			account_id : null,
			custom_item : subTitle
		});
		
		sql = 'SELECT * FROM tbl_account WHERE enable = 1 ORDER BY account_name COLLATE NOCASE ASC';
		var accResultSet = db.execute(sql);
		var i = 1;
		
		while(accResultSet.isValidRow()){
			accountSelectData[i] = Ti.UI.createPickerRow({
				title : accResultSet.fieldByName('account_name'),
				account_id : accResultSet.fieldByName('id'),
				custom_item : subTitle
			});
			accResultSet.next();
			i++;
		}
		
		accResultSet.close();
			
	}
	
	accountSelectView_picker.add(accountSelectData);
	
	accountSelectView_lblview.add(accountSelect_label);
	accountSelectView_selectView.add(accountSelectView_picker);
	
	accountSelectView.add(accountSelectView_lblview);
	accountSelectView.add(accountSelectView_selectView);
	
	if(subTitle != 3){ // if selected view is not an invoice view
		deleteentriespopupcontainerView.add(accountSelectView);
		//entryViewList.top = deviceHeight * 0.075 * 1;
	} else {
		//entryViewList.top = deviceHeight * 0.075 * 2;
	}
	
	accountSelectView_picker.addEventListener('change', function(e) {
		
		activeAccountId = e.row.account_id;
		
		switch(e.row.custom_item) {
			case 1 :
				getExpenseEntries(e.row.account_id);
				break;
			case 2 :
				getIncomeEntries(e.row.account_id);
				break;
			case 3 :
				getInvoiceEntries();
				break;
		}
	});
	
	//# end of account filter view

	// --- category select view
	var entryViewCatSelect = Ti.UI.createView({
		height : deviceHeight * 0.075,
		top : deviceHeight * 0.075,
		backgroundColor : '#E3E3E3',
	});

	var entryView_lblview = Ti.UI.createView({
		height : '100%',
		width : '50%',
		left : 0,
	});
	var entryView_cat_selectView = Ti.UI.createView({
		height : '100%',
		width : '50%',
		right : 0,
		backgroundColor : settingsbtnfontcolor,
	});

	var entryView_lbl_select_cat = Ti.UI.createLabel({
		text : 'Select Category',
		left : stylemargine,
		font : {
			fontFamily : customFont1,
			fontSize : stylefontsize,
		},
		color : settingsbtnfontcolor,

		//top : '15%',
	});

	// Create a Picker.
	var entryView_cat_select = Ti.UI.createPicker({

		right : 0,
		width : '100%',
		//zIndex:20000,
		font : {
			fontFamily : customFont1,
			fontSize : stylefontsize - 2,
		},
		color : '#111111',
		height : '100%',
	});

	// Add data to the Picker.
	var entryCategoryTypedata = [];
	entryCategoryTypedata[0] = Ti.UI.createPickerRow({
		title : 'Please Selects',
		custom_item : '0'
	});
	entryCategoryTypedata[1] = Ti.UI.createPickerRow({
		title : 'Expence',
		custom_item : '1'
	});
	entryCategoryTypedata[2] = Ti.UI.createPickerRow({
		title : 'Income',
		custom_item : '2'
	});
	//entryCategoryTypedata[3] = Ti.UI.createPickerRow({title:'Account', custom_item:'3'});
	entryCategoryTypedata[3] = Ti.UI.createPickerRow({
		title : 'Invoices',
		custom_item : '3'
	});
	entryView_cat_select.add(entryCategoryTypedata);

	// Add to the parent view.

	entryView_lblview.add(entryView_lbl_select_cat);
	entryView_cat_selectView.add(entryView_cat_select);

	entryViewCatSelect.add(entryView_lblview);
	entryViewCatSelect.add(entryView_cat_selectView);
	//deleteentriespopupcontainerView.add(entryViewCatSelect);
	//entryViewCatSelect.hide();
	// -- EOF category select view

	// --- Entries list veiw
	var entryViewList = Ti.UI.createView({
		top : (subTitle != 3) ? deviceHeight * 0.075 * 2 : deviceHeight * 0.075 * 1, // { // if selected view is not an invoice view ,
		contentWidth : 'auto',
		contentHeight : 'auto',
		backgroundColor : '#EEEEEE',
		height : Ti.UI.FILL,//deviceHeight * 0.850,
		width : '100%',
		layout : 'vertical',
		font : {
			fontFamily : customFont
		},
	});

	var entryEditListTable = Ti.UI.createTableView({
		height : '100%'
	});
	entryViewList.add(entryEditListTable);
	deleteentriespopupcontainerView.add(entryViewList);

	// Listen for change events.
	entryView_cat_select.addEventListener('change', function(e) {
		//alert('You selected: row:' + e.row.title + ', column: ' + e.column + ', custom_item: ' + e.row.custom_item);
		switch(e.row.custom_item) {
		case '0' :
			entryEditListTable.setData([]);
			break;
		case '1' :
			getExpenseEntries();
			break;
		case '2' :
			getIncomeEntries();
			break;
		case '3' :
			getInvoiceEntries();
			break;
		}
	});

	function getExpenseEntries(account_id) {
		var sql;
		
		if(account_id == null || account_id == undefined){
			Ti.API.info('TEST 2');
			sql = 'SELECT * FROM tbl_expence ORDER by date(payment_date) DESC, id DESC';
		} else {
			Ti.API.info('TEST 3');
			sql = "SELECT * FROM tbl_expence WHERE account_id = '" + account_id + "' ORDER by date(payment_date) DESC, id DESC";
		}
		
		var resultSet = db.execute(sql);

		var expenceArray = [];
		var i = 1;
		while (resultSet.isValidRow()) {

			console.log('sub_category_id ' + resultSet.fieldByName('sub_category_id'));
			var recCategory = db.execute('SELECT * FROM tbl_expence_category WHERE id=' + resultSet.fieldByName('category_id'));
			var recSubCategory = db.execute('SELECT * FROM tbl_expence_sub_category WHERE id=' + resultSet.fieldByName('sub_category_id'));
			//var recPayMode = db.execute('SELECT * FROM tbl_payment_mode WHERE id='+resultSet.fieldByName('payment_mode_id'));
			var recAccount = db.execute('SELECT * FROM tbl_account WHERE id=' + resultSet.fieldByName('account_id'));
			var row = Ti.UI.createTableViewRow({
				className : 'forumEvent', // used to improve table performance
				backgroundColor : 'white',
				rowIndex : i, // custom property, useful for determining the row during events
				height : '50dp',
				id : resultSet.fieldByName('id'),
				// textEntry: 'expense',
				font : {
					fontFamily : customFont
				},
			});
			var labelday = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				//// textEntry: 'expense',
				color : '#576996',
				text : changeDateView(resultSet.fieldByName('payment_date')),
				left : styleSettingsmargine,
				top : '4dp',
				width : '25%', //height: '10%',
				textAlign : 'left',
				font : {
					fontFamily : customFont
				},
			});
			var labelCategory = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				//// textEntry: 'expense',
				color : '#222',
				text : recCategory.fieldByName('expence_category'),
				left : '33%',
				top : '10%',
				width : '40%',
				font : {
					fontFamily : customFont1
				},
			});

			var labelSubCategory = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				//// textEntry: 'expense',
				color : '#2B2B2B',
				text : (resultSet.fieldByName('sub_category_id') == 0) ? '' : recSubCategory.fieldByName('expence_sub_category'),
				left : '33%',
				top : '50%',
				width : '40%',
				font : {
					fontFamily : customFont
				},
			});
			var labelAmount = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				//// textEntry: 'expense',
				text : toDecimalFormatView(resultSet.fieldByName('total_amount')),
				textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
				right : styleSettingsmargine,
				top : '4dp',
				width : '38%',
				color : '#222',
				font : {
					fontFamily : customFont2
				},
			});
			var labelAccount = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				//// textEntry: 'expense',
				color : '#2B2B2B',
				textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
				text : recAccount.fieldByName('short_code'),
				right : styleSettingsmargine,
				top : '50%',
				width : '38%',
				font : {
					fontFamily : customFont,
					fontSize : stylefontsize - 8,
				},
			});

			row.add(labelday);
			row.add(labelCategory);
			row.add(labelSubCategory);
			row.add(labelAmount);
			row.add(labelAccount);
			expenceArray.push(row);
			i++;
			resultSet.next();
			// to next index

		}
		resultSet.close();
		// close the Array
		entryEditListTable.data = expenceArray;

	}

	function getIncomeEntries(account_id) {
		var sql;
		
		if(account_id == null || account_id == undefined){
			Ti.API.info('TEST 2');
			sql = 'SELECT * FROM tbl_income ORDER by date(payment_date) DESC, id DESC';
		} else {
			Ti.API.info('TEST 3');
			sql = "SELECT * FROM tbl_income WHERE account_id = '" + account_id + "' ORDER by date(payment_date) DESC, id DESC";
		}
		
		var resultSet = db.execute(sql);

		var incomeArray = [];
		var i = 1;
		while (resultSet.isValidRow()) {
			var isInvoice = (resultSet.fieldByName('invoice_no') == '' || resultSet.fieldByName('invoice_no') == undefined) ? false : true;
			var recCategory = db.execute('SELECT * FROM tbl_income_category WHERE id=' + resultSet.fieldByName('category_id'));
			var recSubCategory = db.execute('SELECT * FROM tbl_income_sub_category WHERE id=' + resultSet.fieldByName('sub_category_id'));
			var recAccount = db.execute('SELECT * FROM tbl_account WHERE id=' + resultSet.fieldByName('account_id'));
			var row = Ti.UI.createTableViewRow({
				className : 'forumEvent', // used to improve table performance
				backgroundColor : 'white',
				rowIndex : i, // custom property, useful for determining the row during events
				height : '50dp',
				id : resultSet.fieldByName('id'),
				// textEntry: 'income',
				font : {
					fontFamily : customFont
				},
			});
			var labelday = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'income',
				color : '#576996',
				text : changeDateView(resultSet.fieldByName('payment_date')),
				left : styleSettingsmargine,
				top : '4dp',
				width : '25%', //height: '10%',
				textAlign : 'left',
				font : {
					fontFamily : customFont
				},
			});
			var labelCategory = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'income',
				color : '#222',
				text : (isInvoice == true) ? 'Invoice' : recCategory.fieldByName('income_category'),
				left : '33%',
				top : '10%',
				width : '40%',
				font : {
					fontFamily : customFont1
				},
			});
			var labelSubCategory = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'income',
				color : '#2B2B2B',
				text : (isInvoice == true) ? resultSet.fieldByName('invoice_no') : recSubCategory.fieldByName('income_sub_category'),
				left : '33%',
				top : '50%',
				width : '40%',
				font : {
					fontFamily : customFont
				},
			});
			var labelAmount = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'income',
				text : toDecimalFormatView(resultSet.fieldByName('total_amount')),
				textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
				right : styleSettingsmargine,
				top : '4dp',
				width : '38%',
				color : '#222',
				font : {
					fontFamily : customFont2
				},
			});
			var labelAccount = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'income',
				color : '#2B2B2B',
				textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
				text : recAccount.fieldByName('short_code'),
				right : styleSettingsmargine,
				top : '50%',
				width : '38%',
				font : {
					fontFamily : customFont,
					fontSize : stylefontsize - 8,
				},
			});

			row.add(labelday);
			row.add(labelCategory);
			row.add(labelSubCategory);
			row.add(labelAmount);
			row.add(labelAccount);
			incomeArray.push(row);
			i++;
			resultSet.next();
			// to next index

		}
		resultSet.close();
		// close the Array
		entryEditListTable.data = incomeArray;
	}

	function getInvoiceEntries() {
		var sql = 'SELECT * FROM tbl_invoice WHERE isDeleted==0 ORDER by date(invoice_date) DESC, id DESC';
		var resultSet = db.execute(sql);

		var invoiceArray = [];
		var i = 1;
		while (resultSet.isValidRow()) {
			var recCustomer = db.execute('SELECT * FROM tbl_customer WHERE id=' + resultSet.fieldByName('customer_id'));
			var row = Ti.UI.createTableViewRow({
				id : resultSet.fieldByName('id'),
				// textEntry: 'invoice',
				className : 'forumEvent', // used to improve table performance
				backgroundColor : 'white',
				rowIndex : i, // custom property, useful for determining the row during events
				height : '50dp',
				font : {
					fontFamily : customFont
				},
			});
			var labelday = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'invoice',
				color : '#576996',
				text : changeDateView(resultSet.fieldByName('invoice_date')),
				left : styleSettingsmargine,
				top : '4dp',
				width : '25%', //height: '10%',
				textAlign : 'left',
				font : {
					fontFamily : customFont
				},
			});
			var labelCustomerName = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'invoice',
				color : '#222',
				text : recCustomer.fieldByName('full_name'),
				left : '33%',
				top : '10%',
				width : '40%',
				font : {
					fontFamily : customFont1
				},
			});
			var labelInvoiceNumber = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'invoice',
				color : '#2B2B2B',
				text : resultSet.fieldByName('invoice_no'),
				left : styleSettingsmargine,//'33%',
				top : '50%',
				width : '40%',
				font : {
					fontFamily : customFont
				},
			});
			var labelAmount = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'invoice',
				text : toDecimalFormatView(resultSet.fieldByName('total_amount')),
				textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
				right : styleSettingsmargine,
				top : '4dp',
				width : '38%',
				color : '#222',
				font : {
					fontFamily : customFont2
				},
			});
			//var paid = ((resultSet.fieldByName('short_code') == 1)?'Paid':'Unpaid';
			var labelPaid = Ti.UI.createLabel({
				id : resultSet.fieldByName('id'),
				// textEntry: 'invoice',
				color : '#2B2B2B',
				textAlign : Ti.UI.TEXT_ALIGNMENT_RIGHT,
				text : (resultSet.fieldByName('paid') == 1 ? 'Paid' : 'Unpaid'),
				right : styleSettingsmargine,
				top : '50%',
				width : '38%',
				font : {
					fontFamily : customFont,
					fontSize : stylefontsize - 8,
				},
			});
			
			if(resultSet.fieldByName('isCreditNote') == '1'){
				labelPaid.text = 'Credit Note';
				labelAmount.text = toNegativeDecimalFormatView(resultSet.fieldByName('total_amount'));
			}

			row.add(labelday);
			row.add(labelCustomerName);
			row.add(labelInvoiceNumber);
			row.add(labelAmount);
			row.add(labelPaid);
			invoiceArray.push(row);
			i++;
			resultSet.next();
			// to next index

		}
		resultSet.close();
		// close the Array
		entryEditListTable.data = invoiceArray;
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////

	imgdeleteentriespopupclose.addEventListener('click', function() {
		deleteentriespopupcontainerView.hide();
		entryView_cat_select.setSelectedRow(0, 0, false);
	});

	Ti.App.addEventListener('deleteEntriesClose', function(e) {
		deleteentriespopupcontainerView.hide();
		entryView_cat_select.setSelectedRow(0, 0, false);
	});

	Ti.App.addEventListener('refrishEditView', function(e) {
		var selectValue = subTitle;
		//var selectValue = entryView_cat_select.getSelectedRow(0).custom_item;
		switch(selectValue) {
		case '0' :
			entryEditListTable.setData([]);
			break;
		case 1 :
			getExpenseEntries(activeAccountId);
			break;
		case 2 :
			getIncomeEntries(activeAccountId);
			break;
		case 3 :
			getInvoiceEntries();
			break;
		}
	});
	//editdeleteentriespopupcontainerView.add(editdeleteentriespopupinputview);

	entryEditListTable.addEventListener('click', function(e) {
		var selectValue = subTitle;
		//var selectValue = entryView_cat_select.getSelectedRow(0).custom_item;
		if (selectValue == 1) {// expence data set

			var alertBoxDelete = Ti.UI.createAlertDialog({
				cancel : 1,
				buttonNames : ['Delete', 'Cancel'],
				message : 'Do you want to delete the record?',
				title : 'Delete Confirmation?'
			});

			alertBoxDelete.show();

			alertBoxDelete.addEventListener('click', function(event) {

				if (event.index === 0) {
					var getResult = deleteExpenceData(e.row.id);
					if (getResult) {
						Ti.App.fireEvent('refrishEditView', 'e');
						var toast = Ti.UI.createNotification({
							message : "Record Deleted Successful",
							duration : Ti.UI.NOTIFICATION_DURATION_SHORT
						});
						toast.show();

					}

				}

			});

		} else if (selectValue == 2) {// income data set

			var expenceDataSet = db.execute('SELECT count(invoice_no) as invoicenocount FROM tbl_income WHERE id=' + e.row.id);
			var invoiceNoCount = expenceDataSet.fieldByName('invoicenocount');
			console.log('expenceDataSet: ' + invoiceNoCount);
			if (invoiceNoCount == 0) {//Other Income

				var alertBoxDelete = Ti.UI.createAlertDialog({
					cancel : 1,
					buttonNames : ['Delete', 'Cancel'],
					message : 'Do you want to delete the record?',
					title : 'Delete Confirmation?'
				});

				alertBoxDelete.show();

				alertBoxDelete.addEventListener('click', function(event) {

					if (event.index === 0) {
						var getResult = deleteIncomeData(e.row.id);
						if (getResult) {
							Ti.App.fireEvent('refrishEditView', 'e');

							var toast = Ti.UI.createNotification({
								message : "Record Deleted Successfuly",
								duration : Ti.UI.NOTIFICATION_DURATION_SHORT
							});
							toast.show();

						}
						Ti.App.fireEvent('editAdhocIncomeViewClose', 'e');
					}
				});

			} else {//Invoice Income

				var invoiceIncomeRecordDeleteConf = Ti.UI.createAlertDialog({
					cancel : 1,
					buttonNames : ['Delete', 'Cancel'],
					message : 'Do you want to delete the record?',
					title : 'Delete Confirmation?'
				});

				invoiceIncomeRecordDeleteConf.show();

				invoiceIncomeRecordDeleteConf.addEventListener('click', function(event) {
					if (event.index === 0) {
						var invoiceDataSet = db.execute('SELECT invoice_no FROM tbl_income WHERE id=' + e.row.id);
						var invoice_no = invoiceDataSet.fieldByName('invoice_no');
						console.log('invoice ' + invoice_no);
						console.log('DuebyInvoice ' + getInvoiceDuebyInvoiceNumber(invoice_no));

						var getResult = deleteIncomeData(e.row.id);
						if (getResult) {
							Ti.App.fireEvent('refrishEditView', 'e');
							var toast = Ti.UI.createNotification({
								message : "Delete Successful",
								duration : Ti.UI.NOTIFICATION_DURATION_SHORT
							});
							toast.show();

							if (getInvoiceDuebyInvoiceNumber(invoice_no) == 0) {
								updateInvoiceWithPaidStatus(invoice_no);
							} else {
								updateInvoiceWithUnPaidStatus(invoice_no);
							}

						}
					}
				});

			}

		} else if (selectValue == 3) {// Invoice data set

			var paidInvoiceCount = paidInvoiceCountData(e.row.id);

			if (paidInvoiceCount > 0) {
				var alertBoxUnableDelete = Ti.UI.createAlertDialog({
					//cancel : 1,
					buttonNames : ['Ok'],
					message : 'Please Delete Income Records Added to This Invoice',
					title : 'Unable to Delete '
				});

				alertBoxUnableDelete.show();

			} else {
				var alertBoxDelete = Ti.UI.createAlertDialog({
					cancel : 1,
					buttonNames : ['Delete', 'Cancel'],
					message : 'Do you want to delete the record?',
					title : 'Delete Confirmation?'
				});

				alertBoxDelete.show();

				alertBoxDelete.addEventListener('click', function(event) {
					if (event.index === 0) {
						var getResult = deleteInvoiceData(e.row.id);
						if (getResult) {
							Ti.App.fireEvent('refrishEditView', 'e');
							//createinvoicepopupcontainerView.hide();
							//clearContent();
							var toast = Ti.UI.createNotification({
								message : "Record Deleted Successful",
								duration : Ti.UI.NOTIFICATION_DURATION_SHORT
							});
							toast.show();

						}
					}
				});
			}

		}

		//console.log('invoice_datessss');
		//console.log('table id: ' + e.row.id);
	});

	function changeDateView(dateObj) {

		//console.log('dateObj1 : '+dateObj);
		dateObj = new Date(dateObj);
		//dateObj = getDate();
		//console.log('dateObj2 : '+dateObj);
		var pickerDate = (dateObj.getDate() < 10) ? '0' + dateObj.getDate() : dateObj.getDate();
		var pickerMonth = (dateObj.getMonth() + 1) < 10 ? '0' + (dateObj.getMonth() + 1) : dateObj.getMonth() + 1;
		var pickerYear = dateObj.getFullYear();
		//console.log(pickerDate + '-' + pickerMonth + '-' + pickerYear);
		//selectedDate = pickerYear + '-' + pickerMonth + '-' + pickerDate;
		selectedDate = pickerDate + '/' + pickerMonth + '/' + pickerYear;
		return selectedDate;

	}


	deleteentriespopupcontainerView.update = function(itemIndex) {

		switch(itemIndex) {
		case 1 :
			getExpenseEntries(activeAccountId);
			break;
		case 2 :
			getIncomeEntries(activeAccountId);
			break;
		case 3 :
			getInvoiceEntries();
			break;
		}
		entryView_cat_select.setSelectedRow(0, itemIndex, false);
	};
	return deleteentriespopupcontainerView;
};
