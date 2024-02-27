async function fetchData() {
  const jwt = localStorage.getItem("jwt");
if (jwt === null || jwt === undefined || jwt === "") {
  window.location.href = "index.html";
  return;
}

  const query = `
    {
  user {
    login
    attrs
    campus
    level: transactions(
      where: {type: {_eq: "level"}, path: {_ilike: "%/school-curriculum/%"}}
      order_by: {amount: desc}
      limit: 1
    ) {
      amount
    }
    upAmount: transactions_aggregate(where: {type: {_eq: "up"}}) {
      aggregate {
        sum {
          amount
        }
      }
    }
    downAmount: transactions_aggregate(where: {type: {_eq: "down"}}) {
      aggregate {
        sum {
          amount
        }
      }
    }
    xpAmount: transactions_aggregate(
      where: {
        event: {
        object: {
          type: { _eq: "module" }
        }}
        type: { _eq: "xp" }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
    timeline: transactions(
      where: {type: {_eq: "xp"}},
      order_by: {amount: desc},
      limit: 11
    ) {
      amount
      createdAt
      path
    }
  }
}
  `;

  try {
    const response = await fetch(
      'https://learn.zone01dakar.sn/api/graphql-engine/v1/graphql',
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ query }),
      }
    );

    const data = await response.json();
    const user = data.data.user[0];
    UserDatas(user);
    UserXp(
      user.xpAmount.aggregate.sum.amount,
      user.upAmount.aggregate.sum.amount,
      user.downAmount.aggregate.sum.amount
    );

var timelineJSON = user.timeline
function retrieveValuesOfKeys(array, key1, key2, key3) {
  var valuesArray = [];

  array.forEach(function(obj) {
    var value1 = obj[key1]; // Retrieve value of key1 from the current object
    var value2 = obj[key2]; // Retrieve value of key2 from the current object
    var value3 = obj[key3].split('/').pop(); // Retrieve
    valuesArray.push([value1, value2,value3]); // Push the values into the result array
  });

  return valuesArray;
}

// Define the keys you want to retrieve values for
var key1 = "amount";
var key2 = "createdAt";
var key3 = "path"

// Retrieve values of key1 and key2 from each object in the array
var values = retrieveValuesOfKeys(timelineJSON, key1, key2, key3);


// Function to draw the Google Charts bar chart
function drawChart() {
  var data = new google.visualization.DataTable();
  data.addColumn('date', 'Date');
  data.addColumn('number', 'XP Earned');
  data.addColumn({ type: 'string', role: 'tooltip' });

  // Loop through each array in values and add data points to the chart
  values.forEach(function(entry) {
    // Parse the date string to create a JavaScript Date object
    var dateParts = entry[1].split("T")[0].split("-");
    var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    var formattedDate = date.toISOString().split('T')[0];
    // Construct tooltip content
    var tooltipContent = 'Date: ' + formattedDate + '\n';
    tooltipContent += 'XP Earned: ' + entry[0] + '\n';
    tooltipContent += 'Project: ' + entry[2];

    // Add data row
    data.addRow([date, entry[0], tooltipContent]);
  });

  var options = {
    title: 'Top 10 projects with the most XP Earned:',
    legend: { position: 'none' },
    bars: 'vertical', // Required for Material Bar Charts
    axes: {
      x: {
        0: { side: 'bottom', label: 'Date', textStyle: { fontName: 'Arial Rounded MT Bold' } } // Top x-axis.
      }
    },
    bar: { groupWidth: "70%" },
    tooltip: { isHtml: false }, // Use plain text for tooltip
    pointSize: 10,
    pointShape: 'circle',
    tooltip: { trigger: 'both' }, // Show tooltip on hover and selection
    tooltip: { textStyle: { fontName: 'Arial', fontSize: 14 } }, // Customize tooltip font
    chartArea: { width: '80%', height: '70%' }, // Adjust chart area
    explorer: {} // Enable explorer
  };

  var chart = new google.visualization.ColumnChart(document.getElementById('chart_div'));
  chart.draw(data, options);
}

// Load Google Charts and draw the chart
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);


