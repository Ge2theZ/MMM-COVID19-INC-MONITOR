Module.register("MMM-COVID19-INC-MONITOR", {
  defaults: {
    header: "COVID19-Incidence-Monitor",
    districtAsAgs: ["Reutlingen", "Tübingen", "Stuttgart", "Esslingen"],
    showLastUpdate: true,
    updateInterval: 4320000 // 12h
  },
  SOCKET_NOTIFICATIONS: {
    GET_INCIDENCE: "GET_INCIDENCE",
    GET_INCIDENCE_RESPONSE: "GET_INCIDENCE_RESPONSE"
  },
  districtIncidence: {},
  lastUpdated: null,

  // Override dom generator.
  getDom: function () {
    let wrapper = document.createElement("table");
    wrapper.className = "incidenceTable";

    let tableHead = document.createElement("thead");
    let tableHeadRow = document.createElement("tr");
    let incidenceCounty = document.createElement("td");
    let incidenceState = document.createElement("td");
    let incidenceValue = document.createElement("td");
    let deltaCases = document.createElement("td");
    let deltaDeaths = document.createElement("td");
    let deltaRecovered = document.createElement("td");
    let tableBody = document.createElement("tbody");

    incidenceCounty.innerHTML = this.translate("County");
    incidenceState.innerHTML = this.translate("State");
    incidenceValue.innerHTML = this.translate("Incidence");
    deltaCases.innerHTML = this.translate("DeltaCases");
    deltaDeaths.innerHTML = this.translate("DeltaDeaths");
    deltaRecovered.innerHTML = this.translate("DeltaRecovered");

    tableHead.appendChild(tableHeadRow);
    tableHeadRow.append(
      incidenceCounty,
      incidenceState,
      incidenceValue,
      deltaCases,
      deltaDeaths,
      deltaRecovered
    );
    wrapper.append(tableHead, tableBody);

    console.log(this.districtIncidence);
    if (Object.entries(this.districtIncidence).length === 0) {
      let tableRow = document.createElement("tr");
      let countyData = document.createElement("td");
      let stateData = document.createElement("td");
      let incidenceData = document.createElement("td");
      let deltaCasesData = document.createElement("td");
      let deltaDeathsData = document.createElement("td");
      let deltaRecoveredData = document.createElement("td");

      countyData.innerHTML = this.translate("Loading");
      stateData.innerHTML = this.translate("Loading");
      incidenceData.innerHTML = this.translate("Loading");
      deltaCasesData.innerHTML = this.translate("Loading");
      deltaDeathsData.innerHTML = this.translate("Loading");
      deltaRecoveredData.innerHTML = this.translate("Loading");

      tableRow.append(
        countyData,
        stateData,
        incidenceData,
        deltaCasesData,
        deltaDeathsData,
        deltaRecoveredData
      );
      tableBody.appendChild(tableRow);
      return wrapper;
    } else {
      Log.log(this.districtIncidence);
      tableBody.remove();
      for (const [key, district] of Object.entries(this.districtIncidence)) {
        let tableRow = document.createElement("tr");
        let countyData = document.createElement("td");
        let stateData = document.createElement("td");
        let incidenceData = document.createElement("td");
        let deltaCasesData = document.createElement("td");
        let deltaDeathsData = document.createElement("td");
        let deltaRecoveredData = document.createElement("td");

        countyData.innerHTML = district.county;
        stateData.innerHTML = district.state;
        incidenceData.innerHTML = district.weekIncidence.toFixed(0);
        deltaCasesData.innerHTML = district.delta.cases;
        deltaDeathsData.innerHTML = district.delta.deaths;
        deltaRecoveredData.innerHTML = district.delta.recovered;

        tableRow.append(
          countyData,
          stateData,
          incidenceData,
          deltaCasesData,
          deltaDeathsData,
          deltaRecoveredData
        );
        tableBody.appendChild(tableRow);
      }
      wrapper.appendChild(tableBody);
      return wrapper;
    }
  },

  getStyles: function () {
    return ["MMM-COVID19-INC-MONITOR.css"];
  },

  getTranslations: function () {
    return {
      en: "translations/en.json",
      de: "translations/de.json"
    };
  },

  start: function () {
    Log.log(this.name + " is loaded!");
    this.requestIncidenceNumbers();
    this.scheduleUpdate();
  },

  requestIncidenceNumbers: function () {
    this.sendSocketNotification(
      this.SOCKET_NOTIFICATIONS.GET_INCIDENCE,
      this.config.districtAsAgs
    );
  },

  scheduleUpdate: function () {
    let self = this;
    setInterval(function () {
      self.requestIncidenceNumbers();
    }, self.config.updateInterval);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === this.SOCKET_NOTIFICATIONS.GET_INCIDENCE_RESPONSE) {
      Log.log(
        "Received socket notification: " + notification + " with payload: ",
        payload
      );

      this.districtIncidence = payload;
      this.lastUpdated = new Date();
      this.updateDom();
    }
  },

  getHeader: function () {
    let headerTitle = this.config.header;
    if (this.lastUpdated) {
      headerTitle +=
        " - " +
        this.lastUpdated.toLocaleDateString() +
        " : " +
        this.lastUpdated.toLocaleTimeString();
    }
    return headerTitle;
  }
});
