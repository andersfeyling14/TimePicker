import {LitElement, html} from '@polymer/lit-element';

import './time-picker-canvas';

class TimePickerCanvasDemo extends LitElement {
    static get properties() {
        return {
            open0 : {type: Boolean},
            open1 : {type: Boolean},
            open2 : {type: Boolean},
            is24mode : {type: Boolean},
            am : {type: Boolean}
 
        }
    }
    _onOpen0(){
        this.open0 = true;
    }
    _onOpen1(){
        this.open1 = true;
    }
    _onOpen2(){
        this.open2 = true;
    }
    _onConfirm(e,numId){
        let inputFromClass = e.detail;
        let getFieldID = this.shadowRoot.querySelector("#inputField"+numId);

        getFieldID.value = inputFromClass;
        this.open0 = false;
        this.open1 = false;
        this.open2 = false;
    }

    _onClose(){
        this.open0 = false;
        this.open1 = false;
        this.open2 = false;
    }
    render() {
        // language=HTML
        return html`
            <style>
                :host {
                    display: block;
                }
 
                input {
                    margin-left: 40px;
                    margin-bottom: 400px;
                }
            </style>

            <div>
                <input id="inputField0" @click="${e => this._onOpen0()}" readonly>
                <input id="inputField1" @click="${e => this._onOpen1()}" readonly>
                <input id="inputField2" @click="${e => this._onOpen2()}" readonly>

                <time-picker-canvas .open="${this.open0}" .is24mode="${true}" 
                    @confirmTime="${e => this._onConfirm(e,0)}"
                    @close="${e => this._onClose()}">
                </time-picker-canvas>

                <time-picker-canvas .open="${this.open1}" 
                    @confirmTime="${e => this._onConfirm(e,1)}"
                    @close="${e => this._onClose()}">
                </time-picker-canvas>

                <time-picker-canvas class="is24mode" .open="${this.open2}" .is24mode="${false}"  
                    @confirmTime="${e => this._onConfirm(e,2)}"
                    @close="${e => this._onClose()}">
                </time-picker-canvas>
            </div>
        `;
    }
}

customElements.define('time-picker-canvas-demo', TimePickerCanvasDemo);