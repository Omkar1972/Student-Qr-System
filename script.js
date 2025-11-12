
window.onload = function () {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  document.getElementById("date").value = formattedDate;

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  document.getElementById("outTime").value = getCurrentTime();

  const messageBox = document.getElementById("message");
  const loader = document.getElementById("loader");
  const loaderText = loader.querySelector("p"); // 👈 get <p> inside loader
  const attendanceForm = document.getElementById("attendanceForm");
  const submitButton = attendanceForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  const savedUser = JSON.parse(localStorage.getItem("userData"));
  const lastSubmission = JSON.parse(localStorage.getItem("lastSubmission"));

  if (savedUser) {
    document.getElementById("name").value = savedUser.name;
    document.getElementById("mobile").value = savedUser.mobile;
    document.getElementById("email").value = savedUser.email;
    document.getElementById("name").disabled = true;
    document.getElementById("mobile").disabled = true;
    document.getElementById("email").disabled = true;
  }

  if (lastSubmission && lastSubmission.date === formattedDate) {
    messageBox.innerText = "You have already submitted today's attendance!";
    messageBox.style.display = "block";
    attendanceForm.style.display = "none";
    return;
  }

  const ALLOWED_LOCATION = {
    lat: 21.13092947063975,
    lng: 79.11654813692904,
    radius: 200,
  };

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ====== ASK LOCATION ON PAGE LOAD ======
  if (navigator.geolocation) {
    loader.style.display = "flex";
    loaderText.innerText = "Checking your location..."; // ✅ FIXED

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        loader.style.display = "none";
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const distance = getDistance(
          userLat,
          userLng,
          ALLOWED_LOCATION.lat,
          ALLOWED_LOCATION.lng
        );

        if (distance <= ALLOWED_LOCATION.radius) {
          messageBox.innerText =
            "✅ You are in the allowed area. You can now submit the form.";
          messageBox.style.display = "block";
          submitButton.disabled = false;
        } else {
          messageBox.innerText =
            "❌ You are not in the allowed area. Submission disabled.";
          messageBox.style.display = "block";
          submitButton.disabled = true;
        }
      },
      (err) => {
        loader.style.display = "none";
        messageBox.innerText =
          "⚠️ Location access denied. Please enable GPS to continue.";
        messageBox.style.display = "block";
      }
    );
  } else {
    messageBox.innerText =
      "⚠️ Geolocation is not supported by this browser.";
    messageBox.style.display = "block";
  }

  // ====== MANUAL SUBMIT AFTER LOCATION ALLOWED ======
  attendanceForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (submitButton.disabled) {
      alert("❌ You cannot submit from this location.");
      return;
    }

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("date").value;
    const inTime = document.getElementById("inTime").value.trim();
    const outTime = getCurrentTime();
    const topic = document.getElementById("topic").value.trim();
    const status = "Out";

    if (!name || !mobile || !email || !inTime || !topic) {
      messageBox.innerText = "⚠️ Please fill all fields before submitting!";
      messageBox.style.display = "block";
      return;
    }

    submitAttendance({ name, mobile, email, date, inTime, outTime, topic, status });
  });

  function submitAttendance(data) {
    localStorage.setItem(
      "userData",
      JSON.stringify({
        name: data.name,
        mobile: data.mobile,
        email: data.email,
      })
    );

    loader.style.display = "flex";
    loaderText.innerText = "Submitting..."; // ✅ FIXED HERE
    messageBox.style.display = "none";
    submitButton.disabled = true;
    submitButton.innerText = "Submitting...";

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) =>
      formData.append(key, value)
    );

    fetch(
      "https://script.google.com/macros/s/AKfycbwVdgo1PMfFebJmSneGkd7Ypr2YVutI7_eGOzXH0o3hNsvHNl_H40ZoywC6RYi4oQHhDQ/exec",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((res) => res.json())
      .then((result) => {
        loader.style.display = "none";
        submitButton.disabled = false;
        submitButton.innerText = "Submit";

        if (result.success) {
          localStorage.setItem(
            "lastSubmission",
            JSON.stringify({ date: data.date })
          );
          messageBox.innerText = "✅ Submitted Successfully!";
          messageBox.style.display = "block";
          attendanceForm.style.display = "none";
        } else {
          messageBox.innerText = "❌ Error: " + result.error;
          messageBox.style.display = "block";
        }
      })
      .catch((err) => {
        loader.style.display = "none";
        submitButton.disabled = false;
        submitButton.innerText = "Submit";
        console.error("Error:", err);
        messageBox.innerText =
          "❌ Error submitting form. Please try again later.";
        messageBox.style.display = "block";
      });
  }
};




































