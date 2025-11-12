window.onload = function () {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  document.getElementById("date").value = formattedDate;
  
  // Direct Google Apps Script endpoint (bypasses Netlify)
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzxIWFdWMQyQe6dxM_EKsjgRvCDrRCZrUagUnFZlY4l01nVkhlU8UOb0fMJ5Jll1e3cMw/exec";

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  document.getElementById("outTime").value = getCurrentTime();

  const messageBox = document.getElementById("message");
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
    document.getElementById("attendanceForm").style.display = "none";
    return;
  }

  document.getElementById("attendanceForm").addEventListener("submit", function (e) {
    e.preventDefault();

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

    localStorage.setItem("userData", JSON.stringify({ name, mobile, email }));

    // Submit directly to Google Apps Script (no Netlify dependency)
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile, email, date, inTime, outTime, topic, status }),
    })
      .then(async (res) => {
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (_) {
          // If response isn't JSON, treat HTTP 200 as success
          data = { success: res.ok, raw: text };
        }
        return data;
      })
      .then((data) => {
        if (data.success) {
          localStorage.setItem("lastSubmission", JSON.stringify({ date }));
          messageBox.innerText = "✅ Submitted Successfully!";
          messageBox.style.display = "block";
          document.getElementById("attendanceForm").style.display = "none";
        } else {
          const errMsg = data.error || data.raw || "Unknown error";
          messageBox.innerText = "❌ Error: " + errMsg;
          messageBox.style.display = "block";
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        messageBox.innerText = "❌ Error submitting form. Please try again later.";
        messageBox.style.display = "block";
      });
  });
};
