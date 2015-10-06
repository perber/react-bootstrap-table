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
            return <div />
        }
        return(
            <tr ref="footer">
                {this._renderAccumulatedData()}
            </tr>
        )
    }

    _renderAccumulatedData() {
        return this.state.columns.map( (column, i) => {
            const dataField = column.name;
            const formatData = column.format;

            if(!(dataField in this.state.accumulatedData)) {
                return <TableColumn key={i}  />;
            }

            let value = this.state.accumulatedData[column.name];

            if(formatData) {
                const formattedValue = formatData(value, this.state.accumulatedData);
                if (!React.isValidElement(formattedValue)) {
                    value = <div dangerouslySetInnerHTML={{__html: formattedValue}}></div>;
                }
                else {
                    value = formattedValue
                }
            }

            return <TableColumn key={i} dataAlign={column.align}>{value}</TableColumn>
        });
    }
}
