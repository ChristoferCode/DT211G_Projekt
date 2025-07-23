"use strict";

//Deklarerar variabler i mitt globala scope:

//Variabler för tabell och sortering i tabell.
let tbodyEl = document.querySelector("tbody");
let sort1El = document.querySelector("#sort1");
let sort2El = document.querySelector("#sort2");
let sort3El = document.querySelector("#sort3");
let sort4El = document.querySelector("#sort4");

//Variabler för filtrering på parti och/eller valkrets
let valtParti = "";
let valdValkrets = "";

//Variabel för antal sökträffar
let antalLedamoterEL = document.querySelector("#antalLedamoter");

//Variabler för aktuell "sida" med sökträffar
let paginationEl = document.querySelector("#pagination");

let currentPage = 1;
let itemsPerPage = parseInt(document.querySelector("#visaAntal").value, 10);

//Variabler för extra info om alla ledamöter i sökträffen
let ledamotInfoEl = document.querySelector(".ledamotInfo");
let ledamotBildTextEl = document.querySelector("#ledamotBildText");

//Variabler för enskild info om klickad parti
let partiInfoEl = document.querySelector("#partiInfo");
let visaInfoKnappEl = document.querySelector("#visaInfoKnapp");

//Variabel föf ensklid extra info om klickad ledamot
let ledamotDetaljEl = document.querySelector(".ledamotDetalj");
let ledamotDetaljBildEl = document.querySelector("#ledamotDetaljBild");
let ledamotDetaljTextEl = document.querySelector("#ledamotDetaljText");




//Deklarerar en variabel som cashar de hämtade partiloggorna.
let partiLogoCache = {};

console.log("Logocashe: " + partiLogoCache);

//Används för att skriva ut partiernas fullständiga namn i tabellen istället för förkortningarna som hämtas från Riksdagens API.
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

//Används för att byta partiernas förkortningar ifrån Riksdagens API till de titlar de har i Wikipedias API-url.
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

//Deklarerar variabler i mitt globala scope. Två tomma för array med alla ledamöter och för filtrerad array.
let ledamoter = [];
let filteredLedamoter = [];


//Deklarerar variabler i mitt globala scope. Fyra variabler för checked/clicked (yes or no) för att kunna sortera både fallande och stigande i mina sort-funktioner.
let checked1 = "no";
let checked2 = "no";
let checked3 = "no";
let checked4 = "no";


//Vid laddning av sidan/fönstret körs funktionen getLedamoter och sju stycken händelselyssnare finns tillgängliga och lyssnar på inmatning i sökfältet, klick på kolumnrubriker samt val av filter och val av antal visningar per "sida". Den sistnämnda är också en inbakad funktion
window.onload = () => {
    getLedamoter();

    document.querySelector("#search").addEventListener("input", filterLedamoter);

    document.querySelector("#sort1").addEventListener("click", sortLedamoter1);
    document.querySelector("#sort2").addEventListener("click", sortLedamoter2);
    document.querySelector("#sort3").addEventListener("click", sortLedamoter3);
    document.querySelector("#sort4").addEventListener("click", sortLedamoter4);

    document.querySelector("#partifilter").addEventListener("change", applyFilters);

    document.querySelector("#valkretsfilter").addEventListener("change", applyFilters);

    document.querySelector("#visaAntal").addEventListener("input", (event) => {
        itemsPerPage = parseInt(event.target.value);
        currentPage = 1;
        updateTable();
    });

}


//Händelselyssnare för att blädra bakåt bland "sidorna".
document.querySelector("#prevPage").addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        updateTable();
    }
});


//Händelselyssnare för att blädra framåt bland "sidorna".
document.querySelector("#nextPage").addEventListener("click", () => {
    if ((currentPage * itemsPerPage) < (filteredLedamoter.length || ledamoter.length)) {
        currentPage++;
        updateTable();
    }
});


//Händelselyssnare för att visa/dölja alla ledamöters (sökträffarnas) extra info
document.querySelector("#visaInfoKnapp").addEventListener("click", visaAllaLedamotInfo);



