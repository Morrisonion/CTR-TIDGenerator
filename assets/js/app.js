$(document).ready(function() {
  var nusUrl = "https://morrisonion.github.io/TID-API/data/nus-titles.json";
  var udbUrl = "https://morrisonion.github.io/TID-API/data/udb-titles.json";

  var loadedStatus = 0;
  var completelyLoaded = 1 | 2;
  var nusData = {};
  var udbData = {};
  var titleIDPre = "000400000";
  var titleIDPost = "00";
  var titleIDMax = 0xF7FFF;
  var titleIDMin = 0x300;

  function setLoadedBit(bit) {
    loadedStatus = loadedStatus | bit;
    if ((loadedStatus & completelyLoaded) === completelyLoaded) {
      $(".unusedTitleID").html(generateID());
    }
  }

  $.getJSON(nusUrl, function(data) {
    nusData = data;
    setLoadedBit(1);
  });

  $.getJSON(udbUrl, function(data) {
    udbData = data;
    setLoadedBit(2);
  });

  $("#checkID").click(function() {
    $(".response").slideUp().promise().done(function() {
      searchID($("input[name='checkTitleID']").val().toUpperCase());
    });
  });

  $("#reloadTitleID").click(function() {
    $(".unusedTitleID").html(generateID());
  });

  function generateID() {
    while (true) {
      var gameID = pad(
        parseInt(Math.random() * (titleIDMax - titleIDMin + 1) + titleIDMin)
          .toString(16)
          .toUpperCase(),
        5
      );
      var randomID = titleIDPre + gameID + titleIDPost;

      if (!(randomID in nusData) && !(randomID in udbData)) {
        return titleIDPre + "<strong>" + gameID + "</strong>" + titleIDPost;
      } else {
        console && console.debug && console.debug("ID " + randomID + " exists.");
      }
    }
  }

  function unshortenTitleID(titleID) {
    var capture = titleID.match(/([a-f0-9]+)\s*$/i);

    if (!capture) {
      return "";
    }

    titleID = capture[1];

    if (titleID.length <= 8) {
      if (titleID.length <= 6) {
        titleID = titleID + titleIDPost;
      }
      titleID = titleIDPre.substr(0, 8) + pad(titleID, 8);
    }

    titleID = pad(titleID, 16);
    return titleID;
  }

  function searchID(titleID) {
    titleID = unshortenTitleID(titleID);

    console.debug(titleID);

    if (titleID in nusData) {
      $(".foundAppTitle").text(nusData[titleID]);
      $(".foundAppDev").text("");
      $(".foundAppImage").hide();

      if ($(".response_success").is(":hidden")) {
        $(".response_success").slideDown();
      }
      return true;
    }

    if (titleID in udbData) {
      $(".foundAppTitle").text(udbData[titleID].name);
      $(".foundAppDev").text("");
      $(".foundAppImage").hide();

      if ($(".response_success").is(":hidden")) {
        $(".response_success").slideDown();
      }
      return true;
    }

    if (
      !(
        titleID.length === 16 &&
        titleID.substring(0, 8) === "00040000" &&
        titleID.substring(14) === "00" &&
        parseInt(titleID.substring(8, 14), 16) >= titleIDMin &&
        parseInt(titleID.substring(8, 14), 16) <= titleIDMax
      )
    ) {
      if ($(".response_invalid").is(":hidden")) {
        $(".response_invalid").slideDown();
      }
      return null;
    }

    if ($(".response_failed").is(":hidden")) {
      $(".response_failed").slideDown();
    }
    return false;
  }

  function pad(n, width, z) {
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
  }
});