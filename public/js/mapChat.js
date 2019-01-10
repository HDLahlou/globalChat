var socket = io();

function scrollToBottom (){
//Selectors
//make sure there is a gradient
var messages = jQuery('#messages');
var newMessage = messages.children('li:last-child');
//Heights
var clientHeight = messages.prop('clientHeight');
var scrollTop = messages.prop('scrollTop');
var scrollHeight = messages.prop('scrollHeight');
var newMessageHeight = newMessage.innerHeight();
var lastMessageHeight = newMessage.prev().innerHeight();

if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight){
  messages.scrollTop(scrollHeight);
}
}
// // TODO: Create:
//  a minimize chat button,
// place marker button,
// map search function,
// pop up for marker creation,
// connect db,
// create accounts
//sidebar tab to switch between rooms/chats
//create accounts/settings/preferences
//create private conversation/ private rooms, wont be publicly listed, will be DMs
//This feature can also include a map2me function, brings up the path to them

socket.on('connect', function () {
  console.log('Connected to server');
  var location;
  //Check Geolocation
  if(!navigator.geolocation){
    window.location.href = "help.html";
    return alert('Geolocation not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition(function (position){
    //Grab user Location
    location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }
    var params = jQuery.deparam(window.location.search);
    //Emit join Function
    socket.emit('join', params, location , function(err) {
      if(err){
        alert(err);
        window.location.href = '/';
      }else{
        console.log('No error');
      }
    })
  }, function(){
    alert('Unable to fetch location');
    window.location.href = "help.html";
  })

})


socket.on('disconnect', function () {
  console.log('Disconnected from server');
})

socket.on('updateUserList', function (users) {
  var ol = jQuery('<ol></ol>');

  users.forEach(function (user){
    ol.append(jQuery('<li></li>').text(user));
  });
  jQuery('#users').html(ol);
});


socket.on('newMessage', function (message){
  var formattedTime = moment(message.createdAt).format('h:mm a')
  var template = jQuery("#message-template").html();
  var html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime

  });

  jQuery('#messages').append(html);
  scrollToBottom();
  // console.log('New Message');
  // var li = jQuery('<li></li>');
  // li.text(`${formattedTime} ${message.from}: ${message.text}`);
  //
  // jQuery('#messages').append(li);
});




jQuery('#message-form').on('submit', function (e){
  e.preventDefault();
  console.log("Submit ");

  var messageTextbox = jQuery('[name=message]');
  socket.emit('createMessage', {
    text: messageTextbox.val()
  }, function(){
    messageTextbox.val('')
  })
});


// TODO:
// Create marker placing system, X
// click on button, X
// select on map where to place, X
// finds that positions coord X
// brings a pop up of what the info of that marker should be,
// determines if its public or private, private includes adding permisions,
// Attributes should include content position, pointer of marker in order to remove, id, creator id
// make program wait until user location is secured


function createMarker(position, title, map){
  var marker = new google.maps.Marker({
    position: position,
    title: title,
    map: map
  })
  return marker;
}

var placeMarkerBool = false;

 jQuery('#markerButton').on('click', function(e){
   e.preventDefault();
   placeMarkerBool = true;
   console.log(placeMarkerBool);
 })
var map, infoWindow;
function initMap() {

  map = map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 15
  });
   infoWindow = new google.maps.InfoWindow;

   // Try HTML5 geolocation.
   if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(function(position) {
       var pos = {
         lat: position.coords.latitude,
         lng: position.coords.longitude
       };

       infoWindow.setPosition(pos);
       infoWindow.setContent('Location found.');
       infoWindow.open(map);
       map.setCenter(pos);
       createMarker(pos, 'You are Here', map);
       google.maps.event.addListener(map, 'click', function(event) {
         console.log('Boolean Value');
         console.log(placeMarkerBool);
         if (placeMarkerBool) {
           createMarker({lat: event.latLng.lat(), lng: event.latLng.lng()}, 'You Created a Marker', map);
           placeMarkerBool = false;
         }
       });

     }, function() {
       handleLocationError(true, infoWindow, map.getCenter());
     });
   } else {
     // Browser doesn't support Geolocation
     handleLocationError(false, infoWindow, map.getCenter());
   }
 }

 function handleLocationError(browserHasGeolocation, infoWindow, pos) {
   infoWindow.setPosition(pos);
   infoWindow.setContent(browserHasGeolocation ?
                         'Error: The Geolocation service failed.' :
                         'Error: Your browser doesn\'t support geolocation.');
   infoWindow.open(map);
 }