//Funktion för att uppdatera mina två filter-variabler med användarens val och skicka dem vidare till funktionen getLedamoter.
function applyFilters() {

    console.log("Här fortsätter min funktion applyFilters...");

    valtParti = document.querySelector("#partifilter").value;
    valdValkrets = document.querySelector("#valkretsfilter").value;

    console.log(`Använder filter: Parti = ${valtParti || "Alla"}, Valkrets = ${valdValkrets || "Alla"}`);

    getLedamoter(valtParti, valdValkrets);
}



//Funktion som fetchar API från en url (Sveriges Riksdags API om dess ledamöter) med async/await för att invänta att svaret hinner komma, samt try/catch för att kunna leverera ett felmedelande om något misslyckats men ändå kör vidare koden (vilket är ganska meningslöst i det här fallet eftersom den inte kan göra något utan API-datan...)
async function getLedamoter(valtParti, valdValkrets) {

    console.log("Här fortsätter min funktion getLedamoter...");
    console.log(ledamoter);

    try {
        const response = await fetch(
            `https://data.riksdagen.se/personlista/?iid=&fnamn=&enamn=&f_ar=&kn=&parti=${valtParti}&valkrets=${valdValkrets}&rdlstatus=&org=&utformat=json&sort=sorteringsnamn&sortorder=asc&termlista=`
        );

        //Obs! Ändrara värde på ledamoter, inte deklarerar (det är redan gjort)
        const data = await response.json();
        ledamoter = data.personlista.person;
        console.log(ledamoter);

        if (!Array.isArray(ledamoter)) {
        ledamoter = [ledamoter]; // Gör om till array även med bara en ledamot (istället för objekt vilket orsakade fel)
}

        //Kör funktionen updateTable om hämtningen lyckats
        updateTable();

    } catch (error) {
        console.error("Det har uppstått ett fel vid hämtning av Riksdagens API: ", error);
    }

}


//Funktion som fetchar API från en url (Wikipedias API, i det här fallet riksdagspartiernas sidor) med async/await för att invänta att svaret hinner komma, samt try/catch för att kunna leverera ett felmedelande om något misslyckats men ändå kör vidare koden (vilket är ganska meningslöst i det här fallet eftersom den inte kan göra något utan API-datan...)
async function getPartiInfo(partikod) {

    console.log("Här fortsätter min funktion getPartiInfo...");
    console.log("partikod: " + partikod);

    // Om vi redan har loggan sparad – använd den
    if (partiLogoCache[partikod]) {
        return partiLogoCache[partikod];
    }

    //Hämtar rätt titel på partierna i wikipedia-utlen baserat på partikod från riksdagens API
    let title = partiWikiTitles[partikod];
    if (!title) return null;

    try {
        const response = await fetch(
            `https://sv.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts|pageimages&exintro=true&pithumbsize=300&titles=${encodeURIComponent(title)}`
        );

       
        const data = await response.json();

        const pages = data.query.pages;
        console.log("pages: " + pages);

        const page = Object.values(pages)[0];
        console.log("page: " + page);

        const logoUrl = page?.thumbnail?.source || null;

        // Cacha resultatet
        partiLogoCache[partikod] = logoUrl;
        
        console.log("logoUrl: " + logoUrl);

        return logoUrl;



    } catch (error) {
        console.error("Det har uppstått ett fel: ", error);
        return null;
    }
    
}


//Funktion som updateraar tabellen med nya reslutat varje gång man förändrar filtrering eller hur många som ska visas på varje "sida". Nollar också det som skrivs ut som extra info om alla ledamöter så den infon försvinner inför en ny sökfilrering. 
async function updateTable() {

    console.log("Här fortsätter min funktion updateTable...");

    let arrayToShow = filteredLedamoter.length > 0 ? filteredLedamoter : ledamoter;
    
    let startIndex = (currentPage - 1) * itemsPerPage;
    let endIndex = startIndex + itemsPerPage;
    let currentItems = arrayToShow.slice(startIndex, endIndex);

    ledamotInfoEl.innerHTML = "";

    //Behövs en await här eftersom funktionen inte kan köras innan currentItems är hämtad och den datan kommer ursprungligen från riksdagens API.
    await dataToTable(currentItems);

    renderPagination (arrayToShow.length);
}


