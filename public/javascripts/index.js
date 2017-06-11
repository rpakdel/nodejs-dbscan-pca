

class Plot {
    constructor(element, url) { 
        this.url = url
        this.plotEl = element;
        this.pcaOriented_onclick = this.pcaOriented_onclick.bind(this)
        window.onresize = this.onResize.bind(this)       
    }

    plot(pcaOriented) {
        this.removeAllChildren(this.plotEl)
        let child = document.createElement('div')
        child.innerText = "Please wait while loading..."
        this.plotEl.appendChild(child)

        let u = this.url
        if (pcaOriented) {
            u += '?pcaOriented=true'
        }

        fetch(u, { method: 'GET' }).then(result => result.json()).then(result => {
            this.removeAllChildren(this.plotEl)
            let x = result.data.map(row => row[result.metadata.xyzColumns[0]])
            let y = result.data.map(row => row[result.metadata.xyzColumns[1]])
            let z = result.data.map(row => row[result.metadata.xyzColumns[2]])
            let v = result.data.map(row => row[result.metadata.dataColumn])
            let trace = {
                x: x, 
                y: y,
                z: z,
                text: v,
                type: "scatter3d",
                mode: 'markers',
                marker: {
                    size: 3,		        		    
                    color: v,
                    colorscale: 'Jet'
                }
            } 

            let plotData = [trace]
            let layout = {
                autosize: false,
                height: window.innerHeight - 100,
                width: window.innerWidth - 100,
            }

            Plotly.newPlot(this.plotEl, plotData, layout);
        }).catch(err => console.log(err))
    }

    onResize() {
        let l = {
            height: window.innerHeight - 100,
            width: window.innerWidth - 100,
        }
        Plotly.relayout(this.plotEl, l)
    }

    removeAllChildren(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    }

    pcaOriented_onclick (pcaOriented) {
    }
}

class App {
    constructor(rootId) {
        this.plots = []
        this.rootElement = document.getElementById(rootId)
    }

    addDataPlot(id, url) {
        let el = document.createElement("div")
        el.id = id
        let p = new Plot(el, url)
        this.rootElement.appendChild(el)
        this.plots.push(p)
    }

    plotAll(pcaOriented) {
        this.plots.forEach(p => p.plot(pcaOriented))
    }
}

const app = new App("plots")
app.addDataPlot("rock1", "/data/rock1")
app.plotAll(false)