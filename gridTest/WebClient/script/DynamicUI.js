//*******************************************************************************/
//*  Rocket Software makes no warranty, express or implied, with regard to      */
//*  this material, including fitness for use. Additionally, Rocket is not      */
//*  responsible for maintaining compatibility of this information with future  */
//*  releases.  Rocket provides this as an example only.                        */
//*  Customers using this information do so at their own risk.                  */
//*  The items provided to you are identified as Type II material               */
//*  as per the Professional Services Agreement. For the                        */
//*  avoidance of doubt, this means that Rocket owns the IP in                  */
//*  any such deliverables.                                                     */
//*******************************************************************************/

function log() {
	if (defaults.logDebugMessages) {
		console.log.apply(console, Array.prototype.slice.call(arguments));
	}
}

function activateWidget(widget) {
	if (widget != null && !widget.isHidden() && !widget.isExcluded()) {
		if (widget instanceof ajaxclient.webui.AjaxText
				|| widget instanceof ajaxclient.webui.AjaxTextArea
				|| widget instanceof ajaxclient.webui.AjaxPassword) {
			if (!widget.isReadOnly()) {
				widget.setFocus();
				return true;
			}
		} else if (widget instanceof ajaxclient.webui.AjaxComboBox) {
			if (!widget.isTextFieldReadOnly()) {
				widget.setFocus();
				return true;
			}
		} else if (widget instanceof ajaxclient.webui.AjaxDatePicker) {
			if (!widget.isReadOnlyWhenDisabled()) {
				widget.setFocus();
				return true;
			}
		} else if (widget instanceof qx.ui.container.Composite) {
			var children = widget.getChildren();
			for (var i = 0; i < children.length; i++) {
				if (activateWidget(children[i])) {
					return true;
				}
			}
			return false;
		}
	}
	return false;
}

function moveFocus(widget, key) {
	var container = widget.getLayoutParent();
	var layout = null;
	if (container instanceof ajaxclient.webui.AjaxDatePicker
			|| container instanceof ajaxclient.webui.AjaxComboBox) {
		widget = container;
		container = widget.getLayoutParent();
	} else if (container instanceof qx.ui.container.Composite) {
		layout = container.getLayout();
		if (!(layout instanceof ajaxclient.ui.DynamicUIGridLayoutAjax)) {
			widget = container;
			container = widget.getLayoutParent();
		}
	}
	if (container == null) {
		return;
	}
	layout = container.getLayout();
	var direction;
	switch (key) {
	case "Up":
		direction = -1;
		break;
	case "Down":
		direction = 1;
		break;
	}
	var rows = layout.getRowCount();
	var columns = layout.getColumnCount();
	var row = widget.getLayoutProperties().row;
	var column = widget.getLayoutProperties().column;
	var found = false;
	var searchrow = row + direction;
	var nextWidget = null;
	var searchcolumn;
	while (found == false && searchrow != row) {
		if (searchrow > rows) {
			searchrow = 0;
		} else if (searchrow < 0) {
			searchrow = rows;
		}
		for (searchcolumn = column; searchcolumn >= 0; searchcolumn--) {
			nextWidget = layout.getCellWidget(searchrow, searchcolumn);
			found = activateWidget(nextWidget);
			if (found == true) {
				break;
			}
		}
		if (found == false) {
			for (searchcolumn = column; searchcolumn <= columns; searchcolumn++) {
				nextWidget = layout.getCellWidget(searchrow, searchcolumn);
				found = activateWidget(nextWidget);
				if (found == true) {
					break;
				}
			}
		}
		if (found == false) {
			searchrow += direction;
		}
	}
};

function onKeyPress(event) {
	alert("onKeyPress event");
	var widget = event.getTarget();
	var key = event.getKeyIdentifier();
	switch (key) {
	case "Up":
	case "Down":
		moveFocus(widget, key);
		break;
	}
};

function getHtmlText(text) {
	return text.replace(/&/g, "&amp;").replace(/ /g, "&nbsp;").replace(/</g,
			"&lt;").replace(/>/g, "&gt;");
};