//Funktion som skriver ut objekten i mina arrayer till DOM (alla eller filtrerad samt olika sorteringar beroende på vilken data som skickas in), rad för rad till en tabell med korrekta taggar. Först rensas hela tabellen dock.
async function dataToTable(currentItems) {

console.log("Här fortsätter min funktion dataToTable...");

//Börjar med att radera innehållet i tabellen.
tbodyEl.innerHTML = "";


    //Vanlig for-loop istället för foreach eftersom den innehåller en await. Skapar massa objekt baserat på sökningar inom den stora arrayen, t ex efter utbildning eller anställning, som låg innästlade med olika koder som ID. Gör sedan dessa resultat till variabler. Detta behövdes inte göras med alla uppgifter dock så det är lite blandat (kanske lite ostrukturerat) hur jag valt att sedan skicka in det till DOM med innerHTML. Dels till tabellen och dels till utskriften av extra info.
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

        //Epost-adressen behöver få ett @ eftersom det inte fanns med i API-datan (kanske pga spamskäl men är ju lätt att ersätta för någon som vill utföra en attack så kunde väl lika gärna varit där...). Passar även på att göra adressen till en mailto-länk.
        let epost = epostObjekt && epostObjekt.uppgift.length > 0
            ? `<a href="mailto:${epostObjekt.uppgift[0].replace("[på]", "@")}">${epostObjekt.uppgift[0].replace("[på]", "@")}</a>`
            : "Ingen info";

        //Loggan hämtas från Wikipedias API och behöver därför en await här.
        let logoUrl = await getPartiInfo(ledamot.parti);

        let logoHTML = logoUrl
            ? `<img src="${logoUrl}" alt="${partiFullName[ledamot.parti] || ledamot.parti} logotyp" style="height:50px;">`
            : "Ingen logo";

        //Skriver ut tabellen från sökträff.
        tbodyEl.innerHTML += 
        `<tr>
        <td id="td6">${logoHTML}</td>
        <td id="td1"><a href="#" class="ledamot-namn" data-id="${ledamot.intressent_id}">${ledamot.sorteringsnamn}</a></td>
        <td id="td2">${ledamot.fodd_ar}</td>
        <td id="td3">${partiFullName[ledamot.parti] || ledamot.parti} (${ledamot.parti})</td>
        <td id="td4">${ledamot.valkrets}</td>
        </tr>`;

        //Skriver ut extra info inklusive bild om alla ledamöter från sökträff.
        ledamotBildTextEl.innerHTML += 
        `<picture>
            <img src="${ledamot.bild_url_192}" class="ledamotimage" width=200 alt="Riksdagsledamot: ${ledamot.sorteringsnamn}" />
        </picture>
        <p class="ledamotText">${logoHTML}</p>
        <p class="ledamotText"><span class="ledamotTextBold">Namn: </span>${ledamot.tilltalsnamn} ${ledamot.efternamn}</p>
        <p class="ledamotText"><span class="ledamotTextBold">Född: </span>${ledamot.fodd_ar}</p>
        <p class="ledamotText"><span class="ledamotTextBold">Utbildning: </span>${utbildning}</p>
        <p class="ledamotText"><span class="ledamotTextBold">Tidigare anställningar: </span>${anstallningar}</p>
        <p class="ledamotText"><span class="ledamotTextBold">E-post: </span>${epost}</p>
        <hr><br>`;
        

    

        console.log("Logotyp-URL: " + logoHTML);
    }

    //Har ovan gjort varje namn till en "död" #-länk (för att bli klickbar) med en class och här ges de ett unikt ID för att kunna generear rätt individuell ledamot-info. IDt som används hämtas från APIet som smidigt nog hade ett unikt ID på varje ledamot.
    document.querySelectorAll(".ledamot-namn").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        let id = link.getAttribute("data-id");
        visaEnsklidLedamotInfo(id);

        // Scrolla ner till inforutan när den blivit synlig
        document.querySelector(".ledamotDetalj").scrollIntoView({ behavior: "smooth" });
    });

    visaInfoKnappEl.innerHTML = "Visa info";
});

}


//Funktion som renderar ut min pagineringsinfo eftersom jag inte vill visa alla sökträffar (max 349) i en enda lång tabell. Nu kan man istället välja att visa mellan 5 och 100 träffar på varje "sida". Jag skriver även ut hur många sökträffar som finns totalt.
function renderPagination(totalItems) {

    console.log("Här fortsätter min funktion renderPagination...");

    antalLedamoterEL.innerHTML = `${totalItems} (av totalt 349 ledamöter).`;

    let pageInfoEl = document.querySelector("#pageInfo");
    let totalPages = Math.ceil(totalItems / itemsPerPage);

    paginationEl.style.visibility = "visible";
    pageInfoEl.innerHTML = `Sida ${currentPage} av ${totalPages}`;

    //Gör knapparna oklickbara om man är på första respektive sista sidan.
    document.querySelector("#prevPage").disabled = currentPage === 1;
    document.querySelector("#nextPage").disabled = currentPage === totalPages;

    console.log("itemsPerPage: " + itemsPerPage);
}



