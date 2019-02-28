var players = {};
var getRedactedPlayers = function(){
    var redPlayers = {};
    for (var id in players) {
        if (players.hasOwnProperty(id)) {
            redPlayers[id] = players[id].getRedacted();
        }
    }
    return redPlayers;
}
function setupChat(db){
	var io = require('socket.io')();
	io.on('connection', function(socket){
		var me = null;
		socket.on('join_pc',function(characterId){
			me = new classes.character();
			db.collection('characters').find({id: characterId}).toArray(function(err, result){
				me.load(result[0]);
				log(`player ${me.name} has connected`);
				me.socket = socket;
				players[me.id] = me;
				io.emit('playerListUpdate', getRedactedPlayers());
				db.collection('messages').find({$or: [{'recipients.id': me.id}, {'sender.id': me.id}]}).toArray(function(err, result){
					if(err)
						throw err;
					socket.emit('messages', result);
				});
			});
		});
		socket.on('message',function(data){
			db.collection('characters').find({}).toArray(function(err, result){
				if (err)
					throw err;
				var sId = data.sender;
				data.sender = new classes.character();
				var c = result.find(function(element){
					return element.id == sId;
				});
				data.sender.load(c);
				for (var index in data.recipients) {
					var s_Id = data.recipients[index];
					data.recipients[index] = new classes.character();
					data.recipients[index].load(result.find(function(element){return element.id == s_Id}));
				}
				players[data.sender.id].socket.emit('message', data);
				for (var index in data.recipients){
					if(players[data.recipients[index].id] != undefined)
						players[data.recipients[index].id].socket.emit('message', data);
				}
				db.collection('messages').insertOne(data);
			});
		});
		socket.on('recall',function(data){
			if(players[data.characterId])
				players[data.characterId].socket.emit('recall',data);
			socket.emit('recalled', data);
			var statusObj = {};
			statusObj['status.'+data.characterId] = 'recalled';
			db.collection('messages').updateOne({id: data.messageId}, {$set: statusObj});
		});
		socket.on('disconnect',function(){
			if(me != undefined)
			{
				log(`player ${me.name} has disconnected`);
				delete players[me.id];
			}
			io.emit('playerListUpdate', getRedactedPlayers());
		});
		socket.on('getCharacters',function(){
			db.collection('characters').find({}).toArray(function(err, result){
				socket.emit('characterList', result);
			});
		});
		socket.on('createCharacter', function(data){
			var id = db.collection('characters').insertOne(data);
			db.collection('characters').update({_id: id.insertedId}, {stats: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0, 20:0}});
		});
		socket.on('stat', function(data){
			console.log(`stat collected: ${data}`);
			var subquery = {};
			subquery[`stats.d${data}`] = 1;
			console.log(subquery);
			db.collection('characters').update({id: me.id}, {$inc: subquery}, function(err, res){
				if(err)
					console.log(err);
			});
			//Error: on entering 4 mongo crashes
		});
	});
	return io;
}

module.exports = setupChat;