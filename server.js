var net = require('net');
var HOST = '127.0.0.1';
var PORT = 6969;

var db = {}
var bossHP = 100
var tempBoss = bossHP

let sockets = []; // array of sockets

// emmit data to all connected clients
const broadcast = (msg) => {
    //Loop through the active clients object
    sockets.forEach((client) => {
        client.write(msg);
    });
};

net.createServer(function (sock) {
    sockets.push(sock)
    var state = 0
    var current_key = null    
    sock.on('data', function (data) {
        switch(state){
            case 0:
                if(data == 'BEGIN'){
                    sock.write('BEGIN')
                    state = 1
                }
                break
            case 1:
                current_key = data
                if(db[current_key] != null){
                    sock.write("BossHP: " + bossHP + "\n" + "" + current_key + "HP: " + db[current_key])
                }else {
                    sock.write("BossHP: " + bossHP + "\n" + "" + current_key + "HP: " + 50)
                }
                state = 2
                break
            case 2:
                if(!db[current_key])
                        db[current_key] = 50
                if(data == 'ATTACK'){
                    tempBoss -= 10
                    db[current_key] = db[current_key] - 10
                }else{
                    sock.write("INVALID")
                }
                if(tempBoss != bossHP){
                    bossHP -= 10
                    broadcast("BossHP: " + bossHP + "\n" + "BossATTACK\n" + current_key + "HP: " + db[current_key])
                    
                }    
                if(bossHP == 0 || data == 'FLEE' || db[current_key] == 0){
                    sock.close()
                    state = 3
                }
                break           
        }
    });
    
}).listen(PORT, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);