function adjustWidgetSpace(widget, minSpace) {
	var container = widget.getLayoutParent();
	if (container == null) {
		return;
	}
	var layout = container.getLayout();
	if (!(layout instanceof ajaxclient.ui.DynamicUIGridLayoutAjax)) {
		return;
	}
	var properties = widget.getLayoutProperties();
	var columns = layout.getColumnCount() * 2;
	for (var i = properties.column + properties.colSpan + 1; i < columns; i++) {
		nextWidget = layout.getCellWidget(properties.row, i);
		if (nextWidget != null) {
			nextProperties = nextWidget.getLayoutProperties();
			var move = minSpace
					- (nextProperties.column - (properties.column + properties.colSpan));
			if (move > 0) {
				var spaceBetween = 0;
				for (var j = i; j < columns; j++) {
					followingWidget = layout.getCellWidget(properties.row, j);
					if (followingWidget == null) {
						spaceBetween++;
					} else {
						spaceBetween = 0;
					}
					if (spaceBetween > minSpace) {
						break;
					}
				}
				for (var k = j; k > properties.column + properties.colSpan; k--) {
					lastWidget = layout.getCellWidget(properties.row, k);
					if (lastWidget != null) {
						lastProperties = lastWidget.getLayoutProperties();
						k = lastProperties.column;
						widgetToReplace = layout.getCellWidget(
								lastProperties.row, lastProperties.column
										+ move);
						if (widgetToReplace == null
								|| widgetToReplace == lastWidget) {
							lastWidget.setLayoutProperties({
								row : properties.row,
								column : lastProperties.column + move,
								colSpan : lastProperties.colSpan,
								rowSpan : lastProperties.rowSpan
							});
						}
					}
				}
			}
			break;
		}
	}
};

function adjustContainerList(widget) {
	
	var container = widget.getLayoutParent && widget.getLayoutParent();
	if (container != null) {

		var layout = container.getLayout();
		if (layout instanceof ajaxclient.ui.DynamicUIGridLayoutAjax) {
				
			var containerlist_column = widget.getLayoutProperties().column;
			var containerlist_row = widget.getLayoutProperties().row;
			var containerlist_colSpan = widget.getLayoutProperties().colSpan;
			var containerlist_rowSpan = widget.getLayoutProperties().rowSpan;
			//containerlist header
			var containerlistheader_columns;
			var containerlistheader_rows;
			//containerlist srollpane (body)
			var containerlistpane_rows;
			
			log ("containerlist layout: Position(" + containerlist_column + "," + containerlist_row + ") columns: " + containerlist_colSpan + " rows: " + containerlist_rowSpan);
			
			var header = widget.getChildControl("header");
			
			if (header instanceof qx.ui.container.Composite) {
				
				var header_cell = header.getChildControl("cell#0");

				if (header_cell instanceof ajaxclient.webui.containerlist.HeaderCell) {
					log("ajaxclient.webui.containerlist.HeaderCell found");
										
					var header_cell_layout =  header_cell.getLayout();
					containerlistheader_columns = header_cell_layout.getColumnCount();
					containerlistheader_rows = header_cell_layout.getRowCount();
							
					log ("containerlist header - number of rows: " + containerlistheader_rows);
				}
				
			}
			
			var scrollpane = widget.getChildControl("pane");
			
			if (scrollpane instanceof qx.ui.container.Composite) {
				
				var scrollpane_layout =  scrollpane.getLayout();
				containerlistpane_rows = scrollpane_layout.getRowCount();
				log ("containerlist scrollpane - number of rows: " + containerlistpane_rows);
			}
			
			if (containerlistheader_rows + containerlistpane_rows > containerlist_rowSpan) {
				log ("containerlist too small for both header and body rows - correcting size")
				container.remove(widget);
				container.add(widget, {
					row : widget.getLayoutProperties().row - containerlistheader_rows,
					column : containerlist_column,
					colSpan : containerlist_colSpan,
					rowSpan : containerlist_rowSpan + containerlistheader_rows
				});
				
			}
			
		
		}
	}
	
	//size the childcontrols
	var listcell_columns;
	var scrollpane = widget.getChildControl("pane");
	
	if (scrollpane instanceof qx.ui.container.Composite) {
		var scrollpane_layout =  scrollpane.getLayout();
		//var columns = scrollpane_layout.getColumnCount();
		var scrollpane_rows = scrollpane_layout.getRowCount();
		log("scrollpane_rows: " + scrollpane_rows );
		//walk the listcells
		for (var scrollpane_row = 0; scrollpane_row < scrollpane_rows; scrollpane_row++) {
			var aListCellWidget = scrollpane_layout.getCellWidget(scrollpane_row, 0);
			if (aListCellWidget != null) {
				if (aListCellWidget instanceof ajaxclient.webui.containerlist.ListCell) {
					var listcell_layout =  aListCellWidget.getLayout();
					listcell_columns = listcell_layout.getColumnCount();
					var listcell_rows = listcell_layout.getRowCount();
					
					//walk the listcells
					for (var listcell_column = 0; listcell_column < listcell_columns; listcell_column++) {
						var aWidget = listcell_layout.getCellWidget(0, listcell_column);

						if (aWidget != null) {
							//log("inspecting widget: " + aWidget.getHtmlId());
							if (aWidget instanceof ajaxclient.webui.AjaxLabel) {
								adjustLabelWidget(aWidget);
							} else if (aWidget instanceof ajaxclient.webui.AjaxButton) {
								adjustButtonWidgetCore(aWidget);
							} else if (aWidget instanceof ajaxclient.webui.AjaxText) {
								adjustTextWidget(widget);
							} 											
							listcell_column += aWidget.getLayoutProperties().colSpan + 1;
						}
					} //for 
				}									
			}
		}
	}
	
	
	
};