// window.onload = function () {
//   const today = new Date();
//   const formattedDate = today.toISOString().split("T")[0];
//   document.getElementById("date").value = formattedDate;

//   function getCurrentTime() {
//     const now = new Date();
//     return now.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });
//   }

//   document.getElementById("outTime").value = getCurrentTime();

//   const messageBox = document.getElementById("message");
//   const loader = document.getElementById("loader");
//   const attendanceForm = document.getElementById("attendanceForm");
//   const submitButton = attendanceForm.querySelector('button[type="submit"]');

//   const savedUser = JSON.parse(localStorage.getItem("userData"));
//   const lastSubmission = JSON.parse(localStorage.getItem("lastSubmission"));

//   if (savedUser) {
//     document.getElementById("name").value = savedUser.name;
//     document.getElementById("mobile").value = savedUser.mobile;
//     document.getElementById("email").value = savedUser.email;
//     document.getElementById("name").disabled = true;
//     document.getElementById("mobile").disabled = true;
//     document.getElementById("email").disabled = true;
//   }

//   // if (lastSubmission && lastSubmission.date === formattedDate) {
//   //   messageBox.innerText = "You have already submitted today's attendance!";
//   //   messageBox.style.display = "block";
//   //   document.getElementById("attendanceForm").style.display = "none";
//   //   return;
//   // }

//   // ====== LOCATION RESTRICTION CONFIG ======
//   const ALLOWED_LOCATION = {
//     lat: 21.13092947063975,  // ✅ Your location latitude
//     lng: 79.11654813692904,  // ✅ Your location longitude
//     radius: 200              // meters (allowed distance)
//   };

//   // Function to calculate distance between 2 points (Haversine formula)
//   function getDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371e3; // radius of Earth in meters
//     const φ1 = lat1 * Math.PI / 180;
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c;
//   }

//   // ====== FORM SUBMIT EVENT ======
//   attendanceForm.addEventListener("submit", function (e) {
//     e.preventDefault();

//     const name = document.getElementById("name").value.trim();
//     const mobile = document.getElementById("mobile").value.trim();
//     const email = document.getElementById("email").value.trim();
//     const date = document.getElementById("date").value;
//     const inTime = document.getElementById("inTime").value.trim();
//     const outTime = getCurrentTime();
//     const topic = document.getElementById("topic").value.trim();
//     const status = "Out";

//     if (!name || !mobile || !email || !inTime || !topic) {
//       messageBox.innerText = "⚠️ Please fill all fields before submitting!";
//       messageBox.style.display = "block";
//       return;
//     }

//     // ✅ Ask for user's GPS location before submitting
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           const userLat = pos.coords.latitude;
//           const userLng = pos.coords.longitude;
//           const distance = getDistance(
//             userLat,
//             userLng,
//             ALLOWED_LOCATION.lat,
//             ALLOWED_LOCATION.lng
//           );

//           console.log(`User is ${distance.toFixed(2)}m from allowed location.`);

//           if (distance <= ALLOWED_LOCATION.radius) {
//             // ✅ Inside allowed area — proceed
//             submitAttendance({ name, mobile, email, date, inTime, outTime, topic, status });
//           } else {
//             // ❌ Outside allowed area
//             alert("❌ You are not within the allowed location to submit attendance!");
//           }
//         },
//         (err) => {
//           alert("⚠️ Unable to get your location. Please enable GPS and try again.");
//         }
//       );
//     } else {
//       alert("⚠️ Geolocation is not supported by this browser.");
//     }
//   });

//   // ====== FUNCTION TO SUBMIT DATA ======
//   function submitAttendance(data) {
//     localStorage.setItem("userData", JSON.stringify({ name: data.name, mobile: data.mobile, email: data.email }));

//     loader.style.display = "flex";
//     messageBox.style.display = "none";
//     submitButton.disabled = true;
//     submitButton.innerText = "Submitting...";

//     const formData = new FormData();
//     Object.entries(data).forEach(([key, value]) => formData.append(key, value));

//     fetch("https://script.google.com/macros/s/AKfycbwVdgo1PMfFebJmSneGkd7Ypr2YVutI7_eGOzXH0o3hNsvHNl_H40ZoywC6RYi4oQHhDQ/exec", {
//       method: "POST",
//       body: formData
//     })
//       .then(res => res.json())
//       .then(result => {
//         loader.style.display = "none";
//         submitButton.disabled = false;
//         submitButton.innerText = "Submit";

