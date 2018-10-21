import {LitElement, html, svg} from '@polymer/lit-element'; //Lit element allows for JS template literals, such as ${expression}
 
 
class TimePickerCanvas extends LitElement {
    static get properties() {
        return {
            open : {type: Boolean},
            is24mode : {type: Boolean},
            hour : {type: Number},
            minute : {type: Number},
            am : {type: Boolean}
        }
    }
    constructor(){
        super();
        this.open = false;
        this.selectHour = true
        this.is24mode = false;
        this.hour = 10;
        this.minute = 0;
       
    }
    firstUpdated() { //Runs one time at start
        this.init();
    }
    init() {
        this.canvas = this.shadowRoot.querySelector("canvas");
        this.ctx = this.canvas.getContext("2d"); //Spawning a 2D drawing object for the canvas scene
 
        this.radius = this.canvas.height/2; //Dynamically set the radius. The clock radius is scale invariant
        this.ctx.translate(this.radius, this.radius); //Centering
        //this.radius = this.radius * 0.90; //Reducing the radius by 10% to create padding.
        /* Drawing the initial clock face */
        this.drawFace();
        this.drawNumbers();
        this._drawHandle();
        console.log("Drawing clock face"); //Debug
    }
    _close(){
        let closeEvent = new CustomEvent('close', {});
        this.dispatchEvent(closeEvent);
    }
 
    //Formats the output
    _pad(n) {
        return ('0'.repeat(2) + `${n}`).slice(`${n}`.length);
    }
 
