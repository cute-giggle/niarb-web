<script>
import * as d3 from 'd3';
import axios from 'axios';

export default {
    name: 'KnowledgeGraph',
    data() {
        return {
            nodes: [],
            links: [],
            centerList: [],

            searchText: '',
        }
    },
    mounted() {
        this.initialize();
        // this.getData({
        //     type: 'precise',
        //     name: 'Brodmann.23',
        // });
    },
    methods: {
        initialize() {
            const container = this.$refs.container;
            const width = container.clientWidth;
            const height = container.clientHeight;
            const delta = Math.min(width, height) / 2;

            this.sessionId = 1;

            this.simulation = d3.forceSimulation()
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("link", d3.forceLink().id(d => d.id).distance(delta))
                .force("charge", d3.forceManyBody().strength(-10 * delta));

            this.svg = d3.select(container).append("svg")
                .attr("width", width)
                .attr("height", height)
                .call(d3.zoom().on("zoom", this.zoomed));

            this.zoomBoard = this.svg.append("g");

            this.simLinks = this.zoomBoard.append("g")
                .selectAll("line")
                .data(this.links, d => `${d.source.id}-${d.target.id}`)
                .join("line")
                .attr("stroke", "#777")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 0.6)
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "#fff").attr("stroke-width", 3);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "#777").attr("stroke-width", 2);
                });

            this.simNodes = this.zoomBoard.append("g")
                .attr("stroke", "#999")
                .attr("stroke-width", 2.5)
                .selectAll("circle")
                .data(this.nodes)
                .join("circle")
                .attr("r", delta / 10)
                .attr("fill", d => d.color)
                .call(drag(this.simulation))
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "#fff");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "#777");
                });

            this.simNodes.on("dblclick", (event, d) => {
                event.stopPropagation();
                if (this.isCenterNode(d.id)) {
                    return;
                }
                console.log(d.label);
                this.getData({
                    type: 'precise',
                    name: d.label,
                });
            })

            this.nodeText = this.zoomBoard.append("g")
                .selectAll("text")
                .data(this.nodes)
                .join("text")
                .attr("class", "node-label")
                .attr("fill", "#fff")
                .attr("font-family", "sans-serif")
                .attr("font-size", 13)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .text(d => d.label);

            this.linkText = this.zoomBoard.append("g")
                .selectAll("text")
                .data(this.links)
                .join("text")
                .attr("font-family", "sans-serif")
                .attr("font-size", 16)
                .attr("font-weight", "bold")
                .attr("class", "link-label")
                .attr("fill", "#fff")
                .text(d => d.label);

            this.simulation.nodes(this.nodes)
                .on("tick", () => {
                    this.simNodes
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    this.simLinks
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);
                    this.nodeText
                        .attr("x", d => d.x)
                        .attr("y", d => d.y);

                    this.linkText
                        .attr("transform", d => {
                            const x = (d.source.x + d.target.x) / 2;
                            const y = (d.source.y + d.target.y) / 2;
                            const angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) * 180 / Math.PI;
                            return `translate(${x},${y}) rotate(${angle})`;
                        })
                        .style("text-anchor", "middle");
                });

            this.simulation.force("link")
                .links(this.links);
        },

        updateData() {
            const container = this.$refs.container;
            const width = container.clientWidth;
            const height = container.clientHeight;
            const delta = Math.min(width, height) / 2;

            this.simNodes = this.simNodes
                .data(this.nodes, d => d.id)
                .join("circle")
                .attr("r", delta / 10)
                .attr("fill", d => d.color)
                .call(drag(this.simulation))
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "#fff");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "#777");
                });

            this.simNodes.on("dblclick", (event, d) => {
                event.stopPropagation();
                if (this.isCenterNode(d.id)) {
                    return;
                }
                console.log(d.label);
                this.getData({
                    type: 'precise',
                    name: d.label,
                });
            })

            this.nodeText = this.nodeText
                .data(this.nodes, d => d.id)
                .join("text")
                .attr("class", "node-label")
                .attr("fill", "#fff")
                .attr("font-family", "sans-serif")
                .attr("font-size", 13)
                .attr("font-weight", "bold")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .text(d => d.label);

            this.simLinks = this.simLinks
                .data(this.links, d => `${d.source.id}-${d.target.id}`)
                .join("line")
                .attr("stroke", "#777")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 0.6)
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "#fff").attr("stroke-width", 3);
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "#777").attr("stroke-width", 2);
                });

            this.linkText = this.linkText
                .data(this.links, d => `${d.source.id}-${d.target.id}`)
                .join("text")
                .attr("font-family", "sans-serif")
                .attr("font-size", 16)
                .attr("font-weight", "bold")
                .attr("class", "link-label")
                .attr("fill", "#fff")
                .text(d => d.label);

            this.simulation.nodes(this.nodes);
            this.simulation.force("link").links(this.links);
        },

        zoomed(event) {
            this.zoomBoard.attr("transform", event.transform);
        },

        isCenterNode(id) {
            return this.centerList.includes(id);
        },

        getData(params) {
            axios.get("/search-neo4j/", { params: params }).then((response) => {
                if (response.data.nodes === undefined) {
                    console.log("No data");
                    return;
                }
                if (response.data.nodes.length >= 500 || this.nodes.length >= 500) {
                    this.clear();
                }
                this.sessionId += 1;
                this.centerList.push(response.data.center.id);
                response.data.nodes.forEach(node => {
                    if (!this.nodes.find(item => item.id === node.id)) {
                        node.sessionId = this.sessionId;
                        node.color = this.nodeColor(node);
                        this.nodes.push(node);
                    }
                });
                response.data.links.forEach(link => {
                    if (!this.links.find(item => item.source === link.source && item.target === link.target && item.label === link.label)) {
                        this.links.push(link);
                    }
                });
                console.log(this.nodes);
                console.log(this.links);
                this.updateData();
            }).catch((error) => {
                console.log(error);
            });
        },

        clear() {
            this.nodes = [];
            this.links = [];
            this.centerList = [];
            this.sessionId = 1;
            this.updateData();
        },

        search(name) {
            this.searchText = name;
            this.onSearch();
        },

        nodeColor(d) {
            if (this.isCenterNode(d.id)) {
                var r = (Math.floor(Math.random() * 256) % 128) + 100;
                var g = (Math.floor(Math.random() * 256) % 128) + 100;
                var b = (Math.floor(Math.random() * 256) % 128) + 100;
                var hex = "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
                return hex;
            } else {
                var r = d.sessionId * 123 % 128;
                var g = d.sessionId * 456 % 128;
                var b = d.sessionId * 789 % 128;
                var hex = "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
                return hex;
            }
        },

        onSearch() {
            if (this.searchText === "") {
                return;
            }
            if (this.isCenterNode(this.searchText)) {
                return;
            }
            if (this.nodes.length != 0) {
                this.clear();
            }
            this.getData({
                type: 'precise',
                name: this.searchText,
            });
            // 刷新forcesimulation
            this.simulation.alphaTarget(0.3).restart();
        },

        onReset() {
            this.clear();
        },
    }
}

