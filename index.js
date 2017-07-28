let express = require('express'); 
let app = express();

//player variables 
let player1 = false;
let player2 = false;
var p1_IO; 
var p2_IO; 
var gameOn = false;

var inputP1 = new PlayerInput();
var inputP2 = new PlayerInput();

app.use(express.static(__dirname+'/www'));

let server = app.listen(8080, function(){
    var port = server.address().port;
    console.log("Server running at port %s", port);
});

let io = require('socket.io')(server);

io.on('connection', function(socket){
    // si no hay jugador 1
    if(!player1){
        player1 = true; 
        socket.on('disconnect', function(){
            console.log('player 1 disconected');
            player1 = false;
            inputP1.up = inputP1.down = false;
        });
        socket.on('input', function(inputs){
            inputP1.up = inputs.up;
            inputP1.down = inputs.down;
        })
        p1_IO = socket; 
        socket.emit("play", {player:1});
        console.log('player 1 connected');
    }
    else if(!player2){
        player2 = true; 
        socket.on('disconnect', function(){
            console.log('player 2 disconected');
            player2 = false;
            inputP2.up = inputP2.down = false;
        });
        socket.on('input', function(inputs){
            inputP2.up = inputs.up;
            inputP2.down = inputs.down;
        });
        p2_IO = socket; 
        socket.emit("play", {player:2});
        console.log('player 2 connected');
    }
    else{
        socket.emit("play", {player:0});
        console.log('expectator connected');
        socket.on('disconnect', function(){
            console.log('expectator disconected');
        });
    }
})

// relay inputs 
setInterval(function(){
    io.sockets.emit("inputs", {p1up: inputP1.up, p1down:inputP1.down, p2up: inputP2.up, p2down: inputP2.down});
},50);

//start game 
setInterval(function(){
    // if both players are present start the game
    if(player1 && player2 && !gameOn){
        gameOn = true;
        io.sockets.emit("start", {m:"start"});
    }
    else{
        io.sockets.emit("stop", {m:"stop"});
        gameOn = false;
    }
}, 10000);


// game clases 

function PlayerInput(){
    this.up = false; 
    this.down = false;
}