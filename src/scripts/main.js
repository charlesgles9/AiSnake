var canvas;
var context;
var map=[];
var width=34;
var height=18;
var food;
var segment=[];
var path=[];
var route=[];
var proute=[];
var current_path_index=0;
var resetFood=true;
//varibales to store the cap and get fps values
var ms_per_frame=1/60;
var dt=0;
var p_frame=0;
var fps=0;
// snake update speed after every 100 ms
var segment_speed=100;
var segment_p_frame=0;
var randomRoute;
var debug=false;
var Bound={
	// world position
	x:0,
    y:0,
    // grid size
    size:0,
    // position 1D
    index:0,
    // position 2D
    i:0,
    j:0,
    //search heuristics 
    h:Infinity,
    // total heuristic 
    cost:Infinity,
    // global goal
    g:Infinity,
    // neighboring nodes 
    nbrs:null,
    // pointer to the next and parent node
    next:null,
    parent:null,
    safe:true,
     set(x,y,size){
		this.x=x;
		this.y=y;
		this.size=size;
		this.nbrs=[];
		return this;
	},
	
	// calculates the h value of this node 
	calculate(node,global){
		var a=(node.i-global.i)*(node.i-global.i);
		var b=(node.j-global.j)*(node.j-global.j);
		this.g=a+b;
		var c=(this.i-node.i)*(this.i-node.i);
		var d=(this.j-node.j)*(this.j-node.j);
		this.h=c+d;
		this.cost=this.g+this.h;
		return this.cost;
	},
	
	draw(){
		context.font="8px Arial";
		context.fillstyle="black";
		var text=this.cost==Infinity?-1:this.cost;
		context.strokeText(text,this.x+this.size/2,this.y+this.size/2);
	}
};


function init(){
	canvas=document.getElementById("canvas");
	context=canvas.getContext("2d");
	// create grids 
	for(var i=0;i<width;i++){
		for(var j=0;j<height;j++){
			var obj=Object.create(Bound);
			obj.index=i*height+j;
			obj.i=i;
			obj.j=j;
			var size=25;
			obj.set(i*size,j*size,size);
			map.push(obj);
		}
	}
  // add neigbors in the nodes 
  for(var i=0;i<width;i++){
	  for(var j=0;j<height;j++){
		  var obj=map[i*height+j];
		   var nbr;
		  // add the western nbr
		  if((i-1)>=0){
			  nbr=map[(i-1)*height+j];
			  obj.nbrs.push(nbr);
		  }
		  // add eastern nbr
		  if((i+1)<width){
			  nbr=map[(i+1)*height+j];
			  obj.nbrs.push(nbr);
			  
		  }
		  // add northern nbr
		  if((j-1)>=0){
			  nbr=map[i*height+j-1];
			  obj.nbrs.push(nbr);
		  }
		  // add southern nbr
		  if((j+1)<height){
			  nbr=map[i*height+j+1];
			  obj.nbrs.push(nbr);
		  }
	  }
	 }
	food=Object.create(map[0]);
	addSegment(width*height/2);
}

// implementation of the A* algorithm 
function solvePath(dest){
	
	// reset parent
	for(let p of path){
		p.parent=null;
		p.safe=true;
	}
	
	// remove previous paths 
	path.splice(0,path.length);
    // snake cannot pass by itself     
	for(var i=0;i<segment.length;i++){
		let s=segment[i];
	//	if(segment[0]!=s)
		map[s.index].safe=false;
	}    
	     
	var openList=[];
	var closedList=[];
	var found=false;
	 route=[];
	// push the start node to our list
	// this is the head of the snake segment
	var start=map[segment[0].index];
	var end=map[dest.index];
	openList.push(start);
     start.safe=false;
	while(openList.length>0){
	  var cost=Infinity;
		for(let n of openList){
			closedList.push(n);
			// if we reached destination exit loop
		if(closedList.includes(end)){
		     found=true;
		    break;
		}
		    n.calculate(n,end);
		    for(let b of n.nbrs){
			   if(b.safe&!closedList.includes(b)){
				   b.calculate(n,end);
				    if(b.h<=cost){
					if(!openList.includes(b))
					  openList.push(b);
					  route.push(b);
					  b.parent=n;
					  cost=b.h;
					 
				  }
			  }
		   }	
		}
		
		// remove all nodes in openList that are contained in closedList
		// since they have already been visited
		openList=openList.filter(item=>!closedList.includes(item));
	}
	
   // get the linked parent values 
   while(end!=null&found){
	   path.push(end);
	   end=end.parent;
   }
   
   // test if solution is found if not pick a 
   // random location 
   if(found){
       proute=route;
	   console.log("solution found");
	  }
	  else{
	      randomRoute=proute.length>0;
	      console.log("no solution");
	      if(randomRoute)
	      solvePath(proute[proute.length-1]);
	      else 
	      reset=true;
	  } 
	   
  current_path_index=path.length-1;
}

