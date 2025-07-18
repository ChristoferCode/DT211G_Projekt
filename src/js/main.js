"use strict";

//Deklarerar variabler i mitt globala scope. Fyra stycken för element på min html-sida (tabellinnehåll och kolumnrubrik 1,2 och 3).
let tbodyEl = document.querySelector("tbody");
let sort1El = document.querySelector("#sort1");
let sort2El = document.querySelector("#sort2");
let sort3El = document.querySelector("#sort3");
let sort4El = document.querySelector("#sort4");
let valtParti = "";
let valdValkrets = "";

let antalLedamoterEL = document.querySelector("#antalLedamoter");

let currentPage = 1;
let itemsPerPage = document.querySelector("#visaAntal").value;

console.log(itemsPerPage);

let partiLogoCache = {};

console.log("Logocashe: " + partiLogoCache);

let partiFullName = {
    "S": "Socialdemokraterna",
    "M": "Moderaterna",
    "SD": "Sverigedemokraterna",
    "C": "Centerpartiet",
    "V": "Vänsterpartiet",
    "KD": "Kristdemokraterna",
    "L": "Liberalerna",
    "MP": "Miljöpartiet de gröna"
};

let partiWikiTitles = {
    "S": "Socialdemokraterna (Sverige)",
    "M": "Moderaterna",
    "SD": "Sverigedemokraterna",
    "C": "Centerpartiet",
    "V": "Vänsterpartiet",
    "KD": "Kristdemokraterna (Sverige)",
    "L": "Liberalerna",
    "MP": "Miljöpartiet"
};

console.log("partiWikiTitles: " + partiWikiTitles);

//Deklarerar variabler i mitt globala scope. Två tomma för array med alla kurser och för filtrerad array.
let ledamoter = [];
let filteredLedamoter = [];


//Deklarerar variabler i mitt globala scope. Tre variabler för checked/clicked (yes or no) för att kunna sortera både fallande och stigande.
let checked1 = "no";
let checked2 = "no";
let checked3 = "no";
let checked4 = "no";


//Vid laddning av sidan/fönstret körs funktionen getCourses och fyra stycken händelselyssnare finns tillgängliga och lyssnar på inmatning i sökfältet samt klick på kolumnrubriker.
window.onload = () => {
    getLedamoter();
    document.querySelector("#search").addEventListener("input", filterLedamoter);

    document.querySelector("#sort1").addEventListener("click", sortLedamoter1);
    document.querySelector("#sort2").addEventListener("click", sortLedamoter2);
    document.querySelector("#sort3").addEventListener("click", sortLedamoter3);
    document.querySelector("#sort4").addEventListener("click", sortLedamoter4);

    document.querySelector("#partifilter").addEventListener("change", filterByParty);

    document.querySelector("#valkretsfilter").addEventListener("change", filterByValkrets);

    document.querySelector("#visaAntal").addEventListener("input", (event) => {
        itemsPerPage = parseInt(event.target.value);
        currentPage = 1;
        updateTable();
    });
}

document.querySelector("#prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
});

document.querySelector("#nextPage").addEventListener("click", () => {
    if ((currentPage * itemsPerPage) < (filteredLedamoter.length || ledamoter.length)) {
        currentPage++;
        updateTable();
    }
});

//Funktion som fetchar API från en url med async/await för att invänta att svaret hinner komma, samt try/catch för att kunna leverera ett felmedelande om något misslyckats men ändå kör vidare koden (vilket är ganska meningslöst i det här fallet eftersom den inte kan göra något utan API-datan...)
async function getLedamoter(valtParti, valdValkrets) {
    console.log(ledamoter);

    try {
        const response = await fetch(
            `https://data.riksdagen.se/personlista/?iid=&fnamn=&enamn=&f_ar=&kn=&parti=${valtParti}&valkrets=${valdValkrets}&rdlstatus=&org=&utformat=json&sort=sorteringsnamn&sortorder=asc&termlista=`
        );

        //Obs! Ändrara värde på courses, inte deklarerar (det är redan gjort)
        const data = await response.json();
        ledamoter = data.personlista.person;
        console.log(ledamoter);

        //Kör funktionen dataToTables om hämtningen lyckats
        updateTable(ledamoter);

    } catch (error) {
        console.error("Det har uppstått ett fel: ", error);
    }
}


