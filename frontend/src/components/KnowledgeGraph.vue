<script>
import * as d3 from 'd3';
import axios from 'axios';

export default {
    name: 'KnowledgeGraph',
    data() {
        return {
            nodes: [],
            links: [],
        }
    },
    mounted() {
        this.getData();
        this.drawGraph();
    },
    methods: {
        async drawGraph() {
            const container = this.$refs.container;
            const width = container.clientWidth;
            const height = container.clientHeight;

            const delta = Math.min(width, height) / 2;
            const simulation = d3.forceSimulation()
                .force("link", d3.forceLink().id(d => d.id).distance(delta * 0.7))
                .force("charge", d3.forceManyBody().strength(delta * -0.8))
                .force("center", d3.forceCenter(width / 2, height / 2));

            const svg = d3.select(container).append("svg")
                .attr("width", width)
                .attr("height", height);

            const link = svg.append("g")
                .attr("stroke", "#777")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(this.links)
                .join("line")
                .attr("stroke-width", d => Math.sqrt(d.value))
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "#fff");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "#777");
                });

            const node = svg.append("g")
                .attr("stroke", "#333")
                .attr("stroke-width", 1.5)
                .selectAll("circle")
                .data(this.nodes)
                .join("circle")
                .attr("r", delta * 0.08)
                .attr("fill", "#780")
                .call(drag(simulation))
                .on("mouseover", function () {
                    d3.select(this).attr("stroke", "#fff");
                })
                .on("mouseout", function () {
                    d3.select(this).attr("stroke", "#333");
                });

            node.append("title")
                .text(d => d.id);

            const nodeText = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 8)
                .selectAll("text")
                .data(this.nodes)
                .join("text")
                .attr("class", "node-label")
                .attr("fill", "#fff")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "central")
                .text(d => d.label);

            const linkText = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 8)
                .selectAll("text")
                .data(this.links)
                .join("text")
                .attr("class", "link-label")
                .attr("fill", "#fff")
                .text(d => d.label);

            simulation.nodes(this.nodes)
                .on("tick", () => {
                    node
                        .attr("cx", d => d.x)
                        .attr("cy", d => d.y);

                    link
                        .attr("x1", d => d.source.x)
                        .attr("y1", d => d.source.y)
                        .attr("x2", d => d.target.x)
                        .attr("y2", d => d.target.y);
                    nodeText
                        .attr("x", d => d.x)
                        .attr("y", d => d.y);

                    linkText
                        .attr("transform", d => {
                            const x = (d.source.x + d.target.x) / 2;
                            const y = (d.source.y + d.target.y) / 2;
                            const angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) * 180 / Math.PI;
                            return `translate(${x},${y}) rotate(${angle})`;
                        });
                });

            simulation.force("link")
                .links(this.links);
        },

        getData(params) {
            if (params === undefined) {
                this.nodes = [
                    { id: "A", label: "Brain Region A" },
                    { id: "B", label: "Brain Region B" },
                    { id: "C", label: "Brain Region C" },
                    { id: "D", label: "Brain Region D" },
                    { id: "E", label: "Brain Region E" },
                    { id: "F", label: "Brain Region F" },
                    { id: "G", label: "Brain Region G" },
                    { id: "H", label: "Brain Region H" },
                    { id: "I", label: "Brain Region I" },
                    { id: "J", label: "Brain Region J" },
                    { id: "K", label: "Brain Region K" },
                    { id: "L", label: "Brain Region L" },
                    { id: "M", label: "Brain Region M" },
                    { id: "N", label: "Brain Region N" },
                    { id: "O", label: "Brain Region O" },
                    { id: "P", label: "Brain Region P" },
                    { id: "Q", label: "Brain Region Q" },
                    { id: "R", label: "Brain Region R" },
                    { id: "S", label: "Brain Region S" },
                    { id: "T", label: "Brain Region T" },
                    { id: "U", label: "Brain Region U" },
                    { id: "V", label: "Brain Region V" },
                    { id: "W", label: "Brain Region W" },
                    { id: "X", label: "Brain Region X" },
                    { id: "Y", label: "Brain Region Y" },
                    { id: "Z", label: "Brain Region Z" },
                ];
                this.links = [
                    { source: "A", target: "B", label: "involved in" },
                    { source: "A", target: "C", label: "involved in" },
                    { source: "A", target: "D", label: "involved in" },
                    { source: "A", target: "E", label: "involved in" },
                    { source: "A", target: "F", label: "involved in" },
                    { source: "A", target: "G", label: "involved in" },
                    { source: "A", target: "H", label: "involved in" },
                    { source: "A", target: "I", label: "involved in" },
                    { source: "A", target: "J", label: "involved in" },
                    { source: "A", target: "K", label: "involved in" },
                    { source: "A", target: "L", label: "involved in" },
                    { source: "A", target: "M", label: "involved in" },
                    { source: "A", target: "N", label: "involved in" },
                    { source: "A", target: "O", label: "involved in" },
                    { source: "A", target: "P", label: "involved in" },
                    { source: "A", target: "Q", label: "involved in" },
                    { source: "A", target: "R", label: "involved in" },
                    { source: "A", target: "S", label: "involved in" },
                    { source: "A", target: "T", label: "involved in" },
                    { source: "A", target: "U", label: "involved in" },
                    { source: "A", target: "V", label: "involved in" },
                    { source: "A", target: "W", label: "involved in" },
                    { source: "A", target: "X", label: "involved in" },
                    { source: "A", target: "Y", label: "involved in" },
                    { source: "A", target: "Z", label: "involved in" },
                ];
                return;
            }
            axios.get("/api/graph-data/", { params: params }).then((response) => {
                this.nodes = response.data.nodes;
                this.links = response.data.links;
            });
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
    <div class="container">
        <a-row type="flex">
            <a-col :span="8">
                <div class="knowledge-graph-board">
                    <div style="display: flex; justify-content: space-between; width: 100%">
                        <a-input-search placeholder="Search" enter-button size="large" />
                        <a-button type="danger" size="large" style="margin-left: 10px;">Reset</a-button>
                    </div>
                    <div class="knowledge-graph-info">

                    </div>
                </div>
            </a-col>
            <a-col :span="16" style="padding-left: 10px;">
                <div id="id-knowledge-graph-view" ref="container"></div>
            </a-col>
        </a-row>
    </div>
</template>

<style scoped>
.container {
    width: 100%;
    height: 1000px;
    padding: 5px;
    border: 2px solid white;
    border-radius: 10px;
    background-color: black;
}

.knowledge-graph-board {
    width: 100%;
    height: 985px;
    padding: 10px;
    border: 2px solid white;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: rgb(220, 240, 220);
}

#id-knowledge-graph-view {
    width: 100%;
    height: 985px;
    padding: 10px;
    border: 2px solid white;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(55, 49, 53);
}

svg {
    width: 100%;
    height: 100%;
    min-width: 540px;
    min-height: 540px;
    background-color: #000;
}
</style>  