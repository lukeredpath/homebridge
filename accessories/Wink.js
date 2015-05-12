var types = require("../lib/HAP-NodeJS/accessories/types.js");
var wink = require('wink-js');

function WinkAccessory(log, config) {
  this.log = log;

  // auth info
  this.client_id = config["client_id"];
  this.client_secret = config["client_secret"];
  this.username = config["username"];
  this.password = config["password"];

  // device info
  this.name = config["name"];
  this.device = null;

  this.log("Searching for Wink device with exact name '" + this.name + "'...");
  this.search();
}

WinkAccessory.prototype = {

  search: function() {
    var that = this;

    wink.init({
        "client_id": this.client_id,
        "client_secret": this.client_secret,
        "username": this.username,
        "password": this.password
    }, function(auth_return) {
      if ( auth_return === undefined ) {
        that.log("There was a problem authenticating with Wink.");
      } else {
        // success
        wink.user().device(that.name, function(device) {
          that.device = device
        });
      }
    });

  },

  setPowerState: function(powerOn) {
    if (!this.device) {
      this.log("No '"+this.name+"' device found (yet?)");
      return;
    }

    var that = this;

    if (powerOn) {
      this.log("Setting power state on the '"+this.name+"' to on");
      this.device.power.on(function(response) {
        if (response === undefined) {
          that.log("Error setting power state on the '"+that.name+"'")
        } else {
          that.log("Successfully set power state on the '"+that.name+"' to on");
        }
      });
    }else{
      this.log("Setting power state on the '"+this.name+"' to off");
      this.device.power.off(function(response) {
        if (response === undefined) {
          that.log("Error setting power state on the '"+that.name+"'")
        } else {
          that.log("Successfully set power state on the '"+that.name+"' to off");
        }
      });
    }

  },

  setBrightness: function(level) {
    if (!this.device) {
      this.log("No '"+this.name+"' device found (yet?)");
      return;
    }

    var that = this;

    this.log("Setting brightness on the '"+this.name+"' to on");
    this.device.brightness(level, function(response) {
      if (response === undefined) {
        that.log("Error setting brightness on the '"+that.name+"'")
      } else {
        that.log("Successfully set brightness on the '"+that.name+"' to " + level);
      }
    });
  },

  getServices: function() {
    var that = this;
    return [{
      sType: types.ACCESSORY_INFORMATION_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.name,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Name of the accessory",
        designedMaxLength: 255
      },{
        cType: types.MANUFACTURER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Wink",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Manufacturer",
        designedMaxLength: 255
      },{
        cType: types.MODEL_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "Rev-1",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Model",
        designedMaxLength: 255
      },{
        cType: types.SERIAL_NUMBER_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: "A1S2NASF88EW",
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "SN",
        designedMaxLength: 255
      },{
        cType: types.IDENTIFY_CTYPE,
        onUpdate: null,
        perms: ["pw"],
        format: "bool",
        initialValue: false,
        supportEvents: false,
        supportBonjour: false,
        manfDescription: "Identify Accessory",
        designedMaxLength: 1
      }]
    },{
      sType: types.LIGHTBULB_STYPE,
      characteristics: [{
        cType: types.NAME_CTYPE,
        onUpdate: null,
        perms: ["pr"],
        format: "string",
        initialValue: this.name,
        supportEvents: true,
        supportBonjour: false,
        manfDescription: "Name of service",
        designedMaxLength: 255
      },{
        cType: types.POWER_STATE_CTYPE,
        onUpdate: function(value) { that.setPowerState(value); },
        perms: ["pw","pr","ev"],
        format: "bool",
        initialValue: 0,
        supportEvents: true,
        supportBonjour: false,
        manfDescription: "Change the power state of the Bulb",
        designedMaxLength: 1
      },{
        cType: types.BRIGHTNESS_CTYPE,
        onUpdate: function(value) { that.setBrightness(value); },
        perms: ["pw","pr","ev"],
        format: "int",
        initialValue:  0,
        supportEvents: true,
        supportBonjour: false,
        manfDescription: "Adjust Brightness of Light",
        designedMinValue: 0,
        designedMaxValue: 100,
        designedMinStep: 1,
        unit: "%"
      }]
    }];
  }
};

module.exports.accessory = WinkAccessory;