var a = user.downAmount.aggregate.sum.amount
var b = user.upAmount.aggregate.sum.amount
// Display the user XP and XP ratio in the DOM and generate the XP graph
function UserXp(xpAmount, upAmount, downAmount) {
  // Display the user XP

  var thexp = document.getElementById("total-xp");
  thexp.innerHTML = `<span style="color: orange;">Total XP:</span> ${Byteconversion(xpAmount)}`;

  // Display the user XP ratio
  document.getElementById("xpRatio").textContent =
    "Audit Ratio: " + (parseFloat((upAmount / downAmount).toFixed(2))).toFixed(1);
  // Display the user given XP
  document.getElementById("upXpValue").textContent =
    "Done: " + Byteconversion(upAmount);
  // Display the user received XP
  document.getElementById("downXpValue").textContent =
    "Received: " + Byteconversion(downAmount);

  const totalXP = upAmount + downAmount;
  const upXp = document.getElementById("upXp");
  const downXp = document.getElementById("downXp");
  const upXpWidth = (upAmount / totalXP) * 100;
  const downXpWidth = (downAmount / totalXP) * 100;
  upXp.setAttribute("width", upXpWidth);
  upXp.setAttribute("x", 0);
  downXp.setAttribute("width", downXpWidth);
  downXp.setAttribute("x", upXpWidth);
}


/////////////////////////////////////////////////////////////////////////heeeeeeeeeeeeeeeeeeeeeeeeeeeeereeeeeeee

      google.charts.load("current", {packages:["corechart"]});
      google.charts.setOnLoadCallback(drawtheChart);
      function drawtheChart() {
        var data = google.visualization.arrayToDataTable([
          ['Ratio', 'XP exchange rate'],
          ['Received',      a],
          ['Done',     b],

        ]);

        var options = {
          title: 'Bytes Exchanged Through Audit:',
          pieHole: 0.4,
        };

        var chart = new google.visualization.PieChart(document.getElementById('donutchart'));
        chart.draw(data, options);
      }
  


  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

function UserLevel(level) {
  let developerLevel = '';
  if (level >= 0 && level < 10) developerLevel = 'Aspiring Developer';
  else if (level < 20) developerLevel = 'Beginner Developer';
  else if (level < 30) developerLevel = 'Apprentice Developer';
  else if (level < 40) developerLevel = 'Assistant Developer';
  else if (level < 50) developerLevel = 'Basic Developer';
  else if (level < 60) developerLevel = 'Junior Developer';
  return `Level: ${level} ${developerLevel}`.trim();
}


/////////////////////////////////////////////////////////////////////////heeeeeeeeeeeeeeeeeeeeeeeeeeeeereeeeeeee


function UserDatas(user) {
  // Set the title of the page to the username of the user
  document.title = `${user.login}'s Profile`;
  // Set the user image
  document.querySelector(".user-image").src = "./images/icons8-test-account-64.png";
  // Set the user name
  document.getElementById("name-profile").textContent = ` ${user.login}'s Profile`;
  // Set the user email
  var emailElement = document.getElementById("email");
  emailElement.innerHTML = `<span style="color: orange;">Email:</span> ${user.attrs.email}`;
  // Set the user first name and last name
  var nameElement = document.getElementById("first-name-last-name");
  nameElement.innerHTML = `<span style="color: orange;">FullName:</span> ${user.attrs.firstName} ${user.attrs.lastName}`;
  // Set the user campus
  var campusElement = document.getElementById("campus");
  campusElement.innerHTML = `<span style="color: orange;">Campus:</span> ${UserLevel(user.level)}`;
  // Set the user age and country
  var fromElement = document.getElementById("from");
  fromElement.innerHTML = `<span style="color: orange;">Age:</span> ${RealAge(user.attrs.dateOfBirth)} Years old from ${user.attrs.country}`;
}


/////////////////////////////////////////////////////////////////////////heeeeeeeeeeeeeeeeeeeeeeeeeeeeereeeeeeee


function RealAge(RawAge) {
  const newage = new Date(RawAge);
  const calc = Date.now() - newage.getTime();
  const FinAge = new Date(calc);
  return Math.abs(FinAge.getUTCFullYear() - 1970);
}

fetchData();

function Byteconversion(num) {
  const thebytes = ["bytes", "kB", "MB", "GB"];
  let i = 0;
  while (num >= 1000 && i < thebytes.length - 1) {
    num /= 1000;
    i++;
  }
  num = num.toFixed(2);
  return `${num} ${thebytes[i]}`;
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

