db = new Mongo.Collection('db')

if (Meteor.isClient) {

  Meteor.subscribe('db')

  Session.set("template", "hello")

  Meteor.startup(function () {
        setInterval(function () {
          Session.set("time", new Date());
        }, 1000);

        setInterval(function () {
          if (db.find({name: "swipe"}).fetch().length > 0) {
            if (Session.get("template") == "hello")
              Session.set("template", "goodbye")
            else
              Session.set("template", "hello")
            db.remove({name: "swipe"})
          }
      }, 10);
    });

  Template.main.helpers({
    template: function () {
      return Session.get("template")
    }
  });

  Template.hello.helpers({
    rpm: function () {
      return db.find({name: "rpm"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value
    },
    rpmPct: function () {
      return db.find({name: "rpm"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value / 7000.0
    },
    vss: function () {
      return db.find({name: "vss"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value
    },
    temp: function () {
      return parseFloat(db.find({name: "temp"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value) * 9.0 / 5.0 + 32
    },
    load_pct: function () {
      return db.find({name: "load_pct"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value
    },
    time: function () {
      t = Session.get("time")
      var hour = t.getHours()
      if (hour > 12)
        hour -= 12
      if (t.getMinutes() < 10)
        return hour + ":0" + t.getMinutes()
      else
        return hour + ":" + t.getMinutes()
    },
    seconds: function () {
      t = Session.get("time")
      if (t.getSeconds() < 10)
        return "0" + t.getSeconds()
      else
        return t.getSeconds()
    }
  });

  Template.goodbye.helpers({
    rpm: function () {
      return db.find({name: "rpm"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value
    },
    rpmPct: function () {
      return db.find({name: "rpm"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value / 7000.0
    },
    vss: function () {
      return db.find({name: "vss"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value
    },
    temp: function () {
      return parseFloat(db.find({name: "temp"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value) * 9.0 / 5.0 + 32
    },
    load_pct: function () {
      return db.find({name: "load_pct"}, {sort: {timestamp: -1}, limit: 1}).fetch()[0].value
    },
    time: function () {
      t = Session.get("time")
      var hour = t.getHours()
      if (hour > 12)
        hour -= 12
      if (t.getMinutes() < 10)
        return hour + ":0" + t.getMinutes()
      else
        return hour + ":" + t.getMinutes()
    },
    seconds: function () {
      t = Session.get("time")
      if (t.getSeconds() < 10)
        return "0" + t.getSeconds()
      else
        return t.getSeconds()
    }
  });
}

if (Meteor.isServer) {

  Meteor.publish('db', function() {
    return db.find({}, {sort:{timestamp: -1}, limit: 4});
});

  Meteor.methods({
    getSwipe: function (text) {
      db.remove({name: "swipe"})
      db.insert({name: "swipe"})
    }
  });

  Meteor.startup(function () {
    // code to run on server at startup
    var obdReader = Meteor.npmRequire('bluetooth-obd')
    var obd = new obdReader()
    obd.on('connected', function () {
      this.addPoller("vss");
      this.addPoller("rpm");
      this.addPoller("temp");
      this.addPoller("load_pct");
   
      this.startPolling(1000);
    });

    obd.on('dataReceived', Meteor.bindEnvironment(function (data, error) {
        console.log(data)
        if (data.value != "NO DATA")
          db.insert({name: data.name, value: data.value, timestamp: new Date()})
      })
    )

    obd.autoconnect('OBDII')
  });
}