//Funktion som filtrerar min array med alla ledamöter
function filterLedamoter() {

    console.log("Här fortsätter min funktion filteredLedamoter...");
    console.log(ledamoter);

    //Hämtar det inmatade värdet i sökfältet och lägger i en variabel (gör om allt till små bokstäver så filtreringen inte blir case-sensetive)
    const searchInput = document.querySelector("#search").value.toLowerCase();

    //Filtrerar på ledamots namn (att det innehåller en eller flera valda bokstäver i följd i antingen för- eller efternamn)
    filteredLedamoter = ledamoter.filter((ledamot) => 
        ledamot.sorteringsnamn.toLowerCase().includes(searchInput) 
    );
    console.log("filteredLedamoter: " + filteredLedamoter);

    console.log("search input: " + document.querySelector("#search").value);

    //Återställer "sidan" till 1 vid en sökning
    currentPage = 1;
    //Kör funktionen updateTable igen men med den filtrerade arrayen
    updateTable();
}


//Om man klickar på rubriken Namn så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen updateTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter1() {

    console.log("Här fortsätter min funktion sortLedamoter1...");

    if (filteredLedamoter.length > 0 && checked1 === "no") {
        filteredLedamoter.sort((a, b) => a.sorteringsnamn > b.sorteringsnamn ? 1 : -1);
        updateTable();
        checked1 = "yes";
    } else if (filteredLedamoter.length == 0 && checked1 === "no") {
        ledamoter.sort((a, b) => a.sorteringsnamn > b.sorteringsnamn ? 1 : -1);
        updateTable();
        checked1 = "yes";

    } else if (filteredLedamoter.length > 0 && checked1 === "yes") {
        filteredLedamoter.sort((a, b) => b.sorteringsnamn > a.sorteringsnamn ? 1 : -1);
        updateTable();
        checked1 = "no";
    } else if (filteredLedamoter.length == 0 && checked1 === "yes") {
        ledamoter.sort((a, b) => b.sorteringsnamn > a.sorteringsnamn ? 1 : -1);
        updateTable();
        checked1 = "no";
    }
}


//Om man klickar på rubriken Födelseår så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen updateTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter2() {

    console.log("Här fortsätter min funktion sortLedamoter2...");

    if (filteredLedamoter.length > 0 && checked2 === "no") {
        filteredLedamoter.sort((a, b) => a.fodd_ar > b.fodd_ar ? 1 : -1);
        updateTable();
        checked2 = "yes";

    } else if (filteredLedamoter.length == 0 && checked2 === "no") {
        ledamoter.sort((a, b) => a.fodd_ar > b.fodd_ar ? 1 : -1);
        updateTable();
        checked2 = "yes";

    } else if (filteredLedamoter.length > 0 && checked2 === "yes") {
        filteredLedamoter.sort((a, b) => b.fodd_ar > a.fodd_ar ? 1 : -1);
        updateTable();
        checked2 = "no";
    } else if (filteredLedamoter.length == 0 && checked2 === "yes") {  
        ledamoter.sort((a, b) => b.fodd_ar > a.fodd_ar ? 1 : -1);
        updateTable();
        checked2 = "no";
    }
}

//Om man klickar på rubriken Parti så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen updateTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter3() {

    console.log("Här fortsätter min funktion sortLedamoter3...");

    if (filteredLedamoter.length > 0 && checked3 === "no") {
        filteredLedamoter.sort((a, b) => a.parti > b.parti ? 1 : -1);
        updateTable();
        checked3 = "yes";

    } else if (filteredLedamoter.length == 0 && checked3 === "no") {
        ledamoter.sort((a, b) => a.parti > b.parti ? 1 : -1);
        updateTable();
        checked3 = "yes";

    } else if (filteredLedamoter.length > 0 && checked3 === "yes") {
        filteredLedamoter.sort((a, b) => b.parti > a.parti ? 1 : -1);
        updateTable();
        checked3 = "no";
    } else if (filteredLedamoter.length == 0 && checked3 === "yes") {  
        ledamoter.sort((a, b) => b.parti > a.parti ? 1 : -1);
        updateTable();
        checked3 = "no";
    }
}


