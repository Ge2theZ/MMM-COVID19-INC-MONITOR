var NodeHelper = require("node_helper");
var request = require("request");

const rkiApiV2DistrictUri = "https://api.corona-zahlen.org/districts/";

module.exports = NodeHelper.create({
  districtIncidence: {},
  districtAsAgs: {},
  start: function () {
    console.log("Starting node helper for: " + this.name);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "GET_INCIDENCE") {
      console.log(
        "Helper for " +
          this.name +
          " received notification: " +
          notification +
          " with payload: ",
        payload
      );
      if (Object.keys(this.districtAsAgs).length === 0) {
        this.getIncidenceByCountyName(payload);
      } else {
        this.getIncidenceByAgs(payload);
      }
    }
  },

  getIncidenceByCountyName: function (districtArr) {
    let self = this;
    const options = {
      method: "GET",
      url: rkiApiV2DistrictUri,
      headers: {}
    };

    console.log("Fetching incidence numbers from uri: ", options.url);
    request(options, function (error, response, body) {
      if (error) {
        console.error(
          "Received error when requesting uri " + rkiApiV2DistrictUri,
          error
        );
      } else {
        if (response.statusCode === 200) {
          const response = JSON.parse(body);
          const filteredResponse = Object.fromEntries(
            Object.entries(response.data).filter(([key, value]) =>
              districtArr.includes(value.name)
            )
          );

          for (let key of Object.keys(filteredResponse)) {
            self.districtAsAgs[filteredResponse[key].name] = key;
          }

          self.districtIncidence = filteredResponse;
          self.sendSocketNotification(
            "GET_INCIDENCE_RESPONSE",
            self.districtIncidence
          );
        } else {
          console.error(
            "Something went wrong when requesting uri " + rkiApiV2DistrictUri,
            body
          );
        }
      }
    });
  },
  getIncidenceByAgs: function (districtArr) {
    const self = this;
    for (const district of districtArr) {
      const options = {
        method: "GET",
        url: rkiApiV2DistrictUri + self.districtAsAgs[district],
        headers: {}
      };

      console.log("Fetching incidence numbers from uri: ", options.url);
      request(options, function (error, response, body) {
        if (error) {
          console.error(
            "Received error when requesting uri " + rkiApiV2DistrictUri + error
          );
        } else {
          if (response.statusCode === 200) {
            const result = JSON.parse(body);
            self.districtIncidence[district] = result.data[district];
            self.sendSocketNotification(
              "GET_INCIDENCE_RESPONSE",
              self.districtIncidence
            );
          } else {
            console.error(
              "Something went wrong when requesting uri " + rkiApiV2DistrictUri,
              body
            );
          }
        }
      });
    }
  }
});
