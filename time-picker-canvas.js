import {LitElement, html} from '@polymer/lit-element'; //Lit element allows for JS template literals, such as ${expression}
 
 
class TimePickerCanvas extends LitElement {
    static get properties() {
        return {
            open : {type: Boolean},
            is24mode : {type: Boolean},
            hour : {type: Number},
            minute : {type: Number},
            am : {type: Boolean},
            selectHour : {type: Boolean}
        }
    }
    constructor(){
        super();
        this.open = false;
        this.selectHour = true;
        this.is24mode = false;
        this.hour = 10;
        this.minute = 0;
    }

    _close(){
        let closeEvent = new CustomEvent('close', {});
        this.dispatchEvent(closeEvent);
    }
 
    //Formats the output by placing leading zeros when necesarry.
    _pad(n) {
        return ('0'.repeat(2) + `${n}`).slice(`${n}`.length);
    }
 
    //Override from lit-element. Tracks changes in properties object on line 4
    updated(changedProperties){
        if (changedProperties.has("open")) {
            document.body.style.overflow = this.open ? 'hidden' : ''; 
        }
    }

    _onConfirm(){
        if (!this.is24mode){
        let confirmEvent = new CustomEvent('confirmTime', {
            detail:`${this._pad(this.hour+1)} : ${this._pad(this.minute)} ${this.am ? "AM" : "PM"}`});
            this.dispatchEvent(confirmEvent);
            this.selectHour = true;
        } else {
            let confirmEvent = new CustomEvent('confirmTime', {
            detail:`${this._pad(this.hour+1)} : ${this._pad(this.minute)}`});
            this.dispatchEvent(confirmEvent);
            this.selectHour = true;
        }
    }
 
    _onTouchStart(event){
        this.isTouchStart = true;
        this._updateClock(event);
    }
    _onTouchEnd(event){
        this.isTouchStart = false;
        this._updateClock(event);
 
        if (this.selectHour){
            this.selectHour = false;
            this._updateClock(event);
        } else {
            this.selectHour = true;
        }
    }
   
    _onTouchMove(event){
        if (this.isTouchStart){
            this._updateClock(event);
        }
    }
   
    _onMouseDown(event){
        this.isMouseDown = true;
        this._updateClock(event);
    }
 
    _onMouseUp(event){
        this.isMouseDown = false;
        this._updateClock(event);
 
        if (this.selectHour){
            this.selectHour = false;
            this._updateClock(event);
        }
    }
   
    _onMouseMove(event){
        if (this.isMouseDown){
            this._updateClock(event);
        }
    }
 
    _updateClock(event) {

        let rect= this.shadowRoot.querySelector("#clock-face").getBoundingClientRect();


        //Discriminate between touch and mouse event
        let clientXPos, clientYPos;
        if (event.changedTouches) {
            clientXPos = event.changedTouches[0].clientX;
            clientYPos = event.changedTouches[0].clientY;
        } else {      
            clientXPos = event.clientX;
            clientYPos = event.clientY;
        }
 
        let x =  clientXPos - rect.left;
        let y = clientYPos - rect.top;
 
        let centerLength =  rect.width/2;
        x -= centerLength;
        y -= centerLength;
 
        let closestFeasableNumber, minDistance = Infinity,
        numberPosition = (this.selectHour  ? hourPos : minutePos);//selectHour = true is hour, false is minutes
 
        /*Drawing numbers on clockface. If currently selecting hours, either select 12 or 24 hours, else select minutes*/
        for (let i = 0; i < (this.selectHour ? (this.is24mode ? 24 : 12) : 60); i++){
            let distance = Math.hypot(numberPosition[i].x - x, numberPosition[i].y - y);
 
            if (distance < minDistance){
                minDistance = distance;
                closestFeasableNumber = i;
            }
        }
 
        if (this.selectHour){
            this.hour = closestFeasableNumber
        } else {
            this.minute = closestFeasableNumber
            console.log("minute is", this.minute);
        }
        console.debug("closestFeasableNumber is", closestFeasableNumber)
    }

