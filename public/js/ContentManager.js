
const parser = new DOMParser();

const contentManagerWindows = document.querySelectorAll('.window');
const draggableLeft = document.querySelector('.leftdraggable');
const draggableRight = document.querySelector('.rightdraggable');
const contentManagerWrapper = document.querySelector('.contentmanagerwrapper');
const content = document.querySelector('.content');
const head = document.querySelector('head');
const selectPage = document.getElementById("selectpage");


const leftBox = contentManagerWindows[0];
const midBox = contentManagerWindows[1];
const rightBox = contentManagerWindows[2];

let innerWidth = window.innerWidth;
let sidebarWidth = 200;


draggableLeft.style.right = innerWidth - sidebarWidth + 'px';
draggableRight.style.right = sidebarWidth + 'px';


let leftHold = false;
let rightHold = false;
let x = 0;
let midBoxLeftClick = false
let initialXPos = 0;
let initialYPos = 0;
let initialAbsoluteRight = 0;
let initialAbsoluteTop = 0;
let contentScale = 1;
let links = [];


let leftWidth = sidebarWidth;
let midWidth = innerWidth - (2 * sidebarWidth);
let rightWidth = sidebarWidth;

var allObjectTreeElements = [];
var allSelectedPageElements = [];



var editableDocument; //select page as document
var contentHTML;   //selected page as string
var selectedFile = 'NewHomepage.twig';


var objectTreeDom = parser.parseFromString('<div class = root> </div>', "text/html").body.children[0];


//Set object window, edit window and attribute window
contentManagerWrapper.style.gridTemplateColumns = sidebarWidth + 'px ' + (innerWidth - (2 * sidebarWidth)) + 'px ' + sidebarWidth + 'px';

//gets files of initialpage
getFile(selectedFile);

//sets content to content div
content.innerHTML =  contentHTML;

//add event listeners to


//Event listeners


draggableLeft.addEventListener('pointerdown', (e) =>{
    x = e.clientX;
    leftHold = true;
});

draggableRight.addEventListener('pointerdown', e =>{
   
    x = e.clientX;
    rightHold = true;
    
});

document.addEventListener('pointerup', (e) => {

    leftHold = false;
    rightHold = false;
    midBoxLeftClick = false;
});


document.addEventListener('pointermove', (e) => {
    
    if(leftHold){
     
        //check if sliders are within 100px of each other or mouse movement is to the left
        if((draggableLeft.getBoundingClientRect().right + 100) < draggableRight.getBoundingClientRect().right || (e.clientX < x && x < draggableRight.getBoundingClientRect().right - 100)){

           moveLeftSlider(e.clientX);
        }

        x = e.clientX;

    } 
    if(rightHold){
       
        //check if sliders are within 100px of each other or mouse movement is to the right
        if(((draggableRight.getBoundingClientRect().right - 100) > draggableLeft.getBoundingClientRect().right) || (e.clientX > x && x > (draggableLeft.getBoundingClientRect().right + 100))){
           moveRightSlider(e.clientX);
        }

        x = e.clientX;

    }   

});

onresize = (event) => {

    //change size of containers in proportion to change in inner width

    //get ratio of screen size taken up by each window
    let leftRatio = innerWidth/leftWidth;
    let midRatio = innerWidth/midWidth;
    let rightRatio = innerWidth/rightWidth;


    //change position of sliders
    let leftSliderOffset = draggableLeft.getBoundingClientRect().right;
    let rightSliderOffset = draggableRight.getBoundingClientRect().right;

    let leftSliderOffsetRatio = innerWidth / leftSliderOffset;
    let rightSliderOffsetRatio = innerWidth / rightSliderOffset;


    //update to new inner width
    innerWidth = window.innerWidth;

    leftWidth = innerWidth / leftRatio;
    midWidth = innerWidth / midRatio;
    rightWidth = innerWidth / rightRatio;


    contentManagerWrapper.style.gridTemplateColumns = leftWidth + 'px ' + midWidth + 'px ' + rightWidth + 'px';


    draggableLeft.style.right = rightWidth + midWidth + 'px';
    draggableRight.style.right = rightWidth + 'px';


 
};


midBox.addEventListener('pointerdown', (e) => {
    
    initialAbsoluteRight = midBox.getBoundingClientRect().right - content.getBoundingClientRect().right; 
    initialAbsoluteTop = content.getBoundingClientRect().top - midBox.getBoundingClientRect().top; 
    
    initialXPos = e.clientX;
    initialYPos = e.clientY;
    midBoxLeftClick = true;


});

midBox.addEventListener('pointermove', (e) => {
    
    if(midBoxLeftClick){
    
        let differenceX = initialXPos - e.clientX;   
        let differenceY = e.clientY - initialYPos;

        content.style.right = (initialAbsoluteRight + differenceX) +'px';
        content.style.top = (initialAbsoluteTop + differenceY)  + 'px';

    }
    
});