    //Override from lit-element. Tracks changes in properties object on line 4
    updated(changedProperties){
        if (changedProperties.has("open")) {
            document.body.style.overflow = this.open ? 'hidden' : ''; 
        }
    }
    _drawHandle(){
 
        let handlePos = this.selectHour ? hourPos : minutePos;
        let drawThisNum = this.selectHour ? this.hour : this.minute;
        this.ctx.beginPath();
        this.ctx.moveTo(0,0);
        let pos = handlePos[drawThisNum];
        this.ctx.lineTo(pos.x, pos.y)
        this.ctx.stroke();
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
            this.drawClock(0);
        }
    }
   
    _onTouchMove(event){
        if (this.isTouchStart){
            this._updateClock(event);
        }
    }
   
    _onMouseDown(event){;
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
 
        let rect = this.canvas.getBoundingClientRect();
 
        //Discriminate between touch and mouse event
        let clientXPos, clientYPos;
 
        if (event.changedTouches) {
            clientXPos = event.changedTouches[0].clientX
            clientYPos = event.changedTouches[0].clientY
        } else {      
            clientXPos = event.clientX
            clientYPos = event.clientY
        }
 
        let x =  clientXPos - rect.left;
        let y = clientYPos - rect.top;
 
        let centerLength =  this.canvas.width/2;
        x -= centerLength;
        y -= centerLength;
 
        let closestFeasableNumber, minDistance = Infinity,//mode = 0 is hour, mode = 1 is minutes
        numberPosition = (this.selectHour  ? hourPos : minutePos);
 
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
        }
        this.drawClock();
    }
 
   
    /*  ctx functions at https://www.w3schools.com/tags/ref_canvas.asp  */
    drawFace() {
       
        this.ctx.beginPath(); //reset pen
        this.ctx.arc(0, 0, this.radius, 0, 2*Math.PI); //arc(centerX, centerY, radius, startAngle, endAngle)
        this.ctx.fillStyle = "white";
        this.ctx.fill();
       
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.radius*0.05, 0, 2*Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.lineWidth = 1.5;
        this.ctx.fill();
       
    }
   
    drawNumbers(){
        this.ctx.font = this.radius*0.15 + "px arial";
        this.ctx.textBaseline = "middle";
        this.ctx.textAlign = "center";
       
        console.debug("If selecting minutes, should be false", this.selectHour)
        const numberPosition = (this.selectHour  ? hourPos : minutePos);
        let minIncVec = [];
        // At each index, hold a multiplum of 5.
        for (let i = 0; i < 60; i +=5){
            minIncVec.push(i);
        }
 
        for (let i = 0; i < (this.selectHour ? (this.is24mode ? 24 : 12) : 60 ); i++) {
            if (!this.selectHour){
                if (minIncVec.includes(i)){
                this.ctx.fillText((i).toString(), numberPosition[i].x, numberPosition[i].y);
            }
            }else{
            this.ctx.fillText((i+1).toString(), numberPosition[i].x, numberPosition[i].y);
        }
           
    }
    }
       
    drawClock(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height); //Purge elements
        this.drawFace();
        this.drawNumbers();
        this._drawHandle();
    }
    render() {
        // language=HTML
        return html`
            <style>
                :host {
                    display: block;
                }
                #container {
                    display: flex;
                    position: fixed;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                }
                #time-picker-header {
                    display: flex;
                    background-color: lightslategray;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 3px;
                    height: 25px;
                }

                #whole-component {
                    width: 150px;
                    background-color: white;
                }
                #ampm-container{
                    display:flex;
                    flex-direction: column;
                    font-size: 8px;
                    margin-left: 2px;
                }
                #time-picker-footer {
                    display: flex;
                    background-color: lightslategray;
                    justify-content: space-around;
                    
                }
                
                .actionButton {
                    display: flex;
                    padding: 3px;
                    font-size: 15px;
                    border: 1px;
                    flex: 1;
                    justify-content: center;
                }

                .actionButton:first-of-type {
                    border-right: 1px solid;
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
                
                

                ${this.is24mode ? `
                #ampm-container{
                    display:none
                }
                `: ``}
 
               
 
                ${!this.open ? `
                #container {
                    display: none
                }
                ` : ` `}
            </style>
           
            <div id="container">
                <div id="whole-component">
                    <div id="time-picker-header">
                       
                        <div id="time-picker-header-hour"
                        @click ="${ e=> {this.selectHour = true;this.drawClock();}}" >
                            ${this._pad(this.hour+1)}
                        </div>
                        <div>:</div>
                        <div id="time-picker-header-minute"
                        @click = "${ e=> {this.selectHour = false; this.drawClock();}}">
                            ${this._pad(this.minute)}
                        </div>
                        
                        <div id="ampm-container">
                            <div id="pm"
                            @click ="${ e=> {this.am = false;}}" > PM 
                            </div>

                            <div id="am"                            
                            @click ="${ e=> {this.am = true;}}"> AM 
                            </div>
                        </div>
 
                    </div>
                    <canvas id="time-picker-canvas"
                        width="150"
                        height="150"
               
                       @touchstart="${e=>this._onTouchStart(e)}"
                       @touchend="${e=>this._onTouchEnd(e)}"
                       @touchmove="${e=>this._onTouchMove(e)}"
 
                      @mousedown="${e=>this._onMouseDown(e)}"
                      @mouseup="${e=>this._onMouseUp(e)}"
                      @mousemove="${e=>this._onMouseMove(e)}">
                    </canvas>
                    <div id="time-picker-footer">
                        <div class="actionButton" @click="${e=>this._close()}">  Close </div>
                        <div class="actionButton" @click="${e=>this._onConfirm()}"> Confirm </div>
                    </div>
                </div>
            </div>
        `;
    }
}
 
customElements.define('time-picker-canvas', TimePickerCanvas);
 
 
/* Maps numbers on the clock face to positon in x and y both ways. MinutePos and HourPos return maps that handles position of clock numbers to angles*/
const minutePos = (() => {
    const pos = {};
    const segment = (2 * Math.PI) / 60;
    const offset = Math.PI / 2;
 
    for (let i = 0; i < 60; i++) {
        pos[i] = {x: 60 * Math.cos(segment * i - offset), y: 60 * Math.sin(segment * i - offset)};
    }
    return pos;
})();
 
const hourPos = (() => {
    const pos = {};
    const segment = (2 * Math.PI) / 12;
    const offset = Math.PI / 3;
 
    for (let i = 0; i < 12; i++) {
        pos[i] = {x: 60 * Math.cos(segment * i - offset), y: 60 * Math.sin(segment * i - offset)};
    }
 
    for (let i = 0; i < 12; i++) {
        pos[i + 12] = {x: 30 * Math.cos(segment * i - offset), y: 30 * Math.sin(segment * i - offset)};
    }
 
    return pos
})();