function adjustTextWidget(widget) {
	var insets = widget.getInsets();
	var widgetText = "";
	for (var i = 0; i < widget.getLayoutProperties().colSpan; i++) {
		widgetText += "W";
	}
	var font = qx.theme.manager.Font.getInstance().resolve(widget.getFont());
	
	var widgetTextSize = qx.bom.Label.getHtmlSize(getHtmlText(widgetText), font.getStyles());
	var newWidth = Math.ceil(widgetTextSize.width + insets.left + insets.right);
	widget.setMinWidth(newWidth);
	widget.setMaxWidth(newWidth);
	widget.setWidth(newWidth);
	if (defaults.cursorKeyNavigation) {
		widget.addListener("keypress", onKeyPress);
	}
};

function adjustCheckBoxWidget(widget) {
	
	var icon = widget.getChildControl("icon");	
	var label = widget.getChildControl("label");	

	adjustLabelWidget(label);

	if (defaults.cursorKeyNavigation) {
		widget.addListener("keypress", onKeyPress);
	}
};

function adjustPasswordWidget(widget) {
	var insets = widget.getInsets();
	var widgetText = "";
	for (var i = 0; i < widget.getLayoutProperties().colSpan; i++) {
		widgetText += "W";
	}
	var font = qx.theme.manager.Font.getInstance().resolve(widget.getFont());
	var widgetTextSize = qx.bom.Label.getHtmlSize(getHtmlText(widgetText), font
			.getStyles());
	var newWidth = Math.ceil(widgetTextSize.width + insets.left + insets.right);
	widget.setMinWidth(newWidth);
	widget.setMaxWidth(newWidth);
	widget.setWidth(newWidth);
	if (defaults.cursorKeyNavigation) {
		widget.addListener("keypress", onKeyPress);
	}
};

function adjustDatePickerWidget(widget) {
	var insets = widget.getInsets();
	var widgetText = "";
	for (var i = 0; i < widget.getLayoutProperties().colSpan; i++) {
		widgetText += "W";
	}
	var font = qx.theme.manager.Font.getInstance().resolve(widget.getFont());
	var widgetTextSize = qx.bom.Label.getHtmlSize(getHtmlText(widgetText), font
			.getStyles());
	var newWidth = Math.ceil(widgetTextSize.width + insets.left + insets.right
			+ defaults.dynamicDatePickerPadding);
	widget.setMinWidth(newWidth);
	widget.setMaxWidth(newWidth);
	widget.setWidth(newWidth);
	if (defaults.cursorKeyNavigation) {
		widget.addListener("keypress", onKeyPress);
	}
	widget.addListener("focusin", function(event) {
		widget.open();
	});
	widget.addListener("focusout", function(event) {
		widget.close();
	});
	widget.addListener("click", function(event) {
		widget.open();
	});
};

