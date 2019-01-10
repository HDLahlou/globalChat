const geolib = require('geolib');
const {Users} = require('./users');
const uniqid = require('uniqid');


class Rooms{
  constructor(){
    this.rooms = [{id: "USA", nodeLocation: {latitude: 39.8333333,longitude:-98.585522}, chatLog:[]}]

  }
  //add another var to help with room searching, should it include its radius?
  addRoom(id,nodeLocation, chatLog){
    id = id.toUpperCase();
    var room = {id, nodeLocation,chatLog};
    this.rooms.push(room);
    return room;
  }
  removeRoom(id){
    var room = this.getRoom(id);

    if(room){
      this.rooms =this.users.filter((room) => room.id !== id)
    }
    return room;
  }

  getRoom(id){
    return this.rooms.filter((room) => room.id ===id)[0]
  }
  updateChatLog(id,message){
    var room = this.getRoom(id);
    if(room){
      var index = this.rooms.indexOf(room);
      this.rooms[index].chatLog.push(message);
      return message
    }
    else {
      return console.error(`Room: ${room} was not found`);
    }
  }
  getLocalRooms(userLocation, radius){
    var localRooms = []
    var room = this.rooms
    for (var i = 0; i < room.length; i++) {
      if(geolib.isPointInCircle(
        //point
        {latitude:room[i].nodeLocation.latitude , longitude: room[i].nodeLocation.longitude},
        //center
        {latitude: userLocation.latitude, longitude: userLocation.longitude},
        //radius/meters
        radius
      )){
        localRooms.push(room[i]);
      }
    }
    if (localRooms.length>0) {
      return localRooms
    }
    else {
      this.addRoom(uniqid(),userLocation);
      localRooms.push({id: uniqid(),nodeLocation: userLocation})
      return localRooms
    }

  }


}






module.exports= {Rooms}
