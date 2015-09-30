import React from 'react';
import TableColumn from "./TableColumn"
import _ from "lodash";

export default class TableFooter extends React.Component{

    static defaultProps = {
        columns: [],
        accumulatedData: {}
    };

    constructor(props) {
        super(props);
        this.state = TableFooter._createStateObject(props)
    }

    componentWillReceiveProps(newProps) {
        this.setState(TableFooter._createStateObject(newProps));

    }

    static _createStateObject(props) {
        return {accumulatedData: props.accumulatedData, columns: props.columns};
    }

    render(){
        if(_.isEmpty(this.state.accumulatedData)) {
            return null;
        }

        return(
            <tfoot>
                <tr ref="footer">
                    {this._renderAccumulatedData(this.state.accumulatedData)}
                </tr>
            </tfoot>
        )
    }

    _renderAccumulatedData() {
        return this.state.columns.map( (column, i) => {
            const dataField = column.name;
            const formatData = column.format;
            if(!(dataField in this.state.accumulatedData)) {
                return <TableColumn key={i} {...this.state.accumulatedData}><span> </span></TableColumn>;
            }

            let value = this.state.accumulatedData[column.dataField];

            if(formatData) {
                value = formatData(this.state.accumulatedData[column.dataField], this.state.accumulatedData);
            }

            return <TableColumn key={i} {...this.state.accumulatedData}>{value}</TableColumn>

        });
    }
}
