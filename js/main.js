// * Arreglo para almacenar los equipos y sus jugadores
let teams = [];
let fixture = []; // Guardará los partidos generados en el fixture

// * Referencias a los elementos del DOM
const btnAddTeam = document.getElementById("btnAddTeam");
const formSection = document.getElementById("formSection");
const teamList = document.getElementById("teamList");
const teamForm = document.getElementById("teamForm");
const playerForm = document.getElementById("playerForm");
const playerModal = new bootstrap.Modal(document.getElementById("playerModal"));
const btnStartTournament = document.getElementById("btnStartTournament");
const fixtureSection = document.getElementById("fixtureSection");
const fixtureList = document.getElementById("fixtureList");
const rankingSection = document.getElementById("rankingSection");
const scorersSection = document.getElementById("scorersSection");
const btnClearStorage = document.getElementById("btnClearStorage");
const scorerModal = new bootstrap.Modal(document.getElementById("scorerModal"));
const scorerList = document.getElementById("scorerList");

let currentMatchIndex = -1;
let currentTeamKey = "";

// * Función para agregar un equipo
btnAddTeam.addEventListener("click", () => {
  formSection.classList.remove("d-none");
});

// * Manejar el envío del formulario de equipo
teamForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const teamName = document.getElementById("teamName").value;

  const newTeam = {
    name: teamName,
    points: 0,
    goalsScored: 0,
    goalsConceded: 0,
    players: [],
  };

  teams.push(newTeam);
  localStorage.setItem("teams", JSON.stringify(teams));

  teamForm.reset();
  formSection.classList.add("d-none");

  renderTeams();
});

// * Renderizar los equipos
function renderTeams() {
  teamList.innerHTML = "";
  if (teams.length === 0) {
    teamList.innerHTML = `<p>Aún no se han registrado equipos</p>`;
    return;
  }

  teams.forEach((team, index) => {
    const teamRow = document.createElement("div");
    teamRow.classList.add("row", "mb-3", "align-items-center");

    teamRow.innerHTML = `
      <div class="col-12 col-md-4 mb-3 mb-md-0">
        <h5>${team.name}</h5>
      </div>
      <div class="col-12 col-md-4">
        <ul>
          ${team.players
        .map(
          (player, playerIndex) => `
            <li class="d-flex justify-content-between align-items-center mb-2">
              <span>${player.playerName}</span>
              <button class="btn btn-danger btn-sm" onclick="removePlayer(${index}, ${playerIndex})">Eliminar jugador</button>
            </li>`
        )
        .join("")}
        </ul>
      </div>
      <div class="col-12 col-md-4 text-md-end">
        <button class="btn btn-warning btn-sm" onclick="showPlayerForm(${index})">Agregar jugador</button>
        <button class="btn btn-danger btn-sm ms-2" onclick="removeTeam(${index})">Eliminar equipo</button>
      </div>
    `;

    teamList.appendChild(teamRow);
  });
}

// * Mostrar formulario de jugador
function showPlayerForm(teamIndex) {
  currentTeamIndex = teamIndex;
  playerModal.show();
}

// * Guardar jugador
playerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const playerName = document.getElementById("playerName").value;

  const newPlayer = {
    playerName: playerName,
    playerGoals: 0,
  };

  teams[currentTeamIndex].players.push(newPlayer);
  localStorage.setItem("teams", JSON.stringify(teams));

  playerForm.reset();
  playerModal.hide();

  renderTeams();
});

// * Eliminar jugador
function removePlayer(teamIndex, playerIndex) {
  teams[teamIndex].players.splice(playerIndex, 1);
  localStorage.setItem("teams", JSON.stringify(teams));
  renderTeams();
}

// * Eliminar equipo
function removeTeam(teamIndex) {
  teams.splice(teamIndex, 1);
  localStorage.setItem("teams", JSON.stringify(teams));
  renderTeams();
}