function drag(simulation) {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}
</script>

<template>
    <div class="container" id="id-knowledge-graph">
        <a-divider style="height: 1px; background-color: white" />
        <a-row type="flex" justify="space-around">
            <a-col :span="8">
                <div class="graph-board">
                    <img src="../assets/img/graph-logo.png" style="width: 350px; height: 200px;" />
                    <div class="graph-board-info"
                        style="text-align: center; font-size: 20px; font-weight: bold; color: white;">
                        Niarb brain knowledge graph viewer
                    </div>
                    <div style="display: flex; justify-content: center; margin-top: 50px;">
                        <a-input v-model:value="searchText" placeholder="Search for brain-related concepts"
                            size="large" style="width: 300px;" />
                        <a-button type="primary" size="large" style="margin-left: 10px;" @click="onSearch">Search</a-button>
                        <a-button type="danger" size="large" style="margin-left: 10px;" @click="onReset">Reset</a-button>
                    </div>
                </div>
            </a-col>
            <a-col :span="1"></a-col>
            <a-col :span="15">
                <div id="id-knowledge-graph-view" ref="container"></div>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped>
.container {
    width: auto;
    height: auto;
    padding: 40px;
    background-image: url("../assets/img/bg-buttom.jpg");
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}


#id-knowledge-graph-view {
    width: 900px;
    height: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
    /* border: 1px solid white;
    border-radius: 10px; */
    margin-top: 10px;
}

svg {
    width: 900px;
    height: 800px;
    min-width: 540px;
    min-height: 540px;
    background-color: black;
}

.graph-board {
    width: auto;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
</style>  