//         if (result.success) {
//           localStorage.setItem("lastSubmission", JSON.stringify({ date: data.date }));
//           messageBox.innerText = "✅ Submitted Successfully!";
//           messageBox.style.display = "block";
//           attendanceForm.style.display = "none";
//         } else {
//           messageBox.innerText = "❌ Error: " + result.error;
//           messageBox.style.display = "block";
//         }
//       })
//       .catch(err => {
//         loader.style.display = "none";
//         submitButton.disabled = false;
//         submitButton.innerText = "Submit";
//         console.error("Error:", err);
//         messageBox.innerText = "❌ Error submitting form. Please try again later.";
//         messageBox.style.display = "block";
//       });
//   }
// };



















// window.onload = function () {
//   const today = new Date();
//   const formattedDate = today.toISOString().split("T")[0];
//   document.getElementById("date").value = formattedDate;

//   function getCurrentTime() {
//     const now = new Date();
//     return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
//   }

//   document.getElementById("outTime").value = getCurrentTime();

//       const messageBox = document.getElementById("message");

//      const loader = document.getElementById("loader"); // Get the loader element
//     const attendanceForm = document.getElementById("attendanceForm");
//     const submitButton = attendanceForm.querySelector('button[type="submit"]'); // Get the submit button



//   const savedUser = JSON.parse(localStorage.getItem("userData"));
//   const lastSubmission = JSON.parse(localStorage.getItem("lastSubmission"));

//   if (savedUser) {
//     document.getElementById("name").value = savedUser.name;
//     document.getElementById("mobile").value = savedUser.mobile;
//     document.getElementById("email").value = savedUser.email;
//     document.getElementById("name").disabled = true;
//     document.getElementById("mobile").disabled = true;
//     document.getElementById("email").disabled = true;
//   }

//   if (lastSubmission && lastSubmission.date === formattedDate) {
//     messageBox.innerText = "You have already submitted today's attendance!";
//     messageBox.style.display = "block";
//     document.getElementById("attendanceForm").style.display = "none";
//     return;
//   }

//   document.getElementById("attendanceForm").addEventListener("submit", function (e) {
//     e.preventDefault();

//     const name = document.getElementById("name").value.trim();
//     const mobile = document.getElementById("mobile").value.trim();
//     const email = document.getElementById("email").value.trim();
//     const date = document.getElementById("date").value;
//     const inTime = document.getElementById("inTime").value.trim();
//     const outTime = getCurrentTime();
//     const topic = document.getElementById("topic").value.trim();
//     const status = "Out";

//     if (!name || !mobile || !email || !inTime || !topic) {
//       messageBox.innerText = "⚠️ Please fill all fields before submitting!";
//       messageBox.style.display = "block";
//       return;
//     }

//     localStorage.setItem("userData", JSON.stringify({ name, mobile, email }));


//     // 1. SHOW LOADER and DISABLE BUTTON
//         loader.style.display = "flex";
//         messageBox.style.display = "none"; // Hide previous messages
//         submitButton.disabled = true;
//         submitButton.innerText = "Submitting...";



//     // Use FormData instead of JSON for Apps Script compatibility and CORS fix
//     const formData = new FormData();
//     formData.append("name", name);
//     formData.append("mobile", mobile);
//     formData.append("email", email);
//     formData.append("date", date);
//     formData.append("inTime", inTime);
//     formData.append("outTime", outTime);
//     formData.append("topic", topic);
//     formData.append("status", status);

//     fetch("https://script.google.com/macros/s/AKfycbwVdgo1PMfFebJmSneGkd7Ypr2YVutI7_eGOzXH0o3hNsvHNl_H40ZoywC6RYi4oQHhDQ/exec", {
//       method: "POST",
//       body: formData
//     })
//       .then((res) => res.json())
//       .then((data) => {

//         // 2. HIDE LOADER
//                 loader.style.display = "none";
//                 submitButton.disabled = false;
//                 submitButton.innerText = "Submit";

//         if (data.success) {
//           localStorage.setItem("lastSubmission", JSON.stringify({ date }));
          
//           messageBox.innerText = "✅ Submitted Successfully!";
//           messageBox.style.display = "block";
//           document.getElementById("attendanceForm").style.display = "none";
//         } else {
//           messageBox.innerText = "❌ Error: " + data.error;
//           messageBox.style.display = "block";
//         }
//       })
//       .catch((err) => {

//              // 3. HIDE LOADER on error
//                 loader.style.display = "none";
//                 submitButton.disabled = false;
//                 submitButton.innerText = "Submit";

//         console.error("Error:", err);
//         messageBox.innerText = "❌ Error submitting form. Please try again later.";
//         messageBox.style.display = "block";
//       });
//   });
// };