// * Borrar todos los equipos y el fixture
btnClearStorage.addEventListener("click", () => {
  localStorage.removeItem("teams");
  localStorage.removeItem("fixture");
  teams = [];
  fixture = [];
  renderTeams();
  fixtureSection.classList.add("d-none");
  rankingSection.classList.add("d-none");
  scorersSection.classList.add("d-none");
});

// * Generar fixture
function generateFixture() {
  const fixture = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = 0; j < teams.length; j++) {
      if (i !== j) {
        fixture.push({
          team1: teams[i].name,
          team2: teams[j].name,
          team1Goals: 0,
          team2Goals: 0,
          finished: false, // Reiniciar estado del partido
        });
      }
    }
  }
  return fixture;
}


// * Renderizar fixture
function renderFixture(fixture) {
  fixtureList.innerHTML = ""; // Limpiar contenido previo

  fixture.forEach((match, matchIndex) => {
    const isFinished = match.finished; // Verificar si el partido está terminado

    const matchRow = document.createElement("div");
    matchRow.classList.add("row", "align-items-center", "mb-3");

    matchRow.innerHTML = `
      <div class="col-12 col-md-3 text-center mb-2 mb-md-0"><h5>${match.team1}</h5></div>
      <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center mb-2 mb-md-0">
        <button class="btn btn-danger btn-sm me-2" onclick="openScorerModal(${matchIndex}, 'team1', -1)" ${isFinished ? "disabled" : ""}>-</button>
        <input type="number" class="form-control text-center fixture-score" value="${match.team1Goals}" readonly />
        <button class="btn btn-success btn-sm ms-2" onclick="openScorerModal(${matchIndex}, 'team1', 1)" ${isFinished ? "disabled" : ""}>+</button>
      </div>
      <div class="col-6 col-md-2 text-center d-flex align-items-center justify-content-center mb-2 mb-md-0">
        <button class="btn btn-danger btn-sm me-2" onclick="openScorerModal(${matchIndex}, 'team2', -1)" ${isFinished ? "disabled" : ""}>-</button>
        <input type="number" class="form-control text-center fixture-score" value="${match.team2Goals}" readonly />
        <button class="btn btn-success btn-sm ms-2" onclick="openScorerModal(${matchIndex}, 'team2', 1)" ${isFinished ? "disabled" : ""}>+</button>
      </div>
      <div class="col-12 col-md-3 text-center mb-2 mb-md-0"><h5>${match.team2}</h5></div>
      <div class="col-12 col-md-2 text-center">
        <button 
          class="btn btn-danger btn-sm w-100" 
          onclick="finishMatch(${matchIndex})" 
          ${isFinished ? "disabled" : ""}>
          ${isFinished ? "Partido terminado" : "Terminar partido"}
        </button>
      </div>
    `;

    fixtureList.appendChild(matchRow);
  });
}

// * Modal para seleccionar al jugador que hizo el gol
function openScorerModal(matchIndex, teamKey, value) {
  currentMatchIndex = matchIndex;
  currentTeamKey = teamKey;

  scorerList.innerHTML = ""; // Limpiar la lista previa

  const teamName = fixture[matchIndex][teamKey];
  const team = teams.find((t) => t.name === teamName);

  team.players.forEach((player, playerIndex) => {
    const listItem = document.createElement("li");
    listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    listItem.innerHTML = `
      <span>${player.playerName}</span>
      <button class="btn btn-primary btn-sm" onclick="assignGoal(${playerIndex}, ${value})">${value > 0 ? "+" : "-"}</button>
    `;
    scorerList.appendChild(listItem);
  });

  scorerModal.show();
}

