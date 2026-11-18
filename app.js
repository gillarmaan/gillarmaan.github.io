(() => {
  "use strict";

  const form = document.querySelector("#command-form");
  const input = document.querySelector("#command-input");
  const output = document.querySelector("#terminal-output");
  const scrollRegion = document.querySelector("#terminal-scroll");
  const terminalPane = document.querySelector("#terminal-pane");
  const commandCount = document.querySelector("#command-count");
  const clock = document.querySelector("#desktop-clock");

  const history = [];
  let historyIndex = 0;
  let commandsRun = 0;

  const commandNames = [
    "help", "about", "whoami", "skills", "projects", "project ugv",
    "project drone", "project vr", "education", "contact", "pwd",
    "uname -a", "history", "theme green", "theme amber",
    "theme cyan", "date", "clear"
  ];

  const aliases = new Map([
    ["cat about.md", "about"],
    ["cat skills.conf", "skills"],
    ["cat education.txt", "education"],
    ["./contact.sh", "contact"],
    ["./projects", "projects"],
    ["ls", "projects"],
    ["ls -la", "projects"],
    ["neofetch", "whoami"]
  ]);

  const projects = {
    ugv:
      '<section class="output-card project-output">' +
      '<p class="output-path">~/projects/person-following-ugv.log</p>' +
      '<h2>Autonomous Person-Following UGV</h2>' +
      '<p class="output-label">Robotics · Team Lead · 2026</p>' +
      '<p>Designed a four-tier ROS 2 architecture across a two-computer Husarion Panther and built an identity-aware tracking pipeline for autonomous person following.</p>' +
      '<div class="diagnostic-log">' +
      '<p><span>[scope]</span> network · sensors · CPU · power</p>' +
      '<p><span>[evidence]</span> firmware, kernel hardware-monitor data, 13,000+ system-log events</p>' +
      '<p><span>[root-cause]</span> recurring safety shutdown traced to an undervoltage defect</p>' +
      '</div>' +
      '<p class="stack-line"><span>stack:</span> Linux / Bash / ROS 2 / log analysis / system diagnostics</p>' +
      '</section>',
    drone:
      '<section class="output-card project-output">' +
      '<p class="output-path">~/projects/drone-autonomy.log</p>' +
      '<h2>Autonomous Drone Navigation &amp; Perception</h2>' +
      '<p class="output-label">Autonomy · Software Lead · 2025</p>' +
      '<p>Led a five-person team developing a ROS 2 autonomy stack for an X500 quadcopter. Deployed Isaac ROS in Docker on NVIDIA JetPack and used Foxglove and Wi-Fi Direct for telemetry, monitoring, and ground-station communication.</p>' +
      '<p class="result-line"><span>result:</span> RMIT RedbackBots Flyers</p>' +
      '<p class="stack-line"><span>stack:</span> ROS 2 / Docker / NVIDIA JetPack / ArduPilot / Foxglove</p>' +
      '</section>',
    vr:
      '<section class="output-card project-output">' +
      '<p class="output-path">~/projects/simsteering.log</p>' +
      '<h2>SimSteering Haptic VR</h2>' +
      '<p class="output-label">Mixed Reality · RMIT VXLab · 2026</p>' +
      '<p>Built a gesture-controlled cockpit with tactile finger feedback using SenseGlove haptic gloves and Meta Quest 3. Rebuilt the incompatible legacy Unity system around OpenXR, then evaluated multiple tracking rigs to isolate field-of-view, marker-scale, and depth-estimation limitations.</p>' +
      '<p class="result-line"><span>lab:</span> RMIT VXLab / HuDINi Lab</p>' +
      '<p class="stack-line"><span>stack:</span> Unity / OpenXR / OpenCV / hardware validation</p>' +
      '</section>'
  };

  const outputs = {
    help:
      '<section class="output-card">' +
      '<p class="output-path">portfolio-sh manual</p><h2>Available commands</h2>' +
      '<div class="help-grid">' +
      '<button type="button" data-command="about"><code>about</code><span>Profile and approach</span></button>' +
      '<button type="button" data-command="skills"><code>skills</code><span>Linux and engineering toolchain</span></button>' +
      '<button type="button" data-command="projects"><code>projects</code><span>List selected work</span></button>' +
      '<button type="button" data-command="education"><code>education</code><span>Degree and recognition</span></button>' +
      '<button type="button" data-command="contact"><code>contact</code><span>Open communication channel</span></button>' +
      '<button type="button" data-command="whoami"><code>whoami</code><span>Compact system profile</span></button>' +
      '<button type="button" data-command="theme amber"><code>theme [green|amber|cyan]</code><span>Change terminal accent</span></button>' +
      '<button type="button" data-command="clear"><code>clear</code><span>Clear terminal output</span></button>' +
      '</div>' +
      '<p class="output-note">Shell aliases also work: <code>ls</code>, <code>cat about.md</code>, <code>cat skills.conf</code>, <code>neofetch</code>, and <code>uname -a</code>.</p>' +
      '</section>',
    about:
      '<section class="output-card">' +
      '<p class="output-path">~/about.md</p><h2>About Armaan</h2>' +
      '<p>I’m a third-year Bachelor of Computer Science (Professional) student at RMIT University, with minors in Artificial Intelligence and Cybersecurity.</p>' +
      '<p>I move between code, hardware, Linux environments, telemetry, and system logs to understand how complex systems behave. My approach is practical: reproduce the fault, narrow the system, test assumptions, correlate evidence, and communicate the resolution clearly.</p>' +
      '<p class="quote-line">“Build reliable systems—and find out why they fail.”</p>' +
      '</section>',
    whoami:
      '<section class="output-card fetch-output">' +
      '<div class="ascii-mark" aria-hidden="true"><span>┌──────────┐</span><strong>AG/SYS</strong><span>└──────────┘</span></div>' +
      '<dl>' +
      '<div><dt>user</dt><dd>Armaan Gill</dd></div>' +
      '<div><dt>location</dt><dd>Melbourne, Australia</dd></div>' +
      '<div><dt>education</dt><dd>RMIT Computer Science</dd></div>' +
      '<div><dt>focus</dt><dd>Linux, robotics, autonomous systems</dd></div>' +
      '<div><dt>toolchain</dt><dd>Linux / ROS 2 / Docker / Python / C++</dd></div>' +
      '<div><dt>status</dt><dd class="online-text">● open to opportunities</dd></div>' +
      '</dl></section>',
    skills:
      '<section class="output-card">' +
      '<p class="output-path">/etc/skills.conf</p><h2>Working toolchain</h2>' +
      '<div class="config-output">' +
      '<div><p>[systems]</p><span>platforms=Linux, NVIDIA JetPack</span><span>diagnostics=logs, telemetry, fault isolation</span><span>shell=Bash</span></div>' +
      '<div><p>[software]</p><span>languages=Python, C++, Java, SQL</span><span>version_control=Git</span><span>containers=Docker</span></div>' +
      '<div><p>[robotics]</p><span>middleware=ROS 2, MAVROS, MAVLink</span><span>autonomy=ArduPilot, Isaac ROS</span><span>observability=Foxglove</span></div>' +
      '<div><p>[infrastructure]</p><span>cloud=AWS</span><span>networking=Wi-Fi Direct, distributed systems</span><span>workflow=test, isolate, document, resolve</span></div>' +
      '</div></section>',
    projects:
      '<section class="output-card">' +
      '<p class="output-path">~/projects/</p><h2>Selected systems work</h2>' +
      '<div class="file-list">' +
      '<button type="button" data-command="project ugv"><span>-rwxr-xr-x</span><strong>person-following-ugv</strong><em>Linux diagnostics · ROS 2 · 2026</em></button>' +
      '<button type="button" data-command="project drone"><span>-rwxr-xr-x</span><strong>drone-autonomy</strong><em>Docker · JetPack · ROS 2 · 2025</em></button>' +
      '<button type="button" data-command="project vr"><span>-rwxr-xr-x</span><strong>simsteering-vr</strong><em>OpenXR · OpenCV · 2026</em></button>' +
      '</div>' +
      '<p class="output-note">Run <code>project ugv</code>, <code>project drone</code>, or <code>project vr</code> for details.</p>' +
      '</section>',
    education:
      '<section class="output-card">' +
      '<p class="output-path">~/education.txt</p><h2>Education &amp; recognition</h2>' +
      '<div class="timeline-output">' +
      '<div><span>2027</span><p><strong>Bachelor of Computer Science (Professional)</strong><br>RMIT University · Expected November 2027<br>Minors in Artificial Intelligence and Cybersecurity</p></div>' +
      '<div><span>2025</span><p><strong>3rd Place · RoboCup Flying Robot League</strong><br>Brazil · RMIT RedbackBots Flyers</p></div>' +
      '</div></section>',
    contact:
      '<section class="output-card contact-output">' +
      '<p class="output-path">~/contact.sh</p><h2>Communication channel ready</h2>' +
      '<p>If you’re working on Linux, robotics, autonomy, or a stubborn systems problem, I’d like to hear about it.</p>' +
      '<a href="mailto:armaangill.pb29@gmail.com">&gt; armaangill.pb29@gmail.com</a>' +
      '<p class="success-line">[ OK ] mail handler available</p>' +
      '</section>'
  };

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRegion.scrollTop = scrollRegion.scrollHeight;
    });
  }

  function appendCommandEcho(command) {
    const line = document.createElement("p");
    line.className = "command-echo";
    const user = document.createElement("span");
    user.textContent = "armaan@gill";
    const path = document.createElement("b");
    path.textContent = ":~/portfolio";
    line.append(user, path, document.createTextNode("$ " + command));
    output.append(line);
  }

  function appendHtml(html) {
    const wrapper = document.createElement("div");
    wrapper.className = "command-result";
    wrapper.innerHTML = html;
    output.append(wrapper);
  }

  function setTheme(theme) {
    if (!["green", "amber", "cyan"].includes(theme)) return false;
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch {
      // Persistence is optional.
    }
    return true;
  }

  function executeCommand(rawCommand) {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;
    const normalizedInput = trimmed.toLowerCase().replace(/\s+/g, " ");
    const command = aliases.get(normalizedInput) || normalizedInput;

    history.push(trimmed);
    historyIndex = history.length;
    commandsRun += 1;
    commandCount.textContent = commandsRun + " command" + (commandsRun === 1 ? "" : "s");

    if (command === "clear") {
      output.innerHTML = "";
      scrollToBottom();
      return;
    }

    appendCommandEcho(trimmed);

    if (outputs[command]) {
      appendHtml(outputs[command]);
    } else if (command === "pwd") {
      appendHtml('<p class="plain-output">/home/armaan/portfolio</p>');
    } else if (command === "uname -a") {
      appendHtml('<p class="plain-output">PortfolioOS 6.8.0 linux-systems x86_64 GNU/Linux · ROS 2 · Docker · Git</p>');
    } else if (command === "date") {
      appendHtml('<p class="plain-output">' + escapeHtml(new Date().toString()) + '</p>');
    } else if (command === "history") {
      appendHtml('<ol class="history-output">' + history.map((item) => '<li>' + escapeHtml(item) + '</li>').join("") + '</ol>');
    } else if (command === "project" || command === "projects --list") {
      appendHtml(outputs.projects);
    } else if (command.startsWith("project ")) {
      const project = command.split(" ")[1];
      appendHtml(projects[project] || '<p class="error-output">project: ' + escapeHtml(project) + ' not found. Try: ugv, drone, or vr.</p>');
    } else if (command === "theme") {
      appendHtml('<p class="plain-output">Usage: theme [green|amber|cyan]</p>');
    } else if (command.startsWith("theme ")) {
      const theme = command.split(" ")[1];
      appendHtml(
        setTheme(theme)
          ? '<p class="success-line">[ OK ] terminal accent changed to ' + escapeHtml(theme) + '</p>'
          : '<p class="error-output">theme: ' + escapeHtml(theme) + ' unavailable. Choose green, amber, or cyan.</p>'
      );
    } else if (command.startsWith("sudo")) {
      appendHtml('<p class="error-output">armaan is not in the sudoers file. This incident will be documented.</p>');
    } else if (command === "exit" || command === "logout") {
      appendHtml('<p class="plain-output">There is nowhere to log out to—this portfolio is the shell. Try <code>contact</code> instead.</p>');
    } else {
      appendHtml(
        '<p class="error-output">portfolio-sh: command not found: ' + escapeHtml(trimmed) +
        '<br>Type <button type="button" data-command="help">help</button> to list available commands.</p>'
      );
    }

    scrollToBottom();
  }

  function showAutocomplete() {
    const current = input.value.trim().toLowerCase();
    if (!current) return;
    const matches = commandNames.filter((name) => name.startsWith(current));
    if (matches.length === 1) {
      input.value = matches[0];
    } else if (matches.length > 1) {
      appendHtml(
        '<p class="autocomplete-output">' +
        matches.map((match) => '<span>' + escapeHtml(match) + '</span>').join("") +
        '</p>'
      );
      scrollToBottom();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const command = input.value;
    input.value = "";
    executeCommand(command);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex > 0) historyIndex -= 1;
      input.value = history[historyIndex] || "";
      requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length));
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < history.length) historyIndex += 1;
      input.value = history[historyIndex] || "";
    } else if (event.key === "Tab") {
      event.preventDefault();
      showAutocomplete();
    } else if (event.ctrlKey && event.key.toLowerCase() === "l") {
      event.preventDefault();
      executeCommand("clear");
    } else if (event.ctrlKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      input.value = "";
      appendHtml('<p class="plain-output">^C</p>');
      scrollToBottom();
    }
  });

  document.addEventListener("click", (event) => {
    const commandButton = event.target.closest("[data-command]");
    if (commandButton) {
      executeCommand(commandButton.dataset.command);
      input.focus({ preventScroll: true });
      return;
    }
    if (terminalPane.contains(event.target) && !event.target.closest("a, button, input")) {
      input.focus({ preventScroll: true });
    }
  });

  function updateClock() {
    clock.textContent = new Intl.DateTimeFormat("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(new Date());
  }

  try {
    setTheme(localStorage.getItem("portfolio-theme") || "green");
  } catch {
    setTheme("green");
  }
  updateClock();
  window.setInterval(updateClock, 30000);
})();