function adjustComboBoxWidget(widget) {
	var insets = widget.getInsets();
	var widgetTextSize = null;
	var dropdown = widget.getChildControl("dropdown");
	var list = dropdown.getChildControl("list");
	var children = list.getModel().toArray();
	var font = qx.theme.manager.Font.getInstance().resolve(widget.getFont());
	for (var i = 0; i < children.length; i++) {
		var text = children[i].getLabel().trim();
		children[i].setLabel(text);
		text += "WWWW";
		var childTextSize = qx.bom.Label.getHtmlSize(getHtmlText(text), font
				.getStyles());
		if (widgetTextSize == null
				|| widgetTextSize.width < childTextSize.width) {
			widgetText = text;
			widgetTextSize = childTextSize;
		}
	}
	if (widgetTextSize != null) {
		var newWidth = Math.ceil(widgetTextSize.width + insets.left
				+ insets.right);
		widget.setMinWidth(newWidth);
		widget.setMaxWidth(newWidth);
		widget.setWidth(newWidth);
	}
	var text = widget.getValue();
	if (text != null) {
		widget.setValue(text.trim());
	}
	if (defaults.cursorKeyNavigation) {
		widget.addListener("keypress", onKeyPress);
	}
};

function adjustButtonWidgetCore(widget) {
	widgetText = widget.getLabel();
	widget.setLabel(widgetText.replace(/(\&nbsp\;\&\#8203\;)+$/, ''));
};

function adjustButtonWidget(container, widget) {

	var layout = container.getLayout();
	if (!(layout instanceof ajaxclient.ui.DynamicUIGridLayoutAjax)) {
		return widget;
	}
	var columns = layout.getColumnCount();
	var colSpan = widget.getLayoutProperties().colSpan;
	var composite = new qx.ui.container.Composite();
	composite.setLayout(new qx.ui.layout.HBox(
			defaults.dynamicButtonContainerSpacing));
	var focusedWidget = qx.ui.core.FocusHandler.getInstance()
			.getFocusedWidget();
	for (var i = 0; i < columns; i++) {
		var aWidget = layout.getCellWidget(
				widget.getLayoutProperties().row, i);
		if (aWidget != null) {
			
			container.remove(aWidget);
			if (aWidget instanceof ajaxclient.webui.AjaxLabel) {
				adjustLabelWidget(aWidget);
			} else if (aWidget instanceof ajaxclient.webui.AjaxButton) {
				adjustButtonWidgetCore(aWidget);
			}
			
			composite.add(aWidget);
			i += aWidget.getLayoutProperties().colSpan + 1;
			colSpan += aWidget.getLayoutProperties().colSpan + 1;
			
				
		}
	}
	if (focusedWidget != null
			&& !(focusedWidget instanceof ajaxclient.webui.grid.Table)) {
		focusedWidget.focus();
	}
	container.add(composite, {
		row : widget.getLayoutProperties().row,
		column : defaults.dynamicButtonContainerColumn,
		colSpan : colSpan
	});
};

function adjustLabelWidget(widget) {
	var insets = widget.getInsets();
	var widgetText = widget.getValue();
	var widgetTextSize = qx.bom.Label.getHtmlSize(widgetText, widget
			.getContentElement().getAllStyles());
	var newWidth = Math.ceil(widgetTextSize.width + insets.left + insets.right);
	widget.setMinWidth(newWidth);
	widget.setMaxWidth(newWidth);
	widget.setWidth(newWidth);
};

function adjustPromptButtonWidget(container, widget) {
	var layout = container.getLayout();
	if (!(layout instanceof ajaxclient.ui.DynamicUIGridLayoutAjax)) {
		return widget;
	}
	var columns = layout.getColumnCount();
	var column = widget.getLayoutProperties().column;
	var colSpan = widget.getLayoutProperties().colSpan;
	for (var i = column - 1; i > 0; i--) {
		var previousWidget = layout.getCellWidget(
				widget.getLayoutProperties().row, i);
		if (previousWidget != null) {
			var focusedWidget = qx.ui.core.FocusHandler.getInstance()
					.getFocusedWidget();
			var composite = new qx.ui.container.Composite();
			composite.setLayout(new qx.ui.layout.HBox(
					defaults.dynamicPromptButtonContainerSpacing));
			container.remove(previousWidget);
			container.remove(widget);
			composite.add(previousWidget);
			composite.add(widget);
			previousColumn = previousWidget.getLayoutProperties().column;
			colSpan += (column - previousColumn);
			container.add(composite, {
				row : widget.getLayoutProperties().row,
				column : previousColumn,
				colSpan : colSpan
			});
			if (focusedWidget != null
					&& !(focusedWidget instanceof ajaxclient.webui.grid.Table)) {
				focusedWidget.focus();
			}
			break;
		}
	}
};

function applyWidgetSize(widget, fontChange) {
	if (widget.getFont() != null) {
		var container = widget.getLayoutParent && widget.getLayoutParent();
		if (container != null) {
			if (qx.lang.String.startsWith(widget.getAppearance(),
					defaults.dynamicPromptButtonAppearanceName || "")) {
				adjustPromptButtonWidget(container, widget);
			} else if (widget instanceof ajaxclient.webui.AjaxLabel) {
				adjustLabelWidget(widget);
			} else if (widget instanceof ajaxclient.webui.AjaxText) {
				adjustTextWidget(widget);
			} else if (widget instanceof ajaxclient.webui.AjaxTextArea) {
				adjustTextWidget(widget);
			} else if (widget instanceof ajaxclient.webui.AjaxPassword) {
				adjustPasswordWidget(widget);
			} else if (widget instanceof ajaxclient.webui.AjaxDatePicker) {
				adjustDatePickerWidget(widget);
			} else if (widget instanceof ajaxclient.webui.AjaxButton) {
				adjustButtonWidget(container, widget);
			} else if (widget instanceof ajaxclient.webui.AjaxComboBox) {
				adjustComboBoxWidget(widget);
			} else if (widget instanceof ajaxclient.webui.AjaxCheckBox) {
				adjustCheckBoxWidget(widget);
			} else if (widget instanceof ajaxclient.webui.AjaxContainerList) {
				if (fontChange) {
					adjustContainerList(widget);
				}
			}
		}
	}
}

//Uncomment this function to customize calculation of widget sizes for Dynamic UI
//function adjustWidgetSizeCalcText(colSpan) {
//    return new Array(colSpan).join(colSpan < 4 ? 'W' : 'A');
//}

function adjustWidgetSize(widget) {
	widget.addListener("appear", function(event) {
		applyWidgetSize(widget, false);
	});
	
	widget.addListener("changeFont", function(event) {
		applyWidgetSize(widget, true);
	});
};

function adjustDynamicUILayout(widget) {
	
	if (widget instanceof ajaxclient.webui.containerlist.ListCell) {
		return;
	}
	
	widget.addListener("appear", function(event) {
		var widget = event.getTarget();
		var fontName = defaults.dynamicFont;
		if (fontName != null) {
			var font = qx.theme.manager.Font.getInstance().resolve(fontName);
			var layoutManager = widget.getLayoutManager(), i;
			if (layoutManager != null && layoutManager.setColumnMinWidth
					&& layoutManager.setRowMinHeight) {
				var size = qx.bom.Label.getTextSize("W", font.getStyles());
				layoutManager.setColumnFlex(0);
				layoutManager.setRowFlex(0);
				for (i = 0; i < layoutManager.getColumnCount(); i += 1) {
					layoutManager.setColumnMinWidth(i, size.width
							+ defaults.dynamicColumnPadding);
					layoutManager.setColumnWidth(i, size.width
							+ defaults.dynamicColumnPadding);
					layoutManager.setColumnMaxWidth(i, size.width
							+ defaults.dynamicColumnPadding);
				}
				for (i = 0; i < layoutManager.getRowCount(); i += 1) {
					layoutManager.setRowMinHeight(i, size.height
							+ defaults.dynamicRowPadding);
					layoutManager.setRowHeight(i, size.height
							+ defaults.dynamicRowPadding);
					layoutManager.setRowMaxHeight(i, size.height
							+ defaults.dynamicRowPadding);
				}
			}
		}
	});
};