// * Asignar gol
function assignGoal(playerIndex, value) {
  const teamName = fixture[currentMatchIndex][currentTeamKey];
  const team = teams.find((t) => t.name === teamName);

  // Encontrar el jugador y actualizar goles
  const player = team.players[playerIndex];
  if (player.playerGoals + value < 0) {
    alert("No puedes tener goles negativos.");
    return;
  }
  player.playerGoals += value;

  // Actualizar goles del equipo en el fixture
  if (currentTeamKey === "team1") {
    if (fixture[currentMatchIndex].team1Goals + value >= 0) {
      fixture[currentMatchIndex].team1Goals += value;
      team.goalsScored += value;
    } else {
      alert("No puedes tener goles negativos.");
      return;
    }
  } else {
    if (fixture[currentMatchIndex].team2Goals + value >= 0) {
      fixture[currentMatchIndex].team2Goals += value;
      team.goalsScored += value;
    } else {
      alert("No puedes tener goles negativos.");
      return;
    }
  }

  // Actualizar goles en contra para el equipo oponente
  const opponentTeamName =
    currentTeamKey === "team1"
      ? fixture[currentMatchIndex].team2
      : fixture[currentMatchIndex].team1;
  const opponentTeam = teams.find((t) => t.name === opponentTeamName);
  opponentTeam.goalsConceded += value;

  // Guardar cambios en el localStorage
  localStorage.setItem("teams", JSON.stringify(teams));
  localStorage.setItem("fixture", JSON.stringify(fixture));

  // Refrescar tablas y fixture
  renderFixture(fixture);
  renderRanking(generateRanking());
  renderScorers(generateScorers());

  scorerModal.hide();
}

// * Generar tabla de posiciones
function generateRanking() {
  const ranking = teams.map((team) => ({
    name: team.name,
    goalsFor: team.goalsScored || 0,
    goalsAgainst: team.goalsConceded || 0,
    goalDifference: (team.goalsScored || 0) - (team.goalsConceded || 0),
    points: team.points || 0,
  }));

  // Ordenar por puntos, diferencia de goles y goles a favor
  ranking.sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points; // Ordenar por puntos
    }
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference; // Ordenar por diferencia de goles
    }
    return b.goalsFor - a.goalsFor; // Ordenar por goles a favor
  });

  return ranking;
}


// * Renderizar tabla de posiciones
function renderRanking(ranking) {
  const rankingTable = document.getElementById("rankingTable");
  rankingTable.innerHTML = ""; // Limpiar contenido previo

  let currentPosition = 1; // Posición inicial
  let previousPoints = -1; // Comparar puntos
  let previousGoalDifference = -1; // Comparar diferencia de goles
  let previousGoalsFor = -1; // Comparar goles a favor

  ranking.forEach((team, index) => {
    // Comparar criterios con el equipo anterior
    if (
      team.points !== previousPoints ||
      team.goalDifference !== previousGoalDifference ||
      team.goalsFor !== previousGoalsFor
    ) {
      currentPosition = index + 1; // Actualizar posición si hay diferencias
    }

    // Actualizar valores previos
    previousPoints = team.points;
    previousGoalDifference = team.goalDifference;
    previousGoalsFor = team.goalsFor;

    // Crear fila de la tabla
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${currentPosition}</td>
      <td>${team.name}</td>
      <td>${team.goalsFor}</td>
      <td>${team.goalsAgainst}</td>
      <td>${team.goalDifference}</td>
      <td>${team.points}</td>
    `;
    rankingTable.appendChild(row);
  });
}


// * Generar tabla de goleadores
function generateScorers() {
  const scorers = [];

  // Construir la lista de goleadores
  teams.forEach((team) => {
    team.players.forEach((player) => {
      scorers.push({
        playerName: player.playerName,
        teamName: team.name,
        goals: player.playerGoals || 0,
      });
    });
  });

  // Ordenar la lista por goles de mayor a menor
  scorers.sort((a, b) => b.goals - a.goals);

  return scorers;
}


// * Renderizar tabla de goleadores
function renderScorers(scorers) {
  const scorersTable = document.getElementById("scorersTable");
  scorersTable.innerHTML = ""; // Limpiar contenido previo

  let currentPosition = 1; // Posición inicial
  let previousGoals = -1; // Variable para comparar goles del jugador anterior

  scorers.forEach((scorer, index) => {
    // Comparar goles con el jugador anterior
    if (scorer.goals !== previousGoals) {
      currentPosition = index + 1; // Actualizar posición solo si los goles son diferentes
    }

    // Actualizar goles previos para la próxima iteración
    previousGoals = scorer.goals;

    // Crear fila de la tabla
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${currentPosition}</td>
      <td>${scorer.playerName}</td>
      <td>${scorer.teamName}</td>
      <td>${scorer.goals}</td>
    `;
    scorersTable.appendChild(row);
  });
}