midBox.addEventListener('wheel', (e) =>{


    if(e.deltaY > 0){//mwheeldown
        scaleAmount = -0.02;
        
    }else{//mwheelup
        scaleAmount = 0.02;

    }

    var matrix = "matrix(" + (contentScale + scaleAmount) + ",0,0," + (contentScale + scaleAmount) + ",0,0)";
    contentScale = contentScale + scaleAmount;
    content.style.transform = matrix;

});











//functions

function moveRightSlider(moveToX){

    rightWidth = innerWidth - moveToX;
    midWidth = innerWidth - leftWidth - (innerWidth - moveToX);

    contentManagerWrapper.style.gridTemplateColumns = leftWidth + 'px ' + midWidth + 'px ' + rightWidth + 'px';

    //move slide
    draggableRight.style.right = innerWidth - moveToX + 'px';
        
}

function moveLeftSlider(moveToX){

    leftWidth = innerWidth - (innerWidth - moveToX);
    midWidth = innerWidth - (innerWidth - (innerWidth - moveToX)) - rightWidth;


    contentManagerWrapper.style.gridTemplateColumns = leftWidth + 'px ' + midWidth + 'px ' + rightWidth + 'px';

    //move slide
    draggableLeft.style.right = innerWidth - moveToX + 'px';
}




async function getFile(selectedFile){

    contentHTML = await getHTMLFile('/HighFlyersUkCouriers/private/app/templates/' + selectedFile);

    //identify and twig templating and which files need to be fetched
    var twigExpressionsUnfiltered = contentHTML.match(/(?<={%\s+).*?(?=\s+%})/gs);

    if(twigExpressionsUnfiltered != null){
        //converts twig file to html
        await convertTwigToHTML(twigExpressionsUnfiltered);
    }


    //gets css files
    getCSSFiles(selectedFile);


    //converts html file into dom element for manipulation later on
    const parser = new DOMParser();
    editableDocument = parser.parseFromString(contentHTML, "text/html");


    //generate object tree for selected page
    
    content.innerHTML = editableDocument.querySelector('body').innerHTML;

    generateObjectTree();
}

async function getHTMLFile(filePath){
    //gets html file
    return await fetch(filePath).then(response => response.text());

}

function getCSSFiles(selectedFile){


    var strippedSelectedFile = selectedFile.substring(0, selectedFile.indexOf('.'));
    
    //if css links have been added for different page then remove them before adding new ones
    
    if(links.length > 0){
        console.log(links)
        for(let i = 0; i < links.length; i++){
            head.removeChild(links[i]);
            
        }
       
    }

    links = [];

    //creates css links
    var link = document.createElement('link');
 
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'css/' + strippedSelectedFile + '.css';

    links.push(link);
    head.prepend(link);

    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'css/Footer.css';

    links.push(link);
    head.prepend(link);

    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = 'css/NavigationBar.css';

    links.push(link);
    head.prepend(link);
}

async function convertTwigToHTML(twigExpressionsUnfiltered){
    //filter out known unwanted twig exressions
    contentHTML = contentHTML.replaceAll("{% extends 'boilerplate.twig' %}", "");
    contentHTML = contentHTML.replaceAll("{% block content %}", "");
    contentHTML = contentHTML.replaceAll("{% endblock %}", "");

    //remove block content and endblock expressions
    var twigExpressionsFiltered = twigExpressionsUnfiltered.filter(function(value, index, arr){ 
        return value != 'block content' && value != 'endblock';
    });

    console.log(twigExpressionsFiltered);

    
    var twigFileNames = [];
    for(let i = 0; i < twigExpressionsFiltered.length; i++){
        twigFileNames.push(twigExpressionsFiltered[i].substring(
            twigExpressionsFiltered[i].indexOf("'") + 1, 
            twigExpressionsFiltered[i].lastIndexOf("'")
        ));
    }


    //get each file

    var files = [];

    for(let i = 0; i < twigFileNames.length; i++){
        files[i] = await getHTMLFile('/HighFlyersUkCouriers/private/app/templates/' + twigFileNames[i]);
    }
   
    // //replace twig expression with html

    for(let i = 0; i < files.length; i++){
      
        contentHTML = contentHTML.replace(twigExpressionsFiltered[i], files[i]);
    }
    
    //clean up left over {% and %}
    contentHTML = contentHTML.replaceAll("{%", "");
    contentHTML = contentHTML.replaceAll("%}", "");
    
   
}

function selectOnChange(){

    getFile(selectPage.value);
}

