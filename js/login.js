document
  .getElementById("mylogin")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const creds = customBtoa(`${email}:${password}`);

    try {
      const response = await fetch('https://learn.zone01dakar.sn/api/auth/signin', {
        method: "POST",
        headers: {
          Authorization: `Basic ${creds}`,
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        const jwt = data;
        console.log("The JWT given: " + jwt);
        localStorage.setItem("jwt", jwt);
        window.location.href = "./userprofile.html";
      } else {
        Toastify({
          text: "Wrong credentials. Please be careful!",
          duration: 2000, 
          close: true,
          gravity: "top",
          style: { background: "purple" },
        }).showToast();
      }
    } catch (error) {
      console.error("Error:", error);
      Toastify({
        text: "Error!!",
        duration: 2000, 
        close: true, 
        gravity: "top", 
        style: { background: "purple" }, 
      }).showToast();
    }
  });

  function customBtoa(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    
    return btoa(String.fromCharCode(...utf8Bytes));
  }