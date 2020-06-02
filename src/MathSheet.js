import React from 'react';
import _ from 'lodash';
import * as mathjs from 'mathjs';
import Datasheet from './excel_lib/DataSheet'

export default class MathSheet extends React.Component {
    constructor(props) {
        super(props);
        this.onCellsChanged = this.onCellsChanged.bind(this);
        this.state = {};
        let cell = '';
        for (let col = 0; col < 50; col++){
            for (let row = 1; row <= 50; row++) {
                cell = this.convertIntToAlphabet(col) + row;
                this.state[cell] = {key: cell, value: '', expr: ''}
            }
        }
        //this.setState(table);
    }

    convertIntToAlphabet(n) {
        let ordA = 'A'.charCodeAt(0);
        let ordZ = 'Z'.charCodeAt(0);
        let len = ordZ - ordA + 1;

        let s = '';
        while(n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s;
    };

    generateGrid() {
        let col_header_array = [''];
        for (let col = 0; col < 50; col++) {
            col_header_array.push(this.convertIntToAlphabet(col));
        }
        return [...Array(50).keys()].map((row, i) =>
            col_header_array.map((col, j) => {
                if(i === 0 && j === 0) {
                    return {readOnly: true, value: ''}
                }
                if(row === 0) {
                    return {readOnly: true, value: col}
                }
                if(j === 0) {
                    return {readOnly: true, value: row}
                }
                return this.state[col + row]
            })
        )
    }

    validateExp(trailKeys, expr) {
        let valid = true;
        const matches = expr.match(/[A-Z][1-9]+/g) || [];
        matches.map(match => {
            if(trailKeys.indexOf(match) > -1) {
                valid = false
            } else {
                valid = this.validateExp([...trailKeys, match], this.state[match].expr)
            }
        });
        return valid
    }

    computeExpr(key, expr, scope) {
        let value = null;
        if(expr.charAt(0) !== '=') {
            return {className: '', value: expr, expr: expr};
        } else {
            try {
                value = mathjs.evaluate(expr.substring(1), scope)
            } catch(e) {
                value = null
            }

            if(value !== null && this.validateExp([key], expr)) {
                return {className: 'equation', value, expr}
            } else {
                return {className: 'error', value: 'error', expr: ''}
            }
        }
    }

    cellUpdate(state, changeCell, expr) {
        const scope = _.mapValues(state, (val) => isNaN(val.value) ? 0 : parseFloat(val.value));
        const updatedCell = _.assign({}, changeCell, this.computeExpr(changeCell.key, expr, scope));
        state[changeCell.key] = updatedCell;

        _.each(state, (cell, key) => {
            if(cell.expr.charAt(0) === '=' && cell.expr.indexOf(changeCell.key) > -1 && key !== changeCell.key) {
                state = this.cellUpdate(state, cell, cell.expr)
            }
        });
        return state
    }

    onCellsChanged(changes) {
        const state = _.assign({}, this.state);
        changes.forEach(({cell, value}) => {
            this.cellUpdate(state, cell, value)
        });
        this.setState(state)
    }

    render() {

        return (
            <Datasheet
                data={this.generateGrid()}
                valueRenderer={(cell) => cell.value}
                dataRenderer={(cell) => cell.expr}
                onCellsChanged={this.onCellsChanged}
            />
        )
    }

}