// * Iniciar el torneo
btnStartTournament.addEventListener("click", () => {
  if (teams.length < 2) {
    alert("Debe haber al menos 2 equipos para comenzar el torneo.");
    return;
  }

  // Reiniciar estadísticas de los equipos
  teams = teams.map((team) => ({
    ...team,
    points: 0, // Reiniciar puntos
    goalsScored: 0, // Reiniciar goles a favor
    goalsConceded: 0, // Reiniciar goles en contra
    players: team.players.map((player) => ({
      ...player,
      playerGoals: 0, // Reiniciar goles de los jugadores
    })),
  }));

  // Generar un nuevo fixture
  fixture = generateFixture(); // Generar un nuevo arreglo con los partidos
  localStorage.setItem("fixture", JSON.stringify(fixture)); // Guardar en localStorage

  // Guardar equipos reiniciados en localStorage
  localStorage.setItem("teams", JSON.stringify(teams));

  // Renderizar el fixture, tabla de posiciones y tabla de goleadores
  renderFixture(fixture);
  renderRanking(generateRanking());
  renderScorers(generateScorers());

  // Mostrar las secciones correspondientes
  fixtureSection.classList.remove("d-none");
  rankingSection.classList.remove("d-none");
  scorersSection.classList.remove("d-none");
});


// * Ginalizar partido
function finishMatch(matchIndex) {
  const match = fixture[matchIndex];

  // Verificar si el partido ya ha sido terminado
  if (match.finished) {
    alert("Este partido ya ha sido terminado.");
    return;
  }

  const team1 = teams.find((team) => team.name === match.team1);
  const team2 = teams.find((team) => team.name === match.team2);

  // Calcular puntos según el resultado
  if (match.team1Goals > match.team2Goals) {
    // Gana el equipo 1
    team1.points += 3;
  } else if (match.team1Goals < match.team2Goals) {
    // Gana el equipo 2
    team2.points += 3;
  } else {
    // Empate
    team1.points += 1;
    team2.points += 1;
  }

  // Marcar el partido como terminado
  match.finished = true;

  // Guardar en localStorage
  localStorage.setItem("teams", JSON.stringify(teams));
  localStorage.setItem("fixture", JSON.stringify(fixture));

  // Actualizar la tabla de posiciones
  renderRanking(generateRanking());

  // Renderizar nuevamente el fixture para reflejar los cambios
  renderFixture(fixture);
}



// * Cargar equipos y fixture desde el caché
window.onload = () => {
  const savedTeams = JSON.parse(localStorage.getItem("teams"));
  const savedFixture = JSON.parse(localStorage.getItem("fixture"));

  console.log("Equipos en localStorage:", savedTeams);


  if (savedTeams) {
    teams = savedTeams;
  }

  if (savedFixture) {
    fixture = savedFixture;
  }

  if (teams.length > 0 && fixture.length > 0) {
    renderTeams();
    renderFixture(fixture);
    renderRanking(generateRanking());
    renderScorers(generateScorers());

    fixtureSection.classList.remove("d-none");
    rankingSection.classList.remove("d-none");
    scorersSection.classList.remove("d-none");
  }
};
