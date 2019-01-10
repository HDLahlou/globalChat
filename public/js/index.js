var socket = io();

var roomTextbox = jQuery('[name=room]');
var options = [];
var userLogin = jQuery('#userLogin')

function dropbtnFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
  if (event.target == modal) {
      modal.style.display = "none";
  }
}

var modal = document.getElementById('id01');


userLogin.on('click', function(){
  if(!navigator.geolocation){
    window.location.href = "help.html";
    return alert('Geolocation not supported by your browser');
  }

  navigator.geolocation.getCurrentPosition(function (position){
    socket.emit('userGelocation',{
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    });

  }, function(){
    alert('Unable to fetch location');
    window.location.href = "help.html";
  })
})



roomTextbox.on('click', function(){
  socket.emit('roomTextClick', function(arr){
      var rooms = jQuery('#rooms')
      var optionsTemp = [];
      var match;
      var temp;
      optionsTemp = arr.filter(function(room){
        match = false;
        for(j =0; j< options.length; j++){
          if(room == options[j]){
            match = true;
          }
        }
        if(!match){
          return room;
        }
      })
        options.push.apply(options, optionsTemp);
        console.log(optionsTemp);
        for(i = 0; i < optionsTemp.length; i++){
          temp = jQuery(`<option value='${optionsTemp[i]}'>`);
          rooms.append(temp);
        }

      console.log(options);
      console.log('help');
  });

  // li.text(`${formattedTime} ${message.from}: ${message.text}`);
  //
  // jQuery('#messages').append(li);
})