function randomFoodTranslation(){
    //exclude areas where the snake segments are
	var arr=map.filter(item=>!segment.includes(item));
	var position=Math.min(Math.round((Math.random()*arr.length),arr.length-1));
	var obj=map[arr[position].index];
	food.set(obj.x,obj.y,25);
	food.index=obj.index;
	food.i=obj.i;
	food.j=obj.j;
	resetFood=false;
	solvePath(food);
	
}
	
function addSegment(index,position){
  segment.splice(position,0,Object.create(map[index]));	
  map[index].safe=false;
}

function getTimeStamp(){
	return window.performance&&window.performance.now?
	window.performance.now():new Date().getTime();
}

function getFps(){
	var delta=p_frame+1000;
	if(delta>=time){
		dt++;
	}else{
		fps=dt;
		p_frame=time;
		dt=0;
		
	}
	
}

// update function to move the snake 
function update(){
	var delta=segment_p_frame+segment_speed;
	if(delta<=time){
		moveSegment();
		segment_p_frame=time;
	}
}

// clear screen 
function repaint(){
context.clearRect(0,0,850,450);
}

function moveSegment(){
 if(current_path_index<0)
	return;
  var ref=path[current_path_index--];
  
  // add a new segment if  the snake has eaten food
  if(testCollision(ref)){
	  addSegment(ref.index,0);
	  resetFood=true
  }else{
  //move the snake segments relative to the head
  for(var i=segment.length-1;i>0;i--){
	  var prev=segment[i-1];
	  segment[i].set(prev.x,prev.y,prev.size);
	  segment[i].index=prev.index;
	  segment[i].i=prev.i;
	  segment[i].j=prev.j;
  }
  segment[0].set(ref.x,ref.y,ref.size);
  segment[0].index=ref.index;
  segment[0].i=ref.i;
  segment[0].j=ref.j;
}

}

function testCollision(obj){
	return food.index==obj.index;
	
}

/* limit the snake length and reset incase it's dead */
function testIfSnakeDead(){
	var reset=false;
		for(var s =2;s<segment.length;s++){
		     var body=segment[s];
			if(segment[0].index==body.index){
				reset=true;
			   break;
		}
	}
   if(reset|segment.length>=200){
	   segment.splice(1,segment.length-1);
   }
}

function draw(){
	time=getTimeStamp();
	repaint();
	context.fillStyle="green";
  for(var i=0;i<width*height;i++){
		var obj=map[i];
		obj.safe=true;
		// draw the tiles
		context.fillRect(obj.x,obj.y,obj.size,obj.size);
   }
  
   // reset position if we reached it
   if(resetFood)
   randomFoodTranslation();
   // update snake position
    update();
   // if current snake position is equal to the food position reset it 
   resetFood=current_path_index<0&resetFood==false;
   
  if(debug){
   context.fillStyle="blue";
  // draw all possible routes 
  for(var i=0;i<route.length;i++){
	   var obj=route[i];
	   context.fillRect(obj.x,obj.y,obj.size,obj.size);
	  
      }
    context.fillStyle="lightblue";
    for(let obj of path){
        context.fillRect(obj.x,obj.y,obj.size,obj.size);
    }
  }
   context.fillStyle="brown";
   // draw the food object
   context.fillRect(food.x,food.y,food.size,food.size);
     // draw snake segments
   context.fillStyle="yellow";
   for(var i=0;i<segment.length;i++){
	   var obj=segment[i];
	   context.fillRect(obj.x,obj.y,obj.size-1,obj.size-1);
   }
   testIfSnakeDead();
   // draw fps 
    context.font="12px Arial";
	context.fillstyle="blue";
	context.strokeText("FPS: "+fps,20,20);
	
  getFps();
   
  requestAnimationFrame(draw);

}


init();
draw();

