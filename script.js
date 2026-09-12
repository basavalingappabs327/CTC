/*******************************************************
 * CTC GENERATOR - FRONT END
 * MULTI-USER SAFE
 *******************************************************/


// =====================================================
// YOUR GOOGLE APPS SCRIPT WEB APP URL
// =====================================================

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx3_jmPFlQ5V9jlieN_ygJaVM1iJmF3f8CKqV5c2RIDFwCkCYtmY0nHozyaF4nCBITL/exec";


// =====================================================
// MINIMUM WAIT TIME
// =====================================================

const MINIMUM_WAIT_TIME = 20000;


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const form =
  document.getElementById("ctcForm");

const generateButton =
  document.getElementById("generateButton");

const waitingMessage =
  document.getElementById("waitingMessage");

const waitingSeconds =
  document.getElementById("waitingSeconds");

const successMessage =
  document.getElementById("successMessage");

const downloadButton =
  document.getElementById("downloadButton");

const errorMessage =
  document.getElementById("errorMessage");


// =====================================================
// GENERATED PDF
// =====================================================

let generatedPDF = null;


// =====================================================
// FORM SUBMISSION
// =====================================================

form.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();


    // -----------------------------------------------
    // Reset previous result
    // -----------------------------------------------

    generatedPDF = null;

    downloadButton.classList.add("hidden");

    successMessage.classList.add("hidden");

    errorMessage.classList.add("hidden");


    // -----------------------------------------------
    // Check Apps Script URL
    // -----------------------------------------------

    if (
      !APPS_SCRIPT_URL ||
      APPS_SCRIPT_URL ===
      "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
    ) {

      showError(
        "Google Apps Script Web App URL is missing in script.js."
      );

      return;
    }


    // -----------------------------------------------
    // Disable Generate button
    // -----------------------------------------------

    generateButton.disabled = true;


    // -----------------------------------------------
    // Show Please Wait
    // -----------------------------------------------

    waitingMessage.classList.remove(
      "hidden"
    );


    // -----------------------------------------------
    // Start timer
    // -----------------------------------------------

    const startTime =
      Date.now();


    // -----------------------------------------------
    // Collect form data
    // -----------------------------------------------

    const data = {

      time:
        getValue("time"),

      dateofchargetaken:
        formatDate(
          getValue("dateofchargetaken")
        ),

      GovtOrder:
        getValue("GovtOrder"),

      govtorderdate:
        formatDate(
          getValue("govtorderdate")
        ),

      reason:
        getValue("reason"),

      designation:
        getValue("designation"),

      place:
        getValue("place"),

      relievingofficername:
        getValue("relievingofficername"),

      chargeTakenOfficerName:
        getValue("chargeTakenOfficerName")

    };


    // -----------------------------------------------
    // Send data to Google Apps Script
    // -----------------------------------------------

    fetch(
      APPS_SCRIPT_URL,
      {

        method: "POST",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify(data)

      }
    )

    .then(
      function (response) {

        if (!response.ok) {

          throw new Error(
            "Server returned HTTP " +
            response.status
          );

        }

        return response.json();

      }
    )

    .then(
      function (result) {

        // -------------------------------------------
        // Check Apps Script result
        // -------------------------------------------

        if (!result.success) {

          throw new Error(
            result.error ||
            "Unable to generate CTC PDF."
          );

        }


        // -------------------------------------------
        // Store generated PDF
        // -------------------------------------------

        generatedPDF =
          result;


        // -------------------------------------------
        // Calculate remaining 20-second wait
        // -------------------------------------------

        const elapsed =
          Date.now() - startTime;


        const remaining =
          Math.max(
            0,
            MINIMUM_WAIT_TIME - elapsed
          );


        // -------------------------------------------
        // Show download after minimum 20 seconds
        // -------------------------------------------

        setTimeout(
          function () {

            showDownloadButton();

          },
          remaining
        );

      }
    )

    .catch(
      function (error) {

        waitingMessage.classList.add(
          "hidden"
        );

        generateButton.disabled =
          false;

        showError(
          error.message ||
          "Unable to generate CTC PDF."
        );

      }
    );

  }
);


// =====================================================
// GET ELEMENT VALUE SAFELY
// =====================================================

function getValue(id) {

  const element =
    document.getElementById(id);


  if (!element) {

    return "";

  }


  return (
    element.value || ""
  ).trim();

}


// =====================================================
// SHOW DOWNLOAD BUTTON
// =====================================================

function showDownloadButton() {

  waitingMessage.classList.add(
    "hidden"
  );


  successMessage.classList.remove(
    "hidden"
  );


  downloadButton.classList.remove(
    "hidden"
  );


  generateButton.disabled =
    false;

}


// =====================================================
// DOWNLOAD PDF
// =====================================================

downloadButton.addEventListener(
  "click",
  function () {

    if (!generatedPDF) {

      showError(
        "The PDF is not ready yet."
      );

      return;

    }


    try {

      // -------------------------------------------
      // Convert Base64 to binary
      // -------------------------------------------

      const binary =
        atob(
          generatedPDF.base64
        );


      const bytes =
        new Uint8Array(
          binary.length
        );


      for (
        let i = 0;
        i < binary.length;
        i++
      ) {

        bytes[i] =
          binary.charCodeAt(i);

      }


      // -------------------------------------------
      // Create PDF Blob
      // -------------------------------------------

      const blob =
        new Blob(
          [bytes],
          {
            type:
              generatedPDF.mimeType ||
              "application/pdf"
          }
        );


      // -------------------------------------------
      // Create download URL
      // -------------------------------------------

      const url =
        URL.createObjectURL(blob);


      // -------------------------------------------
      // Create download link
      // -------------------------------------------

      const link =
        document.createElement("a");


      link.href =
        url;


      link.download =
        generatedPDF.filename ||
        "CTC.pdf";


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );


      // -------------------------------------------
      // Release URL
      // -------------------------------------------

      setTimeout(
        function () {

          URL.revokeObjectURL(
            url
          );

        },
        1000
      );


    } catch (error) {

      showError(
        "Unable to download the PDF."
      );

    }

  }
);


// =====================================================
// DATE FORMATTER
// =====================================================
//
// HTML date:
// YYYY-MM-DD
//
// CTC:
// DD-MM-YYYY
// =====================================================

function formatDate(value) {

  if (!value) {

    return "";

  }


  const parts =
    value.split("-");


  if (
    parts.length !== 3
  ) {

    return value;

  }


  return (
    parts[2] +
    "-" +
    parts[1] +
    "-" +
    parts[0]
  );

}


// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {

  errorMessage.textContent =
    message;


  errorMessage.classList.remove(
    "hidden"
  );

}


// =====================================================
// CLEAR GENERATED PDF WHEN PAGE CLOSES
// =====================================================

window.addEventListener(
  "beforeunload",
  function () {

    generatedPDF = null;

  }
);