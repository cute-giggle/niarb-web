import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

class BrainSurfaceView {
    constructor(elementId) {
        this.elementId = elementId

        // create scene and camera
        this.scene = new THREE.Scene()
        var width = document.getElementById(this.elementId).clientWidth
        var height = document.getElementById(this.elementId).clientHeight
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
        this.camera.position.z = 2

        // create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(width, height)
        document.getElementById(this.elementId).appendChild(this.renderer.domElement)

        // create orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.2
        this.controls.enableZoom = true
        this.controls.zoomSpeed = 0.4
        this.controls.minDistance = 1.7
        this.controls.maxDistance = 3.5
        this.controls.rotateSpeed = 0.5
        this.controls.enablePan = false

        // create outline pass
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))
        this.outline_pass = new OutlinePass(new THREE.Vector2(width, height), this.scene, this.camera)
        this.outline_pass.edgeStrength = 3
        this.outline_pass.edgeGlow = 2
        this.outline_pass.edgeThickness = 2
        this.outline_pass.pulsePeriod = 1.5
        this.outline_pass.visibleEdgeColor.set('#ffffff')
        this.outline_pass.hiddenEdgeColor.set('#190a05')
        this.composer.addPass(this.outline_pass)

        // create surface
        this.geometry = new THREE.BufferGeometry()
        this.material = new THREE.MeshBasicMaterial()
        this.surface = new THREE.Mesh(this.geometry, this.material)
        this.scene.add(this.surface)

        // create part surface
        this.part_geometry = new THREE.BufferGeometry()
        this.part_material = new THREE.MeshBasicMaterial()
        this.part_surface = new THREE.Mesh(this.part_geometry, this.part_material)
        this.scene.add(this.part_surface)
        this.outline_pass.selectedObjects = [this.part_surface]

        // ray caster for mouse click
        this.ray_caster = new THREE.Raycaster()
        this.mouse_pos = new THREE.Vector2()

        // add event listener
        this.renderer.domElement.addEventListener('resize', this.onResize.bind(this), false)
    }

    onResize() {
        var width = document.getElementById(this.elementId).clientWidth
        var height = document.getElementById(this.elementId).clientHeight
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(width, height)
    }

    intersect_obj(event) {
        this.mouse_pos.x = (event.clientX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.clientWidth * 2 - 1;
        this.mouse_pos.y = -(event.clientY - this.renderer.domElement.offsetTop) / this.renderer.domElement.clientHeight * 2 + 1;
        this.ray_caster.setFromCamera(this.mouse_pos, this.camera);
        var intersects = this.ray_caster.intersectObjects(this.scene.children, true);
        return intersects.length > 0 ? intersects[0] : null;
    }
}

class BrainSurfaceMesh {
    constructor() {
        this.vertices = null
        this.indices = null
    }

    load(jsonString) {
        var data = JSON.parse(jsonString)
        this.vertices = data.vertices
        this.indices = data.indices
    }

    empty() {
        return this.vertices == null
    }
}

class BrainSurfaceAnnotation {
    constructor() {
        this.colors = null;
        this.part_names = null;
        this.vertex_labels = null;
        this.color_table = null;
    }

    load(jsonString) {
        var data = JSON.parse(jsonString)
        this.color_table = data.color_table
        this.vertex_labels = data.labels

        this.part_names = []
        for (var i = 0; i < data.color_table.length; i++) {
            part_names.push(data.color_table[i][1])
        }

        if (!this.colors) {
            this.colors = new Float32Array(data.label.length * 3);
        }
        for (var i = 0; i < data.label.length; i++) {
            this.colors[i * 3] = data.color_table[data.label[i]][0][0] / 255.0;
            this.colors[i * 3 + 1] = data.color_table[data.label[i]][0][1] / 255.0;
            this.colors[i * 3 + 2] = data.color_table[data.label[i]][0][2] / 255.0;
        }
    }

    empty() {
        return this.colors == null
    }
}

export default class BrainSurface {
    constructor(elementId) {
        this.view = new BrainSurfaceView(elementId)
        this.mesh = new BrainSurfaceMesh()
        this.annotation = new BrainSurfaceAnnotation()
        this.render()
        this.view.renderer.domElement.addEventListener('contextmenu', this.onContextMenu.bind(this), false)
    }

    loadMesh(jsonString) {
        this.mesh.load(jsonString)
        this.view.geometry.setAttribute('position', new THREE.BufferAttribute(this.mesh.vertices, 3))
        this.view.geometry.setIndex(this.mesh.indices)
        this.view.part_geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1))
        this.render()
    }

    loadAnnotation(jsonString) {
        this.annotation.load(jsonString)
        this.view.geometry.setAttribute('color', new THREE.BufferAttribute(this.annotation.colors, 3, true))
        this.view.material.vertexColors = true
        this.view.part_geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1))
        this.render()
    }

    render() {
        requestAnimationFrame(this.render.bind(this))
        this.view.composer.render()
    }

    createPartSurface(part_id) {
        var part_indices = []
        var indices = this.view.geometry.index.array
        for (var i = 0; i < indices.length; i += 3) {
            if (this.annotation.vertex_labels[indices[i]] == part_id
                || this.annotation.vertex_labels[indices[i + 1]] == part_id
                || this.annotation.vertex_labels[indices[i + 2]] == part_id) {
                part_indices.push(indices[i], indices[i + 1], indices[i + 2]);
            }
        }

        this.view.part_geometry.setAttribute('position', this.view.geometry.getAttribute('position'));
        this.view.part_geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(part_indices), 1));

        var part_color = new THREE.Color();
        part_color.setRGB(this.annotation.color_table[part_id][0][0] / 255,
            this.annotation.color_table[part_id][0][1] / 255,
            this.annotation.color_table[part_id][0][2] / 255)
        this.view.part_surface.material = new THREE.MeshBasicMaterial({ color: part_color });
    }

    onContextMenu(event) {
        event.preventDefault()
        if (this.annotation.empty()) {
            return
        }
        var intersect = this.view.intersect_obj(event);
        if (intersect) {
            var part_id = vertex_labels[intersect.face.a];
            this.create_part_surface(part_id);
        } else {
            part_geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(), 1));
        }
    }
}
