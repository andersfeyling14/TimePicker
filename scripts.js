import {LitElement, html, svg} from '@polymer/lit-element'; //Lit element allows for JS template literals, such as ${expression}
import {directive} from 'lit-html';
import {classMap} from 'lit-html/directives/classMap';

import '@material/mwc-button';

function init() {
	var canvas = document.getElementById("canvas"); 
	canvas.addEventListner("mousedown", doMouseDown);
	canvas.addEventListner("mouseup", doMouseUp);
	canvas.addEventListner("mousemove", doMouseMove);

	var ctx = canvas.getContext("2d"); //Spawning a 2D drawing object for the canvas scene
	var radius = canvas.height/2; //Dynamically set the radius. The clock radius is scale invariant
	ctx.translate(radius, radius); //Centering
	radius = radius * 0.90; //Reducing the radius by 10% to create padding.
	drawClock(ctx, radius); //Drawing the clock face
	console.log("Drawing clock face"); //Debug
}


function drawClock(ctx, radius) {

	drawFace(ctx, radius);
	drawNumbers(ctx, radius);
	drawHourHandle(ctx, radius);
	drawMinuteHandle(ctx, radius);
}

/*	ctx functions at https://www.w3schools.com/tags/ref_canvas.asp	*/
function drawFace(ctx, radius) {
	ctx.beginPath(); //reset pen
	ctx.arc(0, 0, radius, 0, 2*Math.PI); //arc(centerX, centerY, radius, startAngle, endAngle)
	ctx.fillStyle = "white";
	ctx.fill();

	var grad = ctx.createRadialGradient(0,0,radius*0.95,0,0,radius*1.05);
	grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius*0.1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius*0.1, 0, 2*Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
}

function drawNumbers(ctx, radius){
	var angle;
	var number;
	ctx.font = radius*0.15 + "px arial";
	ctx.textBaseline = "middle";
	ctx.textAlign = "center";
	//Calculate position for hours to 85% of radius, rotated pi/6 for each number
	for (number = 1; number < 13 ; number++) {
		angle = number * Math.PI / 6; //When hour is 12, it is a full circle
		ctx.rotate(angle);
		ctx.translate(0, -radius*0.85);
		ctx.rotate(-angle);
    	ctx.fillText(number.toString(), 0, 0);
    	ctx.rotate(angle);
    	ctx.translate(0, radius*0.85);
    	ctx.rotate(-angle); 
	}
}

function drawHourHandle(ctx, radius) {
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(0, radius*0.55)
	ctx.stroke();
}

function drawMinuteHandle(ctx, radius) {
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(0, -radius*0.75)
	ctx.stroke();
}