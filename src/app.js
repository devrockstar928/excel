import React from 'react'
import 'react-select/dist/react-select.css'
import  './excel_lib/react-datasheet.css'
import MathSheet from './MathSheet.js';

export default class App extends React.Component {
  render () {
    return (
      <div>
        <div className={'container'} >
          <div className={'sheet-container'}>
            <MathSheet />
          </div>
        </div>
      </div>
    )
  }
}