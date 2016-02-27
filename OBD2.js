if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    var obdReader = Meteor.npmRequire('bluetooth-obd')
    var obd = new obdReader()
    obd.on('connected', function () {
      this.addPoller("vss");
      this.addPoller("rpm");
      this.addPoller("temp");
      this.addPoller("load_pct");
      this.addPoller("map");
      this.addPoller("frp");
   
      this.startPolling(1000);
    });

    obd.on('dataReceived', function (data) {
      console.log(data)
      dataReceivedMarker = data
    });

    obd.autoconnect('OBDII')
  });
}
