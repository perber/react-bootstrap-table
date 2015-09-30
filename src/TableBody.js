import React from 'react';
import Const from './Const';
import TableRow from './TableRow';
import TableColumn from './TableColumn';
import TableEditColumn from './TableEditColumn';
import TableFooter from './TableFooter';
import classSet from 'classnames';

class TableBody extends React.Component{

  constructor(props) {
		super(props);
    this.state = {
      currEditCell: null
    };
    this.editing = false;
  }

  render(){
    var containerClasses = classSet("table-container");

    var tableClasses = classSet("table", "table-bordered", {
      'table-striped': this.props.striped,
      'table-hover': this.props.hover,
      'table-condensed': this.props.condensed
    });

    var isSelectRowDefined = this._isSelectRowDefined();
    var tableHeader = this.renderTableHeader(isSelectRowDefined);

    var tableRows = this.props.data.map(function(data, r){
      var tableColumns = this.props.columns.map(function(column, i){
        var fieldValue = data[column.name];
        if(this.editing &&
          column.name !== this.props.keyField && // Key field can't be edit
          column.editable && // column is editable? default is true, user can set it false
          this.state.currEditCell != null &&
          this.state.currEditCell.rid == r &&
          this.state.currEditCell.cid == i){
            return(
              <TableEditColumn completeEdit={this.handleCompleteEditCell.bind(this)}
                               key={i}
                               blurToSave={this.props.cellEdit.blurToSave}
                               rowIndex={r}
                               colIndex={i}>
                {fieldValue}
              </TableEditColumn>
            )
        } else{
          if(typeof column.format !== "undefined"){
            var formattedValue = column.format(fieldValue, data);
            if (!React.isValidElement(formattedValue)) {
              formattedValue = <div dangerouslySetInnerHTML={{__html: formattedValue}}></div>;
            }
            return(
              <TableColumn dataAlign={column.align}
                           key={i}
                           className={column.className}
                           cellEdit={this.props.cellEdit}
                           onEdit={this.handleEditCell.bind(this)}
                           width={column.width}>
                {formattedValue}
              </TableColumn>
            )
          } else{
            return(
              <TableColumn dataAlign={column.align}
                           key={i}
                           className={column.className}
                           cellEdit={this.props.cellEdit}
                           hidden={column.hidden}
                           onEdit={this.handleEditCell.bind(this)}
                           width={column.width}>
                {fieldValue}
              </TableColumn>
            )
          }
        }
      }, this);
      var selected = this.props.selectedRowKeys.indexOf(data[this.props.keyField]) != -1;
      var selectRowColumn = isSelectRowDefined && !this.props.selectRow.hideSelectColumn?
                              this.renderSelectRowColumn(selected):null;
      return (
        <TableRow isSelected={selected} key={r}
          selectRow={isSelectRowDefined?this.props.selectRow:undefined}
          enableCellEdit={this.props.cellEdit.mode !== Const.CELL_EDIT_NONE}
          onSelectRow={this.handleSelectRow.bind(this)}>
          {selectRowColumn}{tableColumns}
        </TableRow>
      )
    }, this);

    if(tableRows.length === 0){
      tableRows.push(
      <TableRow key="##table-empty##">
        <td colSpan={this.props.columns.length+(isSelectRowDefined?1:0)}
            style={{ textAlign: "center" }}>
            There is no data to display
        </td>
      </TableRow>);
    }

    this.editing = false;
    return(
      <div className={containerClasses}>
        <table className={tableClasses}>
          {tableHeader}
          <tbody>
            {tableRows}
          </tbody>
          <TableFooter accumulatedData={this.props.accumulatedData} columns={this.props.columns} />
        </table>
      </div>
    )
  }

  renderTableHeader(isSelectRowDefined){
    var selectRowHeader = null;

    if(isSelectRowDefined){
      let style = {
        width:35
      }
      selectRowHeader = this.props.selectRow.hideSelectColumn?null:(<th style={style} key={-1}></th>);
    }
    var theader = this.props.columns.map(function(column, i){
      let style={
        display: column.hidden?"none":null,
        width: column.width
      };
      return (<th style={style} key={i} className={column.className}></th>);
    });

    return(
      <thead>
        <tr>{selectRowHeader}{theader}</tr>
      </thead>
    )
  }

  handleSelectRow(rowIndex, isSelected){
    var key, selectedRow;
    this.props.data.forEach(function(row, i){
      if(i == rowIndex-1){
        key = row[this.props.keyField];
        selectedRow = row;
      }
    }, this);
    this.props.onSelectRow(selectedRow, isSelected);
  }

  handleSelectRowColumChange(e){
    if(!this.props.selectRow.clickToSelect || !this.props.selectRow.clickToSelectAndEditCell){
      this.handleSelectRow(
        e.currentTarget.parentElement.parentElement.rowIndex, e.currentTarget.checked);
    }
  }

  handleEditCell(rowIndex, columnIndex){
    this.editing = true;
    if(this._isSelectRowDefined()){
      columnIndex--;
      if(this.props.selectRow.hideSelectColumn)
        columnIndex++;
    }
    rowIndex--;
    var stateObj = {
      currEditCell: {
        rid: rowIndex,
        cid: columnIndex
      }
    };

    if(this.props.selectRow.clickToSelectAndEditCell){
      //if edit cell, trigger row selections also
      let selected = this.props.selectedRowKeys.indexOf(this.props.data[rowIndex][this.props.keyField]) != -1;
      this.handleSelectRow(rowIndex+1, !selected);
    }
    this.setState(stateObj);
  }

  handleCompleteEditCell(newVal, rowIndex, columnIndex){
    this.setState({currEditCell: null});
    if(null != newVal)
      this.props.cellEdit.__onCompleteEdit__(newVal, rowIndex, columnIndex);
  }

  renderSelectRowColumn(selected){
    if(this.props.selectRow.mode == Const.ROW_SELECT_SINGLE) {
      return (<TableColumn><input type="radio" name="selection" checked={selected} onChange={this.handleSelectRowColumChange.bind(this)}/></TableColumn>);
    }else {
      return (<TableColumn><input type="checkbox" checked={selected} onChange={this.handleSelectRowColumChange.bind(this)}/></TableColumn>);
    }
  }

  _isSelectRowDefined(){
    return this.props.selectRow.mode == Const.ROW_SELECT_SINGLE ||
          this.props.selectRow.mode == Const.ROW_SELECT_MULTI;
  }
}
TableBody.propTypes = {
  data: React.PropTypes.array,
  columns: React.PropTypes.array,
  striped: React.PropTypes.bool,
  hover: React.PropTypes.bool,
  condensed: React.PropTypes.bool,
  keyField: React.PropTypes.string,
  selectedRowKeys: React.PropTypes.array,
  onSelectRow: React.PropTypes.func
};
export default TableBody;
