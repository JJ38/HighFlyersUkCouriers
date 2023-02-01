const contentManagerWindows = document.querySelectorAll('.window');
const draggableLeft = document.querySelector('.leftdraggable');
const draggableRight = document.querySelector('.rightdraggable');



const leftBox = contentManagerWindows[0];
const midBox = contentManagerWindows[1];
const rightBox = contentManagerWindows[2];

//set initial size of windows
// for(let i = 0; i < contentManagerWindows.length; i++){
//     contentManagerWindows[i].style.width = 300 + 'px';

// }

let leftHold = false;
let rightHold = false;
let x = 0;
let difference = 0;


draggableLeft.addEventListener('pointerdown', (e) =>{
    leftHold = true;
    x = e.clientX;
    
});

draggableRight.addEventListener('pointerdown', e =>{
    console.log("right");
    rightHold = true;
    x = e.clientX;

});

document.addEventListener('pointerup', (e) => {
    if(leftHold){
        console.log(e.clientX);
    }
    leftHold = false;
    rightHold = false;
});


document.addEventListener('pointermove', (e) => {
    
    
    if(leftHold){
        // console.log("width: " +leftBox.getBoundingClientRect().width);
        // console.log("difference: " + (e.clientX - x)); 
        // console.log("width - difference: " + (leftBox.getBoundingClientRect().width - (difference)));
        // console.log("X: " + x);

        difference = x - e.clientX;

        //move boxes

        leftBox.style.width = (leftBox.getBoundingClientRect().width - (difference)) + 'px';
        midBox.style.width = (midBox.getBoundingClientRect().width + (difference)) + 'px';
        rightBox.style.width = rightBox.getBoundingClientRect().width + 'px';
        x = e.clientX;

        //move slider

        draggableLeft.style.left = draggableLeft.getBoundingClientRect().left - difference + 'px';

      
    } 
    if(rightHold){
        console.log(e.clientX);
    }

});


