var st

var updaters = []

async function update() {
    var data = await fetch("/api/stats")
    var {stats,last_update} = JSON.parse(await data.text())
    st = stats
    var tdiff = new Date().getTime() - last_update
    var mins = tdiff / 1000 / 60
    var plu = document.getElementById("last-update")
    if (plu) plu.textContent = `Last update ${mins.toFixed(1)} minutes ago`
    updaters.forEach(u => u())
}

var si = {}
async function loadInfo() {
    var data = await fetch("/api/info")
    var info = JSON.parse(await data.text())
    si = info
}

async function init() {
    await update()
    await loadInfo()
    setTimeout(update,1000)
    setInterval(update,30000)
    
    document.body.innerHTML = ""
    
    for (const servername in st) {
        var eserver = document.createElement("div")
        eserver.classList.add("d-server")
        if (!st.hasOwnProperty(servername)) continue
        
        var eheader = document.createElement("h2")
        eheader.textContent = si[servername].name
        var edesc = document.createElement("p")
        edesc.textContent = si[servername].description || ""
        var estate = document.createElement("p")
        estate.classList.add("state", `state-${st[servername].state}`)
        estate.textContent = `Server State: ${st[servername].state.toUpperCase()}`
        eserver.append(eheader,edesc,estate)

        if (si[servername].allowWebStart && st[servername].state == "offline"){
            var estartbtn = document.createElement("input")
            estartbtn.type = "button"
            estartbtn.value = "Start server!"
            estartbtn.onclick = () => {
                estartbtn.disabled = true
                fetch("/api/start/" + encodeURIComponent(servername),{
                    method: "POST"
                })
            }
            eserver.append(estartbtn)
        }

        var etable = document.createElement("table")
        etable.classList.add("stat-table")

        var etablehead = document.createElement("tr")
        var etableheadplayers = document.createElement("th")
        etableheadplayers.textContent = "Player"
        etablehead.appendChild(etableheadplayers)
        for (const stat in st[servername].meta) {
            var col = document.createElement("th")
            col.textContent = st[servername].meta[stat].display
            etablehead.appendChild(col)
        }
        etable.appendChild(etablehead)

        for (const playeruuid in st[servername].values) {
            if (!st[servername].values.hasOwnProperty(playeruuid)) continue
            var eline = document.createElement("tr")
            var ecellname = document.createElement("td")
            ecellname.textContent = playeruuid // TODO
            ecellname.classList.add("e-player-name")
            eline.appendChild(ecellname)
            for (const statname in st[servername].values[playeruuid]) {
                if (!st[servername].values[playeruuid].hasOwnProperty(statname)) continue
                var ecell = document.createElement("td")
                updaters.push(() => {
                    ecell.textContent = st[servername].values[playeruuid][statname].toFixed(2) + (st[servername].meta[statname].unit || "")
                })
                eline.appendChild(ecell)
            }
            etable.appendChild(eline)
        }
        eserver.appendChild(etable)
        document.body.appendChild(eserver)
    }
    var plu = document.createElement("p")
    plu.id = "last-update"
    plu.textContent = ""
    document.body.appendChild(plu)
}


window.onload = init