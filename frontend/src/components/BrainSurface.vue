<script>

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

import axios from 'axios'

const scene = new THREE.Scene()
const viewID = "id-brain-surface-view"

export default {
    name: "BrainSurface",

    data() {
        return {
            colorTable: [],
            slcRegionName: "",
        };
    },

    mounted() {
        this.initialize();
        this.loadMesh('pial');
        this.loadAnnotation('aparc');
        this.render();
    },

    methods: {
        initialize() {
            let width = document.getElementById(viewID).clientWidth
            let height = document.getElementById(viewID).clientHeight
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
            this.camera.position.set(0, 0, 1.7)

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
            axios.get(`http://localhost:8000/api/brain-surface/`, { params: { type: "mesh", name: name } })
                .then(response => {
                    let data = response.data
                    let vertices = new Float32Array(data.vertices)
                    let indices = new Uint32Array(data.indices)
                    this.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
                    this.geometry.setIndex(new THREE.BufferAttribute(indices, 1))
                    this.slcGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1))
                    this.slcRegionName = ''
                    this.render()
                })
                .catch(error => {
                    console.log(error)
                })
        },

        loadAnnotation(name) {
            axios.get(`http://localhost:8000/api/brain-surface/`, { params: { type: "annotation", name: name } })
                .then(response => {
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
                    this.render()
                })
                .catch(error => {
                    console.log(error)
                })
        },

        createSlcSurface(partId) {

            this.slcRegionName = this.partNames[partId]

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
            this.mousePos.x = (event.clientX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.clientWidth * 2 - 1;
            this.mousePos.y = -(event.clientY - this.renderer.domElement.offsetTop) / this.renderer.domElement.clientHeight * 2 + 1;
            this.raycaster.setFromCamera(this.mousePos, this.camera);
            var intersects = this.raycaster.intersectObjects(scene.children, true);
            return intersects.length > 0 ? intersects[0] : null;
        },

        onclick(event) {
            event.preventDefault()
            if (this.labels === undefined) {
                return
            }
            var intersect = this.intersectObj(event);
            if (intersect) {
                var partId = this.labels[intersect.face.a];
                this.createSlcSurface(partId);
            } else {
                this.slcGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1));
                this.slcRegionName = ""
            }
        }
    }
};

</script>

<template>
    <a-dropdown :trigger="['contextmenu']">
        <div class="brain-surface-view" id="id-brain-surface-view"></div>
        <template #overlay>
            <a-menu>
                <a-sub-menu key="fsaverage mesh" title="fsaverage mesh">
                    <a-menu-item key="pial" v-on:click="loadMesh('pial')">pial</a-menu-item>
                    <a-menu-item key="orig" v-on:click="loadMesh('orig')">orig</a-menu-item>
                    <a-menu-item key="white" v-on:click="loadMesh('white')">white</a-menu-item>
                    <a-menu-item key="inflated" v-on:click="loadMesh('inflated')">inflated</a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="fsaverage annotation" title="fsaverage annotation">
                    <a-menu-item key="aparc" v-on:click="loadAnnotation('aparc')">aparc</a-menu-item>
                    <a-menu-item key="brodmann" v-on:click="loadAnnotation('brodmann')">brodmann</a-menu-item>
                    <a-menu-item key="shaefer-400-7"
                        v-on:click="loadAnnotation('shaefer-400-7')">shaefer-400-7</a-menu-item>
                </a-sub-menu>
                <a-sub-menu key="view color table" title="view color table">
                    <div style="max-height: 400px; max-width: 270px; overflow-y: auto; overflow-x: hidden;">
                        <div v-for="item, index in colorTable" :key=index
                            :style="{ display: 'flex', alignItems: 'center' }">
                            <a-button
                                :style="{ width: '20px', height: '20px', backgroundColor: 'rgb(' + item[0][0] + ',' + item[0][1] + ',' + item[0][2] + ')' }"
                                v-on:click="createSlcSurface(index)">
                                <span style="opacity: 0;">&nbsp;</span>
                            </a-button>
                            <span style="margin-left: 5px;">{{ item[1] }}</span>
                        </div>
                    </div>
                </a-sub-menu>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<style scoped>
.brain-surface-view {
    width: 100%;
    height: 100%;
    min-width: 400px;
    min-height: 400px;
}
</style>