    render() {
        let handleAngle = this.selectHour ? 360*(this.hour+1)/12 - 90 : 360*(this.minute)/60 - 90;
        let handleWidth = this.selectHour ? (this.hour > 12 ? "20%" : "35%") : "35%";

        return html`
            <style>
                :host {
                    display: block;
                }
                #background {
                    display: flex;
                    background-color: rgba(0,0,0,0.5);
                    user-select: none;
                    position: fixed;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                }

                #output-container {
                    display: flex;
                    height: 100%;
                    width: 30%;
                    color: rgba(255,255,255,0.4);
                    background-color: #5c826b;
                    justify-content: center;
                    flex-direction: row;
                    align-items: center;
                    font-size: 40px;
                }

                #foreground {
                    background-color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 350px;
                    width: 500px;  
  
                }
                #ampm-container{
                    display:flex;
                    flex-direction: column;
                    font-size: 14px;
                    margin-left: 2px;
                }
                
                #button-container {
                    display: flex;
                    justify-content: flex-end;
                    padding: 10px;
                }
                
                .actionButton {
                    display: flex;
                    padding: 3px;
                    font-size: 25px;
                    border: 1px;
                    color: #5c826b;
                    justify-content: center;
                    margin-right: 10px;
                }


                #clock-container {
                    display: flex;
                    position: relative;
                    border-radius: 50%;
                    flex-direction: row;
                    justify-content: center;
                    align-items: center;
                    flex: 1;
                }
                
                #clock-face {
                    position: relative;
                    height: 240px;
                    width: 240px;
                    border-radius: 50%;
                    background-color: #eeeeee;
                    
                    
                }
                #inputContainer{
                    display: flex;
                    height: 100%;
                    width: 70%;
                    flex-direction: column;
                }
                
                #clock-face>.number{
                    
                    display: flex;
                    transform-origin: 50% 50%;
                    position: absolute;
                    top: 0px;
                    left: 0px;
                    width: 20px;
                    justify-content: center;
                    align-items: center;
                }
                
                .handle{
                    transform-origin: 0 50%;
                    transform: translate(120px, 120px) rotate( ${handleAngle}deg);
                    height: 2px;
                    width: ${handleWidth};
                    border-radius: 2px;
                    background-color: #5c826b;
                }
                #selector-highlight{
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    background-color: #5c826b;
                    transform: translate(75px, -15px);
                }
                #center-point{
                    transform: translate(115px, 115px);
                    width: 10px;
                    height: 10px;
                    background-color: #5c826b;
                    border-radius: 50%;
                }
                

                
                ${this.am ? `
                #am {
                    color: white;
                }
                ` : `
                #pm {
                    color: white;
                }
                `}
                
                ${this.selectHour ? `
    
                    #header-hour {
                        color: white;
                    }
                    ` : `
                    #header-minute {
                        color: white;
                    }
                    `}
                    
    
                ${this.is24mode ? `
                #ampm-container {
                    display: none;
                }
                ` : ``}
 
               
 
                ${!this.open ? `
                #background {
                    display: none
                }
                ` : ` `}
                


            </style>
           
           
            <div id="background">
                <div id="foreground">
                    <div id="output-container">
                       
                        
                        <div id="header-hour"
                        @click ="${ e => {this.selectHour = true; }}" >
                            ${this._pad(this.hour + 1)}
                        </div>
                        <div>:</div>
                        <div id="header-minute"
                        @click = "${ e => {this.selectHour = false; }}">
                            ${this._pad(this.minute)}
                        </div>
                        <div id="ampm-container">
                            <div id="pm"
                            @click ="${ e => {this.am = false;}}" > PM 
                            </div>

                            <div id="am"                            
                            @click ="${ e => {this.am = true; }}"> AM 
                            </div>
                        </div>
                    </div>
                    <div id="inputContainer">
                        <div id="clock-container">
                            <div id="clock-face"
                                    @touchstart="${e => this._onTouchStart(e)}"
                                    @touchend="${e => this._onTouchEnd(e)}"
                                    @touchmove="${e => this._onTouchMove(e)}"
 
                                    @mousedown="${e => this._onMouseDown(e)}"
                                    @mouseup="${e => this._onMouseUp(e)}"
                                    @mousemove="${e => this._onMouseMove(e)}">
                                <div class="handle">
                                    <div id="selector-highlight"></div>
                                </div>
                                <div id="center-point"></div>
                                
                                ${this.selectHour ? hourNumbers.slice(0, (this.is24mode ? 24 : 12)): ``}
                                ${!this.selectHour ? minuteNumbers : ``}
                                                        
                            </div>
                        </div>
                        <div id="button-container">
                            <div class="actionButton" @click="${e => this._close()}">  Close </div>
                            <div class="actionButton" @click="${e => this._onConfirm()}"> Confirm </div>
                        </div>
                    </div>
                    
                    
                </div>
            </div>
        `;
    }
}
 
customElements.define('time-picker-canvas', TimePickerCanvas);
 
 
/* Maps numbers on the clock face to positon in x and y both ways. 
MinutePos and HourPos return maps that handles position of clock numbers to angles*/
const minutePos = (() => {
    const pos = {};
    const segment = (2 * Math.PI) / 60;
    const offset = Math.PI / 2; // Zero degrees (i=0) is located @ 3/15:00 on a natural clock, so an offset of +90 degrees is required.
 
    for (let i = 0; i < 60; i++) {
        pos[i] = {x: 90 * Math.cos(segment * i - offset), y: 90 * Math.sin(segment * i - offset)};
    }
    return pos;
})();
 
const hourPos = (() => {
    const pos = {};
    const segment = (2 * Math.PI) / 12;
    const offset = Math.PI / 3; // Zero degrees (i=0) is located @ 3/15:00 on a natural clock, hour = 0 is not a valid .
 
    for (let i = 0; i < 12; i++) {
        pos[i] = {x: 90 * Math.cos(segment * i - offset), y: 90 * Math.sin(segment * i - offset)};
    }
 
    for (let i = 0; i < 12; i++) {
        pos[i + 12] = {x: 55 * Math.cos(segment * i - offset), y: 55 * Math.sin(segment * i - offset)};
    }
    return pos;
})();
const minuteNumbers = (() => {
    const elements = [];

    for (let i=0; i<60; i+=5){
        elements.push(html`<div class="number" style="transform: translate(${minutePos[i].x+110}px,${minutePos[i].y+110}px)">${i}</div>`);
    }
    return elements;
    })();


const hourNumbers = (() => {
    const elements = [];

    for (let i=0; i<24; i++){
        elements.push(html`<div class="number" style="transform: translate(${hourPos[i].x+110}px,${hourPos[i].y+110}px)">${i+1}</div>`);
    }
    return elements;
    })();
