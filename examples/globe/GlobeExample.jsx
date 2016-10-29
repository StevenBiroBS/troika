import React from 'react'
import ReactDOM from 'react-dom'
import {Canvas3D} from '../../src/index'
import Earth from './Earth'


export default React.createClass({
  propTypes: {
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },

  getInitialState() {
    return {
      rotateX: 0,
      rotateY: 0,
      trackMouse: false,
      hoveredCountry: null,
      wireframe: false,
      colorScheme: 'technicolor'
    }
  },

  _onMouseMove(e) {
    if (this.state.trackMouse) {
      let rect = ReactDOM.findDOMNode(this).getBoundingClientRect()
      let x = e.clientX - rect.left
      let y = e.clientY - rect.top
      this.setState({
        rotateX: Math.PI / 2 * (y / rect.height * 2 - 1),
        rotateY: Math.PI * (x / rect.width * 2 - 1)
      })
    }
  },

  _toggleWireframe() {
    this.setState({wireframe: !this.state.wireframe})
  },

  _toggleTrackMouse() {
    this.setState({trackMouse: !this.state.trackMouse})
  },

  _changeColorScheme(e) {
    this.setState({colorScheme: e.target.options[e.target.selectedIndex].value})
  },

  _onCountryMouseOver(id) {
    this.setState({hoveredCountry: id})
  },

  _onCountryMouseOut() {
    this.setState({hoveredCountry: null})
  },

  _getOceanColor() {
    switch (this.state.colorScheme) {
      case 'technicolor':
        return 0x000066
      case 'greyscale':
        return 0x000000
      case 'satellite':
        return 0x004989
      case 'night':
        return 0x000000
    }
  },

  _getCountryColor(d, i, arr) {
    let hovering = d.id === this.state.hoveredCountry
    switch (this.state.colorScheme) {
      case 'technicolor':
        if (i % 2) i = arr.length - 1 - i //flip every other one for greater neighbor contrast
        let color = Math.round(i / (arr.length - 1) * 0xffffff)
        return hovering ? 0xffffff - color : color
      case 'greyscale':
        if (hovering) return 0x3ba7db //highlight blue
        if (i % 2) i = arr.length - 1 - i //flip every other one for greater neighbor contrast
        let grey = Math.round(50 + 100 * i / (arr.length - 1))
        return (grey << 16) + (grey << 8) + grey
      case 'satellite':
        return hovering ? 0x3ba7db : 0xffffff
      case 'night':
        return hovering ? 0x0000ff : 0xffffff
    }
  },

  _getCountryTexture() {
    switch (this.state.colorScheme) {
      case 'satellite':
        return 'globe/texture_day.jpg'
      case 'night':
        return 'globe/texture_night.jpg'
    }
    return null
  },

  render() {
    let state = this.state
    let {width, height} = this.props
    return (
      <div onMouseMove={ this._onMouseMove }>
        <Canvas3D
          antialias
          width={ width }
          height={ height }
          camera={ {
            aspect: width / height,
            x: 0,
            y: 0,
            z: 300,
            lookAt: {x: 0, y: 0, z: 0}
          } }
          lights={ [
            {
              type: 'directional',
              color: 0xffffff,
              x: 1,
              y: 0,
              z: 1
            }
          ] }
          objects={ [
            {
              key: 'earth',
              class: Earth,
              scaleX: 100,
              scaleY: 100,
              scaleZ: 100,
              rotateY: state.trackMouse ? state.rotateY : 0,
              rotateX: state.trackMouse ? state.rotateX : 0,
              onCountryMouseOver: this._onCountryMouseOver,
              onCountryMouseOut: this._onCountryMouseOut,
              //highlightCountry: state.hoveredCountry,
              wireframe: state.wireframe,
              oceanColor: this._getOceanColor(),
              getCountryColor: this._getCountryColor,
              countryTexture: this._getCountryTexture(),
              animation: state.trackMouse ? null : {
                from: {rotateY: 0},
                to: {rotateY: Math.PI * 2},
                duration: 24000,
                iterations: Infinity
              }
            }
          ] }
        />

        <div className="example_desc">
          <p></p>
        </div>

        <div className="example_controls">
          <button onClick={ this._toggleTrackMouse }>Track Mouse: { `${!!state.trackMouse}` }</button>
          <button onClick={ this._toggleWireframe }>Wireframe: { `${!!state.wireframe}` }</button>
          <select onChange={ this._changeColorScheme }>
            <option value="technicolor">Technicolor</option>
            <option value="greyscale">Greyscale</option>
            <option value="satellite">Satellite</option>
            <option value="night">Night Lights</option>
          </select>
        </div>
      </div>
    )
  }
})
