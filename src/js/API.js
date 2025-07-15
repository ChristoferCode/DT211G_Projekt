"use strict";

//Deklarerar variabler i mitt globala scope. Fyra stycken för element på min html-sida (tabellinnehåll och kolumnrubrik 1,2 och 3).
let tbodyEl = document.querySelector("tbody");
let sort1El = document.querySelector("#sort1");
let sort2El = document.querySelector("#sort2");
let sort3El = document.querySelector("#sort3");


//Deklarerar variabler i mitt globala scope. Två tomma för array med alla kurser och för filtrerad array.
let courses = [];
let filteredCourses = [];


//Deklarerar variabler i mitt globala scope. Tre variabler för checked/clicked (yes or no) för att kunna sortera både fallande och stigande.
let checked1 = "no";
let checked2 = "no";
let checked3 = "no";


//Vid laddning av sidan/fönstret körs funktionen getCourses och fyra stycken händelselyssnare finns tillgängliga och lyssnar på inmatning i sökfältet samt klick på kolumnrubriker.
window.onload = () => {
    getCourses();
    document.querySelector("#search").addEventListener("input", filterCourses);
    document.querySelector("#sort1").addEventListener("click", sortCourses1);
    document.querySelector("#sort2").addEventListener("click", sortCourses2);
    document.querySelector("#sort3").addEventListener("click", sortCourses3);
}

//Funktion som fetchar API från en url med async/await för att invänta att svaret hinner komma, samt try/catch för att kunna leverera ett felmedelande om något misslyckats men ändå kör vidare koden (vilket är ganska meningslöst i det här fallet eftersom den inte kan göra något utan API-datan...)
async function getCourses() {
    console.log(courses);

    try {
        const response = await fetch(
            "https://webbutveckling.miun.se/files/ramschema_ht24.json"
        );

        //Obs! Ändrara värde på courses, inte deklarerar (det är redan gjort)
        courses = await response.json();
        console.log(courses);

        //Kör funktionen dataToTables om hämtningen lyckats
        dataToTable(courses);

    } catch (error) {
        console.error("Det har uppstått ett fel: ", error);
    }
}

//Funktion som skriver ut objekten i mina arrayer till DOM (alla eller filtrerad samt olika sorteringar beroende på vilken data som skickas in), rad för rad till en tabell med korrekta taggar. Först rensas hela tabellen dock.
function dataToTable(data) {

tbodyEl.innerHTML = "";

    data.forEach(course => {
        tbodyEl.innerHTML += `<tr><td id="td1">${course.code}</td><td id="td2">${course.coursename}</td><td id="td3">${course.progression}</td><td id="td4"><a href="${course.syllabus}"> <i class="fa-solid fa-up-right-from-square"></i></a></td></tr>`;
    });
    console.log("Här fortsätter mitt program...");
}


//Funktion som filtrerar min array med alla kurser
function filterCourses() {

    console.log("Här fortsätter mitt program 2...");
    console.log(courses);

    //Hämtar det inmatade värdet i sökfältet och lägger i en variabel (gör om allt till små bokstäver så filtreringen inte blir case-sensetive)
    const searchInput = document.querySelector("#search").value.toLowerCase();

    //Filtrerar på kurskod och/eller kursnamn
    filteredCourses = courses.filter((course) => 
        course.code.toLowerCase().includes(searchInput) ||
        course.coursename.toLowerCase().includes(searchInput)
    );
    console.log(filteredCourses);

    //Kör funktionen dataToTable igen men med den filtrerade arrayen
    dataToTable(filteredCourses);
}


//Om man klickar på rubriken Kurskod så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen dataToTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortCourses1() {
    if (filteredCourses !="" && checked1 === "no") {
        const sorted1 = filteredCourses.sort((a, b) => a.code > b.code ? 1 : -1);
        dataToTable(sorted1);
        checked1 = "yes";
    } else if (filteredCourses =="" && checked1 === "no") {
        const sorted1 = courses.sort((a, b) => a.code > b.code ? 1 : -1);
        dataToTable(sorted1);
        checked1 = "yes";

    } else if (filteredCourses !="" && checked1 === "yes") {
        const sorted1 = filteredCourses.sort((a, b) => b.code > a.code ? 1 : -1);
        dataToTable(sorted1);
        checked1 = "no";
    } else if (filteredCourses =="" && checked1 === "yes") {
        const sorted1 = courses.sort((a, b) => b.code > a.code ? 1 : -1);
        dataToTable(sorted1);
        checked1 = "no";
    }
}


//Om man klickar på rubriken Kursnamn så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen dataToTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortCourses2() {
    if (filteredCourses !="" && checked2 === "no") {
        const sorted2 = filteredCourses.sort((a, b) => a.coursename > b.coursename ? 1 : -1);
        dataToTable(sorted2);
        checked2 = "yes";

    } else if (filteredCourses =="" && checked2 === "no") {
        const sorted2 = courses.sort((a, b) => a.coursename > b.coursename ? 1 : -1);
        dataToTable(sorted2);
        checked2 = "yes";

    } else if (filteredCourses !="" && checked2 === "yes") {
        const sorted2 = filteredCourses.sort((a, b) => b.coursename > a.coursename ? 1 : -1);
        dataToTable(sorted2);
        checked2 = "no";
    } else if (filteredCourses =="" && checked2 === "yes") {  
        const sorted2 = courses.sort((a, b) => b.coursename > a.coursename ? 1 : -1);
        dataToTable(sorted2);
        checked2 = "no";
    }
}


//Om man klickar på rubriken Progression så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen dataToTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortCourses3() {
    if (filteredCourses !="" && checked3 === "no") {
        const sorted3 = filteredCourses.sort((a, b) => a.progression > b.progression ? 1 : -1);
        dataToTable(sorted3);
        checked3 = "yes";
    } else if (filteredCourses =="" && checked3 === "no") {
        const sorted3 = courses.sort((a, b) => a.progression > b.progression ? 1 : -1);
        dataToTable(sorted3);
        checked3 = "yes";

    } else if (filteredCourses !="" && checked3 === "yes") {
        const sorted3 = filteredCourses.sort((a, b) => b.progression > a.progression ? 1 : -1);
        dataToTable(sorted3);
        checked3 = "no";
    } else if (filteredCourses =="" && checked3 === "yes") {  
        const sorted3 = courses.sort((a, b) => b.progression > a.progression ? 1 : -1);
        dataToTable(sorted3);
        checked3 = "no";
    }
}