async function getPartiInfo(partikod) {
    console.log("partikod: " + partikod);

       // Om vi redan har loggan sparad – använd den
    if (partiLogoCache[partikod]) {
        return partiLogoCache[partikod];
    }

    let title = partiWikiTitles[partikod];
    if (!title) return null;

    try {
        const response = await fetch(
            `https://sv.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts|pageimages&exintro=true&pithumbsize=300&titles=${encodeURIComponent(title)}`
        );

        //Obs! Ändrara värde på courses, inte deklarerar (det är redan gjort)
        const data = await response.json();

        const pages = data.query.pages;
        const page = Object.values(pages)[0];

        const logoUrl = page?.thumbnail?.source || null;

        // Cacha resultatet
        partiLogoCache[partikod] = logoUrl;
        return logoUrl;


    } catch (error) {
        console.error("Det har uppstått ett fel: ", error);
        return null;
    }
}



async function updateTable() {
    let arrayToShow = filteredLedamoter.length > 0 ? filteredLedamoter : ledamoter;
    
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let currentItems = arrayToShow.slice(startIndex, endIndex);

    await dataToTable(currentItems);

    renderPagination (arrayToShow.length);
}


//Funktion som skriver ut objekten i mina arrayer till DOM (alla eller filtrerad samt olika sorteringar beroende på vilken data som skickas in), rad för rad till en tabell med korrekta taggar. Först rensas hela tabellen dock.
async function dataToTable(currentItems) {

tbodyEl.innerHTML = "";



   // currentItems.forEach(ledamot => {

    for (let ledamot of currentItems) {
        
        let utbildningObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Utbildning");
        let anstallningarObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Anställningar");
        let epostObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Officiell e-postadress");

        let utbildning = utbildningObjekt && utbildningObjekt.uppgift.length > 0
            ? utbildningObjekt.uppgift[0]
            : "Ingen info";

        let anstallningar = anstallningarObjekt && anstallningarObjekt.uppgift.length > 0
            ? anstallningarObjekt.uppgift[0]
            : "Ingen info";

        let epost = epostObjekt && epostObjekt.uppgift.length > 0
            ? `<a href="mailto:${epostObjekt.uppgift[0].replace("[på]", "@")}">${epostObjekt.uppgift[0].replace("[på]", "@")}</a>`
            : "Ingen info";

        let logoUrl = await getPartiInfo(ledamot.parti);

        let logoHTML = logoUrl
            ? `<img src="${logoUrl}" alt="${ledamot.parti} logotyp" style="height:50px;">`
            : "Ingen logo";

        tbodyEl.innerHTML += `<tr>
        <td id="td1">${ledamot.sorteringsnamn}</td>
        <td id="td2">${ledamot.fodd_ar}</td>
        <td id="td3">${partiFullName[ledamot.parti] || ledamot.parti} (${ledamot.parti})</td>
        <td id="td4">${ledamot.valkrets}</td>
        <td id="td5"><a href="${ledamot.bild_url_192}" target="_blank"> <i class="fa-solid fa-up-right-from-square"></i></a></td>
        <td id="td6">${utbildning}</td>
        <td id="td6">${anstallningar}</td>
        <td id="td6">${epost}</td>
        <td id="td6">${logoHTML}</td>
        </tr>`;

        console.log("Logotyp-URL: " + logoHTML);
    }

    
    console.log("Här fortsätter mitt program...");
}

function renderPagination(totalItems) {

    antalLedamoterEL.innerHTML = `Antal ledamöter som matchar sökningen: ${totalItems} (av totalt 349 ledamöter).`;

    let totalPages = Math.ceil(totalItems / itemsPerPage);
    document.querySelector("#pageInfo").textContent = `Sida ${currentPage} av ${totalPages}`;

    document.querySelector("#prevPage").disabled = currentPage === 1;
    document.querySelector("#nextPage").disabled = currentPage === totalPages;
}




//Funktion som filtrerar min array med alla kurser
function filterLedamoter() {

    console.log("Här fortsätter mitt program 2...");
    console.log(ledamoter);

    //Hämtar det inmatade värdet i sökfältet och lägger i en variabel (gör om allt till små bokstäver så filtreringen inte blir case-sensetive)
    const searchInput = document.querySelector("#search").value.toLowerCase();

    //Filtrerar på kurskod och/eller kursnamn
    filteredLedamoter = ledamoter.filter((ledamot) => 
        ledamot.sorteringsnamn.toLowerCase().includes(searchInput) 
    );
    console.log(filteredLedamoter);

    //Återställer "sidan" till 1 vid en sökning
    currentPage = 1;
    //Kör funktionen dataToTable igen men med den filtrerade arrayen
    updateTable(filteredLedamoter);
}


