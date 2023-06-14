<script>

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

import axios from 'axios'

import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const scene = new THREE.Scene()
const viewID = "id-brain-surface-view"

export default {
    name: "BrainSurface",

    data() {
        return {
            colorTable: [],

            slcRegionName: "",
            slcRegionDetail: {},
            slcRegionDetailBenchmarkIndex: 1,

            meshList: ['pial', 'orig', 'white', 'inflated'],
            annotationList: ['aparc', 'brodmann', 'shaefer-400-7'],

            meshLoading: false,
            annotationLoading: false,
            annotationName: '',
            chooseAnnotationDisabled: true,
        };
    },

    mounted() {
        this.initialize();
        this.render();
    },

    methods: {
        initialize() {
            let width = document.getElementById(viewID).clientWidth
            let height = document.getElementById(viewID).clientHeight
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
            this.camera.position.set(0, 0, 1.8)

            this.renderer = new THREE.WebGLRenderer({ antialias: true })
            this.renderer.setSize(width, height)
            document.getElementById(viewID).appendChild(this.renderer.domElement)

            this.controls = new OrbitControls(this.camera, this.renderer.domElement)
            this.controls.enableDamping = true
            this.controls.dampingFactor = 0.2
            this.controls.enableZoom = true
            this.controls.zoomSpeed = 0.4
            this.controls.minDistance = 1.7
            this.controls.maxDistance = 3.5
            this.controls.rotateSpeed = 0.5
            this.controls.enablePan = false

            this.composer = new EffectComposer(this.renderer)
            this.composer.addPass(new RenderPass(scene, this.camera))
            this.outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, this.camera)
            this.outlinePass.edgeStrength = 3
            this.outlinePass.edgeGlow = 2
            this.outlinePass.edgeThickness = 2
            this.outlinePass.pulsePeriod = 1.5
            this.outlinePass.visibleEdgeColor.set('#ffffff')
            this.outlinePass.hiddenEdgeColor.set('#190a05')
            this.composer.addPass(this.outlinePass)

            this.geometry = new THREE.BufferGeometry()
            this.material = new THREE.MeshBasicMaterial()
            this.mesh = new THREE.Mesh(this.geometry, this.material)
            scene.add(this.mesh)

            this.slcGeometry = new THREE.BufferGeometry()
            this.slcMaterial = new THREE.MeshBasicMaterial()
            this.slcMesh = new THREE.Mesh(this.slcGeometry, this.slcMaterial)
            scene.add(this.slcMesh)
            this.outlinePass.selectedObjects = [this.slcMesh]

            this.raycaster = new THREE.Raycaster()
            this.mousePos = new THREE.Vector2()

            window.addEventListener('resize', this.resize)
            this.renderer.domElement.addEventListener('dblclick', this.onclick)
        },

        render() {
            requestAnimationFrame(this.render)
            this.composer.render()
        },

        resize() {
            let width = document.getElementById(viewID).clientWidth
            let height = document.getElementById(viewID).clientHeight
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
            this.renderer.setSize(width, height)
        },

        loadMesh(name) {
            this.meshLoading = true
            axios.get(`http://localhost:8000/api/brain-surface/`, { params: { type: "mesh", name: name } })
                .then(response => {
                    this.meshLoading = false
                    let data = response.data
                    let vertices = new Float32Array(data.vertices)
                    let indices = new Uint32Array(data.indices)
                    this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
                    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1))
                    this.slcGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1))
                    this.slcRegionName = ''
                    this.slcRegionDetail = {}
                    this.chooseAnnotationDisabled = false
                    this.render()
                })
                .catch(error => {
                    this.meshLoading = false
                    console.log(error)
                })
        },

        loadAnnotation(name) {
            this.annotationLoading = true
            axios.get(`http://localhost:8000/api/brain-surface/`, { params: { type: "annotation", name: name } })
                .then(response => {
                    this.annotationLoading = false
                    let data = response.data
                    this.colorTable = data.color_table
                    this.labels = data.labels
                    this.partNames = []
                    for (var i = 0; i < data.color_table.length; i++) {
                        this.partNames.push(data.color_table[i][1])
                    }
                    if (this.colors === undefined || this.colors.length != data.labels.length * 3) {
                        this.colors = new Float32Array(data.labels.length * 3)
                    }
                    for (var i = 0; i < data.labels.length; i++) {
                        this.colors[i * 3] = data.color_table[data.labels[i]][0][0] / 255.0;
                        this.colors[i * 3 + 1] = data.color_table[data.labels[i]][0][1] / 255.0;
                        this.colors[i * 3 + 2] = data.color_table[data.labels[i]][0][2] / 255.0;
                    }
                    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3, true))
                    this.material.vertexColors = true
                    this.material.needsUpdate = true
                    this.slcGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1))
                    this.slcRegionName = ''
                    this.slcRegionDetail = {}
                    this.annotationName = name
                    this.render()
                })
                .catch(error => {
                    this.annotationLoading = false
                    console.log(error)
                })
        },

        createSlcSurface(partId) {
            this.getRegionDetail(this.partNames[partId]);

            var partIndices = []
            var indices = this.geometry.index.array
            for (var i = 0; i < indices.length; i += 3) {
                if (this.labels[indices[i]] == partId
                    || this.labels[indices[i + 1]] == partId
                    || this.labels[indices[i + 2]] == partId) {
                    partIndices.push(indices[i], indices[i + 1], indices[i + 2]);
                }
            }

            this.slcGeometry.setAttribute('position', this.geometry.getAttribute('position'));
            this.slcGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(partIndices), 1));

            var partColor = new THREE.Color();
            partColor.setRGB(
                this.colorTable[partId][0][0] / 255.0,
                this.colorTable[partId][0][1] / 255.0,
                this.colorTable[partId][0][2] / 255.0)
            this.slcMesh.material.color = partColor;
        },

        intersectObj(event) {
            var rect = this.renderer.domElement.getBoundingClientRect();
            this.mousePos.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mousePos.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            this.raycaster.setFromCamera(this.mousePos, this.camera);
            var intersects = this.raycaster.intersectObjects(scene.children, true);
            return intersects.length > 0 ? intersects[0] : null;
        },

        getRegionDetail(name) {
            if (name === '') {
                this.slcRegionName = ""
                this.regionDetail = {}
                console.log("name is empty")
                return
            }
            console.log(name, this.annotationName)
            axios.get(`http://localhost:8000/api/region-detail/`, { params: { type: this.annotationName, name: name } })
                .then(response => {
                    if (response.data.error) {
                        this.slcRegionName = ""
                        this.slcRegionDetail = {}
                        console.log(response.data.error)
                        return
                    }

                    this.slcRegionName = name
                    this.slcRegionDetail = response.data
                    this.slcRegionDetailBenchmarkIndex = 1
                    console.log(this.slcRegionDetailBenchmarkSize * 10)
                    this.onSlcRegionDetailBenchmarkPageChange(1, this.slcRegionDetailBenchmarkSize * 10)
                })
                .catch(error => {
                    console.log(error)
                    this.slcRegionDetail = {}
                })
        },

        onclick(event) {
            event.preventDefault();
            if (this.labels === undefined) {
                return;
            }
            var intersect = this.intersectObj(event);
            if (intersect) {
                var partId = this.labels[intersect.face.a];
                this.createSlcSurface(partId);
            } else {
                this.slcGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1));
                this.slcRegionName = ""
                this.slcRegionDetail = {}
            }
        },

        onSlcRegionDetailBenchmarkPageChange(page, pageSize) {
            if (pageSize < 1) {
                return;
            }

            let name = Object.keys(this.slcRegionDetail.benchmark)[page - 1];
            let data = this.slcRegionDetail.benchmark[name];

            const ctx = document.getElementById('id-benchmark-chart').getContext('2d');

            if (window.benchmarkChart) {
                window.benchmarkChart.destroy();
            }

            window.benchmarkChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.bins,
                    datasets: [{
                        label: name,
                        data: data.hist,
                        backgroundColor: 'rgba(75, 150, 192, 0.2)',
                        borderColor: 'rgba(75, 150, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        },
    },

    computed: {
        slcRegionDetailBenchmarkSize() {
            if (this.slcRegionDetail === undefined) {
                return 0
            }
            if (this.slcRegionDetail.benchmark === undefined) {
                return 0
            }
            return Object.keys(this.slcRegionDetail.benchmark).length
        },

        brainSurfaceViewSpan() {
            if (this.slcRegionName === '') {
                return 18
            }
            return 11
        },

        brainSurfaceInfoSpan() {
            if (this.slcRegionName === '') {
                return 0
            }
            return 7
        },
    }
};

</script>

<template>
    <div class="container">
        <a-divider style="height: 1px; background-color: white" />
        <a-row type="flex" justify="space-around">
            <a-col :span="brainSurfaceViewSpan">
                <div class="brain-surface-view" id="id-brain-surface-view"></div>
            </a-col>
            <a-col :span="1"></a-col>
            <a-col :span="4">
                <div class="brain-surface-board">
                    <div v-if="colorTable.length == 0">
                        <img src="../assets/img/surface-logo.png" style="width: 256px;" />
                        <div class="graph-board-info"
                            style="text-align: center; font-size: 20px; font-weight: bold; color: white;">
                            Niarb brain surface viewer
                        </div>
                    </div>
                    <a-dropdown-button :loading="meshLoading"  style="margin-top: 10px;">
                        <template #overlay>
                            <a-menu>
                                <a-menu-item v-for="item in meshList" :key="item" v-on:click="loadMesh(item)">{{ item
                                }}</a-menu-item>
                            </a-menu>
                        </template>
                        Choose fsaverage mesh
                    </a-dropdown-button>
                    <a-dropdown-button :loading="annotationLoading" :disabled="chooseAnnotationDisabled" style="margin-top: 10px;">
                        <template #overlay>
                            <a-menu>
                                <a-menu-item v-for="item in annotationList" :key="item" v-on:click="loadAnnotation(item)">{{
                                    item }}</a-menu-item>
                            </a-menu>
                        </template>
                        Choose fsaverage annotation
                    </a-dropdown-button>
                    <div v-if="colorTable.length != 0" class="color-view">
                        <div v-for="item, index in colorTable" :key=index
                            :style="{ display: 'flex', alignItems: 'center', color: 'white' }">
                            <a-button
                                :style="{ width: '20px', height: '20px', backgroundColor: 'rgb(' + item[0][0] + ',' + item[0][1] + ',' + item[0][2] + ')' }"
                                v-on:click="createSlcSurface(index)">
                                <span style="opacity: 0;">&nbsp;</span>
                            </a-button>
                            <span style="margin-left: 5px;">{{ item[1] }}</span>
                        </div>
                    </div>
                </div>
            </a-col>
            <a-col :span="1"></a-col>
            <a-col :span="brainSurfaceInfoSpan">
                <div class="brain-surface-info">
                    <a-button style="border-radius: 5px;" type="primary">
                        View in knowledge graph
                    </a-button>
                    <li v-for="(value, key) in slcRegionDetail" :key="key">
                        <div v-if="key !== 'benchmark'" class="brain-surface-info-item">
                            <span style="font-weight: bold;">{{ key }}:</span> {{ value }}
                        </div>
                    </li>
                    <div v-show="slcRegionDetailBenchmarkSize != 0" class="brain-surface-info-chart">
                        <span style="font-weight: bold; width: 100%">related benchmark:</span>
                        <canvas id="id-benchmark-chart"></canvas>
                        <a-pagination :total="slcRegionDetailBenchmarkSize * 10"
                            v-model:current="slcRegionDetailBenchmarkIndex" @change="onSlcRegionDetailBenchmarkPageChange"
                            size="small" />
                    </div>
                </div>
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
}

.brain-surface-view {
    width: 100%;
    height: 800px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: black;
}

.brain-surface-board {
    width: 100%;
    height: 800px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    align-content: space-around;
    overflow-y: auto;
    overflow-x: hidden;
}

.color-view {
    width: 260px;
    height: 650px;
    overflow-y: auto;
    overflow-x: hidden;
    margin-top: 10px;
}

.brain-surface-info {
    width: 100%;
    height: 800px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.brain-surface-info-item {
    padding: 10px;
    border: 2px solid white;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    flex-direction: column;
    background-color: rgb(239, 237, 205);
}

.brain-surface-info-chart {
    padding: 10px;
    border: 2px solid white;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: rgb(239, 237, 205);
}
</style>