//Om man klickar på rubriken Valkrets så sorteras raderna i bokstavsordning (stigande eller fallande). Den sorterade arrayen körs sedan med funktionen updateTable. Checked yes or no möjliggör att jag kan växla mellan fallande eller stigande bokstavsordning. Är checked "no" när man klickar ändras vördet till "yes" och tvärtom.
function sortLedamoter4() {

    console.log("Här fortsätter min funktion sortLedamoter4...");

    if (filteredLedamoter.length > 0 && checked4 === "no") {
        filteredLedamoter.sort((a, b) => a.valkrets > b.valkrets ? 1 : -1);
        updateTable();
        checked4 = "yes";
    } else if (filteredLedamoter.length == 0 && checked4 === "no") {
        ledamoter.sort((a, b) => a.valkrets > b.valkrets ? 1 : -1);
        updateTable();
        checked4 = "yes";

    } else if (filteredLedamoter.length > 0 && checked4 === "yes") {
        filteredLedamoter.sort((a, b) => b.valkrets > a.valkrets ? 1 : -1);
        updateTable();
        checked4 = "no";
    } else if (filteredLedamoter.length == 0 && checked4 === "yes") {  
        ledamoter.sort((a, b) => b.valkrets > a.valkrets ? 1 : -1);
        updateTable();
        checked4 = "no";
    }
}


//Funktion som göra att man kan växla mellan att visa eller dölja extra info om alla ledamöter från sökträffen.
function visaAllaLedamotInfo() {

    console.log("Här fortsätter min funktion visaLedamotInfo...");

    if (window.getComputedStyle(ledamotInfoEl).display === "none") {
        ledamotInfoEl.style.display = "flex";
        visaInfoKnappEl.innerHTML = "Dölj info";
    } else {
        ledamotInfoEl.style.display = "none";
        visaInfoKnappEl.innerHTML = "Visa info";
    }  
}