//Om man klickar på rubriken Kurskod så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen dataToTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter1() {
    if (filteredLedamoter.length > 0 && checked1 === "no") {
        const sorted1 = filteredLedamoter.sort((a, b) => a.sorteringsnamn > b.sorteringsnamn ? 1 : -1);
        updateTable(sorted1);
        checked1 = "yes";
    } else if (filteredLedamoter.length == 0 && checked1 === "no") {
        const sorted1 = ledamoter.sort((a, b) => a.sorteringsnamn > b.sorteringsnamn ? 1 : -1);
        updateTable(sorted1);
        checked1 = "yes";

    } else if (filteredLedamoter.length > 0 && checked1 === "yes") {
        const sorted1 = filteredLedamoter.sort((a, b) => b.sorteringsnamn > a.sorteringsnamn ? 1 : -1);
        updateTable(sorted1);
        checked1 = "no";
    } else if (filteredLedamoter.length == 0 && checked1 === "yes") {
        const sorted1 = ledamoter.sort((a, b) => b.sorteringsnamn > a.sorteringsnamn ? 1 : -1);
        updateTable(sorted1);
        checked1 = "no";
    }
}


//Om man klickar på rubriken Kursnamn så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen dataToTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter2() {
    if (filteredLedamoter.length > 0 && checked2 === "no") {
        const sorted2 = filteredLedamoter.sort((a, b) => a.fodd_ar > b.fodd_ar ? 1 : -1);
        updateTable(sorted2);
        checked2 = "yes";

    } else if (filteredLedamoter.length == 0 && checked2 === "no") {
        const sorted2 = ledamoter.sort((a, b) => a.fodd_ar > b.fodd_ar ? 1 : -1);
        updateTable(sorted2);
        checked2 = "yes";

    } else if (filteredLedamoter.length > 0 && checked2 === "yes") {
        const sorted2 = filteredLedamoter.sort((a, b) => b.fodd_ar > a.fodd_ar ? 1 : -1);
        updateTable(sorted2);
        checked2 = "no";
    } else if (filteredLedamoter.length == 0 && checked2 === "yes") {  
        const sorted2 = ledamoter.sort((a, b) => b.fodd_ar > a.fodd_ar ? 1 : -1);
        updateTable(sorted2);
        checked2 = "no";
    }
}

//Om man klickar på rubriken Kursnamn så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen dataToTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter3() {
    if (filteredLedamoter.length > 0 && checked3 === "no") {
        const sorted3 = filteredLedamoter.sort((a, b) => a.parti > b.parti ? 1 : -1);
        updateTable(sorted3);
        checked3 = "yes";

    } else if (filteredLedamoter.length == 0 && checked3 === "no") {
        const sorted3 = ledamoter.sort((a, b) => a.parti > b.parti ? 1 : -1);
        updateTable(sorted3);
        checked3 = "yes";

    } else if (filteredLedamoter.length > 0 && checked3 === "yes") {
        const sorted3 = filteredLedamoter.sort((a, b) => b.parti > a.parti ? 1 : -1);
        updateTable(sorted3);
        checked3 = "no";
    } else if (filteredLedamoter.length == 0 && checked3 === "yes") {  
        const sorted3 = ledamoter.sort((a, b) => b.parti > a.parti ? 1 : -1);
        updateTable(sorted3);
        checked3 = "no";
    }
}


//Om man klickar på rubriken Progression så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen dataToTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter4() {
    if (filteredLedamoter.length > 0 && checked4 === "no") {
        const sorted4 = filteredLedamoter.sort((a, b) => a.valkrets > b.valkrets ? 1 : -1);
        updateTable(sorted4);
        checked4 = "yes";
    } else if (filteredLedamoter.length == 0 && checked4 === "no") {
        const sorted4 = ledamoter.sort((a, b) => a.valkrets > b.valkrets ? 1 : -1);
        updateTable(sorted4);
        checked4 = "yes";

    } else if (filteredLedamoter.length > 0 && checked4 === "yes") {
        const sorted4 = filteredLedamoter.sort((a, b) => b.valkrets > a.valkrets ? 1 : -1);
        updateTable(sorted4);
        checked4 = "no";
    } else if (filteredLedamoter.length == 0 && checked4 === "yes") {  
        const sorted4 = ledamoter.sort((a, b) => b.valkrets > a.valkrets ? 1 : -1);
        updateTable(sorted4);
        checked4 = "no";
    }
}





function filterByParty() {

    valtParti = document.querySelector("#partifilter").value;
    getLedamoter(valtParti, valdValkrets);

}

function filterByValkrets() {

    valdValkrets = document.querySelector("#valkretsfilter").value;
    getLedamoter(valtParti, valdValkrets);

}