function generateObjectTree(){

    //remove all object tree children


    //Loop through every element

    //if element has children add expandable list class and 

    const root = editableDocument.querySelector('body');

    var parentElement = root;

    //objectTreeDom.innerHTML = '';
    objectTreeDom.replaceChildren(getChildElements(parentElement, 1));

    document.querySelector('.objecttree').innerHTML = objectTreeDom.innerHTML;

    //add event listeners to newly generated elements
    let objectTreeExpandableLists = document.querySelectorAll('.expandablelist');

    for(let i = 0; i < objectTreeExpandableLists.length; i++){
        objectTreeExpandableLists[i].addEventListener('click', e => {
            objectTreeExpandableLists[i].nextElementSibling.classList.toggle("nested");
        });
    }
    
    allObjectTreeElements = [];
    allSelectedPageElements = [];
   
    //get all object tree elements in array
    allObjectTreeElements.push(getAllObjectTreeElements(document.querySelector('.objecttree'), allObjectTreeElements));

    var filteredAllObjectTreeElements = allObjectTreeElements.filter(i => i.tagName != 'UL' && i.tagName != 'LI');
    filteredAllObjectTreeElements = filteredAllObjectTreeElements.slice(1, filteredAllObjectTreeElements.length - 1); //removes object tree wrapper 
    
    
    //get all corrosponding elements in selected page in array
    allSelectedPageElements.push(getAllObjectTreeElements(document.querySelector('.content'), allSelectedPageElements));

    const filteredAllSelectedTreeElements = allSelectedPageElements.slice(0, allSelectedPageElements.length - 1);
    

    
    console.log(filteredAllObjectTreeElements);
    console.log(filteredAllSelectedTreeElements);

    var currentlySelectedElement;


    //adds event listeners to object tree to interact with corrosponding selected page element
    for(let i = 0; i < filteredAllSelectedTreeElements.length; i++){
        filteredAllObjectTreeElements[i].addEventListener('mouseover', e => {
            filteredAllSelectedTreeElements[i].classList.toggle('objecttreeselectoutline');
            e.stopPropagation();
        });

        filteredAllObjectTreeElements[i].addEventListener('mouseout', e => {
            filteredAllSelectedTreeElements[i].classList.toggle('objecttreeselectoutline');
            e.stopPropagation();
        });

        filteredAllObjectTreeElements[i].addEventListener('click', e => {

            //deselect currently selected
            currentlySelectedElement = document.querySelector('.listitemselected');
            if(currentlySelectedElement != null){
                currentlySelectedElement.classList.toggle('listitemselected');
            }
            
            //highlight newly selected item
            filteredAllObjectTreeElements[i].classList.toggle('listitemselected');
            e.stopPropagation();

            //update attribute window
            const generatedAttributes = generateAttributes(filteredAllSelectedTreeElements[i]);
            rightBox.replaceChildren(generatedAttributes);
        });
    }

}

function generateAttributes(selectedElement){

    const attributesWrapper = document.createElement('div');

    const elementName = document.createElement('div');
    elementName.innerHTML = selectedElement.tagName;
    attributesWrapper.appendChild(elementName);


    //get appearance attributes

    attributesWrapper.appendChild(generateAppearanceAttributes(selectedElement));

    

    //get dimension attributes

   


    return attributesWrapper;
}

function generateAppearanceAttributes(selectedElement){

    const appearanceAttributeWrapper = document.createElement('div');

    var css = window.getComputedStyle(selectedElement);

    console.log(css);


    return appearanceAttributeWrapper;
}   

function getAllObjectTreeElements(element, array){



    array.push(element);

    if(element.children.length > 0){
       
        //loop through children
        for(let i = 0; i < element.children.length; i++){
           
            getAllObjectTreeElements(element.children[i], array);       
        
        } 
       
    }else{
        return element;
        
    }
    return element;
}



function getChildElements(element, layer){

    const listItemElement = document.createElement('li');
    

    if(element.children.length > 0){
        //add expandable div to tree
        const expandableDivElement = document.createElement('div');
        expandableDivElement.className = 'expandablelist listitem';
        expandableDivElement.innerHTML = 'v ' + element.tagName;
        expandableDivElement.style.paddingLeft = 15 * layer + 'px';


        listItemElement.appendChild(expandableDivElement);

        var unorderedList = document.createElement('ul');
        unorderedList.className = "nested"; 

        //loop through children
        for(let i = 0; i < element.children.length; i++){
       
            unorderedList.appendChild(getChildElements(element.children[i], layer + 1));
           
        } 

        listItemElement.appendChild(unorderedList);

        
    }else{
        const divTextHolder = document.createElement('div');
        divTextHolder.className = "listitem";
        divTextHolder.style.paddingLeft = 15 * layer + 'px';
        divTextHolder.innerHTML = element.tagName;
        listItemElement.appendChild(divTextHolder);
        return listItemElement;
        
    }

    return listItemElement;
}