//Funktion som gör att det visas enskild info om den ledamot man klickar på (namnet är klickbart) i tabellen med sökträffar. Skapar massa objekt baserat på sökningar inom den stora arrayen, t ex efter utbildning eller anställning, som låg innästlade med olika koder som ID. Gör sedan dessa resultat till variabler. Detta behövdes inte göras med alla uppgifter dock så det är lite blandat (kanske lite ostrukturerat) hur jag valt att sedan skicka in det till DOM med innerHTML.
async function visaEnsklidLedamotInfo(id) {

    console.log("Här fortsätter min funktion visaInfoOmLedamot...");

    console.log("ledamotDetaljEl = " + ledamotDetaljEl);

    const allLedamoter = filteredLedamoter.length > 0 ? filteredLedamoter : ledamoter;
    const ledamot = allLedamoter.find(p => p.intressent_id === id);
    if (!ledamot) return;

    let riksdagsuppdragObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Uppdrag inom riksdag och regering");
    let myndighetsuppdragObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Uppdrag inom statliga myndigheter m.m.");
    let foreningsuppdragObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Uppdrag inom förenings- och näringsliv");
    let kommunuppdragObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Kommunala uppdrag");
    let utbildningObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Utbildning");
    let anstallningarObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Anställningar");
    let epostObjekt = ledamot.personuppgift?.uppgift?.find(u => u.kod === "Officiell e-postadress");

    let riksdagsuppdrag = riksdagsuppdragObjekt && riksdagsuppdragObjekt.uppgift.length > 0
        ? '<ul class="uppdragLista">• ' + riksdagsuppdragObjekt.uppgift[0].replace(/\.(\s+)(?=\S)/g, '.<br><br>• ') + '<br><br></ul>'
        : "Ingen info";

    let myndighetsuppdrag = myndighetsuppdragObjekt && myndighetsuppdragObjekt.uppgift.length > 0
        ? '<ul class="uppdragLista">• ' + myndighetsuppdragObjekt.uppgift[0].replace(/\.(\s+)(?=\S)/g, '.<br><br>• ') + '<br><br></ul>'
        : "Ingen info";

    let foreningsuppdrag = foreningsuppdragObjekt && foreningsuppdragObjekt.uppgift.length > 0
        ? '<ul class="uppdragLista">• ' + foreningsuppdragObjekt.uppgift[0].replace(/\.(\s+)(?=\S)/g, '.<br><br>• ') + '<br><br></ul>'
        : "Ingen info";

    let kommunuppdrag = kommunuppdragObjekt && kommunuppdragObjekt.uppgift.length > 0
        ? '<ul class="uppdragLista">• ' + kommunuppdragObjekt.uppgift[0].replace(/\.(\s+)(?=\S)/g, '.<br><br>• ') + '<br><br></ul>'
        : "Ingen info";

    let utbildning = utbildningObjekt && utbildningObjekt.uppgift.length > 0
        ? '<ul class="uppdragLista">• ' + utbildningObjekt.uppgift[0].replace(/\.(\s+)(?=\S)/g, '.<br><br>• ') + '<br><br></ul>'
        : "Ingen info";

    let anstallningar = anstallningarObjekt && anstallningarObjekt.uppgift.length > 0
        ? '<ul class="uppdragLista">• ' + anstallningarObjekt.uppgift[0].replace(/\.(\s+)(?=\S)/g, '.<br><br>• ') + '<br><br></ul>'
        : "Ingen info";

    //Epost-adressen behöver få ett @ eftersom det inte fanns med i API-datan (kanske pga spamskäl men är ju lätt att ersätta för någon som vill utföra en attack så kunde väl lika gärna varit där...). Passar även på att göra adressen till en mailto-länk.
    let epost = epostObjekt && epostObjekt.uppgift.length > 0
        ? `<a href="mailto:${epostObjekt.uppgift[0].replace("[på]", "@")}">${epostObjekt.uppgift[0].replace("[på]", "@")}</a>`
        : "Ingen info";

    //Loggan hämtas från Wikipedias API och behöver därför en await här.
    let logoUrl = await getPartiInfo(ledamot.parti);
    let logoHTML = logoUrl
        ? `<img src="${logoUrl}" alt="${ledamot.parti} logotyp" style="height:50px;">`
        : "Ingen logo";

    console.log('ledamotDetaljTextEl:', ledamotDetaljTextEl);

    console.log("Klick på ledamot med id:", id);

    //Skriver ut extra info inklusive bild om vald enskild ledamöter från sökträff. Gör även en knapp för att kunna stänga/dölja infon om man vill.
    ledamotDetaljBildEl.innerHTML = 
    `<picture>
        <img src="${ledamot.bild_url_192}" class="ledamotimage" width=200 alt="Riksdagsledamot: ${ledamot.sorteringsnamn}" />
    </picture>`;

    ledamotDetaljTextEl.innerHTML =
    `<p class="ledamotText">${logoHTML}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Namn: </span>${ledamot.tilltalsnamn} ${ledamot.efternamn}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Född: </span>${ledamot.fodd_ar}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Uppdrag inom riksdag och regering: </span>${riksdagsuppdrag}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Uppdrag inom statliga myndigheter m.m.: </span>${myndighetsuppdrag}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Uppdrag inom förenings- och näringsliv: </span>${foreningsuppdrag}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Kommunala uppdrag: </span>${kommunuppdrag}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Utbildning: </span>${utbildning}</p>
    <p class="ledamotText"><span class="ledamotTextBold">Tidigare anställningar: </span>${anstallningar}</p>
    <p class="ledamotText"><span class="ledamotTextBold">E-post: </span>${epost}</p>
    <button id="stangDetalj"><i class="fa-solid fa-square-xmark"></i> Stäng</button>`;

    
    ledamotDetaljEl.style.visibility = "visible";
    
    //Händelselyssnare till knappen som skapas ovan som gör att display på infon ändras från flex till none (döljs).
    document.querySelector("#stangDetalj").addEventListener("click", () => {
        ledamotDetaljEl.style.visibility = "hidden";
        ledamotDetaljBildEl.innerHTML = "";
        ledamotDetaljTextEl.innerHTML = "";

    // Scrolla upp till tabellen när inforutan döljs
    document.querySelector(".ledamotTabell").scrollIntoView({ behavior: "smooth" });
    });
}

